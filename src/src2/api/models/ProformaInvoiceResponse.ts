/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocPermissionResponse } from './DocPermissionResponse';
import type { LigneProformaResponse } from './LigneProformaResponse';
export type ProformaInvoiceResponse = {
    idFactureProforma?: string;
    numeroProformaInvoice?: string;
    dateCreation?: string;
    type?: string;
    statut?: ProformaInvoiceResponse.statut;
    montantTotal?: number;
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    lignesFactureProforma?: Array<LigneProformaResponse>;
    montantHT?: number;
    montantTVA?: number;
    montantTTC?: number;
    devise?: string;
    tauxChange?: number;
    conditionsPaiement?: string;
    notes?: string;
    referenceExterne?: string;
    pdfPath?: string;
    envoyeParEmail?: boolean;
    dateEnvoiEmail?: string;
    dateAcceptation?: string;
    dateRefus?: string;
    motifRefus?: string;
    idFactureConvertie?: string;
    remiseGlobalePourcentage?: number;
    remiseGlobaleMontant?: number;
    validiteOffreJours?: number;
    applyVat?: boolean;
    dateSysteme?: string;
    modeReglement?: ProformaInvoiceResponse.modeReglement;
    nosRef?: string;
    vosRef?: string;
    nbreEcheance?: number;
    referalClientId?: string;
    finalAmount?: number;
    createdAt?: string;
    updatedAt?: string;
    organizationId?: string;
    agencyId?: string;
    createdBy?: string;
    docPermission?: DocPermissionResponse;
};
export namespace ProformaInvoiceResponse {
    export enum statut {
        BROUILLON = 'BROUILLON',
        ENVOYE = 'ENVOYE',
        ACCEPTE = 'ACCEPTE',
        REFUSE = 'REFUSE',
        EXPIRE = 'EXPIRE',
        ANNULE = 'ANNULE',
        CONVERTI_EN_FACTURE = 'CONVERTI_EN_FACTURE',
    }
    export enum modeReglement {
        VIREMENT = 'VIREMENT',
        CARTE_BANCAIRE = 'CARTE_BANCAIRE',
        ESPECES = 'ESPECES',
        CHEQUE = 'CHEQUE',
        PRELEVEMENT = 'PRELEVEMENT',
        PAYPAL = 'PAYPAL',
        AUTRE = 'AUTRE',
    }
}

