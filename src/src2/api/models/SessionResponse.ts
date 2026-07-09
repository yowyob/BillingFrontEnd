/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SessionResponse = {
    id?: string;
    salesPointId?: string;
    organizationId?: string;
    agencyId?: string;
    sellerId?: string;
    type?: SessionResponse.type;
    status?: SessionResponse.status;
    openingAmount?: number;
    closingAmount?: number;
    startTime?: string;
    endTime?: string;
    loginTime?: string;
    logoutTime?: string;
    locked?: boolean;
    createdAt?: string;
    updatedAt?: string;
};
export namespace SessionResponse {
    export enum type {
        POS = 'POS',
        SALES = 'SALES',
    }
    export enum status {
        PENDING = 'PENDING',
        OPEN = 'OPEN',
        SUSPENDED = 'SUSPENDED',
        CLOSED = 'CLOSED',
        CANCELLED = 'CANCELLED',
        REOPENED = 'REOPENED',
    }
}

