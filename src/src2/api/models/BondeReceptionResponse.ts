/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocPermissionResponse } from './DocPermissionResponse';
import type { LineBonReception } from './LineBonReception';
export type BondeReceptionResponse = {
    idBonReception?: string;
    numeroReception?: string;
    idFournisseur?: string;
    nomFournisseur?: string;
    lines?: Array<LineBonReception>;
    dateReception?: string;
    statut?: BondeReceptionResponse.statut;
    notes?: string;
    createdBy?: string;
    updatedAt?: string;
    dateSysteme?: string;
    numeroBonAchat?: string;
    idBonAchat?: string;
    agenceDeTransport?: string;
    organizationId?: string;
    agencyId?: string;
    docPermission?: DocPermissionResponse;
};
export namespace BondeReceptionResponse {
    export enum statut {
        DRAFT = 'DRAFT',
        PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
        RECEIVED = 'RECEIVED',
        REJECTED = 'REJECTED',
        ANNULE = 'ANNULE',
    }
}

