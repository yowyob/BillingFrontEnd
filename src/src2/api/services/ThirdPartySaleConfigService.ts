/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SaleConfigResponse } from '../models/SaleConfigResponse';
import type { SetSaleConfigRequest } from '../models/SetSaleConfigRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ThirdPartySaleConfigService {
    /**
     * Get the sale config for a third party
     * @param thirdPartyId
     * @returns SaleConfigResponse OK
     * @throws ApiError
     */
    public static get(
        thirdPartyId: string,
    ): CancelablePromise<SaleConfigResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tiers/third-parties/{thirdPartyId}/sale-config',
            path: {
                'thirdPartyId': thirdPartyId,
            },
        });
    }
    /**
     * Set the sale config for a third party
     * @param thirdPartyId
     * @param requestBody
     * @returns SaleConfigResponse OK
     * @throws ApiError
     */
    public static set(
        thirdPartyId: string,
        requestBody: SetSaleConfigRequest,
    ): CancelablePromise<SaleConfigResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tiers/third-parties/{thirdPartyId}/sale-config',
            path: {
                'thirdPartyId': thirdPartyId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
