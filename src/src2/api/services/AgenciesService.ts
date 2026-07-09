/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AgencyCreateRequest } from '../models/AgencyCreateRequest';
import type { KernelAgencyResponse } from '../models/KernelAgencyResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AgenciesService {
    /**
     * List agencies for an organization
     * @param organizationId
     * @returns KernelAgencyResponse OK
     * @throws ApiError
     */
    public static getAll3(
        organizationId: string,
    ): CancelablePromise<Array<KernelAgencyResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/agencies',
            query: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * Create an agency for an organization
     * @param organizationId
     * @param requestBody
     * @returns KernelAgencyResponse Created
     * @throws ApiError
     */
    public static create3(
        organizationId: string,
        requestBody: AgencyCreateRequest,
    ): CancelablePromise<KernelAgencyResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/agencies',
            query: {
                'organizationId': organizationId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get an agency by ID
     * @param agencyId
     * @param organizationId
     * @returns KernelAgencyResponse OK
     * @throws ApiError
     */
    public static getById3(
        agencyId: string,
        organizationId: string,
    ): CancelablePromise<KernelAgencyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/agencies/{agencyId}',
            path: {
                'agencyId': agencyId,
            },
            query: {
                'organizationId': organizationId,
            },
        });
    }
}
