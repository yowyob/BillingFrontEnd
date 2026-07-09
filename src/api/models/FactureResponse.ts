/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LigneFactureResponse } from './LigneFactureResponse';
export type FactureResponse = {
    idFacture?: string;
    numeroFacture?: string;
    dateFacturation?: string;
    dateEcheance?: string;
    type?: string;
    etat?: FactureResponse.etat;
    montantTotal?: number;
    montantRestant?: number;
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    lignesFacture?: Array<LigneFactureResponse>;
    montantHT?: number;
    montantTVA?: number;
    montantTTC?: number;
    devise?: string;
    tauxChange?: number;
    conditionsPaiement?: string;
    notes?: string;
    referenceCommande?: string;
    pdfPath?: string;
    envoyeParEmail?: boolean;
    dateEnvoiEmail?: string;
    createdAt?: string;
    updatedAt?: string;
};
export namespace FactureResponse {
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
        AUTRE = 'AUTRE'
    }
}

