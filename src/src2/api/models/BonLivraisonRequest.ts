/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LigneBonLivraisonRequest } from './LigneBonLivraisonRequest';
export type BonLivraisonRequest = {
    numeroBonLivraison?: string;
    idSaleOrder?: string;
    saleOrderNumber?: string;
    idClient: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    nomAgence?: string;
    adresseAgence?: string;
    contactAgence?: string;
    dateLivraison: string;
    dateEcheance?: string;
    idFacture?: string;
    numeroFacture?: string;
    idBonCommande?: string;
    numeroCommande?: string;
    statut?: BonLivraisonRequest.statut;
    lignes: Array<LigneBonLivraisonRequest>;
    montantHT?: number;
    montantTVA?: number;
    montantTTC?: number;
    notes?: string;
    transporteur?: string;
    numeroSuivi?: string;
    createdBy?: string;
    dateSysteme?: string;
    organizationId?: string;
    agencyId?: string;
    partial?: boolean;
};
export namespace BonLivraisonRequest {
    export enum statut {
        EN_PREPARATION = 'EN_PREPARATION',
        PRET_A_EXPEDIER = 'PRET_A_EXPEDIER',
        EXPEDIE = 'EXPEDIE',
        LIVRE = 'LIVRE',
        PARTIELLE = 'PARTIELLE',
        RETOURNE = 'RETOURNE',
        ANNULE = 'ANNULE',
    }
}

