/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BackOrderRequest } from '../models/BackOrderRequest';
import type { BackOrderResponse } from '../models/BackOrderResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BackOrderService {
    /**
     * Récupérer un back-order par ID
     * @param id
     * @returns BackOrderResponse OK
     * @throws ApiError
     */
    public static getBackOrderById(
        id: string,
    ): CancelablePromise<BackOrderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facturation/back-orders/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour un back-order
     * @param id
     * @param requestBody
     * @returns BackOrderResponse OK
     * @throws ApiError
     */
    public static updateBackOrder(
        id: string,
        requestBody: BackOrderRequest,
    ): CancelablePromise<BackOrderResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/facturation/back-orders/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer un back-order
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteBackOrder(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/facturation/back-orders/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Lister tous les back-orders
     * @returns BackOrderResponse OK
     * @throws ApiError
     */
    public static getAllBackOrders(): CancelablePromise<Array<BackOrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facturation/back-orders',
        });
    }
    /**
     * Créer un back-order
     * @param requestBody
     * @returns BackOrderResponse OK
     * @throws ApiError
     */
    public static createBackOrder(
        requestBody: BackOrderRequest,
    ): CancelablePromise<BackOrderResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/facturation/back-orders',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Changer le statut d'un back-order
     * @param id
     * @param statut
     * @returns BackOrderResponse OK
     * @throws ApiError
     */
    public static updateStatut(
        id: string,
        statut: 'EN_ATTENTE' | 'PARTIELLEMENT_LIVRE' | 'LIVRE' | 'ANNULE',
    ): CancelablePromise<BackOrderResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/facturation/back-orders/{id}/statut',
            path: {
                'id': id,
            },
            query: {
                'statut': statut,
            },
        });
    }
    /**
     * Récupérer les back-orders par organisation
     * @param organizationId
     * @returns BackOrderResponse OK
     * @throws ApiError
     */
    public static getByOrganizationId2(
        organizationId: string,
    ): CancelablePromise<Array<BackOrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facturation/back-orders/organisation/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * Récupérer les back-orders par bon de livraison
     * @param idBonLivraison
     * @returns BackOrderResponse OK
     * @throws ApiError
     */
    public static getByIdBonLivraison(
        idBonLivraison: string,
    ): CancelablePromise<Array<BackOrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facturation/back-orders/bon-livraison/{idBonLivraison}',
            path: {
                'idBonLivraison': idBonLivraison,
            },
        });
    }
    /**
     * Récupérer les back-orders par agence
     * @param agencyId
     * @returns BackOrderResponse OK
     * @throws ApiError
     */
    public static getByAgencyId2(
        agencyId: string,
    ): CancelablePromise<Array<BackOrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facturation/back-orders/agence/{agencyId}',
            path: {
                'agencyId': agencyId,
            },
        });
    }
    /**
     * Récupérer les back-orders accessibles par un vendeur (via ses permissions)
     * @param sellerId
     * @returns BackOrderResponse OK
     * @throws ApiError
     */
    public static getBySellerId2(
        sellerId: string,
    ): CancelablePromise<Array<BackOrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/facturation/back-orders/seller/{sellerId}',
            path: {
                'sellerId': sellerId,
            },
        });
    }
}
