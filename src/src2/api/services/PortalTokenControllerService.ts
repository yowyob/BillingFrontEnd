/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PortalAccessToken } from '../models/PortalAccessToken';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PortalTokenControllerService {
    /**
     * @param resourceId
     * @param resourceType
     * @param clientEmail
     * @returns PortalAccessToken Created
     * @throws ApiError
     */
    public static generateToken(
        resourceId: string,
        resourceType: 'QUOTATION' | 'INVOICE' | 'SALES_ORDER' | 'PROFORMA_INVOICE' | 'PURCHASE_ORDER',
        clientEmail: string,
    ): CancelablePromise<PortalAccessToken> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/portal-tokens/generate',
            query: {
                'resourceId': resourceId,
                'resourceType': resourceType,
                'clientEmail': clientEmail,
            },
        });
    }
    /**
     * @returns PortalAccessToken OK
     * @throws ApiError
     */
    public static getAll4(): CancelablePromise<Array<PortalAccessToken>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/portal-tokens',
        });
    }
    /**
     * @param token
     * @returns PortalAccessToken OK
     * @throws ApiError
     */
    public static validateAndGet(
        token: string,
    ): CancelablePromise<PortalAccessToken> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/portal-tokens/validate/{token}',
            path: {
                'token': token,
            },
        });
    }
}
