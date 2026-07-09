/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CloseSessionRequest } from '../models/CloseSessionRequest';
import type { CreateSessionRequest } from '../models/CreateSessionRequest';
import type { SessionResponse } from '../models/SessionResponse';
import type { UpdateSessionRequest } from '../models/UpdateSessionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SessionsService {
    /**
     * Get a session by ID
     * @param id
     * @returns SessionResponse OK
     * @throws ApiError
     */
    public static getById1(
        id: string,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sessions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update a session
     * @param id
     * @param requestBody
     * @returns SessionResponse OK
     * @throws ApiError
     */
    public static update1(
        id: string,
        requestBody: UpdateSessionRequest,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/sessions/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a session
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static delete1(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/sessions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * List sessions, optionally filtered
     * @param salesPointId
     * @param sellerId
     * @param organizationId
     * @param agencyId
     * @returns SessionResponse OK
     * @throws ApiError
     */
    public static getAll(
        salesPointId?: string,
        sellerId?: string,
        organizationId?: string,
        agencyId?: string,
    ): CancelablePromise<Array<SessionResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sessions',
            query: {
                'salesPointId': salesPointId,
                'sellerId': sellerId,
                'organizationId': organizationId,
                'agencyId': agencyId,
            },
        });
    }
    /**
     * Open a session
     * @param requestBody
     * @returns SessionResponse Created
     * @throws ApiError
     */
    public static open(
        requestBody: CreateSessionRequest,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sessions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Schedule a session for a seller to start themselves later
     * @param requestBody
     * @returns SessionResponse OK
     * @throws ApiError
     */
    public static schedule(
        requestBody: CreateSessionRequest,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sessions/schedule',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Start a pending session (seller-initiated)
     * @param id
     * @returns SessionResponse OK
     * @throws ApiError
     */
    public static start(
        id: string,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: `/api/sessions/${id}/start`,
        });
    }
    /**
     * Suspend an open session
     * @param id
     * @returns SessionResponse OK
     * @throws ApiError
     */
    public static suspend(
        id: string,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sessions/{id}/suspend',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Resume a suspended session back to open
     * @param id
     * @returns SessionResponse OK
     * @throws ApiError
     */
    public static resume(
        id: string,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sessions/{id}/resume',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Reopen a closed session
     * @param id
     * @returns SessionResponse OK
     * @throws ApiError
     */
    public static reopen(
        id: string,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sessions/{id}/reopen',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Close a session
     * @param id
     * @param requestBody
     * @returns SessionResponse OK
     * @throws ApiError
     */
    public static close(
        id: string,
        requestBody: CloseSessionRequest,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sessions/{id}/close',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Cancel a pending or open session
     * @param id
     * @returns SessionResponse OK
     * @throws ApiError
     */
    public static cancel(
        id: string,
    ): CancelablePromise<SessionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sessions/{id}/cancel',
            path: {
                'id': id,
            },
        });
    }
}
