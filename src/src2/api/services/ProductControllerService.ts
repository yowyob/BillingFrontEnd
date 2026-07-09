/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductResponse } from '../models/ProductResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductControllerService {
    public static getAllProducts(): CancelablePromise<Array<ProductResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/products',
        });
    }
    public static createProduct(
        requestBody: ProductResponse,
    ): CancelablePromise<ProductResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/products',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    public static getProductById(
        id: string,
    ): CancelablePromise<ProductResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/products/{id}',
            path: { 'id': id },
        });
    }
    public static updateProduct(
        id: string,
        requestBody: ProductResponse,
    ): CancelablePromise<ProductResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/products/{id}',
            path: { 'id': id },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    public static getProductByOrganization(
        orgId: string,
    ): CancelablePromise<Array<ProductResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/products/organization/{orgId}',
            path: { 'orgId': orgId },
        });
    }
}
