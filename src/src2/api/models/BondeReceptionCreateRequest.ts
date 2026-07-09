/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineBonReception } from './LineBonReception';
export type BondeReceptionCreateRequest = {
    numeroReception?: string;
    idFournisseur?: string;
    nomFournisseur?: string;
    lines?: Array<LineBonReception>;
    dateReception?: string;
    statut?: BondeReceptionCreateRequest.statut;
    notes?: string;
    createdBy?: string;
    dateSysteme?: string;
    numeroBonAchat?: string;
    idBonAchat?: string;
    agenceDeTransport?: string;
    organizationId?: string;
    agencyId?: string;
};
export namespace BondeReceptionCreateRequest {
    export enum statut {
        DRAFT = 'DRAFT',
        PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
        RECEIVED = 'RECEIVED',
        REJECTED = 'REJECTED',
        ANNULE = 'ANNULE',
    }
}

