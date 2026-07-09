/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { DocPermissionResponse } from '../models/DocPermissionResponse';

export interface AssignDocPermissionRequest {
    sellerId: string;
    docId: string;
    docType: 'DEVIS' | 'FACTURE' | 'FACTURE_PROFORMA' | 'BACK_ORDER' | 'NOTE_CREDIT' | 'BON_ACHAT' | 'BON_COMMANDE' | 'BON_LIVRAISON' | 'BON_RECEPTION' | 'FACTURE_FOURNISSEUR';
    permission: 'OWNER' | 'EDITOR' | 'VIEWER';
    recipientEmail?: string;
    recipientName?: string;
    sharedByName?: string;
    docLabel?: string;
}

export class DocPermissionsService {
    /**
     * Grant (or update) a seller's permission on a document — silent, no email.
     */
    public static grant(requestBody: AssignDocPermissionRequest): CancelablePromise<DocPermissionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/doc-permissions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Share a document with a seller — grants the permission and emails them a notification.
     */
    public static share(requestBody: AssignDocPermissionRequest): CancelablePromise<DocPermissionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/doc-permissions/share',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * List all document permissions granted to a seller.
     */
    public static listBySeller(sellerId: string): CancelablePromise<DocPermissionResponse[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/doc-permissions/seller/{sellerId}',
            path: { sellerId },
        });
    }

    /**
     * List all sellers with a permission on a document.
     */
    public static listByDoc(docId: string, docType: AssignDocPermissionRequest['docType']): CancelablePromise<DocPermissionResponse[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/doc-permissions/doc/{docId}',
            path: { docId },
            query: { docType },
        });
    }

    /**
     * Revoke a seller's permission on a document.
     */
    public static revoke(sellerId: string, docId: string, docType: AssignDocPermissionRequest['docType']): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/doc-permissions/seller/{sellerId}/doc/{docId}',
            path: { sellerId, docId },
            query: { docType },
        });
    }
}
