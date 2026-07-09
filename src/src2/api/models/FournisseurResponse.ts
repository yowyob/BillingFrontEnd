/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FournisseurResponse = {
    idFournisseur?: string;
    username?: string;
    categorie?: string;
    siteWeb?: string;
    allowedSaleSizes?: Array<string>;
    adresse?: string;
    telephone?: string;
    email?: string;
    typeFournisseur?: FournisseurResponse.typeFournisseur;
    raisonSociale?: string;
    numeroTva?: string;
    codeFournisseur?: string;
    limiteCredit?: number;
    soldeCourant?: number;
    actif?: boolean;
    createdAt?: string;
    updatedAt?: string;
    ntva?: boolean;
};
export namespace FournisseurResponse {
    export enum typeFournisseur {
        PARTICULIER = 'PARTICULIER',
        ENTREPRISE = 'ENTREPRISE',
        ADMINISTRATION = 'ADMINISTRATION',
    }
}

