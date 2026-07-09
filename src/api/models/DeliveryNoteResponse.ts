import type { DocPermissionResponse } from '../../src2/api/models/DocPermissionResponse';

export type DeliveryNoteLineResponse = {
  productId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  idProduit?: string;
  amount?: number;
  // Partial delivery fields
  quantiteTotal?: number;
  quantiteLivree?: number;
  quantiteRestante?: number;
};

export type DeliveryNoteResponse = {
  idDN?: string;
  deliveryNoteNumber?: string;

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


  deliveryAgency?:string

  // Delivery Metadata
  deliveryDate?: string;
  dueDate?: string;

  // status
  etat: DeliveryNoteResponse.etat;

  // Line Items
  lines?: DeliveryNoteLineResponse[];

  // Footer / Totals
  totalAmount?: number;

  // Terms & Conditions
  termsAndConditions?: string;

  // Reference
  idSaleOrder?: string;
  SaleOrderNumber?: string;

  // Partial delivery
  isPartial?: boolean;

  createdAt?: string;
  updatedAt?: string;
  docPermission?: DocPermissionResponse;
};

export namespace DeliveryNoteResponse {
  export enum etat {
    BROUILLON = 'BROUILLON',
    ENVOYE = 'ENVOYE',
    PARTIELLE = 'PARTIELLE',
    ANNULE = 'ANNULE',
  }
}

export const MOCK_DELIVERY_NOTES: DeliveryNoteResponse[] = [
  {
    idDN: "DN-2026-001",
    deliveryNoteNumber: "BL/2026/001",
    etat: DeliveryNoteResponse.etat.ENVOYE,
    // Client Info
    idClient: "c002",
    nomClient: "ABC Distributors",
    adresseClient: "Yaoundé, Bastos",
    emailClient: "billing@abc.cm",
    telephoneClient: "+237690000002",
    // Recipient Info
    recipientName: "Moussa Ibrahim",
    recipientPhone: "+237677123456",
    recipientAddress: "Marché Central, Magasin 44",
    recipientCity: "Yaoundé",
    deliveryDate: "2026-01-22T10:00:00Z",
    dueDate: "2026-01-25",
    lines: [
      {
        productId: "p001",
        description: "Riz 25kg (Wholesale Tier)",
        quantity: 20,
        unitPrice: 14400,
        amount: 288000
      },
      {
        productId: "p003",
        description: "Sucre blanc 50kg (Wholesale Tier)",
        quantity: 10,
        unitPrice: 15000,
        amount: 150000
      }
    ],
    totalAmount: 438000,
    termsAndConditions: "Goods remain the property of the seller until full payment is received.",
    idSaleOrder: "SO-2026-001",
    SaleOrderNumber: "ORD/2026/001",
    createdAt: "2026-01-22T08:00:00Z",
    updatedAt: "2026-01-22T09:30:00Z"
  },
  {
    idDN: "DN-2026-002",
    deliveryNoteNumber: "BL/2026/002",
    etat: DeliveryNoteResponse.etat.BROUILLON,
    // Client Info
    idClient: "c001",
    nomClient: "John Doe Retail",
    adresseClient: "Douala, Akwa",
    telephoneClient: "+237690000001",
    // Recipient Info
    recipientName: "John Doe",
    recipientPhone: "+237690000001",
    recipientAddress: "Rue de la Joie",
    recipientCity: "Douala",
    deliveryDate: "2026-01-23T14:00:00Z",
    dueDate: "2026-01-23",
    lines: [
      {
        productId: "p002",
        description: "Huile végétale 5L (Retail Price)",
        quantity: 5,
        unitPrice: 7500,
        amount: 37500
      },
      {
        productId: "p005",
        description: "Savon en barre (Promo Applied)",
        quantity: 50,
        unitPrice: 250,
        amount: 12500
      }
    ],
    totalAmount: 50000,
    termsAndConditions: "Fragile items included. Please inspect for leaks upon delivery.",
    idSaleOrder: "SO-2026-002",
    SaleOrderNumber: "ORD/2026/002",
    createdAt: "2026-01-22T11:45:00Z",
    updatedAt: "2026-01-22T11:45:00Z"
  },
  {
    idDN: "DN-2026-003",
    deliveryNoteNumber: "BL/2026/003",
    etat: DeliveryNoteResponse.etat.ANNULE,
    // Client Info
    idClient: "c004",
    nomClient: "Small Shop",
    adresseClient: "Bafoussam, Market",
    telephoneClient: "+237690000004",
    // Recipient Info
    recipientName: "Mama Beatrice",
    recipientPhone: "+237699887766",
    recipientAddress: "Entrée Marché",
    recipientCity: "Bafoussam",
    deliveryDate: "2026-01-21T09:00:00Z",
    dueDate: "2026-01-21",
    lines: [
      {
        productId: "p004",
        description: "Ciment 50kg (Super Gros)",
        quantity: 100,
        unitPrice: 4700,
        amount: 470000
      }
    ],
    totalAmount: 470000,
    termsAndConditions: "Order cancelled due to stock unavailability.",
    idSaleOrder: "SO-2026-004",
    SaleOrderNumber: "ORD/2026/004",
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-01-21T15:20:00Z"
  }
];