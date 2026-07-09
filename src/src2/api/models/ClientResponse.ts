/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ClientResponse = {
    idClient?: string;
    username?: string;
    categorie?: string;
    siteWeb?: string;
    allowedSaleSizes?: Array<string>;
    adresse?: string;
    telephone?: string;
    email?: string;
    typeClient?: ClientResponse.typeClient;
    raisonSociale?: string;
    numeroTva?: string;
    codeClient?: string;
    limiteCredit?: number;
    soldeCourant?: number;
    actif?: boolean;
    createdAt?: string;
    updatedAt?: string;
    ntva?: boolean;
};
export namespace ClientResponse {
    export enum typeClient {
        PARTICULIER = 'PARTICULIER',
        ENTREPRISE = 'ENTREPRISE',
        ADMINISTRATION = 'ADMINISTRATION',
    }
}

