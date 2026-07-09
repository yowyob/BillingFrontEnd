/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SaleSize } from './SaleSize';
import type { SaleSizePromotion } from './SaleSizePromotion';
export type ProductResponse = {
    idProduit?: string;
    nomProduit?: string;
    typeProduit?: string;
    prixVente?: number;
    cout?: number;
    categorie?: string;
    reference?: string;
    codeBarre?: string;
    photo?: string;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
    uom?: string;
    allowedSaleSizes?: Array<SaleSize>;
    activePromotions?: Array<SaleSizePromotion>;
    stockQuantity?: number;
    availableQuantity?: number;
    reservedQuantity?: number;
    organizationId?: string;
};

