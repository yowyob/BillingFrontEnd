/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductResponse } from '../models/ProductResponse';
import type { SaleSize } from '../models/SaleSize';
import type { UpdatePhotoRequest } from '../models/UpdatePhotoRequest';
import type { UpdateSaleSizesRequest } from '../models/UpdateSaleSizesRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductsService {
    /**
     * Configure a product's allowed sale sizes and per-size pricing
     * @param productId
     * @param requestBody
     * @returns SaleSize OK
     * @throws ApiError
     */
    public static updateSaleSizes(
        productId: string,
        requestBody: UpdateSaleSizesRequest,
    ): CancelablePromise<Array<SaleSize>> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/products/{productId}/sale-sizes',
            path: {
                'productId': productId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Set a product's photo URL
     * @param productId
     * @param requestBody
     * @returns string OK
     * @throws ApiError
     */
    public static updatePhoto(
        productId: string,
        requestBody: UpdatePhotoRequest,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/products/{productId}/photo',
            path: {
                'productId': productId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all products
     * @returns ProductResponse OK
     * @throws ApiError
     */
    public static getAllProducts(): CancelablePromise<Array<ProductResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products',
        });
    }
    /**
     * Get product by ID
     * @param productId
     * @returns ProductResponse OK
     * @throws ApiError
     */
    public static getProductById(
        productId: string,
    ): CancelablePromise<ProductResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products/{productId}',
            path: {
                'productId': productId,
            },
        });
    }
    /**
     * Get products by organization
     * @param organizationId
     * @returns ProductResponse OK
     * @throws ApiError
     */
    public static getProductsByOrganization(
        organizationId: string,
    ): CancelablePromise<Array<ProductResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products/organization/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
        });
    }
}
