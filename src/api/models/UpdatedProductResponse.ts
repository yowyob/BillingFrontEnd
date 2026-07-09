/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UpdatedProductResponse = {
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
    uom?:string;
    /** Sale sizes this client is allowed to buy (FULL CONFIG) */
    allowedSaleSizes?: ClientSaleSize[];
   availableQuantity?: number; // Added for completeness
    reservedQuantity?: number; 
    organizationId?:string;

    /** Active promotions per sale size */
    activePromotions?: ClientResponse.SaleSizePromotion[];
    stockQuantity:number
};


export type ClientSaleSize = {
    size: ClientSaleSize.size;
    unitPrice: number;
    unitPriceWithTax:number;
    minQuantity?: number;
    active?: boolean;
    isNegotiable?:boolean;
    minNegotiationPercentage?:number
};

export namespace ClientSaleSize {
    export enum size {
        DETAIL = 'DETAIL',
        DEMIS_GROS = 'DEMIS_GROS',
        GROS = 'GROS',
        SUPER_GROS = 'SUPER_GROS',
    }
}


export namespace ClientResponse {
    export enum typeClient {
        PARTICULIER = 'PARTICULIER',
        ENTREPRISE = 'ENTREPRISE',
        ADMINISTRATION = 'ADMINISTRATION',
    }

    export enum SaleSize {
        DETAIL = 'DETAIL',
        DEMIS_GROS = 'DEMIS_GROS',
        GROS = 'GROS',
        SUPER_GROS = 'SUPER_GROS',
    }

    export type SaleSizePromotion = {
        saleSize: SaleSize;
        startDate: string;
        endDate: string;
        promotionalPrice?: number;
        discountPercentage?: number;
        active?: boolean;
       
    };
}

/* generated using openapi-typescript-codegen -- do not edit */
/* generated using openapi-typescript-codegen -- do not edit */

