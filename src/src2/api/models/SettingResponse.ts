/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SettingResponse = {
    id?: string;
    organizationId?: string;
    typeNumerotation?: SettingResponse.typeNumerotation;
    uri?: string;
    includeOrgCode?: boolean;
    orgCode?: string;
    includeBranchCode?: boolean;
    branchCode?: string;
    includeTva?: boolean;
    includeDate?: boolean;
    randomSeq4?: boolean;
    preview?: string;
};
export namespace SettingResponse {
    export enum typeNumerotation {
        FACTURE = 'FACTURE',
        DEVIS = 'DEVIS',
        AVOIR = 'AVOIR',
        PAIEMENT = 'PAIEMENT',
        REMBOURSEMENT = 'REMBOURSEMENT',
        COMMANDE = 'COMMANDE',
        BON_LIVRAISON = 'BON_LIVRAISON',
        PROFORMA = 'PROFORMA',
        SALES_ORDER = 'SALES_ORDER',
        PURCHASE_ORDER = 'PURCHASE_ORDER',
        BACK_ORDER = 'BACK_ORDER',
        GOODS_RECEIPT = 'GOODS_RECEIPT',
        SUPPLIER_INVOICE = 'SUPPLIER_INVOICE',
        CLIENT = 'CLIENT',
        FOURNISSEUR = 'FOURNISSEUR',
        PRODUIT = 'PRODUIT',
        ABONNEMENT = 'ABONNEMENT',
        CONTRAT = 'CONTRAT',
        PROJET = 'PROJET',
        TICKET = 'TICKET',
        PERSONNALISE = 'PERSONNALISE',
    }
}

