import type { BackOrderRequest, BackOrderResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalBackOrder } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocal = (payload: BackOrderRequest & { idBackOrder?: string }, organizationId: string): LocalBackOrder => {
  const id = payload.idBackOrder ?? crypto.randomUUID();
  return {
    idBackOrder: id,
    numeroBackOrder: payload.numeroBackOrder,
    idBonLivraison: payload.idBonLivraison,
    idClient: payload.idClient,
    dateCreation: payload.dateCreation ?? now(),
    statut: payload.statut ?? 'EN_ATTENTE',
    lignes: payload.lignes ?? [],
    nomClient: payload.nomClient,
    agencyId: payload.agencyId,
    createdBy: payload.createdBy,
    organizationId,
    syncStatus: 'pending',
    createdAt: now(),
    updatedAt: now(),
  };
};

const toResponse = (local: LocalBackOrder): BackOrderResponse => ({
  idBackOrder: local.idBackOrder,
  numeroBackOrder: local.numeroBackOrder,
  idBonLivraison: local.idBonLivraison,
  idClient: local.idClient,
  nomClient: local.nomClient,
  dateCreation: local.dateCreation,
  statut: local.statut as BackOrderResponse.statut,
  lignes: local.lignes as BackOrderResponse['lignes'],
  notes: undefined,
  organizationId: local.organizationId,
  agencyId: local.agencyId,
  createdBy: local.createdBy,
});

export const createBackOrderOffline = async (
  request: BackOrderRequest,
  existingId?: string
): Promise<BackOrderResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idBackOrder = existingId ?? crypto.randomUUID();
  const payload = { ...request, idBackOrder };
  const local = toLocal(payload, organizationId);

  await offlineDb.back_orders.put(local);
  await createOutboxEntry({
    action: existingId ? 'UPDATE_BACK_ORDER' : 'CREATE_BACK_ORDER',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: existingId ? `/api/v1/facturation/back-orders/${idBackOrder}` : '/api/v1/facturation/back-orders',
    method: existingId ? 'PUT' : 'POST',
    entityId: idBackOrder,
    organizationId,
  });

  if (await isFullyOnline()) processOutbox().catch(console.error);
  return toResponse(local);
};

export const updateBackOrderOffline = async (id: string, request: BackOrderRequest) =>
  createBackOrderOffline(request, id);

export const pullAndCacheBackOrders = async (
  fetcher: () => Promise<BackOrderResponse[]>
): Promise<BackOrderResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await offlineDb.back_orders.where('organizationId').equals(seller.organizationId).toArray();
  if (!(await isFullyOnline())) return localList.map(toResponse);

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.back_orders.where('syncStatus').equals('pending').toArray()).map((b) => b.idBackOrder)
    );

    await offlineDb.transaction('rw', offlineDb.back_orders, async () => {
      for (const b of remote) {
        if (!b.idBackOrder || pendingIds.has(b.idBackOrder)) continue;
        await offlineDb.back_orders.put({
          idBackOrder: b.idBackOrder,
          numeroBackOrder: b.numeroBackOrder,
          idBonLivraison: b.idBonLivraison ?? '',
          idClient: b.idClient,
          dateCreation: b.dateCreation ?? now(),
          statut: b.statut ?? 'EN_ATTENTE',
          lignes: b.lignes ?? [],
          nomClient: b.nomClient,
          organizationId: seller.organizationId,
          agencyId: b.agencyId,
          createdBy: b.createdBy,
          syncStatus: 'synced',
          createdAt: b.createdAt ?? now(),
          updatedAt: b.updatedAt ?? now(),
        });
      }
    });

    const pendingLocal = await offlineDb.back_orders
      .where('organizationId').equals(seller.organizationId)
      .filter((b) => b.syncStatus === 'pending' || b.syncStatus === 'conflict')
      .toArray();

    const map = new Map<string, BackOrderResponse>();
    remote.forEach((b) => { if (b.idBackOrder) map.set(b.idBackOrder, b); });
    pendingLocal.map(toResponse).forEach((b) => {
      if (b.idBackOrder && !map.has(b.idBackOrder)) map.set(b.idBackOrder, b);
    });
    return Array.from(map.values());
  } catch {
    return localList.map(toResponse);
  }
};
