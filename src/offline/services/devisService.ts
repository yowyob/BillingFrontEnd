import type { DevisCreateRequest, DevisResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalDevis } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocalDevis = (
  payload: DevisCreateRequest & { idDevis?: string },
  organizationId: string
): LocalDevis => {
  const id = payload.idDevis ?? crypto.randomUUID();
  return {
    idDevis: id,
    codeDevis: payload.numeroDevis,
    numeroDevis: payload.numeroDevis,
    idClient: payload.idClient,
    dateCreation: payload.dateCreation ?? now(),
    dateValidite: payload.dateValidite,
    statut: payload.statut ?? 'BROUILLON',
    montantHt: payload.montantHT ?? 0,
    montantTtc: payload.montantTTC ?? 0,
    montantHT: payload.montantHT,
    montantTTC: payload.montantTTC,
    montantTVA: payload.montantTVA,
    lignes: payload.lignesDevis ?? [],
    lignesDevis: payload.lignesDevis,
    nomClient: payload.nomClient,
    agencyId: payload.agencyId,
    createdBy: payload.createdBy,
    organizationId,
    syncStatus: 'pending',
    createdAt: now(),
    updatedAt: now(),
  };
};

const toDevisResponse = (local: LocalDevis): DevisResponse => ({
  idDevis: local.idDevis,
  numeroDevis: local.numeroDevis ?? local.codeDevis,
  dateCreation: local.dateCreation,
  dateValidite: local.dateValidite,
  statut: local.statut as DevisResponse.statut,
  idClient: local.idClient,
  nomClient: local.nomClient,
  montantHT: local.montantHT ?? local.montantHt,
  montantTTC: local.montantTTC ?? local.montantTtc,
  montantTVA: local.montantTVA,
  lignesDevis: local.lignesDevis as DevisResponse['lignesDevis'],
  organizationId: local.organizationId,
  agencyId: local.agencyId,
  createdBy: local.createdBy,
  createdAt: local.createdAt,
  updatedAt: local.updatedAt,
});

export const getLocalDevisList = async (organizationId: string): Promise<DevisResponse[]> => {
  const local = await offlineDb.devis.where('organizationId').equals(organizationId).toArray();
  return local.map(toDevisResponse);
};

export const mergeDevisLists = (
  remote: DevisResponse[],
  local: DevisResponse[]
): DevisResponse[] => {
  const map = new Map<string, DevisResponse>();
  remote.forEach((d) => { if (d.idDevis) map.set(d.idDevis, d); });
  local.forEach((d) => {
    if (d.idDevis && !map.has(d.idDevis)) map.set(d.idDevis, d);
  });
  return Array.from(map.values());
};

export const createDevisOffline = async (
  request: DevisCreateRequest,
  existingId?: string
): Promise<DevisResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idDevis = existingId ?? crypto.randomUUID();

  const payload = { ...request, idDevis };
  const local = toLocalDevis(payload, organizationId);

  await offlineDb.devis.put(local);
  await createOutboxEntry({
    action: existingId ? 'UPDATE_DEVIS' : 'CREATE_DEVIS',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: existingId ? `/api/devis/${idDevis}` : '/api/devis',
    method: existingId ? 'PUT' : 'POST',
    entityId: idDevis,
    organizationId,
  });

  const online = await isFullyOnline();
  if (online) processOutbox().catch(console.error);

  return toDevisResponse(local);
};

export const updateDevisOffline = async (
  idDevis: string,
  request: DevisCreateRequest
): Promise<DevisResponse> => {
  return createDevisOffline(request, idDevis);
};

export const pullAndCacheDevis = async (
  fetcher: () => Promise<DevisResponse[]>
): Promise<DevisResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await getLocalDevisList(seller.organizationId);
  const online = await isFullyOnline();

  if (!online) return localList;

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.devis.where('syncStatus').equals('pending').toArray()).map((d) => d.idDevis)
    );

    await offlineDb.transaction('rw', offlineDb.devis, async () => {
      for (const d of remote) {
        if (!d.idDevis || pendingIds.has(d.idDevis)) continue;
        const local: LocalDevis = {
          idDevis: d.idDevis,
          codeDevis: d.numeroDevis,
          numeroDevis: d.numeroDevis,
          idClient: d.idClient ?? '',
          dateCreation: d.dateCreation ?? now(),
          dateValidite: d.dateValidite,
          statut: d.statut ?? 'BROUILLON',
          montantHt: d.montantHT ?? 0,
          montantTtc: d.montantTTC ?? 0,
          montantHT: d.montantHT,
          montantTTC: d.montantTTC,
          montantTVA: d.montantTVA,
          lignes: d.lignesDevis ?? [],
          lignesDevis: d.lignesDevis,
          nomClient: d.nomClient,
          organizationId: seller.organizationId,
          agencyId: d.agencyId,
          createdBy: d.createdBy,
          syncStatus: 'synced',
          createdAt: d.createdAt ?? now(),
          updatedAt: d.updatedAt ?? now(),
        };
        await offlineDb.devis.put(local);
      }
    });

    const pendingLocal = await offlineDb.devis
      .where('organizationId')
      .equals(seller.organizationId)
      .filter((d) => d.syncStatus === 'pending' || d.syncStatus === 'conflict')
      .toArray();

    return mergeDevisLists(remote, pendingLocal.map(toDevisResponse));
  } catch {
    return localList;
  }
};
