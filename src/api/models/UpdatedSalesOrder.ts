import type { LigneDevisResponse } from './LigneDevisResponse';
import type { DocPermissionResponse } from '../../src2/api/models/DocPermissionResponse';
export type UpdatedSalesOrderResponse = {
    idSalesOrder?: string;
    numeroSalesOrder?: string;

    // Dates
    dateCreation?: string;
    dateSysteme?: string;
    expectedDeliveryDate?: string;
    deliveryDate?: string;

    // Status
    statut?: SalesOrderResponse.statut;

    // Client Info (The person/entity paying)
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;

    // Recipient Info (The specific person receiving the goods)
    recipientName?: string;
    recipientPhone?: string;
    recipientAddress?: string;
    recipientCity?: string;

    // Reference to source Quotation
    idDevisOrigine?: string;
    numeroDevisOrigine?: string;

    // Line Items
    lignesSalesOrder?: Array<LigneDevisResponse>;

    // Financial Summary
    montantHT?: number;
    montantTVA?: number;
    montantTTC?: number;
    devise?: string;

    // Logistics
    transportMethod?: SalesOrderResponse.transportMethod;
    // Linked Agency Data
    idAgency?: string; 
    agencyInfo?: AgencyResponse;

    // Payment Info
    modeReglement?: SalesOrderResponse.modeReglement;

    // Metadata
    notes?: string;
    createdAt?: string;
    updatedAt?: string;


    //missing fields 
     applyVat?: boolean;
          nosRef?: string;
        vosRef?: string;
        docPermission?: DocPermissionResponse;
};

export namespace SalesOrderResponse {
    export enum statut {
        BROUILLON = 'BROUILLON',
        VALIDE = 'VALIDE',           // Confirmed by client
        EN_COURS = 'EN_COURS',       // In preparation
        EXPEDIE = 'EXPEDIE',         // Left the warehouse
        LIVRE = 'LIVRE',             // Final delivery confirmed
        ANNULE = 'ANNULE'
    }

    export enum transportMethod {
        AGENCE = 'AGENCE',
        COURSEUR = 'COURSEUR',              // Local Courier / Delivery Boy
        RETRAIT_MAGASIN = 'RETRAIT_MAGASIN', // In-store Pickup
        LIVRAISON_PROPRE = 'LIVRAISON_PROPRE', // Company Truck
        FRET_AERIEN = 'FRET_AERIEN',
        FRET_MARITIME = 'FRET_MARITIME'
    }

    export enum agencyName {
        BUCA_VOYAGES = 'BUCA_VOYAGES',
        FINEXS_VOYAGES = 'FINEXS_VOYAGES',
        GENERAL_VOYAGES = 'GENERAL_VOYAGES',
        TOURISTIQUE_EXPRESS = 'TOURISTIQUE_EXPRESS',
        DHL = 'DHL',
        UPS = 'UPS',
        AUTRE = 'AUTRE'
    }

    export enum modeReglement {
        VIREMENT = 'VIREMENT',
        ESPECES = 'ESPECES',
        CHEQUE = 'CHEQUE',
        MOBILE_MONEY = 'MOBILE_MONEY'
    }
}

export type AgencyResponse = {
    idAgency: string;
    name: string;           // e.g., "Buca Voyages"
    shortName?: string;     // e.g., "BUCA"
    mainContact?: string;   // Name of the person you usually deal with
    telephone?: string;
    address?: string;       // Head office or specific drop-off point
    city?: string;          // e.g., "Douala"
    email?: string;
    isActive: boolean;
};


// This replaces the previous enum for static choices
export const MOCK_AGENCIES: AgencyResponse[] = [
    { 
        idAgency: "550e8400-e29b-41d4-a716-446655440000", 
        name: "Buca Voyages", 
        shortName: "BUCA", 
        telephone: "+237670000001", 
        isActive: true 
    },
    { 
        idAgency: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", 
        name: "Finexs Voyages", 
        shortName: "FINEXS", 
        telephone: "+237670000002", 
        isActive: true 
    },
    { 
        idAgency: "f47ac10b-58cc-4372-a567-0e02b2c3d479", 
        name: "Touristique Express", 
        shortName: "TOURISTIQUE", 
        telephone: "+237670000003", 
        isActive: true 
    },
    { 
        idAgency: "2d543501-1433-4f91-8935-4309859f139d", 
        name: "DHL Cameroon", 
        shortName: "DHL", 
        telephone: "+237670000004", 
        isActive: true 
    },
];


