import { ProformaInvoiceResponse, LigneProformaResponse, ProformaInvoiceRequest } from '../src2/api';
import { UpdatedProformaInvoiceResponse } from '../api/models/UpdatedProformaInvoiceResponse';
import { LigneDevisResponse } from '../api';

/**
 * Helper to ensure a string is a valid LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
 * Strips milliseconds and Z/Timezone offsets for backend compatibility.
 */
const ensureDateTime = (dateStr?: string): string => {
    try {
        const date = dateStr ? new Date(dateStr) : new Date();
        // If the date is invalid (NaN), fallback to now
        const finalDate = isNaN(date.getTime()) ? new Date() : date;
        return finalDate.toISOString().split('.')[0]; 
    } catch {
        return new Date().toISOString().split('.')[0];
    }
};

/**
 * Maps a single LigneProformaResponse to LigneDevisResponse
 */
const mapLigneToUI = (ligne: LigneProformaResponse): LigneDevisResponse => {
    return {
        idProduit: ligne.idProduit,
        nomProduit: ligne.nomProduit,
        description: ligne.description,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        montantTotal: ligne.montantTotal,
        remisePourcentage: ligne.remisePourcentage,
        remiseMontant: ligne.remiseMontant,
        isTaxLine: false,
        debit: 0,
        credit: 0
    };
};

/**
 * API -> UI: Maps ProformaInvoiceResponse to UpdatedProformaInvoiceResponse
 */
export const mapProformaResponseToUI = (
    response: ProformaInvoiceResponse
): UpdatedProformaInvoiceResponse => {
    return {
        ...response,
        // Standardizing all Dates to Datetime
        dateCreation: response.dateCreation ? ensureDateTime(response.dateCreation) : undefined,
        dateEnvoiEmail: response.dateEnvoiEmail ? ensureDateTime(response.dateEnvoiEmail) : undefined,
        dateAcceptation: response.dateAcceptation ? ensureDateTime(response.dateAcceptation) : undefined,
        dateRefus: response.dateRefus ? ensureDateTime(response.dateRefus) : undefined,
        dateSysteme: response.dateSysteme ? ensureDateTime(response.dateSysteme) : undefined,
        createdAt: response.createdAt ? ensureDateTime(response.createdAt) : undefined,
        updatedAt: response.updatedAt ? ensureDateTime(response.updatedAt) : undefined,

        statut: response.statut as unknown as UpdatedProformaInvoiceResponse.statut,
        modeReglement: response.modeReglement as unknown as UpdatedProformaInvoiceResponse.modeReglement,
        
        lignesDevis: response.lignesFactureProforma?.map(mapLigneToUI) || [],
        
        applyVat: response.applyVat ?? false,
        finalAmount: response.finalAmount ?? response.montantTTC ?? 0,
    };
};

/**
 * Array API -> UI
 */
export const mapProformaArrayToUI = (
    responses: ProformaInvoiceResponse[]
): UpdatedProformaInvoiceResponse[] => {
    if (!responses) return [];
    return responses.map(mapProformaResponseToUI);
};

/**
 * Maps individual UI lines back to API Request format
 */
const mapLineToRequest = (line: LigneDevisResponse): any => {
    return {
        idProduit: line.idProduit ?? "Not Found",
        nomProduit: line.nomProduit,
        description: line.description,
        quantite: line.quantite ?? 0,
        prixUnitaire:  line.prixUnitaire ?? 0,
        remisePourcentage: line.remisePourcentage ?? 0,
        remiseMontant: line.remiseMontant ?? 0,
        tauxTva: 0, 
    };
};

/**
 * UI -> API Request: Standardizes all dates to Datetime
 *//**
 * UI -> API Request: Standardizes all dates to Datetime and removes OrgID dependency
 */
export const mapUIToProformaRequest = (
    uiModel: UpdatedProformaInvoiceResponse
): ProformaInvoiceRequest => {
    return {
        // Basic Info
        numeroProformaInvoice: uiModel.numeroProformaInvoice,
        idClient: uiModel.idClient ?? '',
        nomClient: uiModel.nomClient,
        adresseClient: uiModel.adresseClient,
        emailClient: uiModel.emailClient,
        telephoneClient: uiModel.telephoneClient,

        // Data Mapping: UI 'lignesDevis' -> API 'lignes'
        lignes: uiModel.lignesDevis?.map(mapLineToRequest) || [],

        // Financials
        montantHT: uiModel.montantHT,
        montantTVA: uiModel.montantTVA,
        montantTTC: uiModel.montantTTC,
        remiseGlobalePourcentage: uiModel.remiseGlobalePourcentage,
        remiseGlobaleMontant: uiModel.remiseGlobaleMontant,
        
        // System Settings
        type: uiModel.type,
        statut: uiModel.statut as unknown as ProformaInvoiceRequest.statut,
        applyVat: uiModel.applyVat,
        devise: uiModel.devise,
        tauxChange: uiModel.tauxChange,
        
        // Standardizing dateSysteme to Datetime (YYYY-MM-DDTHH:mm:ss)
        dateSysteme: ensureDateTime(uiModel.dateSysteme),
        
        // References & Terms
        modeReglement: (uiModel.modeReglement || ProformaInvoiceRequest.modeReglement.AUTRE) as unknown as ProformaInvoiceRequest.modeReglement,
        conditionsPaiement: uiModel.conditionsPaiement,
        notes: uiModel.notes,
        referenceExterne: uiModel.referenceExterne,
        nosRef: uiModel.nosRef,
        vosRef: uiModel.vosRef,
        nbreEcheance: uiModel.nbreEcheance,
        referalClientId: uiModel.referalClientId,
        validiteOffreJours: uiModel.validiteOffreJours,
    };
};