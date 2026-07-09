/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LigneBackOrder } from './LigneBackOrder';
export type BackOrderRequest = {
    numeroBackOrder?: string;
    idBonLivraison: string;
    numeroBonLivraison?: string;
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    lignes: Array<LigneBackOrder>;
    dateCreation?: string;
    dateLivraisonPrevue?: string;
    dateSysteme?: string;
    statut?: BackOrderRequest.statut;
    notes?: string;
    organizationId?: string;
    agencyId?: string;
    createdBy?: string;
};
export namespace BackOrderRequest {
    export enum statut {
        EN_ATTENTE = 'EN_ATTENTE',
        PARTIELLEMENT_LIVRE = 'PARTIELLEMENT_LIVRE',
        LIVRE = 'LIVRE',
        ANNULE = 'ANNULE',
    }
}

