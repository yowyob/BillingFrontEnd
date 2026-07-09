/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BonCommandeCreateRequest } from '../models/BonCommandeCreateRequest';
import type { BonCommandeResponse } from '../models/BonCommandeResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BonCommandeService {
    /**
     * Récupérer un bon de commande par ID
     * @param id
     * @returns BonCommandeResponse OK
     * @throws ApiError
     */
    public static getBonCommandeById(
        id: string,
    ): CancelablePromise<BonCommandeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bon-commande/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour un bon de commande
     * @param id
     * @param requestBody
     * @returns BonCommandeResponse OK
     * @throws ApiError
     */
    public static updateBonCommandeById(
        id: string,
        requestBody: BonCommandeCreateRequest,
    ): CancelablePromise<BonCommandeResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/bon-commande/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Récupérer tous les bons de commande
     * @returns BonCommandeResponse OK
     * @throws ApiError
     */
    public static getAllBonCommandes(): CancelablePromise<Array<BonCommandeResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bon-commande',
        });
    }
    /**
     * Créer un bon de commande
     * @param requestBody
     * @returns BonCommandeResponse OK
     * @throws ApiError
     */
    public static createBonCommande(
        requestBody: BonCommandeCreateRequest,
    ): CancelablePromise<BonCommandeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/bon-commande',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Changer l'état d'un bon de commande
     * @param id
     * @param statut
     * @returns BonCommandeResponse OK
     * @throws ApiError
     */
    public static updateStatut3(
        id: string,
        statut: 'BROUILLON' | 'VALIDE' | 'EN_COURS' | 'EXPEDIE' | 'LIVRE' | 'RECU_PARTIEL' | 'RECU' | 'REJETE' | 'ANNULE',
    ): CancelablePromise<BonCommandeResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/bon-commande/{id}/status',
            path: {
                'id': id,
            },
            query: {
                'statut': statut,
            },
        });
    }
    /**
     * Récupérer les bons de commande par organisation
     * @param organizationId
     * @returns BonCommandeResponse OK
     * @throws ApiError
     */
    public static getByOrganizationId6(
        organizationId: string,
    ): CancelablePromise<Array<BonCommandeResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bon-commande/organisation/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * Récupérer les bons de commande par agence
     * @param agencyId
     * @returns BonCommandeResponse OK
     * @throws ApiError
     */
    public static getByAgencyId6(
        agencyId: string,
    ): CancelablePromise<Array<BonCommandeResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bon-commande/agence/{agencyId}',
            path: {
                'agencyId': agencyId,
            },
        });
    }
    /**
     * Récupérer les bons de commande accessibles par un vendeur (via ses permissions)
     * @param sellerId
     * @returns BonCommandeResponse OK
     * @throws ApiError
     */
    public static getBySellerId6(
        sellerId: string,
    ): CancelablePromise<Array<BonCommandeResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bon-commande/seller/{sellerId}',
            path: {
                'sellerId': sellerId,
            },
        });
    }
}
