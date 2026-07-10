import type { FactureCreateRequest, FactureResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalFacture } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocalFacture = (
  payload: FactureCreateRequest & { idFacture?: string },
  organizationId: string
): LocalFacture => {
  const id = payload.idFacture ?? crypto.randomUUID();
  return {
    idFacture: id,
    codeFacture: payload.numeroFacture,
    numeroFacture: payload.numeroFacture,
    idClient: payload.idClient,
    dateFacture: payload.dateFacturation,
    dateFacturation: payload.dateFacturation,
    dateEcheance: payload.dateEcheance,
    statut: payload.etat ?? 'BROUILLON',
    etat: payload.etat,
    montantHt: payload.montantHT ?? 0,
    montantTtc: payload.montantTTC ?? 0,
    montantHT: payload.montantHT,
    montantTTC: payload.montantTTC,
    montantTVA: payload.montantTVA,
    montantRestant: payload.montantRestant ?? payload.montantTTC ?? 0,
    lignes: payload.lignesFacture ?? [],
    lignesFacture: payload.lignesFacture,
    nomClient: payload.nomClient,
    agencyId: payload.agencyId,
    createdBy: payload.createdBy,
    organizationId,
    syncStatus: 'pending',
    createdAt: now(),
    updatedAt: now(),
  };
};

const toFactureResponse = (local: LocalFacture): FactureResponse => ({
  idFacture: local.idFacture,
  numeroFacture: local.numeroFacture ?? local.codeFacture,
  dateFacturation: local.dateFacturation ?? local.dateFacture,
  dateEcheance: local.dateEcheance,
  etat: (local.etat ?? local.statut) as FactureResponse.etat,
  idClient: local.idClient,
  nomClient: local.nomClient,
  montantHT: local.montantHT ?? local.montantHt,
  montantTTC: local.montantTTC ?? local.montantTtc,
  montantTVA: local.montantTVA,
  montantRestant: local.montantRestant,
  lignesFacture: local.lignesFacture as FactureResponse['lignesFacture'],
  organizationId: local.organizationId,
  agencyId: local.agencyId,
  createdBy: local.createdBy,
  createdAt: local.createdAt,
  updatedAt: local.updatedAt,
});

export const getLocalFactureList = async (organizationId: string): Promise<FactureResponse[]> => {
  const local = await offlineDb.factures.where('organizationId').equals(organizationId).toArray();
  return local.map(toFactureResponse);
};

export const mergeFactureLists = (
  remote: FactureResponse[],
  local: FactureResponse[]
): FactureResponse[] => {
  const map = new Map<string, FactureResponse>();
  remote.forEach((f) => { if (f.idFacture) map.set(f.idFacture, f); });
  local.forEach((f) => {
    if (f.idFacture && !map.has(f.idFacture)) map.set(f.idFacture, f);
  });
  return Array.from(map.values());
};

export const createFactureOffline = async (
  request: FactureCreateRequest,
  existingId?: string
): Promise<FactureResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idFacture = existingId ?? crypto.randomUUID();

  const payload = { ...request, idFacture };
  const local = toLocalFacture(payload, organizationId);

  await offlineDb.factures.put(local);
  await createOutboxEntry({
    action: existingId ? 'UPDATE_FACTURE' : 'CREATE_FACTURE',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: existingId ? `/api/factures/${idFacture}` : '/api/factures',
    method: existingId ? 'PUT' : 'POST',
    entityId: idFacture,
    organizationId,
  });

  const online = await isFullyOnline();
  if (online) processOutbox().catch(console.error);

  return toFactureResponse(local);
};

export const updateFactureOffline = async (
  idFacture: string,
  request: FactureCreateRequest
): Promise<FactureResponse> => {
  return createFactureOffline(request, idFacture);
};

export const pullAndCacheFactures = async (
  fetcher: () => Promise<FactureResponse[]>
): Promise<FactureResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await getLocalFactureList(seller.organizationId);
  const online = await isFullyOnline();

  if (!online) return localList;

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.factures.where('syncStatus').equals('pending').toArray()).map((f) => f.idFacture)
    );

    await offlineDb.transaction('rw', offlineDb.factures, async () => {
      for (const f of remote) {
        if (!f.idFacture || pendingIds.has(f.idFacture)) continue;
        const local: LocalFacture = {
          idFacture: f.idFacture,
          codeFacture: f.numeroFacture,
          numeroFacture: f.numeroFacture,
          idClient: f.idClient ?? '',
          dateFacture: f.dateFacturation ?? now(),
          dateFacturation: f.dateFacturation,
          dateEcheance: f.dateEcheance,
          statut: f.etat ?? 'BROUILLON',
          etat: f.etat,
          montantHt: f.montantHT ?? 0,
          montantTtc: f.montantTTC ?? 0,
          montantHT: f.montantHT,
          montantTTC: f.montantTTC,
          montantTVA: f.montantTVA,
          montantRestant: f.montantRestant ?? 0,
          lignes: f.lignesFacture ?? [],
          lignesFacture: f.lignesFacture,
          nomClient: f.nomClient,
          organizationId: seller.organizationId,
          agencyId: f.agencyId,
          createdBy: f.createdBy,
          syncStatus: 'synced',
          createdAt: f.createdAt ?? now(),
          updatedAt: f.updatedAt ?? now(),
        };
        await offlineDb.factures.put(local);
      }
    });

    const pendingLocal = await offlineDb.factures
      .where('organizationId')
      .equals(seller.organizationId)
      .filter((f) => f.syncStatus === 'pending' || f.syncStatus === 'conflict')
      .toArray();

    return mergeFactureLists(remote, pendingLocal.map(toFactureResponse));
  } catch {
    return localList;
  }
};
