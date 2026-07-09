/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { FournisseurResponse } from '../models/FournisseurResponse';

export interface AssignProducerRequest {
    fournisseurId: string;
    sellerId: string;
    sellerName?: string;
    organizationId: string;
}

export interface ProducerAssignmentResponse {
    idAssignment?: string;
    organizationId?: string;
    fournisseurId?: string;
    sellerId?: string;
    sellerName?: string;
    assignedAt?: string;
    updatedAt?: string;
}

export class ProducerAssignmentsService {
    /**
     * Assign (or reassign) a producer to a seller
     */
    public static assign(requestBody: AssignProducerRequest): CancelablePromise<ProducerAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/producer-assignments',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get the current assignment for a producer
     */
    public static getForFournisseur(fournisseurId: string, organizationId: string): CancelablePromise<ProducerAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/producer-assignments/fournisseur/{fournisseurId}',
            path: { fournisseurId },
            query: { organizationId },
        });
    }

    /**
     * List all producer assignments for an organization
     */
    public static listByOrganization(organizationId: string): CancelablePromise<ProducerAssignmentResponse[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/producer-assignments/organisation/{organizationId}',
            path: { organizationId },
        });
    }

    /**
     * List all producer assignments for a seller
     */
    public static listBySeller(sellerId: string, organizationId: string): CancelablePromise<ProducerAssignmentResponse[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/producer-assignments/seller/{sellerId}',
            path: { sellerId },
            query: { organizationId },
        });
    }

    /**
     * Get the producers/suppliers assigned to a seller
     */
    public static getProducersForSeller(sellerId: string, organizationId: string): CancelablePromise<FournisseurResponse[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/producer-assignments/seller/{sellerId}/producers',
            path: { sellerId },
            query: { organizationId },
        });
    }

    /**
     * Remove a producer's seller assignment
     */
    public static unassign(fournisseurId: string, organizationId: string): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/producer-assignments/fournisseur/{fournisseurId}',
            path: { fournisseurId },
            query: { organizationId },
        });
    }
}
