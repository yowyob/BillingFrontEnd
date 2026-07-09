/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PortalAccessToken = {
    tokenId?: number;
    token?: string;
    resourceType?: PortalAccessToken.resourceType;
    resourceId?: string;
    clientEmail?: string;
    canView?: boolean;
    canModify?: boolean;
    canAccept?: boolean;
    canReject?: boolean;
    expiresAt?: string;
    used?: boolean;
    usedAt?: string;
    createdAt?: string;
};
export namespace PortalAccessToken {
    export enum resourceType {
        QUOTATION = 'QUOTATION',
        INVOICE = 'INVOICE',
        SALES_ORDER = 'SALES_ORDER',
        PROFORMA_INVOICE = 'PROFORMA_INVOICE',
        PURCHASE_ORDER = 'PURCHASE_ORDER',
    }
}

