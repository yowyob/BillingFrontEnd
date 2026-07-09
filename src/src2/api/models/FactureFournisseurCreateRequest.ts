/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineFactureFournisseur } from './LineFactureFournisseur';
export type FactureFournisseurCreateRequest = {
    numeroFacture?: string;
    idFournisseur?: string;
    nomFournisseur?: string;
    adresseFournisseur?: string;
    emailFournisseur?: string;
    telephoneFournisseur?: string;
    lines?: Array<LineFactureFournisseur>;
    montantHT?: number;
    montantTVA?: number;
    montantTTC?: number;
    montantTotal?: number;
    modeReglement?: FactureFournisseurCreateRequest.modeReglement;
    nbreEcheance?: number;
    montantRestant?: number;
    dateFacture?: string;
    dateEcheance?: string;
    statut?: FactureFournisseurCreateRequest.statut;
    applyVat?: boolean;
    devise?: string;
    notes?: string;
    pdfPath?: string;
    createdBy?: string;
    idBonReception?: string;
    numeroBonReception?: string;
    dateSysteme?: string;
    organizationId?: string;
    agencyId?: string;
};
export namespace FactureFournisseurCreateRequest {
    export enum modeReglement {
        VIREMENT = 'VIREMENT',
        CARTE_BANCAIRE = 'CARTE_BANCAIRE',
        ESPECES = 'ESPECES',
        CHEQUE = 'CHEQUE',
        PRELEVEMENT = 'PRELEVEMENT',
        PAYPAL = 'PAYPAL',
        AUTRE = 'AUTRE',
    }
    export enum statut {
        BROUILLON = 'BROUILLON',
        ENVOYE = 'ENVOYE',
        PAYE = 'PAYE',
        PARTIELLEMENT_PAYE = 'PARTIELLEMENT_PAYE',
        EN_RETARD = 'EN_RETARD',
        ANNULE = 'ANNULE',
    }
}

