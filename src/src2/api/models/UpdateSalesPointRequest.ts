/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateSalesPointRequest = {
    agencyId?: string;
    salesPointName: string;
    status?: UpdateSalesPointRequest.status;
    currency?: string;
};
export namespace UpdateSalesPointRequest {
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

