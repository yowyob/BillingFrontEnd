/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { ClientResponse } from '../models/ClientResponse';

export interface AssignCustomerRequest {
    clientId: string;
    sellerId: string;
    sellerName?: string;
    organizationId: string;
}

export interface CustomerAssignmentResponse {
    idAssignment?: string;
    organizationId?: string;
    clientId?: string;
    sellerId?: string;
    sellerName?: string;
    assignedAt?: string;
    updatedAt?: string;
}

export class CustomerAssignmentsService {
    /**
     * Assign (or reassign) a customer to a seller
     */
    public static assign(requestBody: AssignCustomerRequest): CancelablePromise<CustomerAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/customer-assignments',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get the current assignment for a customer
     */
    public static getForClient(clientId: string, organizationId: string): CancelablePromise<CustomerAssignmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/customer-assignments/client/{clientId}',
            path: { clientId },
            query: { organizationId },
        });
    }

    /**
     * List all customer assignments for an organization
     */
    public static listByOrganization(organizationId: string): CancelablePromise<CustomerAssignmentResponse[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/customer-assignments/organisation/{organizationId}',
            path: { organizationId },
        });
    }

    /**
     * List all customer assignments for a seller
     */
    public static listBySeller(sellerId: string, organizationId: string): CancelablePromise<CustomerAssignmentResponse[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/customer-assignments/seller/{sellerId}',
            path: { sellerId },
            query: { organizationId },
        });
    }

    /**
     * Get the customers assigned to a seller
     */
    public static getCustomersForSeller(sellerId: string, organizationId: string): CancelablePromise<ClientResponse[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/customer-assignments/seller/{sellerId}/customers',
            path: { sellerId },
            query: { organizationId },
        });
    }

    /**
     * Remove a customer's seller assignment
     */
    public static unassign(clientId: string, organizationId: string): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/customer-assignments/client/{clientId}',
            path: { clientId },
            query: { organizationId },
        });
    }
}
