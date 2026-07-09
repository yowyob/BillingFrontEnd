/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMediaAssetRequest } from '../models/CreateMediaAssetRequest';
import type { MediaAssetResponse } from '../models/MediaAssetResponse';
import type { StoredFileResponse } from '../models/StoredFileResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MediaService {
    /**
     * Upload a file to Kernel's file storage
     * @param documentType
     * @param formData
     * @returns StoredFileResponse OK
     * @throws ApiError
     */
    public static uploadFile(
        documentType?: string,
        formData?: {
            file: Blob;
        },
    ): CancelablePromise<StoredFileResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/media/files',
            query: {
                'documentType': documentType,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * List media assets for a target
     * @param targetType
     * @param targetId
     * @returns MediaAssetResponse OK
     * @throws ApiError
     */
    public static getMediaAssets(
        targetType: string,
        targetId: string,
    ): CancelablePromise<Array<MediaAssetResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/media/assets',
            query: {
                'targetType': targetType,
                'targetId': targetId,
            },
        });
    }
    /**
     * Link an uploaded file to a target (e.g. a product) as a media asset
     * @param requestBody
     * @returns MediaAssetResponse OK
     * @throws ApiError
     */
    public static createMediaAsset(
        requestBody: CreateMediaAssetRequest,
    ): CancelablePromise<MediaAssetResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/media/assets',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Fetch a stored file's raw content (e.g. for use as an <img> src)
     * @param fileId
     * @returns string OK
     * @throws ApiError
     */
    public static getFileContent(
        fileId: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/media/files/{fileId}',
            path: {
                'fileId': fileId,
            },
        });
    }
}
