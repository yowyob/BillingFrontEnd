/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DevisCreateRequest } from '../models/DevisCreateRequest';
import type { DevisResponse } from '../models/DevisResponse';
import type { EmailRequest } from '../models/EmailRequest';
import type { EnrichedDevisResponse } from '../models/EnrichedDevisResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DevisService {
    /**
     * Récupérer un devis par ID
     * @param devisId
     * @returns DevisResponse OK
     * @throws ApiError
     */
    public static getDevisById(
        devisId: string,
    ): CancelablePromise<DevisResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/devis/{devisId}',
            path: {
                'devisId': devisId,
            },
        });
    }
    /**
     * Mettre à jour un devis
     * @param devisId
     * @param requestBody
     * @returns DevisResponse OK
     * @throws ApiError
     */
    public static updateDevis(
        devisId: string,
        requestBody: DevisCreateRequest,
    ): CancelablePromise<DevisResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/devis/{devisId}',
            path: {
                'devisId': devisId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Supprimer un devis
     * @param devisId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteDevis(
        devisId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/devis/{devisId}',
            path: {
                'devisId': devisId,
            },
        });
    }
    /**
     * Refuser un devis
     * @param devisId
     * @returns any OK
     * @throws ApiError
     */
    public static refuserDevis(
        devisId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/devis/{devisId}/refuser',
            path: {
                'devisId': devisId,
            },
        });
    }
    /**
     * Accepter un devis
     * @param devisId
     * @returns any OK
     * @throws ApiError
     */
    public static accepterDevis(
        devisId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/devis/{devisId}/accepter',
            path: {
                'devisId': devisId,
            },
        });
    }
    /**
     * Envoyer le devis au client via le portail (login requis)
     * @param devisId
     * @throws ApiError
     */
    public static sendToPortal(
        devisId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/devis/{devisId}/send-to-portal',
            path: {
                'devisId': devisId,
            },
        });
    }
    /**
     * Récupérer tous les devis
     * @returns DevisResponse OK
     * @throws ApiError
     */
    public static getAllDevis(): CancelablePromise<Array<DevisResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/devis',
        });
    }
    /**
     * Créer un nouveau devis
     * @param requestBody
     * @returns DevisResponse OK
     * @throws ApiError
     */
    public static createDevis(
        requestBody: DevisCreateRequest,
    ): CancelablePromise<DevisResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/devis',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static sendQuotationEmail(
        requestBody: EmailRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/devis/email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Récupérer les devis par organisation
     * @param organizationId
     * @returns DevisResponse OK
     * @throws ApiError
     */
    public static getDevisByOrganizationId(
        organizationId: string,
    ): CancelablePromise<Array<DevisResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/devis/organisation/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * Récupérer un devis par numéro
     * @param numeroDevis
     * @returns DevisResponse OK
     * @throws ApiError
     */
    public static getDevisByNumero(
        numeroDevis: string,
    ): CancelablePromise<DevisResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/devis/numero/{numeroDevis}',
            path: {
                'numeroDevis': numeroDevis,
            },
        });
    }
    /**
     * Enrichir les devis
     * @param orgId
     * @returns EnrichedDevisResponse OK
     * @throws ApiError
     */
    public static getEnrichedDevis(
        orgId: string,
    ): CancelablePromise<Array<EnrichedDevisResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/devis/enriched/{orgId}',
            path: {
                'orgId': orgId,
            },
        });
    }
    /**
     * Récupérer les devis par agence
     * @param agencyId
     * @returns DevisResponse OK
     * @throws ApiError
     */
    public static getDevisByAgencyId(
        agencyId: string,
    ): CancelablePromise<Array<DevisResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/devis/agence/{agencyId}',
            path: {
                'agencyId': agencyId,
            },
        });
    }
    /**
     * Récupérer les devis accessibles par un vendeur (via ses permissions)
     * @param sellerId
     * @returns DevisResponse OK
     * @throws ApiError
     */
    public static getDevisBySellerId(
        sellerId: string,
    ): CancelablePromise<Array<DevisResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/devis/seller/{sellerId}',
            path: {
                'sellerId': sellerId,
            },
        });
    }
}
