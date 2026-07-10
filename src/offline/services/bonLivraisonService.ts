import type { BonLivraisonRequest, BonLivraisonResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalBonLivraison } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocalBonLivraison = (
  payload: BonLivraisonRequest & { idBonLivraison?: string },
  organizationId: string
): LocalBonLivraison => {
  const id = payload.idBonLivraison ?? crypto.randomUUID();
  return {
    idBonLivraison: id,
    numeroBonLivraison: payload.numeroBonLivraison,
    idClient: payload.idClient,
    dateLivraison: payload.dateLivraison,
    statut: payload.statut ?? 'EN_PREPARATION',
    montantHt: payload.montantHT ?? 0,
    montantTtc: payload.montantTTC ?? 0,
    montantHT: payload.montantHT,
    montantTTC: payload.montantTTC,
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

const toBonLivraisonResponse = (local: LocalBonLivraison): BonLivraisonResponse => ({
  idBonLivraison: local.idBonLivraison,
  numeroBonLivraison: local.numeroBonLivraison,
  idClient: local.idClient,
  nomClient: local.nomClient,
  dateLivraison: local.dateLivraison,
  statut: local.statut as BonLivraisonResponse.statut,
  montantHT: local.montantHT ?? local.montantHt,
  montantTTC: local.montantTTC ?? local.montantTtc,
  lignes: local.lignes as BonLivraisonResponse['lignes'],
  organizationId: local.organizationId,
  agencyId: local.agencyId,
  createdBy: local.createdBy,
});

export const createBonLivraisonOffline = async (
  request: BonLivraisonRequest,
  existingId?: string
): Promise<BonLivraisonResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idBonLivraison = existingId ?? crypto.randomUUID();

  const payload = { ...request, idBonLivraison };
  const local = toLocalBonLivraison(payload, organizationId);

  await offlineDb.bon_livraisons.put(local);
  await createOutboxEntry({
    action: existingId ? 'UPDATE_BON_LIVRAISON' : 'CREATE_BON_LIVRAISON',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: existingId ? `/api/bons-livraison/${idBonLivraison}` : '/api/bons-livraison',
    method: existingId ? 'PUT' : 'POST',
    entityId: idBonLivraison,
    organizationId,
  });

  if (await isFullyOnline()) processOutbox().catch(console.error);
  return toBonLivraisonResponse(local);
};

export const updateBonLivraisonOffline = async (
  idBonLivraison: string,
  request: BonLivraisonRequest
): Promise<BonLivraisonResponse> => createBonLivraisonOffline(request, idBonLivraison);

export const pullAndCacheBonLivraisons = async (
  fetcher: () => Promise<BonLivraisonResponse[]>
): Promise<BonLivraisonResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await offlineDb.bon_livraisons.where('organizationId').equals(seller.organizationId).toArray();
  if (!(await isFullyOnline())) return localList.map(toBonLivraisonResponse);

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.bon_livraisons.where('syncStatus').equals('pending').toArray()).map((b) => b.idBonLivraison)
    );

    await offlineDb.transaction('rw', offlineDb.bon_livraisons, async () => {
      for (const b of remote) {
        if (!b.idBonLivraison || pendingIds.has(b.idBonLivraison)) continue;
        await offlineDb.bon_livraisons.put({
          idBonLivraison: b.idBonLivraison,
          numeroBonLivraison: b.numeroBonLivraison,
          idClient: b.idClient ?? '',
          dateLivraison: b.dateLivraison ?? now(),
          statut: b.statut ?? 'EN_PREPARATION',
          montantHt: b.montantHT ?? 0,
          montantTtc: b.montantTTC ?? 0,
          montantHT: b.montantHT,
          montantTTC: b.montantTTC,
          lignes: b.lignes ?? [],
          nomClient: b.nomClient,
          organizationId: seller.organizationId,
          agencyId: b.agencyId,
          createdBy: b.createdBy,
          syncStatus: 'synced',
          createdAt: now(),
          updatedAt: b.updatedAt ?? now(),
        });
      }
    });

    const pendingLocal = await offlineDb.bon_livraisons
      .where('organizationId').equals(seller.organizationId)
      .filter((b) => b.syncStatus === 'pending' || b.syncStatus === 'conflict')
      .toArray();

    const map = new Map<string, BonLivraisonResponse>();
    remote.forEach((b) => { if (b.idBonLivraison) map.set(b.idBonLivraison, b); });
    pendingLocal.map(toBonLivraisonResponse).forEach((b) => {
      if (b.idBonLivraison && !map.has(b.idBonLivraison)) map.set(b.idBonLivraison, b);
    });
    return Array.from(map.values());
  } catch {
    return localList.map(toBonLivraisonResponse);
  }
};