export const produits: UpdatedProductResponse[] = [
  {
    idProduit: "p001",
    nomProduit: "Riz 25kg",
    typeProduit: "ALIMENTAIRE",
    prixVente: 18000,
    cout: 15000,
    categorie: "Céréales",
    reference: "RIZ-25KG",
    codeBarre: "1234567890123",
    photo: "riz25kg.jpg",
    active: true,
    createdAt: "2024-10-01T08:00:00Z",
    updatedAt: "2024-12-15T10:30:00Z",
    stockQuantity: 150,
    allowedSaleSizes: [
      { size: ClientSaleSize.size.DETAIL, unitPrice: 18000, unitPriceWithTax: 21465, isNegotiable: false, minNegotiationPercentage: 0 },
      { size: ClientSaleSize.size.DEMIS_GROS, unitPrice: 17000, unitPriceWithTax: 20272.5, minQuantity: 5, isNegotiable: true, minNegotiationPercentage: 2 },
      { size: ClientSaleSize.size.GROS, unitPrice: 16000, unitPriceWithTax: 19080, minQuantity: 20, isNegotiable: true, minNegotiationPercentage: 5 }
    ],
    activePromotions: [
      {
        saleSize: ClientResponse.SaleSize.GROS,
        startDate: "2026-01-01",
        endDate: "2026-03-31",
        discountPercentage: 10,
        active: true
      }
    ]
  },
  {
    idProduit: "p002",
    nomProduit: "Huile végétale 5L",
    typeProduit: "ALIMENTAIRE",
    prixVente: 7500,
    cout: 6200,
    categorie: "Huiles",
    reference: "HUILE-5L",
    codeBarre: "2234567890123",
    photo: "huile5l.png",
    active: true,
    createdAt: "2024-09-20T09:15:00Z",
    updatedAt: "2024-11-02T14:45:00Z",
    stockQuantity: 85,
    allowedSaleSizes: [
      { size: ClientSaleSize.size.DETAIL, unitPrice: 7500, unitPriceWithTax: 8943.75, isNegotiable: false, minNegotiationPercentage: 0 },
      { size: ClientSaleSize.size.DEMIS_GROS, unitPrice: 7200, unitPriceWithTax: 8586, minQuantity: 6, isNegotiable: true, minNegotiationPercentage: 3 }
    ],
    activePromotions: [
      {
        saleSize: ClientResponse.SaleSize.DETAIL,
        startDate: "2026-01-01",
        endDate: "2026-02-15",
        promotionalPrice: 6900,
        active: true
      }
    ]
  },
  {
    idProduit: "p003",
    nomProduit: "Sucre blanc 50kg",
    typeProduit: "ALIMENTAIRE",
    prixVente: 16500,
    cout: 14000,
    categorie: "Sucrerie",
    reference: "SUC-50KG",
    codeBarre: "3234567890123",
    photo: "sucre50kg.jpg",
    active: true,
    createdAt: "2024-08-12T07:30:00Z",
    updatedAt: "2024-12-01T11:00:00Z",
    stockQuantity: 40,
    allowedSaleSizes: [
      { size: ClientSaleSize.size.DEMIS_GROS, unitPrice: 16000, unitPriceWithTax: 19080, minQuantity: 5, isNegotiable: true, minNegotiationPercentage: 2 },
      { size: ClientSaleSize.size.GROS, unitPrice: 15000, unitPriceWithTax: 17887.5, minQuantity: 25, isNegotiable: true, minNegotiationPercentage: 6 }
    ],
    activePromotions: [
      {
        saleSize: ClientResponse.SaleSize.DEMIS_GROS,
        startDate: "2026-01-01",
        endDate: "2026-06-30",
        discountPercentage: 5,
        active: true
      }
    ]
  },
  {
    idProduit: "p004",
    nomProduit: "Ciment 50kg",
    typeProduit: "MATERIAUX",
    prixVente: 5200,
    cout: 4800,
    categorie: "Construction",
    reference: "CIM-50KG",
    codeBarre: "4234567890123",
    photo: "ciment50kg.jpg",
    active: true,
    createdAt: "2024-07-05T06:45:00Z",
    updatedAt: "2024-12-18T09:20:00Z",
    stockQuantity: 0,
    allowedSaleSizes: [
      { size: ClientSaleSize.size.GROS, unitPrice: 5000, unitPriceWithTax: 5962.5, minQuantity: 20, isNegotiable: true, minNegotiationPercentage: 3 },
      { size: ClientSaleSize.size.SUPER_GROS, unitPrice: 4700, unitPriceWithTax: 5604.75, minQuantity: 100, isNegotiable: true, minNegotiationPercentage: 8 }
    ],
    activePromotions: [
      {
        saleSize: ClientResponse.SaleSize.SUPER_GROS,
        startDate: "2025-12-01",
        endDate: "2026-03-31",
        discountPercentage: 15,
        active: true
      }
    ]
  },
  {
    idProduit: "p005",
    nomProduit: "Savon en barre",
    typeProduit: "HYGIENE",
    prixVente: 300,
    cout: 220,
    categorie: "Hygiène",
    reference: "SAV-001",
    codeBarre: "5234567890123",
    photo: "savon.png",
    active: true,
    createdAt: "2024-06-10T13:00:00Z",
    updatedAt: "2024-10-18T16:20:00Z",
    stockQuantity: 1200,
    allowedSaleSizes: [
      { size: ClientSaleSize.size.DETAIL, unitPrice: 300, unitPriceWithTax: 357.75, isNegotiable: false, minNegotiationPercentage: 0 },
      { size: ClientSaleSize.size.DEMIS_GROS, unitPrice: 280, unitPriceWithTax: 333.9, minQuantity: 24, isNegotiable: false, minNegotiationPercentage: 5 }
    ],
    activePromotions: [
      {
        saleSize: ClientResponse.SaleSize.DEMIS_GROS,
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        promotionalPrice: 250,
        active: true
      }
    ]
  },
  {
    idProduit: "p006",
    nomProduit: "Boisson gazeuse 1.5L",
    typeProduit: "BOISSON",
    prixVente: 800,
    cout: 600,
    categorie: "Boissons",
    reference: "BOIS-15L",
    codeBarre: "6234567890123",
    photo: "boisson15l.jpg",
    active: true,
    createdAt: "2024-05-01T09:00:00Z",
    updatedAt: "2024-11-25T14:10:00Z",
    stockQuantity: 320,
    allowedSaleSizes: [
      { size: ClientSaleSize.size.DETAIL, unitPrice: 800, unitPriceWithTax: 954, isNegotiable: false, minNegotiationPercentage: 0 },
      { size: ClientSaleSize.size.DEMIS_GROS, unitPrice: 760, unitPriceWithTax: 906.3, minQuantity: 12, isNegotiable: true, minNegotiationPercentage: 2 },
      { size: ClientSaleSize.size.GROS, unitPrice: 720, unitPriceWithTax: 858.6, minQuantity: 48, isNegotiable: true, minNegotiationPercentage: 4 }
    ],
    activePromotions: [
      {
        saleSize: ClientResponse.SaleSize.DEMIS_GROS,
        startDate: "2026-01-01",
        endDate: "2026-05-15",
        promotionalPrice: 740,
        active: true
      }
    ]
  },
  {
    idProduit: "p007",
    nomProduit: "Papier A4 (rame)",
    typeProduit: "BUREAUTIQUE",
    prixVente: 3500,
    cout: 3000,
    categorie: "Fournitures",
    reference: "PAP-A4",
    codeBarre: "7234567890123",
    photo: "papierA4.jpg",
    active: true,
    createdAt: "2024-03-18T10:20:00Z",
    updatedAt: "2024-12-10T15:45:00Z",
    stockQuantity: 65,
    allowedSaleSizes: [
      { size: ClientSaleSize.size.DETAIL, unitPrice: 3500, unitPriceWithTax: 4173.75, isNegotiable: false, minNegotiationPercentage: 0 },
      { size: ClientSaleSize.size.GROS, unitPrice: 3300, unitPriceWithTax: 3935.25, minQuantity: 10, isNegotiable: true, minNegotiationPercentage: 5 }
    ],
    activePromotions: [
      {
        saleSize: ClientResponse.SaleSize.GROS,
        startDate: "2026-01-01",
        endDate: "2026-02-28",
        discountPercentage: 20,
        active: true
      }
    ]
  },
  {
    "idProduit": "8b2f9a1c-7e34-4d81-9b45-f02a6c8e3d12",
    "nomProduit": "Cartouche d'encre HP 652 Noir",
    "typeProduit": "INFORMATIQUE",
    "prixVente": 12500,
    "cout": 9500,
    "categorie": "Consommables",
    "reference": "HP-652-BK",
    "codeBarre": "8432109876541",
    "photo": "hp652_black.png",
    "active": true,
    "createdAt": "2024-05-10T09:15:00Z",
    "updatedAt": "2025-01-20T11:30:00Z",
    "stockQuantity": 42,
     allowedSaleSizes: [
      { size: ClientSaleSize.size.DETAIL, unitPrice: 3500, unitPriceWithTax: 4173.75, isNegotiable: false, minNegotiationPercentage: 0 },
      { size: ClientSaleSize.size.GROS, unitPrice: 3300, unitPriceWithTax: 3935.25, minQuantity: 10, isNegotiable: true, minNegotiationPercentage: 5 }
    ],
    activePromotions: [
      {
        saleSize: ClientResponse.SaleSize.GROS,
        startDate: "2026-01-01",
        endDate: "2026-02-28",
        discountPercentage: 20,
        active: true
      }
    ]
},
{
    "idProduit": "8b2f9a1c-7e34-4d81-9b45-f02a6c8e3d22",
    "nomProduit": "Bon Bon Alcolisee",
    "typeProduit": "INFORMATIQUE",
    "prixVente": 12500,
    "cout": 9500,
    "categorie": "Consommables",
    "reference": "HP-652-BK",
    "codeBarre": "8432109876541",
    "photo": "hp652_black.png",
    "active": true,
    "createdAt": "2024-05-10T09:15:00Z",
    "updatedAt": "2025-01-20T11:30:00Z",
    "stockQuantity": 42,
     allowedSaleSizes: [
      { size: ClientSaleSize.size.DETAIL, unitPrice: 3500, unitPriceWithTax: 4173.75, isNegotiable: false, minNegotiationPercentage: 0 },
      { size: ClientSaleSize.size.GROS, unitPrice: 3300, unitPriceWithTax: 3935.25, minQuantity: 10, isNegotiable: true, minNegotiationPercentage: 5 }
    ],
    activePromotions: [
      {
        saleSize: ClientResponse.SaleSize.GROS,
        startDate: "2026-01-01",
        endDate: "2026-02-28",
        discountPercentage: 20,
        active: true
      }
    ]
}
];