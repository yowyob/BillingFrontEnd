/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaleSizePromotion = {
    saleSize?: SaleSizePromotion.saleSize;
    startDate?: string;
    endDate?: string;
    promotionalPrice?: number;
    discountPercentage?: number;
    active?: boolean;
};
export namespace SaleSizePromotion {
    export enum saleSize {
        DETAIL = 'DETAIL',
        DEMIS_GROS = 'DEMIS_GROS',
        GROS = 'GROS',
        SUPER_GROS = 'SUPER_GROS',
    }
}

