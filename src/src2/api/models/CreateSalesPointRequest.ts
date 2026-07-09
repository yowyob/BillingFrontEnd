/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateSalesPointRequest = {
    organizationId: string;
    agencyId?: string;
    salesPointName: string;
    status?: CreateSalesPointRequest.status;
    currency?: string;
};
export namespace CreateSalesPointRequest {
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

