/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SettingResponse } from '../models/SettingResponse';
import type { UpdateLogoRequest } from '../models/UpdateLogoRequest';
import type { UpdateSequenceSettingRequest } from '../models/UpdateSequenceSettingRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SettingsService {
    /**
     * Update document numbering configuration for a document type
     * @param organizationId
     * @param typeNumerotation
     * @param requestBody
     * @returns SettingResponse OK
     * @throws ApiError
     */
    public static updateSequenceSetting(
        organizationId: string,
        typeNumerotation: 'FACTURE' | 'DEVIS' | 'AVOIR' | 'PAIEMENT' | 'REMBOURSEMENT' | 'COMMANDE' | 'BON_LIVRAISON' | 'PROFORMA' | 'SALES_ORDER' | 'PURCHASE_ORDER' | 'BACK_ORDER' | 'GOODS_RECEIPT' | 'SUPPLIER_INVOICE' | 'CLIENT' | 'FOURNISSEUR' | 'PRODUIT' | 'ABONNEMENT' | 'CONTRAT' | 'PROJET' | 'TICKET' | 'PERSONNALISE',
        requestBody: UpdateSequenceSettingRequest,
    ): CancelablePromise<SettingResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/settings/organization/{organizationId}/numbering/{typeNumerotation}',
            path: {
                'organizationId': organizationId,
                'typeNumerotation': typeNumerotation,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Set the organization's logo URL
     * @param organizationId
     * @param requestBody
     * @returns SettingResponse OK
     * @throws ApiError
     */
    public static updateLogo(
        organizationId: string,
        requestBody: UpdateLogoRequest,
    ): CancelablePromise<SettingResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/settings/organization/{organizationId}/logo',
            path: {
                'organizationId': organizationId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get organization-wide settings (logo)
     * @param organizationId
     * @returns SettingResponse OK
     * @throws ApiError
     */
    public static getOrganizationSettings(
        organizationId: string,
    ): CancelablePromise<SettingResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/settings/organization/{organizationId}',
            path: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * List document numbering configuration for every document type
     * @param organizationId
     * @returns SettingResponse OK
     * @throws ApiError
     */
    public static listSequenceSettings(
        organizationId: string,
    ): CancelablePromise<Array<SettingResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/settings/organization/{organizationId}/numbering',
            path: {
                'organizationId': organizationId,
            },
        });
    }
}
