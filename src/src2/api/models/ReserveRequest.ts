/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ReserveRequest = {
    productId?: string;
    organizationId?: string;
    quantity?: number;
    sellerId?: string;
    action?: ReserveRequest.action;
};
export namespace ReserveRequest {
    export enum action {
        RESERVE = 'RESERVE',
        CANCEL = 'CANCEL',
    }
}

