/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/* ===================== CLIENT RESPONSE ===================== */

export type UpdatedClientResponse = {
    idClient?: string;
    username?: string;
    categorie?: string;
    siteWeb?: string;
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

    /** Sale sizes this client is allowed to buy */
    allowedSaleSizes?: ClientSaleSize.size[];
};

/* ===================== SALE SIZE MODEL ===================== */

export type ClientSaleSize = {
    size: ClientSaleSize.size;
    unitPrice: number;
    minQuantity?: number;
    active?: boolean;
};

export namespace ClientSaleSize {
    export enum size {
        DETAIL = 'DETAIL',
        DEMIS_GROS = 'DEMIS_GROS',
        GROS = 'GROS',
        SUPER_GROS = 'SUPER_GROS',
    }
}

/* ===================== CLIENT ENUMS ===================== */

export namespace ClientResponse {
    export enum typeClient {
        PARTICULIER = 'PARTICULIER',
        ENTREPRISE = 'ENTREPRISE',
        ADMINISTRATION = 'ADMINISTRATION',
    }
}

/* ===================== MOCK CLIENT DATA ===================== */

export const clients: UpdatedClientResponse[] = [
  {
    idClient: "c001",
    username: "john_doe",
    categorie: "Retail",
    siteWeb: "https://johndoe.com",
    adresse: "Douala, Akwa",
    telephone: "+237690000001",
    email: "john@example.com",
    typeClient: ClientResponse.typeClient.PARTICULIER,
    raisonSociale: "John Doe Retail",
    codeClient: "CLI-001",
    limiteCredit: 100000,
    soldeCourant: 25000,
    actif: true,
    ntva: true,
    createdAt: "2025-01-10T08:30:00Z",
    updatedAt: "2025-12-15T10:30:00Z",

    allowedSaleSizes: [
      ClientSaleSize.size.DETAIL
    ]
  },

  {
    idClient: "c002",
    username: "abc_distributors",
    categorie: "Wholesale",
    siteWeb: "https://abc-distributors.cm",
    adresse: "Yaoundé, Bastos",
    telephone: "+237690000002",
    email: "contact@abc-distributors.cm",
    typeClient: ClientResponse.typeClient.ENTREPRISE,
    raisonSociale: "ABC Distributors",
    numeroTva: "TVA123456",
    codeClient: "CLI-002",
    limiteCredit: 5000000,
    soldeCourant: 1200000,
    actif: true,
    ntva: false,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2025-12-01T11:00:00Z",

    allowedSaleSizes: [
      ClientSaleSize.size.DEMIS_GROS,
      ClientSaleSize.size.GROS,
      ClientSaleSize.size.SUPER_GROS
    ]
  },

  {
    idClient: "c003",
    username: "min_edu",
    categorie: "Public",
    siteWeb: "https://minedu.cm",
    adresse: "Yaoundé, Centre Ville",
    telephone: "+237690000003",
    email: "procurement@minedu.gov.cm",
    typeClient: ClientResponse.typeClient.ADMINISTRATION,
    raisonSociale: "Ministry of Education",
    codeClient: "CLI-003",
    limiteCredit: 10000000,
    soldeCourant: 0,
    actif: true,
    ntva: true,
    createdAt: "2023-06-15T09:00:00Z",
    updatedAt: "2025-11-01T09:30:00Z",

    allowedSaleSizes: [
      ClientSaleSize.size.GROS
    ]
  },

  {
    idClient: "c004",
    username: "small_shop",
    categorie: "Retail",
    siteWeb: "",
    adresse: "Bafoussam, Market",
    telephone: "+237690000004",
    email: "shop@smallshop.cm",
    typeClient: ClientResponse.typeClient.PARTICULIER,
    raisonSociale: "Small Shop",
    codeClient: "CLI-004",
    limiteCredit: 50000,
    soldeCourant: 5000,
    actif: true,
    ntva: false,
    createdAt: "2025-02-01T09:00:00Z",
    updatedAt: "2025-12-01T12:00:00Z",

    allowedSaleSizes: [
      ClientSaleSize.size.DETAIL,
      ClientSaleSize.size.DEMIS_GROS
    ]
  },
  {
  "idClient": "d5e8f4a2-9b3c-4e1a-8f6d-7c2a1b0e9f4a",
  "username": "horizon_logistics",
  "categorie": "Wholesale",
  "siteWeb": "https://horizon-logistics.cm",
  "adresse": "Douala, Akwa - Rue des Écoles",
  "telephone": "+237677123456",
  "email": "logistics@horizon-group.cm",
  "typeClient":ClientResponse.typeClient.PARTICULIER,
  "raisonSociale": "Horizon Logistics & Trading",
  "numeroTva": "NIU-P0123456789",
  "codeClient": "CLI-2026-088",
  "limiteCredit": 10000000,
  "soldeCourant": 4500000,
  "actif": true,
  "ntva": true,
  "createdAt": "2025-01-15T08:30:00Z",
  "updatedAt": "2026-02-02T10:00:00Z",
  
    allowedSaleSizes: [
      ClientSaleSize.size.DETAIL,
      ClientSaleSize.size.DEMIS_GROS
    ]
},
{
    idClient: "d5e8f4a2-9b3c-4e1a-8f6d-7c2a1b0e9f4b",
    username: "fureh mitoto",
    categorie: "Wholesale",
    siteWeb: "https://abc-distributors.cm",
    adresse: "Yaoundé, Bastos",
    telephone: "+237690000002",
    email: "furehmitoto@gmail.com",
    typeClient: ClientResponse.typeClient.ENTREPRISE,
    raisonSociale: "fureh mitoto",
    numeroTva: "TVA123456",
    codeClient: "CLI-002",
    limiteCredit: 5000000,
    soldeCourant: 1200000,
    actif: true,
    ntva: false,
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2025-12-01T11:00:00Z",

    allowedSaleSizes: [
      ClientSaleSize.size.DEMIS_GROS,
      ClientSaleSize.size.GROS,
      ClientSaleSize.size.SUPER_GROS
    ]
  },
];
