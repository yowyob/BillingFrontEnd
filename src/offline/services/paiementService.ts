import type { PaiementCreateRequest, PaiementResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalPaiement } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocalPaiement = (
  payload: PaiementCreateRequest & { idPaiement?: string },
  organizationId: string
): LocalPaiement => {
  const id = payload.idPaiement ?? crypto.randomUUID();
  return {
    idPaiement: id,
    idFacture: payload.idFacture ?? '',
    idClient: payload.idClient,
    montant: payload.montant,
    datePaiement: payload.date,
    date: payload.date,
    modePaiement: payload.modePaiement,
    journal: payload.journal,
    agencyId: payload.agencyId,
    organizationId,
    syncStatus: 'pending',
    createdAt: now(),
    updatedAt: now(),
  };
};

const toPaiementResponse = (local: LocalPaiement): PaiementResponse => ({
  idPaiement: local.idPaiement,
  idFacture: local.idFacture,
  idClient: local.idClient,
  montant: local.montant,
  date: local.date ?? local.datePaiement,
  modePaiement: local.modePaiement as PaiementResponse.modePaiement,
  organizationId: local.organizationId,
  agencyId: local.agencyId,
});

export const createPaiementOffline = async (
  request: PaiementCreateRequest
): Promise<PaiementResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idPaiement = crypto.randomUUID();

  const payload = { ...request, idPaiement };
  const local = toLocalPaiement(payload, organizationId);

  await offlineDb.paiements.put(local);
  await createOutboxEntry({
    action: 'CREATE_PAIEMENT',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: '/api/paiement',
    method: 'POST',
    entityId: idPaiement,
    organizationId,
  });

  if (request.idFacture) {
    const facture = await offlineDb.factures.get(request.idFacture);
    if (facture) {
      const newRestant = Math.max(0, facture.montantRestant - request.montant);
      await offlineDb.factures.update(request.idFacture, {
        montantRestant: newRestant,
        etat: newRestant === 0 ? 'PAYE' : 'PARTIELLEMENT_PAYE',
        statut: newRestant === 0 ? 'PAYE' : 'PARTIELLEMENT_PAYE',
        syncStatus: facture.syncStatus === 'synced' ? 'pending' : facture.syncStatus,
        updatedAt: now(),
      });
    }
  }

  const online = await isFullyOnline();
  if (online) processOutbox().catch(console.error);

  return toPaiementResponse(local);
};

export const getLocalPaiements = async (organizationId: string): Promise<PaiementResponse[]> => {
  const local = await offlineDb.paiements.where('organizationId').equals(organizationId).toArray();
  return local.map(toPaiementResponse);
};

export const pullAndCachePaiements = async (
  fetcher: () => Promise<PaiementResponse[]>
): Promise<PaiementResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await getLocalPaiements(seller.organizationId);
  if (!(await isFullyOnline())) return localList;

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.paiements.where('syncStatus').equals('pending').toArray()).map((p) => p.idPaiement)
    );

    await offlineDb.transaction('rw', offlineDb.paiements, async () => {
      for (const p of remote) {
        if (!p.idPaiement || pendingIds.has(p.idPaiement)) continue;
        await offlineDb.paiements.put({
          idPaiement: p.idPaiement,
          idFacture: p.idFacture ?? '',
          idClient: p.idClient ?? '',
          montant: p.montant ?? 0,
          datePaiement: p.date ?? now(),
          date: p.date,
          modePaiement: p.modePaiement ?? 'ESPECES',
          organizationId: seller.organizationId,
          agencyId: p.agencyId,
          syncStatus: 'synced',
          createdAt: p.createdAt ?? now(),
          updatedAt: p.updatedAt ?? now(),
        });
      }
    });

    const pendingLocal = await offlineDb.paiements
      .where('organizationId').equals(seller.organizationId)
      .filter((p) => p.syncStatus === 'pending' || p.syncStatus === 'conflict')
      .toArray();

    const map = new Map<string, PaiementResponse>();
    remote.forEach((p) => { if (p.idPaiement) map.set(p.idPaiement, p); });
    pendingLocal.map(toPaiementResponse).forEach((p) => {
      if (p.idPaiement && !map.has(p.idPaiement)) map.set(p.idPaiement, p);
    });
    return Array.from(map.values());
  } catch {
    return localList;
  }
};
