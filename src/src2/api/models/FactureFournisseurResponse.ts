/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocPermissionResponse } from './DocPermissionResponse';
import type { LineFactureFournisseur } from './LineFactureFournisseur';
export type FactureFournisseurResponse = {
    idFactureFournisseur?: string;
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
    modeReglement?: FactureFournisseurResponse.modeReglement;
    nbreEcheance?: number;
    montantRestant?: number;
    dateFacture?: string;
    dateEcheance?: string;
    statut?: FactureFournisseurResponse.statut;
    applyVat?: boolean;
    devise?: string;
    notes?: string;
    pdfPath?: string;
    createdBy?: string;
    idBonReception?: string;
    numeroBonReception?: string;
    createdAt?: string;
    updatedAt?: string;
    dateSysteme?: string;
    organizationId?: string;
    agencyId?: string;
    docPermission?: DocPermissionResponse;
};
export namespace FactureFournisseurResponse {
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

