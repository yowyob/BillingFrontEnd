import type { ProformaInvoiceRequest, ProformaInvoiceResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalProforma } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocalProforma = (
  payload: ProformaInvoiceRequest & { idFactureProforma?: string },
  organizationId: string
): LocalProforma => {
  const id = payload.idFactureProforma ?? crypto.randomUUID();
  return {
    idFactureProforma: id,
    numeroProformaInvoice: payload.numeroProformaInvoice,
    idClient: payload.idClient,
    dateCreation: now(),
    statut: payload.statut ?? 'BROUILLON',
    montantHt: payload.montantHT ?? 0,
    montantTtc: payload.montantTTC ?? 0,
    montantHT: payload.montantHT,
    montantTTC: payload.montantTTC,
    montantTVA: payload.montantTVA,
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

const toProformaResponse = (local: LocalProforma): ProformaInvoiceResponse => ({
  idFactureProforma: local.idFactureProforma,
  numeroProformaInvoice: local.numeroProformaInvoice,
  dateCreation: local.dateCreation,
  statut: local.statut as ProformaInvoiceResponse.statut,
  idClient: local.idClient,
  nomClient: local.nomClient,
  montantHT: local.montantHT ?? local.montantHt,
  montantTTC: local.montantTTC ?? local.montantTtc,
  montantTVA: local.montantTVA,
  lignesFactureProforma: local.lignes as ProformaInvoiceResponse['lignesFactureProforma'],
  organizationId: local.organizationId,
  agencyId: local.agencyId,
  createdBy: local.createdBy,
});

export const createProformaOffline = async (
  request: ProformaInvoiceRequest,
  existingId?: string
): Promise<ProformaInvoiceResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idFactureProforma = existingId ?? crypto.randomUUID();

  const payload = { ...request, idFactureProforma };
  const local = toLocalProforma(payload, organizationId);

  await offlineDb.proformas.put(local);
  await createOutboxEntry({
    action: existingId ? 'UPDATE_PROFORMA' : 'CREATE_PROFORMA',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: existingId ? `/api/factures-proforma/${idFactureProforma}` : '/api/factures-proforma',
    method: existingId ? 'PUT' : 'POST',
    entityId: idFactureProforma,
    organizationId,
  });

  if (await isFullyOnline()) processOutbox().catch(console.error);
  return toProformaResponse(local);
};

export const updateProformaOffline = async (
  idFactureProforma: string,
  request: ProformaInvoiceRequest
): Promise<ProformaInvoiceResponse> => createProformaOffline(request, idFactureProforma);

export const pullAndCacheProformas = async (
  fetcher: () => Promise<ProformaInvoiceResponse[]>
): Promise<ProformaInvoiceResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await offlineDb.proformas.where('organizationId').equals(seller.organizationId).toArray();
  if (!(await isFullyOnline())) return localList.map(toProformaResponse);

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.proformas.where('syncStatus').equals('pending').toArray()).map((p) => p.idFactureProforma)
    );

    await offlineDb.transaction('rw', offlineDb.proformas, async () => {
      for (const p of remote) {
        if (!p.idFactureProforma || pendingIds.has(p.idFactureProforma)) continue;
        await offlineDb.proformas.put({
          idFactureProforma: p.idFactureProforma,
          numeroProformaInvoice: p.numeroProformaInvoice,
          idClient: p.idClient ?? '',
          dateCreation: p.dateCreation ?? now(),
          statut: p.statut ?? 'BROUILLON',
          montantHt: p.montantHT ?? 0,
          montantTtc: p.montantTTC ?? 0,
          montantHT: p.montantHT,
          montantTTC: p.montantTTC,
          montantTVA: p.montantTVA,
          lignes: p.lignesFactureProforma ?? [],
          nomClient: p.nomClient,
          organizationId: seller.organizationId,
          agencyId: p.agencyId,
          createdBy: p.createdBy,
          syncStatus: 'synced',
          createdAt: p.dateCreation ?? now(),
          updatedAt: now(),
        });
      }
    });

    const pendingLocal = await offlineDb.proformas
      .where('organizationId').equals(seller.organizationId)
      .filter((p) => p.syncStatus === 'pending' || p.syncStatus === 'conflict')
      .toArray();

    const map = new Map<string, ProformaInvoiceResponse>();
    remote.forEach((p) => { if (p.idFactureProforma) map.set(p.idFactureProforma, p); });
    pendingLocal.map(toProformaResponse).forEach((p) => {
      if (p.idFactureProforma && !map.has(p.idFactureProforma)) map.set(p.idFactureProforma, p);
    });
    return Array.from(map.values());
  } catch {
    return localList.map(toProformaResponse);
  }
};
