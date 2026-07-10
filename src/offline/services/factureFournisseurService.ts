import type { FactureFournisseurCreateRequest, FactureFournisseurResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { LocalFactureFournisseur } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import { createOutboxEntry } from '../sync/outbox';
import { processOutbox } from '../sync/syncEngine';

const now = () => new Date().toISOString();

const toLocal = (
  payload: FactureFournisseurCreateRequest & { idFactureFournisseur?: string },
  organizationId: string
): LocalFactureFournisseur => {
  const id = payload.idFactureFournisseur ?? crypto.randomUUID();
  return {
    idFactureFournisseur: id,
    numeroFacture: payload.numeroFacture,
    idFournisseur: payload.idFournisseur,
    nomFournisseur: payload.nomFournisseur,
    adresseFournisseur: payload.adresseFournisseur,
    emailFournisseur: payload.emailFournisseur,
    telephoneFournisseur: payload.telephoneFournisseur,
    lines: payload.lines ?? [],
    montantHT: payload.montantHT,
    montantTVA: payload.montantTVA,
    montantTTC: payload.montantTTC,
    montantTotal: payload.montantTotal,
    modeReglement: payload.modeReglement,
    nbreEcheance: payload.nbreEcheance,
    montantRestant: payload.montantRestant,
    dateFacture: payload.dateFacture ?? now(),
    dateEcheance: payload.dateEcheance,
    statut: payload.statut ?? 'BROUILLON',
    applyVat: payload.applyVat,
    devise: payload.devise,
    notes: payload.notes,
    pdfPath: payload.pdfPath,
    createdBy: payload.createdBy,
    idBonReception: payload.idBonReception,
    numeroBonReception: payload.numeroBonReception,
    dateSysteme: payload.dateSysteme,
    agencyId: payload.agencyId,
    organizationId,
    syncStatus: 'pending',
    createdAt: now(),
    updatedAt: now(),
  };
};

const toResponse = (local: LocalFactureFournisseur): FactureFournisseurResponse => ({
  idFactureFournisseur: local.idFactureFournisseur,
  numeroFacture: local.numeroFacture,
  idFournisseur: local.idFournisseur,
  nomFournisseur: local.nomFournisseur,
  adresseFournisseur: local.adresseFournisseur,
  emailFournisseur: local.emailFournisseur,
  telephoneFournisseur: local.telephoneFournisseur,
  lines: local.lines as FactureFournisseurResponse['lines'],
  montantHT: local.montantHT,
  montantTVA: local.montantTVA,
  montantTTC: local.montantTTC,
  montantTotal: local.montantTotal,
  modeReglement: local.modeReglement as FactureFournisseurResponse.modeReglement,
  nbreEcheance: local.nbreEcheance,
  montantRestant: local.montantRestant,
  dateFacture: local.dateFacture,
  dateEcheance: local.dateEcheance,
  statut: local.statut as FactureFournisseurResponse.statut,
  applyVat: local.applyVat,
  devise: local.devise,
  notes: local.notes,
  pdfPath: local.pdfPath,
  createdBy: local.createdBy,
  idBonReception: local.idBonReception,
  numeroBonReception: local.numeroBonReception,
  dateSysteme: local.dateSysteme,
  organizationId: local.organizationId,
  agencyId: local.agencyId,
  createdAt: local.createdAt,
  updatedAt: local.updatedAt,
});

export const createFactureFournisseurOffline = async (
  request: FactureFournisseurCreateRequest,
  existingId?: string
): Promise<FactureFournisseurResponse> => {
  const seller = getStoredSeller();
  const organizationId = request.organizationId ?? seller?.organizationId ?? '';
  const idFactureFournisseur = existingId ?? crypto.randomUUID();
  const payload = { ...request, idFactureFournisseur };
  const local = toLocal(payload, organizationId);

  await offlineDb.factures_fournisseur.put(local);
  await createOutboxEntry({
    action: existingId ? 'UPDATE_FACTURE_FOURNISSEUR' : 'CREATE_FACTURE_FOURNISSEUR',
    payload: payload as unknown as Record<string, unknown>,
    endpoint: existingId ? `/api/facture-fournisseurs/${idFactureFournisseur}` : '/api/facture-fournisseurs',
    method: existingId ? 'PUT' : 'POST',
    entityId: idFactureFournisseur,
    organizationId,
  });

  if (await isFullyOnline()) processOutbox().catch(console.error);
  return toResponse(local);
};

export const updateFactureFournisseurOffline = async (id: string, request: FactureFournisseurCreateRequest) =>
  createFactureFournisseurOffline(request, id);

export const pullAndCacheFacturesFournisseur = async (
  fetcher: () => Promise<FactureFournisseurResponse[]>
): Promise<FactureFournisseurResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  const localList = await offlineDb.factures_fournisseur.where('organizationId').equals(seller.organizationId).toArray();
  if (!(await isFullyOnline())) return localList.map(toResponse);

  try {
    const remote = await fetcher();
    const pendingIds = new Set(
      (await offlineDb.factures_fournisseur.where('syncStatus').equals('pending').toArray()).map((f) => f.idFactureFournisseur)
    );

    await offlineDb.transaction('rw', offlineDb.factures_fournisseur, async () => {
      for (const f of remote) {
        if (!f.idFactureFournisseur || pendingIds.has(f.idFactureFournisseur)) continue;
        await offlineDb.factures_fournisseur.put({
          idFactureFournisseur: f.idFactureFournisseur,
          numeroFacture: f.numeroFacture,
          idFournisseur: f.idFournisseur,
          nomFournisseur: f.nomFournisseur,
          adresseFournisseur: f.adresseFournisseur,
          emailFournisseur: f.emailFournisseur,
          telephoneFournisseur: f.telephoneFournisseur,
          lines: f.lines ?? [],
          montantHT: f.montantHT,
          montantTVA: f.montantTVA,
          montantTTC: f.montantTTC,
          montantTotal: f.montantTotal,
          modeReglement: f.modeReglement,
          nbreEcheance: f.nbreEcheance,
          montantRestant: f.montantRestant,
          dateFacture: f.dateFacture ?? now(),
          dateEcheance: f.dateEcheance,
          statut: f.statut ?? 'BROUILLON',
          applyVat: f.applyVat,
          devise: f.devise,
          notes: f.notes,
          pdfPath: f.pdfPath,
          createdBy: f.createdBy,
          idBonReception: f.idBonReception,
          numeroBonReception: f.numeroBonReception,
          dateSysteme: f.dateSysteme,
          organizationId: seller.organizationId,
          agencyId: f.agencyId,
          syncStatus: 'synced',
          createdAt: f.createdAt ?? now(),
          updatedAt: f.updatedAt ?? now(),
        });
      }
    });

    const pendingLocal = await offlineDb.factures_fournisseur
      .where('organizationId').equals(seller.organizationId)
      .filter((f) => f.syncStatus === 'pending' || f.syncStatus === 'conflict')
      .toArray();

    const map = new Map<string, FactureFournisseurResponse>();
    remote.forEach((f) => { if (f.idFactureFournisseur) map.set(f.idFactureFournisseur, f); });
    pendingLocal.map(toResponse).forEach((f) => {
      if (f.idFactureFournisseur && !map.has(f.idFactureFournisseur)) map.set(f.idFactureFournisseur, f);
    });
    return Array.from(map.values());
  } catch {
    return localList.map(toResponse);
  }
};
