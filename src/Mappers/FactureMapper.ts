import { FactureCreateRequest } from '../src2/api';
import { UpdatedFactureResponse } from '../api/models/UpdatedFactureResponse';

/**
 * Mappe un objet Facture UI/Response vers un objet de création Backend.
 * Gère les fallbacks pour éviter les erreurs de validation Hibernate (ex: montantTotal).
 */
export const mapUpdatedFactureToCreateRequest = (
  response: UpdatedFactureResponse
): FactureCreateRequest => {
  return {
    // --- Identification ---
    numeroFacture: response.numeroFacture,
    idClient: response.idClient || "",
    nomClient: response.nomClient,
    adresseClient: response.adresseClient,
    emailClient: response.emailClient,
    telephoneClient: response.telephoneClient,
    organizationId: response.organizationId,
    agencyId: response.agencyId,
    originType: response.originType as unknown as FactureCreateRequest.originType,
    sessionId: response.sessionId,
    createdBy:response.createdBy,

    // --- Dates (Garantit le format string ISO requis) ---
    dateFacturation: response.dateFacturation || new Date().toISOString().split('T')[0],
    dateEcheance: response.dateEcheance || new Date().toISOString().split('T')[0],
    dateSysteme: response.dateSysteme || new Date().toISOString(),
    dateEnvoiEmail: response.dateEnvoiEmail,

    // --- Enums (Cast pour aligner FactureResponse vers FactureCreateRequest) ---
    etat: response.etat as unknown as FactureCreateRequest.etat,
    modeReglement: (response.modeReglement || FactureCreateRequest.modeReglement.AUTRE) as unknown as FactureCreateRequest.modeReglement,
    type: response.type || "VENTE",

    // --- Données Financières (Correction de l'erreur montantTotal obligatoire) ---
    montantHT: response.montantHT ?? 0,
    montantTVA: response.montantTVA ?? 0,
    montantTTC: response.montantTTC ?? 0,
    montantTotal: response.montantTotal ?? response.finalAmount ?? 0, // Fallback critique
    finalAmount: response.finalAmount ?? 0,
    montantRestant: response.montantRestant ?? 0,
    
    // --- Paramètres de Calcul ---
    applyVat: response.applyVat ?? true,
    devise: response.devise || "XAF",
    tauxChange: response.tauxChange || 1,
    remiseGlobalePourcentage: response.remiseGlobalePourcentage ?? 0,
    remiseGlobaleMontant: response.remiseGlobaleMontant ?? 0,

    // --- Références & Détails ---
    nosRef: response.nosRef,
    vosRef: response.vosRef,
    referenceCommande: response.referenceCommande,
    idDevisOrigine: response.idDevisOrigine,
    conditionsPaiement: response.conditionsPaiement,
    nbreEcheance: response.nbreEcheance,
    referalClientId: response.referalClientId,
    notes: response.notes,
    pdfPath: response.pdfPath,
    envoyeParEmail: response.envoyeParEmail ?? false,

    // --- Mapping des Lignes ---
    // --- Mapping des Lignes corrigé ---
    lignesFacture: response.lignesFacture?.map((ligne) => {
  const total = ligne.montantTotal ?? 0;

  return {
    idProduit: ligne.idProduit,
    nomProduit: ligne.nomProduit,
    description: ligne.description,
    quantite: ligne.quantite ?? 1,
    prixUnitaire: ligne.prixUnitaire ?? 0,
    montantTotal: total,
    remisePourcentage: ligne.remisePourcentage ?? 0,
    remiseMontant: ligne.remiseMontant ?? 0,
    isTaxLine: ligne.isTaxLine ?? false,

    // AJOUT DES CHAMPS MANQUANTS :
    // Généralement, pour une facture client : 
    // - Le montant TTC va au DEBIT du compte client.
    // - Le CREDIT est utilisé pour les avoirs ou les comptes de produits.
    debit: total, 
    credit: 0     
  };
}) || [],
  };
};





import { FactureResponse as BackendFactureResponse } from '@/src/src2/api/models/FactureResponse'; // Le type généré
import { FactureResponse } from '../api/models/UpdatedFactureResponse';

/**
 * Transforme une Facture provenant de l'API vers le format UpdatedFactureResponse utilisé par l'UI.
 */
export const mapBackendFactureToUpdatedFacture = (
    backend: BackendFactureResponse
): UpdatedFactureResponse => {
    return {
        // Identification
        idFacture: backend.idFacture,
        numeroFacture: backend.numeroFacture,
        
        // Dates
        dateFacturation: backend.dateFacturation,
        dateEcheance: backend.dateEcheance,
        dateSysteme: backend.dateSysteme,
        createdAt: backend.createdAt,
        updatedAt: backend.updatedAt,

        // Enums & Statuts (Mapping sécurisé vers l'enum UI)
        // Note: On cast vers UIFactureResponse.etat pour gérer les écarts de nommage
        etat: backend.etat as unknown as FactureResponse.etat,
        modeReglement: backend.modeReglement as unknown as FactureResponse.modeReglement,
        type: backend.type,

        // Client
        idClient: backend.idClient,
        nomClient: backend.nomClient,
        adresseClient: backend.adresseClient,
        emailClient: backend.emailClient,
        telephoneClient: backend.telephoneClient,
        referalClientId: backend.referalClientId,

        // Montants & Finance
        montantHT: backend.montantHT ?? 0,
        montantTVA: backend.montantTVA ?? 0,
        montantTTC: backend.montantTTC ?? 0,
        montantTotal: backend.montantTotal ?? 0,
        montantRestant: backend.montantRestant ?? 0,
        finalAmount: backend.finalAmount ?? 0,
        
        // Remises & Taxes
        remiseGlobalePourcentage: backend.remiseGlobalePourcentage ?? 0,
        remiseGlobaleMontant: backend.remiseGlobaleMontant ?? 0,
        applyVat: backend.applyVat ?? false,
        devise: backend.devise || "XAF",
        tauxChange: backend.tauxChange || 1,
        createdBy:backend.createdBy,
        organizationId:backend.organizationId,
        agencyId:backend.agencyId,
        originType: backend.originType as unknown as UpdatedFactureResponse['originType'],
        sessionId: backend.sessionId,

        // Détails & Lignes
        lignesFacture: backend.lignesFacture || [],
        conditionsPaiement: backend.conditionsPaiement,
        nbreEcheance: backend.nbreEcheance,
        nosRef: backend.nosRef,
        vosRef: backend.vosRef,
        referenceCommande: backend.referenceCommande,
        idDevisOrigine: backend.idDevisOrigine,
        notes: backend.notes,
        pdfPath: backend.pdfPath,

        // Email status
        envoyeParEmail: backend.envoyeParEmail ?? false,
        dateEnvoiEmail: backend.dateEnvoiEmail,
        docPermission: backend.docPermission,
    };
};

/**
 * Mappe un tableau de factures du backend vers le format UI
 */
export const mapBackendFactureArrayToUpdatedArray = (
    backendArray: BackendFactureResponse[] | undefined
): UpdatedFactureResponse[] => {
    if (!backendArray) return [];
    return backendArray.map(mapBackendFactureToUpdatedFacture);
};