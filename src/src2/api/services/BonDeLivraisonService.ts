/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BonLivraisonRequest } from '../models/BonLivraisonRequest';
import type { BonLivraisonResponse } from '../models/BonLivraisonResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BonDeLivraisonService {
    /**
     * Récupérer un bon de livraison par ID
     * @param id
     * @returns BonLivraisonResponse OK
     * @throws ApiError
     */
    public static getBonLivraisonById(
        id: string,
    ): CancelablePromise<BonLivraisonResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bons-livraison/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour un bon de livraison par ID
     * @param id
     * @param requestBody
     * @returns BonLivraisonResponse OK
     * @throws ApiError
     */
    public static updatedLivraison(
        id: string,
        requestBody: BonLivraisonRequest,
    ): CancelablePromise<BonLivraisonResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/bons-livraison/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer un bon de livraison
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteBonLivraison(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/bons-livraison/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Lister tous les bons de livraison
     * @returns BonLivraisonResponse OK
     * @throws ApiError
     */
    public static getAllBonLivraisons(): CancelablePromise<Array<BonLivraisonResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bons-livraison',
        });
    }
    /**
     * Créer un nouveau bon de livraison
     * @param requestBody
     * @returns BonLivraisonResponse OK
     * @throws ApiError
     */
    public static createBonLivraison(
        requestBody: BonLivraisonRequest,
    ): CancelablePromise<BonLivraisonResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/bons-livraison',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Marquer une livraison comme effectuée
     * @param id
     * @returns BonLivraisonResponse OK
     * @throws ApiError
     */
    public static marquerCommeEffectuee(
        id: string,
    ): CancelablePromise<BonLivraisonResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/bons-livraison/{id}/effectuer',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour le statut d'un bon de livraison
     * @param id
     * @param statut
     * @returns BonLivraisonResponse OK
     * @throws ApiError
     */
    public static updateStatut2(
        id: string,
        statut: 'EN_PREPARATION' | 'PRET_A_EXPEDIER' | 'EXPEDIE' | 'LIVRE' | 'PARTIELLE' | 'RETOURNE' | 'ANNULE',
    ): CancelablePromise<BonLivraisonResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/bons-livraison/{id}/statut',
            path: {
                'id': id,
            },
            query: {
                'statut': statut,
            },
        });
    }
    /**
     * Récupérer les bons de livraison par organisation
     * @param organizationId
     * @returns BonLivraisonResponse OK
     * @throws ApiError
     */
    public static getByOrganizationId4(
        organizationId: string,
    ): CancelablePromise<Array<BonLivraisonResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bons-livraison/organisation/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * Lister les bons de livraison par client
     * @param idClient
     * @returns BonLivraisonResponse OK
     * @throws ApiError
     */
    public static getBonLivraisonsByClient(
        idClient: string,
    ): CancelablePromise<Array<BonLivraisonResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bons-livraison/client/{idClient}',
            path: {
                'idClient': idClient,
            },
        });
    }
    /**
     * Récupérer les bons de livraison par agence
     * @param agencyId
     * @returns BonLivraisonResponse OK
     * @throws ApiError
     */
    public static getByAgencyId4(
        agencyId: string,
    ): CancelablePromise<Array<BonLivraisonResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bons-livraison/agence/{agencyId}',
            path: {
                'agencyId': agencyId,
            },
        });
    }
    /**
     * Récupérer les bons de livraison accessibles par un vendeur (via ses permissions)
     * @param sellerId
     * @returns BonLivraisonResponse OK
     * @throws ApiError
     */
    public static getBySellerId4(
        sellerId: string,
    ): CancelablePromise<Array<BonLivraisonResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bons-livraison/seller/{sellerId}',
            path: {
                'sellerId': sellerId,
            },
        });
    }
}
