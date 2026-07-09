/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaiementCreateRequest } from '../models/PaiementCreateRequest';
import type { PaiementResponse } from '../models/PaiementResponse';
import type { PaiementUpdateRequest } from '../models/PaiementUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaiementService {
    /**
     * Récupérer un paiement par ID
     * @param id
     * @returns PaiementResponse OK
     * @throws ApiError
     */
    public static getPaiementById(
        id: string,
    ): CancelablePromise<PaiementResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/paiement/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour un paiement
     * @param id
     * @param requestBody
     * @returns PaiementResponse OK
     * @throws ApiError
     */
    public static updatePaiement(
        id: string,
        requestBody: PaiementUpdateRequest,
    ): CancelablePromise<PaiementResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/paiement/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer un paiement
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deletePaiement(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/paiement/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Récupérer tous les paiements
     * @returns PaiementResponse OK
     * @throws ApiError
     */
    public static getAllPaiements(): CancelablePromise<Array<PaiementResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/paiement',
        });
    }
    /**
     * Créer un nouveau paiement
     * @param requestBody
     * @returns PaiementResponse OK
     * @throws ApiError
     */
    public static createPaiement(
        requestBody: PaiementCreateRequest,
    ): CancelablePromise<PaiementResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/paiement',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Récupérer les paiements par organisation
     * @param organizationId
     * @returns PaiementResponse OK
     * @throws ApiError
     */
    public static getPaiementsByOrganizationId(
        organizationId: string,
    ): CancelablePromise<Array<PaiementResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/paiement/organisation/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * Récupérer les paiements d'une facture
     * @param factureId
     * @returns PaiementResponse OK
     * @throws ApiError
     */
    public static getPaiementsByFacture(
        factureId: string,
    ): CancelablePromise<Array<PaiementResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/paiement/facture/{factureId}',
            path: {
                'factureId': factureId,
            },
        });
    }
    /**
     * Récupérer les paiements d'un client
     * @param clientId
     * @returns PaiementResponse OK
     * @throws ApiError
     */
    public static getPaiementsByClient(
        clientId: string,
    ): CancelablePromise<Array<PaiementResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/paiement/client/{clientId}',
            path: {
                'clientId': clientId,
            },
        });
    }
    /**
     * Récupérer les paiements par agence
     * @param agencyId
     * @returns PaiementResponse OK
     * @throws ApiError
     */
    public static getPaiementsByAgencyId(
        agencyId: string,
    ): CancelablePromise<Array<PaiementResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/paiement/agence/{agencyId}',
            path: {
                'agencyId': agencyId,
            },
        });
    }
}
