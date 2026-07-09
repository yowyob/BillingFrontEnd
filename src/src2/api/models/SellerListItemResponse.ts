/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SellerListItemResponse = {
    id?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: 'POS_SELLER' | 'SELLER' | 'AGENCY_MANAGER' | 'OWNER';
    agency?: string;
    salePoint?: string;
    profileImageUrl?: string;
    permissions?: Array<'NEGOTIATE_PRICE' | 'APPLY_DISCOUNT' | 'OVERRIDE_PRICE' | 'APPROVE_DOCUMENT'>;
    permittedSaleSizes?: Array<'DETAIL' | 'DEMIS_GROS' | 'GROS' | 'SUPER_GROS'>;
    organizationId?: string;
    agencyId?: string;
    salesPointId?: string;
    mustChangePassword?: boolean;
    pin?: string;
    createdAt?: string;
};

