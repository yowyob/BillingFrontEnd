/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignAgencyRequest } from '../models/AssignAgencyRequest';
import type { AssignAgencyResponse } from '../models/AssignAgencyResponse';
import type { CreateSellerRequest } from '../models/CreateSellerRequest';
import type { CreateSellerResponse } from '../models/CreateSellerResponse';
import type { SellerListItemResponse } from '../models/SellerListItemResponse';
import type { SellerUIPermissionsRequest } from '../models/SellerUIPermissionsRequest';
import type { SellerUIPermissionsResponse } from '../models/SellerUIPermissionsResponse';
import type { UpdateSellerPermissionsRequest } from '../models/UpdateSellerPermissionsRequest';
import type { UpdateSellerPhotoRequest } from '../models/UpdateSellerPhotoRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SellerAdminService {
    /**
     * Update a seller's sale permissions and permitted sale sizes
     * @param sellerId
     * @param requestBody
     * @returns SellerListItemResponse OK
     * @throws ApiError
     */
    public static updatePermissions(
        sellerId: string,
        requestBody: UpdateSellerPermissionsRequest,
    ): CancelablePromise<SellerListItemResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/sellers/{sellerId}/permissions',
            path: {
                'sellerId': sellerId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update a seller's profile image
     * @param sellerId
     * @param requestBody
     * @returns SellerListItemResponse OK
     * @throws ApiError
     */
    public static updatePhoto(
        sellerId: string,
        requestBody: UpdateSellerPhotoRequest,
    ): CancelablePromise<SellerListItemResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/sellers/{sellerId}/photo',
            path: {
                'sellerId': sellerId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remove a seller from the organization
     * @param sellerId
     * @throws ApiError
     */
    public static deleteSeller(
        sellerId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/sellers/{sellerId}',
            path: {
                'sellerId': sellerId,
            },
        });
    }
    /**
     * List sellers for an organization
     * @param organizationId
     * @returns SellerListItemResponse OK
     * @throws ApiError
     */
    public static getAll1(
        organizationId: string,
    ): CancelablePromise<Array<SellerListItemResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sellers',
            query: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * Create a seller
     * @param requestBody
     * @returns CreateSellerResponse Created
     * @throws ApiError
     */
    public static create1(
        requestBody: CreateSellerRequest,
    ): CancelablePromise<CreateSellerResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sellers',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get a seller's UI permissions
     * @param sellerId
     * @returns SellerUIPermissionsResponse OK
     * @throws ApiError
     */
    public static getUiPermissions(
        sellerId: string,
    ): CancelablePromise<SellerUIPermissionsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sellers/{sellerId}/ui-permissions',
            path: {
                'sellerId': sellerId,
            },
        });
    }
    /**
     * Set a seller's UI permissions
     * @param sellerId
     * @param requestBody
     * @returns SellerUIPermissionsResponse OK
     * @throws ApiError
     */
    public static setUiPermissions(
        sellerId: string,
        requestBody: SellerUIPermissionsRequest,
    ): CancelablePromise<SellerUIPermissionsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sellers/{sellerId}/ui-permissions',
            path: {
                'sellerId': sellerId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Assign a seller to an agency
     * @param sellerId
     * @param requestBody
     * @returns AssignAgencyResponse OK
     * @throws ApiError
     */
    public static assignAgency(
        sellerId: string,
        requestBody: AssignAgencyRequest,
    ): CancelablePromise<AssignAgencyResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sellers/{sellerId}/agency',
            path: {
                'sellerId': sellerId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
