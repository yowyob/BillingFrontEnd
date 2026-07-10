import type { NoteCreditRequest, NoteCreditResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalNoteCredit } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocal = (payload: NoteCreditRequest & { idNoteCredit?: string }, organizationId: string): LocalNoteCredit => {
  const id = payload.idNoteCredit ?? crypto.randomUUID();
  return {
    idNoteCredit: id,
    numeroNoteCredit: payload.numeroNoteCredit,
    idClient: payload.idClient ?? '',
    dateEmission: payload.dateEmission ?? now(),
    statut: payload.statut ?? 'BROUILLON',
    montantHt: payload.montantHT ?? 0,
    montantTtc: payload.montantTTC ?? 0,
    montantHT: payload.montantHT,
    montantTTC: payload.montantTTC,
    montantTVA: payload.montantTVA,
    lignes: payload.lignesNoteCredit ?? [],
    nomClient: payload.nomClient,
    agencyId: payload.agencyId,
    createdBy: payload.createdBy,
    organizationId,
    syncStatus: 'pending',
    createdAt: now(),
    updatedAt: now(),
  };
};

const toResponse = (local: LocalNoteCredit): NoteCreditResponse => ({
  idNoteCredit: local.idNoteCredit,
  numeroNoteCredit: local.numeroNoteCredit,
  idClient: local.idClient,
  nomClient: local.nomClient,
  dateEmission: local.dateEmission,
  statut: local.statut as NoteCreditResponse.statut,
  montantHT: local.montantHT ?? local.montantHt,
  montantTTC: local.montantTTC ?? local.montantTtc,
  montantTVA: local.montantTVA,
  lignesNoteCredit: local.lignes as NoteCreditResponse['lignesNoteCredit'],
  organizationId: local.organizationId,
  agencyId: local.agencyId,
  createdBy: local.createdBy,
});

export const createNoteCreditOffline = async (
  request: NoteCreditRequest,
  existingId?: string
): Promise<NoteCreditResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idNoteCredit = existingId ?? crypto.randomUUID();
  const payload = { ...request, idNoteCredit };
  const local = toLocal(payload, organizationId);

  await offlineDb.note_credits.put(local);
  await createOutboxEntry({
    action: existingId ? 'UPDATE_NOTE_CREDIT' : 'CREATE_NOTE_CREDIT',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: existingId ? `/api/v1/facturation/note-credits/${idNoteCredit}` : '/api/v1/facturation/note-credits',
    method: existingId ? 'PUT' : 'POST',
    entityId: idNoteCredit,
    organizationId,
  });

  if (await isFullyOnline()) processOutbox().catch(console.error);
  return toResponse(local);
};

export const updateNoteCreditOffline = async (id: string, request: NoteCreditRequest) =>
  createNoteCreditOffline(request, id);

export const pullAndCacheNoteCredits = async (
  fetcher: () => Promise<NoteCreditResponse[]>
): Promise<NoteCreditResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await offlineDb.note_credits.where('organizationId').equals(seller.organizationId).toArray();
  if (!(await isFullyOnline())) return localList.map(toResponse);

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.note_credits.where('syncStatus').equals('pending').toArray()).map((n) => n.idNoteCredit)
    );

    await offlineDb.transaction('rw', offlineDb.note_credits, async () => {
      for (const n of remote) {
        if (!n.idNoteCredit || pendingIds.has(n.idNoteCredit)) continue;
        await offlineDb.note_credits.put({
          idNoteCredit: n.idNoteCredit,
          numeroNoteCredit: n.numeroNoteCredit,
          idClient: n.idClient ?? '',
          dateEmission: n.dateEmission ?? now(),
          statut: n.statut ?? 'BROUILLON',
          montantHt: n.montantHT ?? 0,
          montantTtc: n.montantTTC ?? 0,
          montantHT: n.montantHT,
          montantTTC: n.montantTTC,
          montantTVA: n.montantTVA,
          lignes: n.lignesNoteCredit ?? [],
          nomClient: n.nomClient,
          organizationId: seller.organizationId,
          agencyId: n.agencyId,
          createdBy: n.createdBy,
          syncStatus: 'synced',
          createdAt: n.createdAt ?? now(),
          updatedAt: n.updatedAt ?? now(),
        });
      }
    });

    const pendingLocal = await offlineDb.note_credits
      .where('organizationId').equals(seller.organizationId)
      .filter((n) => n.syncStatus === 'pending' || n.syncStatus === 'conflict')
      .toArray();

    const map = new Map<string, NoteCreditResponse>();
    remote.forEach((n) => { if (n.idNoteCredit) map.set(n.idNoteCredit, n); });
    pendingLocal.map(toResponse).forEach((n) => {
      if (n.idNoteCredit && !map.has(n.idNoteCredit)) map.set(n.idNoteCredit, n);
    });
    return Array.from(map.values());
  } catch {
    return localList.map(toResponse);
  }
};
