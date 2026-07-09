import { MOCK_AGENCIES, SalesOrderResponse, UpdatedSalesOrderResponse } from '../api/models/UpdatedSalesOrder';
import { LineBonCommande, BonCommandeCreateRequest, BonCommandeResponse } from '../src2/api';
import { LigneDevisResponse } from '../api';

/**
 * UI TO API: Converts UpdatedSalesOrderResponse to BonCommandeCreateRequest
 * This ensures dates are sent as full ISO Datetime strings.
 */
export const mapSalesOrderToBonCommandeRequest = (
    order: UpdatedSalesOrderResponse
): BonCommandeCreateRequest => {
    return {
        // UUIDs / Identifiers
        numeroCommande: order.numeroSalesOrder ?? '',
        idClient: order.idClient ?? '', // Should be UUID
        nomClient: order.nomClient,
        
        // Client Contact & Delivery
        adresseClient: order.adresseClient,
        emailClient: order.emailClient,
        telephoneClient: order.telephoneClient,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhone,
        recipientAddress: order.recipientAddress,
        recipientCity: order.recipientCity,
        
        // References
        idDevisOrigine: order.idDevisOrigine, // Should be UUID
        numeroDevisOrigine: order.numeroDevisOrigine,
        nosRef: order.nosRef,
        vosRef: order.vosRef,
        
        // DATETIME MAPPING (Ensuring full ISO format)
        dateCommande: order.dateCreation ? new Date(order.dateCreation).toISOString() : new Date().toISOString(),
        dateSysteme: order.dateSysteme ? new Date(order.dateSysteme).toISOString() : undefined,
        dateLivraisonPrevue: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString() : undefined,
        
        // Line Items Mapping
        lines: (order.lignesSalesOrder ?? []).map(mapLigneToLineRequest),
        
        // Financials
        montantTTC: order.montantTTC ?? 0,
        montantHT: order.montantHT,
        montantTVA: order.montantTVA,
        devise: order.devise,
        applyVat: order.applyVat,
        
        // Logic & Methods
        transportMethod: order.transportMethod?.toString(),
        idAgency: order.idAgency, // Should be UUID
        modeReglement: order.modeReglement?.toString(),
        
        // Status mapping
        statut: order.statut as unknown as BonCommandeCreateRequest.statut,
        
        // Metadata
        notes: order.notes,
    };
};

/**
 * API TO UI: Converts BonCommandeResponse to UpdatedSalesOrderResponse
 */
export const mapBonCommandeToSalesOrderResponse = (
    apiRes: BonCommandeResponse
): UpdatedSalesOrderResponse => {
    return {
        // IDs & References (UUID Strings)
        idSalesOrder: apiRes.idBonCommande,
        numeroSalesOrder: apiRes.numeroCommande,
        idDevisOrigine: apiRes.idDevisOrigine,
        numeroDevisOrigine: apiRes.numeroDevisOrigine,
        nosRef: apiRes.nosRef,
        vosRef: apiRes.vosRef,

        // DATETIME MAPPING
        dateCreation: apiRes.dateCommande, // Already ISO string from API
        dateSysteme: apiRes.dateSysteme,
        expectedDeliveryDate: apiRes.dateLivraisonPrevue,
        deliveryDate: apiRes.validatedAt, 

        // Status mapping
        statut: apiRes.statut as unknown as SalesOrderResponse.statut,

        // Client Info
        idClient: apiRes.idClient,
        nomClient: apiRes.nomClient,
        adresseClient: apiRes.adresseClient,
        emailClient: apiRes.emailClient,
        telephoneClient: apiRes.telephoneClient,

        // Recipient Info
        recipientName: apiRes.recipientName,
        recipientPhone: apiRes.recipientPhone,
        recipientAddress: apiRes.recipientAddress,
        recipientCity: apiRes.recipientCity,

        // Line Items
        lignesSalesOrder: apiRes.lines?.map(mapLineToLigneDevis),

        // Financials
        montantHT: apiRes.montantHT,
        montantTVA: apiRes.montantTVA,
        montantTTC: apiRes.montantTTC,
        devise: apiRes.devise,
        applyVat: apiRes.applyVat,

        // Logistics & Payment
        transportMethod: apiRes.transportMethod as SalesOrderResponse.transportMethod,
        idAgency: apiRes.idAgency,
        // Linking Agency from MOCK using UUID
        agencyInfo: MOCK_AGENCIES.find(a => a.idAgency === apiRes.idAgency),
        modeReglement: apiRes.modeReglement as SalesOrderResponse.modeReglement,

        // Metadata
        notes: apiRes.notes,
        createdAt: apiRes.createdAt,
        updatedAt: apiRes.updatedAt,
        docPermission: apiRes.docPermission,
    };
};

/**
 * Line item mappers
 */
const mapLigneToLineRequest = (ligne: LigneDevisResponse): LineBonCommande => ({
    quantite: ligne.quantite,
    description: ligne.description,
    debit: ligne.debit,
    credit: ligne.credit,
    isTaxLine: ligne.isTaxLine,
    idProduit: ligne.idProduit,
    nomProduit: ligne.nomProduit,
    prixUnitaire: ligne.prixUnitaire,
    montantTotal: ligne.montantTotal,
    remisePourcentage: ligne.remisePourcentage,
    remiseMontant: ligne.remiseMontant,
});

const mapLineToLigneDevis = (line: LineBonCommande): LigneDevisResponse => ({
    quantite: line.quantite,
    description: line.description,
    debit: line.debit,
    credit: line.credit,
    isTaxLine: line.isTaxLine,
    idProduit: line.idProduit,
    nomProduit: line.nomProduit,
    prixUnitaire: line.prixUnitaire,
    montantTotal: line.montantTotal,
    remisePourcentage: line.remisePourcentage,
    remiseMontant: line.remiseMontant,
});

export const mapBonCommandeListToSalesOrderList = (
    list: BonCommandeResponse[]
): UpdatedSalesOrderResponse[] => list.map(mapBonCommandeToSalesOrderResponse);