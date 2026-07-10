import type { BonAchatRequest, BonAchatResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalBonAchat } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocal = (payload: BonAchatRequest & { idBonAchat?: string }, organizationId: string): LocalBonAchat => {
  const id = payload.idBonAchat ?? crypto.randomUUID();
  return {
    idBonAchat: id,
    numeroBonAchat: payload.numeroBonAchat,
    supplierId: payload.supplierId,
    dateBonAchat: payload.dateBonAchat ?? now(),
    statut: payload.status ?? 'BROUILLON',
    montantHt: payload.subtotalAmount ?? 0,
    montantTtc: payload.grandTotal ?? 0,
    subtotalAmount: payload.subtotalAmount,
    grandTotal: payload.grandTotal,
    lignes: payload.lines ?? [],
    supplierName: payload.supplierName,
    agencyId: payload.agencyId,
    createdBy: payload.createdBy,
    organizationId,
    syncStatus: 'pending',
    createdAt: now(),
    updatedAt: now(),
  };
};

const toResponse = (local: LocalBonAchat): BonAchatResponse => ({
  idBonAchat: local.idBonAchat,
  numeroBonAchat: local.numeroBonAchat,
  supplierId: local.supplierId,
  supplierName: local.supplierName,
  dateBonAchat: local.dateBonAchat,
  status: local.statut as BonAchatResponse.status,
  subtotalAmount: local.subtotalAmount ?? local.montantHt,
  grandTotal: local.grandTotal ?? local.montantTtc,
  lines: local.lignes as BonAchatResponse['lines'],
  organizationId: local.organizationId,
  agencyId: local.agencyId,
  createdBy: local.createdBy,
});

export const createBonAchatOffline = async (
  request: BonAchatRequest,
  existingId?: string
): Promise<BonAchatResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idBonAchat = existingId ?? crypto.randomUUID();
  const payload = { ...request, idBonAchat };
  const local = toLocal(payload, organizationId);

  await offlineDb.bon_achats.put(local);
  await createOutboxEntry({
    action: existingId ? 'UPDATE_BON_ACHAT' : 'CREATE_BON_ACHAT',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: existingId ? `/api/bons-achat/${idBonAchat}` : '/api/bons-achat',
    method: existingId ? 'PUT' : 'POST',
    entityId: idBonAchat,
    organizationId,
  });

  if (await isFullyOnline()) processOutbox().catch(console.error);
  return toResponse(local);
};

export const updateBonAchatOffline = async (id: string, request: BonAchatRequest) =>
  createBonAchatOffline(request, id);

export const pullAndCacheBonAchats = async (
  fetcher: () => Promise<BonAchatResponse[]>
): Promise<BonAchatResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await offlineDb.bon_achats.where('organizationId').equals(seller.organizationId).toArray();
  if (!(await isFullyOnline())) return localList.map(toResponse);

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.bon_achats.where('syncStatus').equals('pending').toArray()).map((b) => b.idBonAchat)
    );

    await offlineDb.transaction('rw', offlineDb.bon_achats, async () => {
      for (const b of remote) {
        if (!b.idBonAchat || pendingIds.has(b.idBonAchat)) continue;
        await offlineDb.bon_achats.put({
          idBonAchat: b.idBonAchat,
          numeroBonAchat: b.numeroBonAchat ?? '',
          supplierId: b.supplierId ?? '',
          dateBonAchat: b.dateBonAchat ?? now(),
          statut: b.status ?? 'BROUILLON',
          montantHt: b.subtotalAmount ?? 0,
          montantTtc: b.grandTotal ?? 0,
          subtotalAmount: b.subtotalAmount,
          grandTotal: b.grandTotal,
          lignes: b.lines ?? [],
          supplierName: b.supplierName,
          organizationId: seller.organizationId,
          agencyId: b.agencyId,
          createdBy: b.createdBy,
          syncStatus: 'synced',
          createdAt: b.createdAt ?? now(),
          updatedAt: b.updatedAt ?? now(),
        });
      }
    });

    const pendingLocal = await offlineDb.bon_achats
      .where('organizationId').equals(seller.organizationId)
      .filter((b) => b.syncStatus === 'pending' || b.syncStatus === 'conflict')
      .toArray();

    const map = new Map<string, BonAchatResponse>();
    remote.forEach((b) => { if (b.idBonAchat) map.set(b.idBonAchat, b); });
    pendingLocal.map(toResponse).forEach((b) => {
      if (b.idBonAchat && !map.has(b.idBonAchat)) map.set(b.idBonAchat, b);
    });
    return Array.from(map.values());
  } catch {
    return localList.map(toResponse);
  }
};
