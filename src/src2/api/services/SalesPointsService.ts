/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSalesPointRequest } from '../models/CreateSalesPointRequest';
import type { SalesPointResponse } from '../models/SalesPointResponse';
import type { UpdateSalesPointRequest } from '../models/UpdateSalesPointRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SalesPointsService {
    /**
     * Get a sales point by ID
     * @param id
     * @returns SalesPointResponse OK
     * @throws ApiError
     */
    public static getById2(
        id: string,
    ): CancelablePromise<SalesPointResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sales-points/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update a sales point
     * @param id
     * @param requestBody
     * @returns SalesPointResponse OK
     * @throws ApiError
     */
    public static update2(
        id: string,
        requestBody: UpdateSalesPointRequest,
    ): CancelablePromise<SalesPointResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/sales-points/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a sales point
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static delete2(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/sales-points/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * List sales points, optionally filtered
     * @param organizationId
     * @param agencyId
     * @returns SalesPointResponse OK
     * @throws ApiError
     */
    public static getAll2(
        organizationId?: string,
        agencyId?: string,
    ): CancelablePromise<Array<SalesPointResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sales-points',
            query: {
                'organizationId': organizationId,
                'agencyId': agencyId,
            },
        });
    }
    /**
     * Create a sales point
     * @param requestBody
     * @returns SalesPointResponse Created
     * @throws ApiError
     */
    public static create2(
        requestBody: CreateSalesPointRequest,
    ): CancelablePromise<SalesPointResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sales-points',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
