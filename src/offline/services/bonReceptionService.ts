import type { BondeReceptionCreateRequest, BondeReceptionResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalBonReception } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocal = (
  payload: BondeReceptionCreateRequest & { idBonReception?: string },
  organizationId: string
): LocalBonReception => {
  const id = payload.idBonReception ?? crypto.randomUUID();
  return {
    idBonReception: id,
    numeroReception: payload.numeroReception,
    idFournisseur: payload.idFournisseur,
    nomFournisseur: payload.nomFournisseur,
    lines: payload.lines ?? [],
    dateReception: payload.dateReception ?? now(),
    statut: payload.statut ?? 'DRAFT',
    notes: payload.notes,
    createdBy: payload.createdBy,
    dateSysteme: payload.dateSysteme,
    numeroBonAchat: payload.numeroBonAchat,
    idBonAchat: payload.idBonAchat,
    agenceDeTransport: payload.agenceDeTransport,
    agencyId: payload.agencyId,
    organizationId,
    syncStatus: 'pending',
    createdAt: now(),
    updatedAt: now(),
  };
};

const toResponse = (local: LocalBonReception): BondeReceptionResponse => ({
  idBonReception: local.idBonReception,
  numeroReception: local.numeroReception,
  idFournisseur: local.idFournisseur,
  nomFournisseur: local.nomFournisseur,
  lines: local.lines as BondeReceptionResponse['lines'],
  dateReception: local.dateReception,
  statut: local.statut as BondeReceptionResponse.statut,
  notes: local.notes,
  createdBy: local.createdBy,
  updatedAt: local.updatedAt,
  dateSysteme: local.dateSysteme,
  numeroBonAchat: local.numeroBonAchat,
  idBonAchat: local.idBonAchat,
  agenceDeTransport: local.agenceDeTransport,
  organizationId: local.organizationId,
  agencyId: local.agencyId,
});

export const createBonReceptionOffline = async (
  request: BondeReceptionCreateRequest,
  existingId?: string
): Promise<BondeReceptionResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idBonReception = existingId ?? crypto.randomUUID();
  const payload = { ...request, idBonReception };
  const local = toLocal(payload, organizationId);

  await offlineDb.bon_receptions.put(local);
  await createOutboxEntry({
    action: existingId ? 'UPDATE_BON_RECEPTION' : 'CREATE_BON_RECEPTION',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: existingId
      ? `/api/v1/facturation/bon-receptions/${idBonReception}`
      : '/api/v1/facturation/bon-receptions',
    method: existingId ? 'PUT' : 'POST',
    entityId: idBonReception,
    organizationId,
  });

  if (await isFullyOnline()) processOutbox().catch(console.error);
  return toResponse(local);
};

export const updateBonReceptionOffline = async (id: string, request: BondeReceptionCreateRequest) =>
  createBonReceptionOffline(request, id);

export const pullAndCacheBonReceptions = async (
  fetcher: () => Promise<BondeReceptionResponse[]>
): Promise<BondeReceptionResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await offlineDb.bon_receptions.where('organizationId').equals(seller.organizationId).toArray();
  if (!(await isFullyOnline())) return localList.map(toResponse);

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.bon_receptions.where('syncStatus').equals('pending').toArray()).map((b) => b.idBonReception)
    );

    await offlineDb.transaction('rw', offlineDb.bon_receptions, async () => {
      for (const b of remote) {
        if (!b.idBonReception || pendingIds.has(b.idBonReception)) continue;
        await offlineDb.bon_receptions.put({
          idBonReception: b.idBonReception,
          numeroReception: b.numeroReception,
          idFournisseur: b.idFournisseur,
          nomFournisseur: b.nomFournisseur,
          lines: b.lines ?? [],
          dateReception: b.dateReception ?? now(),
          statut: b.statut ?? 'DRAFT',
          notes: b.notes,
          createdBy: b.createdBy,
          dateSysteme: b.dateSysteme,
          numeroBonAchat: b.numeroBonAchat,
          idBonAchat: b.idBonAchat,
          agenceDeTransport: b.agenceDeTransport,
          organizationId: seller.organizationId,
          agencyId: b.agencyId,
          syncStatus: 'synced',
          createdAt: now(),
          updatedAt: b.updatedAt ?? now(),
        });
      }
    });

    const pendingLocal = await offlineDb.bon_receptions
      .where('organizationId').equals(seller.organizationId)
      .filter((b) => b.syncStatus === 'pending' || b.syncStatus === 'conflict')
      .toArray();

    const map = new Map<string, BondeReceptionResponse>();
    remote.forEach((b) => { if (b.idBonReception) map.set(b.idBonReception, b); });
    pendingLocal.map(toResponse).forEach((b) => {
      if (b.idBonReception && !map.has(b.idBonReception)) map.set(b.idBonReception, b);
    });
    return Array.from(map.values());
  } catch {
    return localList.map(toResponse);
  }
};
