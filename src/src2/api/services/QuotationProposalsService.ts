/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class QuotationProposalsService {
    /**
     * Lister toutes les propositions de devis
     */
    public static getAll(): CancelablePromise<any[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/quotation-proposals',
        });
    }

    /**
     * Récupérer une proposition par ID
     */
    public static getById(id: string): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/quotation-proposals/{id}',
            path: { id },
        });
    }

    /**
     * Accepter une proposition de devis
     */
    public static accept(id: string, commentary?: string): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/quotation-proposals/{id}/accept',
            path: { id },
            body: { commentary },
            mediaType: 'application/json',
        });
    }

    /**
     * Refuser une proposition de devis
     */
    public static reject(id: string, commentary?: string): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/quotation-proposals/{id}/reject',
            path: { id },
            body: { commentary },
            mediaType: 'application/json',
        });
    }
}
