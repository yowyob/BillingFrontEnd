/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaleSize = {
    size?: SaleSize.size;
    unitPrice?: number;
    unitPriceWithTax?: number;
    minQuantity?: number;
    active?: boolean;
    isNegotiable?: boolean;
    minNegotiationPercentage?: number;
};
export namespace SaleSize {
    export enum size {
        DETAIL = 'DETAIL',
        DEMIS_GROS = 'DEMIS_GROS',
        GROS = 'GROS',
        SUPER_GROS = 'SUPER_GROS',
    }
}

