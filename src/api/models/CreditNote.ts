import type { LigneFactureResponse } from './LigneFactureResponse';

export type CreditNoteResponse = {
    idCNoteCredit?: string;
    numeroNoteCredit?:string;
    numeroFacture?: string;
    dateFacturation?: string;
    dateEcheance?: string;
    dateSysteme?: string;
    etat?: CreditNoteResponse.etat;
    type?: "AVOIR"; // Marks this as a credit note
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    montantHT?: number;      // Negative amounts for reversal
    montantTVA?: number;     // Negative amounts for reversal
    montantTTC?: number;
    montantTotal?: number;
    montantRestant?: number;
    finalAmount?: number;
    remiseGlobalePourcentage?: number;
    remiseGlobaleMontant?: number;
    applyVat?: boolean;
    devise?: string;
    tauxChange?: number;
    modeReglement?: CreditNoteResponse.modeReglement;
    conditionsPaiement?: string;
    nbreEcheance?: number;
    nosRef?: string;
    vosRef?: string;
    referenceCommande?: string;
    idDevisOrigine?: string;
    lignesFacture?: Array<LigneFactureResponse>; // Line items, negative for returned/cancelled items
    notes?: string;
    pdfPath?: string;
    envoyeParEmail?: boolean;
    dateEnvoiEmail?: string;
    createdAt?: string;
    updatedAt?: string;
    referalClientId?: string;
};

export namespace CreditNoteResponse {
    export enum etat {
        BROUILLON = 'BROUILLON',
        ENVOYE = 'ENVOYE',
        PAYE = 'PAYE',
        PARTIELLEMENT_PAYE = 'PARTIELLEMENT_PAYE',
        EN_RETARD = 'EN_RETARD',
        ANNULE = 'ANNULE',
    }

    export enum modeReglement {
        VIREMENT = 'VIREMENT',
        CARTE_BANCAIRE = 'CARTE_BANCAIRE',
        ESPECES = 'ESPECES',
        CHEQUE = 'CHEQUE',
        PRELEVEMENT = 'PRELEVEMENT',
        PAYPAL = 'PAYPAL',
        AUTRE = 'AUTRE',
        BON_D_ACHAT = 'BON_D_ACHAT', // Optional: if credit is issued as store credit
    }
}
