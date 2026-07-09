/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SalesPointResponse = {
    id?: string;
    organizationId?: string;
    agencyId?: string;
    salesPointName?: string;
    status?: SalesPointResponse.status;
    currency?: string;
    createdAt?: string;
    updatedAt?: string;
};
export namespace SalesPointResponse {
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

