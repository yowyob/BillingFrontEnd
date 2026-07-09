/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PortalAcessResponseDevisResponse } from '../models/PortalAcessResponseDevisResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PortalAccessControllerService {
    /**
     * @param token The generated UUID string
     * @param action Action Submitted by Customer
     * @returns any OK
     * @throws ApiError
     */
    public static handleAction(
        token: string,
        action: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/portal-access/{token}',
            path: {
                'token': token,
            },
            query: {
                'action': action,
            },
        });
    }
    /**
     * Get Quotation
     * Enter the long token string to fetch data
     * @param token The generated UUID string
     * @returns PortalAcessResponseDevisResponse OK
     * @throws ApiError
     */
    public static getQuotationInfo(
        token: string,
    ): CancelablePromise<PortalAcessResponseDevisResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/portal-access/quotation/{token}',
            path: {
                'token': token,
            },
        });
    }
}
