import type { BonCommandeCreateRequest, BonCommandeResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalBonCommande } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocalBonCommande = (
  payload: BonCommandeCreateRequest & { idBonCommande?: string },
  organizationId: string
): LocalBonCommande => {
  const id = payload.idBonCommande ?? crypto.randomUUID();
  return {
    idBonCommande: id,
    numeroCommande: payload.numeroCommande,
    idClient: payload.idClient,
    dateCommande: payload.dateCommande,
    statut: payload.statut ?? 'BROUILLON',
    montantHt: payload.montantHT ?? 0,
    montantTtc: payload.montantTTC ?? 0,
    montantHT: payload.montantHT,
    montantTTC: payload.montantTTC,
    lignes: payload.lines ?? [],
    nomClient: payload.nomClient,
    agencyId: payload.agencyId,
    createdBy: payload.createdBy,
    organizationId,
    syncStatus: 'pending',
    createdAt: now(),
    updatedAt: now(),
  };
};

const toBonCommandeResponse = (local: LocalBonCommande): BonCommandeResponse => ({
  idBonCommande: local.idBonCommande,
  numeroCommande: local.numeroCommande,
  idClient: local.idClient,
  nomClient: local.nomClient,
  dateCommande: local.dateCommande,
  statut: local.statut as BonCommandeResponse.statut,
  montantHT: local.montantHT ?? local.montantHt,
  montantTTC: local.montantTTC ?? local.montantTtc,
  lines: local.lignes as BonCommandeResponse['lines'],
  organizationId: local.organizationId,
  agencyId: local.agencyId,
  createdBy: local.createdBy,
});

export const createBonCommandeOffline = async (
  request: BonCommandeCreateRequest,
  existingId?: string
): Promise<BonCommandeResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idBonCommande = existingId ?? crypto.randomUUID();

  const payload = { ...request, idBonCommande };
  const local = toLocalBonCommande(payload, organizationId);

  await offlineDb.bon_commandes.put(local);
  await createOutboxEntry({
    action: existingId ? 'UPDATE_BON_COMMANDE' : 'CREATE_BON_COMMANDE',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: existingId ? `/api/bon-commande/${idBonCommande}` : '/api/bon-commande',
    method: existingId ? 'PUT' : 'POST',
    entityId: idBonCommande,
    organizationId,
  });

  if (await isFullyOnline()) processOutbox().catch(console.error);
  return toBonCommandeResponse(local);
};

export const updateBonCommandeOffline = async (
  idBonCommande: string,
  request: BonCommandeCreateRequest
): Promise<BonCommandeResponse> => createBonCommandeOffline(request, idBonCommande);

export const pullAndCacheBonCommandes = async (
  fetcher: () => Promise<BonCommandeResponse[]>
): Promise<BonCommandeResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await offlineDb.bon_commandes.where('organizationId').equals(seller.organizationId).toArray();
  if (!(await isFullyOnline())) return localList.map(toBonCommandeResponse);

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.bon_commandes.where('syncStatus').equals('pending').toArray()).map((b) => b.idBonCommande)
    );

    await offlineDb.transaction('rw', offlineDb.bon_commandes, async () => {
      for (const b of remote) {
        if (!b.idBonCommande || pendingIds.has(b.idBonCommande)) continue;
        await offlineDb.bon_commandes.put({
          idBonCommande: b.idBonCommande,
          numeroCommande: b.numeroCommande ?? '',
          idClient: b.idClient ?? '',
          dateCommande: b.dateCommande ?? now(),
          statut: b.statut ?? 'BROUILLON',
          montantHt: b.montantHT ?? 0,
          montantTtc: b.montantTTC ?? 0,
          montantHT: b.montantHT,
          montantTTC: b.montantTTC,
          lignes: b.lines ?? [],
          nomClient: b.nomClient,
          organizationId: seller.organizationId,
          agencyId: b.agencyId,
          createdBy: b.createdBy,
          syncStatus: 'synced',
          createdAt: now(),
          updatedAt: now(),
        });
      }
    });

    const pendingLocal = await offlineDb.bon_commandes
      .where('organizationId').equals(seller.organizationId)
      .filter((b) => b.syncStatus === 'pending' || b.syncStatus === 'conflict')
      .toArray();

    const map = new Map<string, BonCommandeResponse>();
    remote.forEach((b) => { if (b.idBonCommande) map.set(b.idBonCommande, b); });
    pendingLocal.map(toBonCommandeResponse).forEach((b) => {
      if (b.idBonCommande && !map.has(b.idBonCommande)) map.set(b.idBonCommande, b);
    });
    return Array.from(map.values());
  } catch {
    return localList.map(toBonCommandeResponse);
  }
};
