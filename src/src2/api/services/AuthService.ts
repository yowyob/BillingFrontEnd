/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChangePasswordRequest } from '../models/ChangePasswordRequest';
import type { LoginRequest } from '../models/LoginRequest';
import type { SellerAuthResponse } from '../models/SellerAuthResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Try Out login
     * Authenticates directly against Kernel using the org the account already belongs to, auto-provisioning a local seller on first use. Does not create new organizations.
     * @param requestBody
     * @returns SellerAuthResponse OK
     * @throws ApiError
     */
    public static tryOut(
        requestBody: LoginRequest,
    ): CancelablePromise<SellerAuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/try-out',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Seller login
     * Returns full seller profile with org and agency details on success.
     * @param requestBody
     * @returns SellerAuthResponse OK
     * @throws ApiError
     */
    public static login(
        requestBody: LoginRequest,
    ): CancelablePromise<SellerAuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Seller change password
     * Returns full seller profile with org and agency details on success.
     * @param requestBody
     * @returns SellerAuthResponse OK
     * @throws ApiError
     */
    public static changePassword(
        requestBody: ChangePasswordRequest,
    ): CancelablePromise<SellerAuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/change-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