export const MOCK_SALES_ORDERS: UpdatedSalesOrderResponse[] = [
  {
    "idSalesOrder": "SO-2026-001",
    "numeroSalesOrder": "ORD/2026/001",
    "dateCreation": "2026-01-20T10:00:00Z",
    "dateSysteme": "2026-01-22T13:00:00Z",
    "expectedDeliveryDate": "2026-01-25",
    "statut": SalesOrderResponse.statut.VALIDE,
    "idClient": "c002",
    "nomClient": "ABC Distributors",
    "adresseClient": "Yaoundé, Bastos",
    "emailClient": "contact@abc-distributors.cm",
    "telephoneClient": "+237690000002",
    "recipientName": "Moussa Ibrahim",
    "recipientPhone": "+237677123456",
    "recipientAddress": "Marché Central",
    "recipientCity": "Yaoundé",
    "idDevisOrigine": "QT-9921",
    "numeroDevisOrigine": "DEV/2026/112",
    "lignesSalesOrder": [
      {
        "idLigne": "L001",
        "idProduit": "p001",
        "nomProduit": "Riz 25kg",
        "quantite": 50,
        "prixUnitaire": 16000,
        "montantTotal": 800000,
        "description": "Riz 25kg - Gros"
      }
    ],
    "montantHT": 1250000,
    "montantTVA": 0,
    "montantTTC": 1250000,
    "devise": "XAF",
    "transportMethod": SalesOrderResponse.transportMethod.AGENCE,
    "idAgency": "AG-001",
    "agencyInfo": {
      "idAgency": "AG-001",
      "name": "Buca Voyages",
      "isActive": true
    },
    "modeReglement": SalesOrderResponse.modeReglement.VIREMENT,
    "createdAt": "2026-01-20T10:00:00Z",
    "updatedAt": "2026-01-22T13:00:00Z"
  },
  {
    "idSalesOrder": "SO-2026-002",
    "numeroSalesOrder": "ORD/2026/002",
    "dateCreation": "2026-01-21T08:30:00Z",
    "statut": SalesOrderResponse.statut.EN_COURS,
    "idClient": "c001",
    "nomClient": "John Doe Retail",
    "adresseClient": "Douala, Akwa",
    "recipientName": "John Doe",
    "lignesSalesOrder": [
      {
        "idLigne": "L003",
        "idProduit": "p002",
        "nomProduit": "Huile végétale 5L",
        "quantite": 5,
        "prixUnitaire": 7500,
        "montantTotal": 37500
      }
    ],
    "montantHT": 31446.54,
    "montantTVA": 6053.46,
    "montantTTC": 37500,
    "devise": "XAF",
    "transportMethod": SalesOrderResponse.transportMethod.COURSEUR,
    "modeReglement": SalesOrderResponse.modeReglement.MOBILE_MONEY,
    "createdAt": "2026-01-21T08:30:00Z"
  },
  {
    "idSalesOrder": "SO-2026-003",
    "numeroSalesOrder": "ORD/2026/003",
    "dateCreation": "2026-01-22T09:15:00Z",
    "statut": SalesOrderResponse.statut.BROUILLON,
    "idClient": "c003",
    "nomClient": "Ministry of Education",
    "lignesSalesOrder": [
      {
        "idLigne": "L005",
        "idProduit": "p007",
        "nomProduit": "Papier A4 (rame)",
        "quantite": 100,
        "prixUnitaire": 3300,
        "montantTotal": 330000
      }
    ],
    "montantHT": 276729.56,
    "montantTVA": 53270.44,
    "montantTTC": 330000,
    "devise": "XAF",
    "transportMethod": SalesOrderResponse.transportMethod.LIVRAISON_PROPRE,
    "modeReglement": SalesOrderResponse.modeReglement.VIREMENT,
    "createdAt": "2026-01-22T09:15:00Z"
  },
  {
    "idSalesOrder": "SO-2026-004",
    "numeroSalesOrder": "ORD/2026/004",
    "dateCreation": "2026-01-22T11:00:00Z",
    "statut": SalesOrderResponse.statut.VALIDE,
    "idClient": "c004",
    "nomClient": "Small Shop",
    "lignesSalesOrder": [
      {
        "idLigne": "L006",
        "idProduit": "p005",
        "nomProduit": "Savon en barre",
        "quantite": 24,
        "prixUnitaire": 280,
        "montantTotal": 6720
      }
    ],
    "montantHT": 6720,
    "montantTVA": 0,
    "montantTTC": 6720,
    "devise": "XAF",
    "transportMethod": SalesOrderResponse.transportMethod.RETRAIT_MAGASIN,
    "modeReglement": SalesOrderResponse.modeReglement.ESPECES,
    "createdAt": "2026-01-22T11:00:00Z"
  }
]