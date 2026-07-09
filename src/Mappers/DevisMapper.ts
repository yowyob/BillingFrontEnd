
import { UpdatedDevisResponse } from '@/src/api/models/UpdatedDevisResponse';
import { DevisCreateRequest } from '../src2/api';
/**
 * Mappe un Devis existant (Response) vers un format de création (Request)
 * Utile pour la duplication ou la réédition de devis.
 */

/**
 * Mappe un UpdatedDevisResponse vers un DevisCreateRequest.
 * Gère les champs obligatoires manquants (debit, credit) et harmonise les enums.
 */
/**
 * Mappe un UpdatedDevisResponse vers un DevisCreateRequest.
 * Assure la conformité avec LigneDevisCreateRequest (debit, credit, quantite).
 */
export const mapUpdatedResponseToCreateRequest = (
    response: UpdatedDevisResponse,
    
): DevisCreateRequest => {
    return {
        // --- Identification & Scope ---
        numeroDevis: response.numeroDevis,
        nosRef: response.nosRef,
        vosRef: response.vosRef,
        referenceExterne: response.referenceExterne,
        

        // --- Dates (Format ISO requis par le Backend) ---
        dateCreation: response.dateCreation || new Date().toISOString(),
        dateValidite: response.dateValidite || new Date().toISOString(),
        dateSysteme: response.dateSysteme || new Date().toISOString(),
        
        // --- Infos Client ---
        idClient: response.idClient || '',
        nomClient: response.nomClient,
        adresseClient: response.adresseClient,
        emailClient: response.emailClient,
        telephoneClient: response.telephoneClient,
        referalClientId: response.referalClientId,

        // --- Statut & Règlement ---
        type: response.type,
        // On réinitialise à BROUILLON pour une nouvelle demande de création
        statut: DevisCreateRequest.statut.BROUILLON, 
        modeReglement: (response.modeReglement || DevisCreateRequest.modeReglement.AUTRE) as unknown as DevisCreateRequest.modeReglement,
        applyVat: response.applyVat,
        conditionsPaiement: response.conditionsPaiement,
        nbreEcheance: response.nbreEcheance,
        validiteOffreJours: response.validiteOffreJours,

        // --- MAPPING DES LIGNES (Satisfait LigneDevisCreateRequest) ---
        lignesDevis: response.lignesDevis?.map(ligne => ({
            // Champs obligatoires selon votre définition
            quantite: ligne.quantite || 0,
            debit: ligne.debit ?? ligne.montantTotal ?? 0,
            credit: ligne.credit ?? 0,
            
            // Champs optionnels ou calculés
            idProduit: ligne.idProduit,
            nomProduit: ligne.nomProduit,
            description: ligne.description,
            prixUnitaire: ligne.prixUnitaire,
            montantTotal: ligne.montantTotal,
            remiseMontant: ligne.remiseMontant,
            remisePourcentage: ligne.remisePourcentage,
            isTaxLine: ligne.isTaxLine ?? false
        })),

        // --- Données Financières Globales ---
        montantHT: response.montantHT,
        montantTVA: response.montantTVA,
        montantTTC: response.montantTTC,
        montantTotal: response.montantTotal||0,
        finalAmount: response.finalAmount,
        devise: response.devise || 'XAF',
        tauxChange: response.tauxChange || 1,
        remiseGlobalePourcentage: response.remiseGlobalePourcentage,
        remiseGlobaleMontant: response.remiseGlobaleMontant,

        // --- Metadata ---
        notes: response.notes,
        pdfPath: response.pdfPath,
        createdBy:response.createdBy,
        organizationId:response.organizationId,
        agencyId:response.agencyId
    };
};

import { DevisResponse } from '../src2/api/models/DevisResponse';


/**
 * Mappe les données brutes du Backend vers le format enrichi de l'UI
 */
export const mapBackendToUpdatedDevis = (backend: DevisResponse): UpdatedDevisResponse => {
    return {
        // Copie de toutes les propriétés communes
        ...backend,

        // --- Alignement des Enums ---
        // On force le type car les namespaces diffèrent mais les valeurs sont identiques
        statut: backend.statut as unknown as UpdatedDevisResponse.statut,
        
        // Gestion sécurisée du mode de règlement
        modeReglement: backend.modeReglement as unknown as UpdatedDevisResponse.modeReglement,
        // --- Garanties pour les champs obligatoires dans l'UI ---
        applyVat: backend.applyVat ?? true,
        finalAmount: backend.finalAmount ?? backend.montantTTC ?? backend.montantTotal ?? 0,

        // --- Champs additionnels (Mapping explicite pour clarté) ---
        dateSysteme: backend.dateSysteme,
        nosRef: backend.nosRef,
        vosRef: backend.vosRef,
        nbreEcheance: backend.nbreEcheance,
        referalClientId: backend.referalClientId,
        createdBy:backend.createdBy,
        docPermission: backend.docPermission,
    };
};

/**
 * Utilitaire pour convertir l'enum de règlement
 * UpdatedDevisResponse n'ayant pas ORANGE_MONEY/MOBILE_MONEY par défaut
 */


export const mapBackendArrayToUpdatedDevisArray=(backend:DevisResponse[]):UpdatedDevisResponse[]=>{
    return backend?.map(n=> mapBackendToUpdatedDevis(n))
}