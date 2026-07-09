/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocPermissionResponse } from './DocPermissionResponse';
import type { LigneBackOrder } from './LigneBackOrder';
export type BackOrderResponse = {
    idBackOrder?: string;
    numeroBackOrder?: string;
    idBonLivraison?: string;
    numeroBonLivraison?: string;
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    lignes?: Array<LigneBackOrder>;
    dateCreation?: string;
    dateLivraisonPrevue?: string;
    dateSysteme?: string;
    statut?: BackOrderResponse.statut;
    notes?: string;
    organizationId?: string;
    agencyId?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    docPermission?: DocPermissionResponse;
};
export namespace BackOrderResponse {
    export enum statut {
        EN_ATTENTE = 'EN_ATTENTE',
        PARTIELLEMENT_LIVRE = 'PARTIELLEMENT_LIVRE',
        LIVRE = 'LIVRE',
        ANNULE = 'ANNULE',
    }
}

