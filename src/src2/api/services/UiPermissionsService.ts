/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UIPermissionsRequest } from '../models/UIPermissionsRequest';
import type { UIPermissionsResponse } from '../models/UIPermissionsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UiPermissionsService {
    /**
     * Récupérer des permissions UI par ID
     * @param id
     * @returns UIPermissionsResponse OK
     * @throws ApiError
     */
    public static getById(
        id: string,
    ): CancelablePromise<UIPermissionsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ui-permissions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Mettre à jour les permissions UI
     * @param id
     * @param requestBody
     * @returns UIPermissionsResponse OK
     * @throws ApiError
     */
    public static update(
        id: string,
        requestBody: UIPermissionsRequest,
    ): CancelablePromise<UIPermissionsResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/ui-permissions/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer des permissions UI
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static delete(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/ui-permissions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Créer des permissions UI pour un vendeur
     * @param requestBody
     * @returns UIPermissionsResponse OK
     * @throws ApiError
     */
    public static create(
        requestBody: UIPermissionsRequest,
    ): CancelablePromise<UIPermissionsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/ui-permissions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Récupérer les permissions UI d'un vendeur
     * @param sellerId
     * @returns UIPermissionsResponse OK
     * @throws ApiError
     */
    public static getBySellerId(
        sellerId: string,
    ): CancelablePromise<Array<UIPermissionsResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ui-permissions/seller/{sellerId}',
            path: {
                'sellerId': sellerId,
            },
        });
    }
    /**
     * Récupérer les permissions UI par organisation
     * @param organizationId
     * @returns UIPermissionsResponse OK
     * @throws ApiError
     */
    public static getByOrganizationId(
        organizationId: string,
    ): CancelablePromise<Array<UIPermissionsResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ui-permissions/organisation/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * Récupérer les permissions UI par agence
     * @param agencyId
     * @returns UIPermissionsResponse OK
     * @throws ApiError
     */
    public static getByAgencyId(
        agencyId: string,
    ): CancelablePromise<Array<UIPermissionsResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ui-permissions/agence/{agencyId}',
            path: {
                'agencyId': agencyId,
            },
        });
    }
}
