/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductResponse } from '../models/ProductResponse';
import type { ReserveRequest } from '../models/ReserveRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebSocketStompDocumentationOnlyService {
    /**
     * Reserve or cancel a product reservation
     * **STOMP destination:** `/app/stock.reserve`
     *
     * Send a `ReserveRequest` payload. Use `action: RESERVE` to hold stock or `action: CANCEL` to release it.
     *
     * After processing, all clients subscribed to `/topic/stock` receive the updated `ProductResponse` automatically.
     *
     * @param requestBody
     * @returns ProductResponse Broadcast to /topic/stock after update
     * @throws ApiError
     */
    public static stockReserve(
        requestBody: ReserveRequest,
    ): CancelablePromise<ProductResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/docs/websocket/stock.reserve',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
