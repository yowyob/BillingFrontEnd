/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateSellerRequest = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: 'POS_SELLER' | 'SELLER' | 'AGENCY_MANAGER' | 'OWNER';
    agency?: string;
    salePoint?: string;
    permissions?: Array<string>;
    permittedSaleSizes?: Array<string>;
    organizationId: string;
    organizationName?: string;
    organizationLogoUri?: string;
    organizationEmail?: string;
    taxNumber?: string;
    agencyId?: string;
    agencyEmail?: string;
    agencyPhone?: string;
    agencyCity?: string;
    agencyAddress?: string;
    salesPointId?: string;
    salesPointAddress?: string;
};

