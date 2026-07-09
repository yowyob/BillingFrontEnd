/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TestControllerService {
    /**
     * @param param
     * @returns string OK
     * @throws ApiError
     */
    public static getMethodName(
        param: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/test/{Id}',
            query: {
                'param': param,
            },
        });
    }
}
