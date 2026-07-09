/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateSessionRequest = {
    type: CreateSessionRequest.type;
    /** Required when type is POS; omitted when type is SALES. */
    salesPointId?: string;
    /** Required when type is SALES; omitted when type is POS. */
    organizationId?: string;
    agencyId?: string;
    sellerId: string;
    openingAmount: number;
    startTime?: string;
    endTime?: string;
};
export namespace CreateSessionRequest {
    export enum type {
        POS = 'POS',
        SALES = 'SALES',
    }
}

