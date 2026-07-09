/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocPermissionResponse } from './DocPermissionResponse';
import type { LigneBonLivraison } from './LigneBonLivraison';
export type BonLivraisonResponse = {
    idBonLivraison?: string;
    numeroBonLivraison?: string;
    idSaleOrder?: string;
    saleOrderNumber?: string;
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    lignes?: Array<LigneBonLivraison>;
    montantHT?: number;
    montantTVA?: number;
    montantTTC?: number;
    dateLivraison?: string;
    statut?: BonLivraisonResponse.statut;
    notes?: string;
    createdBy?: string;
    dateSysteme?: string;
    updatedAt?: string;
    organizationId?: string;
    agencyId?: string;
    partial?: boolean;
    docPermission?: DocPermissionResponse;
};
export namespace BonLivraisonResponse {
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

