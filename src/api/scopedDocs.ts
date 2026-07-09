import {
  DevisService,
  DevisResponse,
  FactureService,
  FactureResponse,
  FacturesProformaService,
  ProformaInvoiceResponse,
  BackOrderService,
  BackOrderResponse,
  NoteCreditControllerService,
  NoteCreditResponse,
  BonDAchatService,
  BonAchatResponse,
  BonCommandeService,
  BonCommandeResponse,
  BonDeLivraisonService,
  BonLivraisonResponse,
  BondeReceptionControllerService,
  BondeReceptionResponse,
  FactureFournisseurControllerService,
  FactureFournisseurResponse,
} from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { SellerRole } from "@/src/api/models/UpdatedSellerResponse";

/**
 * Document visibility by role:
 * - OWNER: every document in the organization
 * - AGENCY_MANAGER: every document for their agency
 * - SELLER / POS_SELLER: only documents they hold a permission on (owner/editor/viewer)
 */
async function loadScoped<T>(
  byOrganizationId: (organizationId: string) => Promise<T[]>,
  byAgencyId: (agencyId: string) => Promise<T[]>,
  bySellerId: (sellerId: string) => Promise<T[]>
): Promise<T[]> {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];

  if (seller.role === SellerRole.OWNER) {
    return byOrganizationId(seller.organizationId);
  }
  if (seller.role === SellerRole.AGENCY_MANAGER) {
    if (!seller.agencyId) return [];
    return byAgencyId(seller.agencyId);
  }
  if (!seller.Id) return [];
  return bySellerId(seller.Id);
}

export const getVisibleDevis = (): Promise<DevisResponse[]> =>
  loadScoped(DevisService.getDevisByOrganizationId, DevisService.getDevisByAgencyId, DevisService.getDevisBySellerId);

export const getVisibleFactures = (): Promise<FactureResponse[]> =>
  loadScoped(FactureService.getFacturesByOrganizationId, FactureService.getFacturesByAgencyId, FactureService.getFacturesBySellerId);

export const getVisibleProformas = (): Promise<ProformaInvoiceResponse[]> =>
  loadScoped(FacturesProformaService.getProformasByOrganizationId, FacturesProformaService.getProformasByAgencyId, FacturesProformaService.getProformasBySellerId);

export const getVisibleBackOrders = (): Promise<BackOrderResponse[]> =>
  loadScoped(BackOrderService.getByOrganizationId2, BackOrderService.getByAgencyId2, BackOrderService.getBySellerId2);

export const getVisibleNoteCredits = (): Promise<NoteCreditResponse[]> =>
  loadScoped(NoteCreditControllerService.getNotesCreditByOrganizationId, NoteCreditControllerService.getNotesCreditByAgencyId, NoteCreditControllerService.getNotesCreditBySellerId);

export const getVisibleBonAchats = (): Promise<BonAchatResponse[]> =>
  loadScoped(BonDAchatService.getByOrganizationId5, BonDAchatService.getByAgencyId5, BonDAchatService.getBySellerId5);

export const getVisibleBonCommandes = (): Promise<BonCommandeResponse[]> =>
  loadScoped(BonCommandeService.getByOrganizationId6, BonCommandeService.getByAgencyId6, BonCommandeService.getBySellerId6);

export const getVisibleBonLivraisons = (): Promise<BonLivraisonResponse[]> =>
  loadScoped(BonDeLivraisonService.getByOrganizationId4, BonDeLivraisonService.getByAgencyId4, BonDeLivraisonService.getBySellerId4);

export const getVisibleBonReceptions = (): Promise<BondeReceptionResponse[]> =>
  loadScoped(BondeReceptionControllerService.getByOrganizationId1, BondeReceptionControllerService.getByAgencyId1, BondeReceptionControllerService.getBySellerId1);

export const getVisibleFacturesFournisseur = (): Promise<FactureFournisseurResponse[]> =>
  loadScoped(FactureFournisseurControllerService.getByOrganizationId3, FactureFournisseurControllerService.getByAgencyId3, FactureFournisseurControllerService.getBySellerId3);
