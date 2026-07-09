/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LigneNoteCredit } from './LigneNoteCredit';
export type NoteCreditRequest = {
    numeroNoteCredit?: string;
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    idFactureOrigine?: string;
    numeroFactureOrigine?: string;
    lignesNoteCredit?: Array<LigneNoteCredit>;
    montantHT?: number;
    montantTVA?: number;
    montantTTC?: number;
    montantTotal?: number;
    dateEmission?: string;
    dateSysteme?: string;
    modeReglement?: NoteCreditRequest.modeReglement;
    statut?: NoteCreditRequest.statut;
    motif?: string;
    notes?: string;
    devise?: string;
    pdfPath?: string;
    createdBy?: string;
    validatedBy?: string;
    validatedAt?: string;
    organizationId?: string;
    agencyId?: string;
};
export namespace NoteCreditRequest {
    export enum modeReglement {
        VIREMENT = 'VIREMENT',
        CARTE_BANCAIRE = 'CARTE_BANCAIRE',
        ESPECES = 'ESPECES',
        CHEQUE = 'CHEQUE',
        PRELEVEMENT = 'PRELEVEMENT',
        PAYPAL = 'PAYPAL',
        AUTRE = 'AUTRE',
        BON_D_ACHAT = 'BON_D_ACHAT',
    }
    export enum statut {
        BROUILLON = 'BROUILLON',
        APPLIQU_ = 'APPLIQUÉ',
        REMBOURS_ = 'REMBOURSÉ',
        ANNUL_ = 'ANNULÉ',
    }
}

