/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductResponse } from '../models/ProductResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebhooksService {
    /**
     * Product created / updated
     * ComOps sends the `productId` of the changed product. This service fetches the full product from ComOps and upserts it locally.
     * @param xWebhookSecret
     * @param requestBody
     * @returns ProductResponse OK
     * @throws ApiError
     */
    public static onProductChanged(
        xWebhookSecret: string,
        requestBody: Record<string, string>,
    ): CancelablePromise<ProductResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/webhooks/products',
            headers: {
                'X-Webhook-Secret': xWebhookSecret,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Product deleted / deactivated
     * ComOps notifies us that a product was removed. We mark it inactive locally.
     * @param xWebhookSecret
     * @param productId
     * @returns void
     * @throws ApiError
     */
    public static onProductDeleted(
        xWebhookSecret: string,
        productId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/webhooks/products/{productId}',
            path: {
                'productId': productId,
            },
            headers: {
                'X-Webhook-Secret': xWebhookSecret,
            },
        });
    }
}
