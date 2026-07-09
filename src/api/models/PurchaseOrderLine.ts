import type { DocPermissionResponse } from '../../src2/api/models/DocPermissionResponse';

export type PurchaseOrderResponse = {
  idPO?: string;
  poNumber?: string;

  // Supplier / Vendor Information
  supplierId?: string;
  supplierName?: string;
  supplierCode?: string;
  supplierEmail?: string;
  supplierContact?: string;
  supplierAddress?: string;

  // Delivery Information
  deliveryName?: string;
  deliveryAddress?: string;
  deliveryEmail?: string;
  deliveryContact?: string;

  // PO Metadata
  poDate?: string;       // Date PO was created
  systemDate?: string;   // Date system recorded PO

  // Transport / Shipping
  transportMethod?: PurcaseOrderResponse.transportMethod;
  expectedDeliveryDate?: string;
  deliveryInstructions?: string;

  // Status
  status?: PurcaseOrderResponse.statut;

  // Line Items
  lines?: PurchaseOrderLineResponse[];

  // Footer / Totals
  subtotalAmount?: number;
  
  taxAmount?: number;
  grandTotal?: number;

  // Audit / Approval
  preparedBy?: string;
  approvedBy?: string;
  remarks?: string;

  createdAt?: string;
  updatedAt?: string;
  docPermission?: DocPermissionResponse;
};

export type PurchaseOrderLineResponse = {
  productId?: string;
  productCode?: string;
  productName?: string;
  uom?:string

  orderedQuantity?: number;
  unitPrice?: number;
  taxable?:boolean;
  vatAmount?:number
  
  totalAmount?: number;     // (Rate * Quantity - Discount) + Tax
};


export namespace PurcaseOrderResponse{
   export enum transportMethod {
        AGENCE = 'AGENCE',
        COURSEUR = 'COURSEUR',              // Local Courier / Delivery Boy
        RETRAIT_MAGASIN = 'RETRAIT_MAGASIN', // In-store Pickup
        LIVRAISON_PROPRE = 'LIVRAISON_PROPRE', // Company Truck
        FRET_AERIEN = 'FRET_AERIEN',
        FRET_MARITIME = 'FRET_MARITIME'
    }

     export enum statut {
        BROUILLON = 'BROUILLON',
        VALIDE = 'VALIDE',           // Confirmed by client
        EN_COURS = 'EN_COURS',       // In preparation
        EXPEDIE = 'EXPEDIE',         // Left the warehouse
        LIVRE = 'LIVRE',             // Final delivery confirmed
        ANNULE = 'ANNULE'
    }
}


export const MOCK_PURCHASE_ORDERS: PurchaseOrderResponse[] = [
  {
    idPO: "PO-2026-001",
    poNumber: "PURCH-001",
    
    // Supplier Information
    supplierId: "c002",
    supplierName: "ABC Distributors",
    supplierCode: "CLI-002",
    supplierEmail: "contact@abc-distributors.cm",
    supplierContact: "+237690000002",
    supplierAddress: "Yaoundé, Bastos",

    // Delivery Information
    deliveryName: "Central Warehouse",
    deliveryAddress: "Douala Port Zone, Hangar 4",
    deliveryEmail: "logistics-douala@company.cm",
    deliveryContact: "+237677001122",
    
    // PO Metadata
    poDate: "2026-01-20T08:00:00Z",
    systemDate: "2026-01-20T08:05:00Z",
    status: PurcaseOrderResponse.statut.VALIDE,
    
    // Transport
    transportMethod: PurcaseOrderResponse.transportMethod.LIVRAISON_PROPRE,
    expectedDeliveryDate: "2026-01-25T17:00:00Z",
    deliveryInstructions: "Please call the warehouse manager 2 hours before arrival for gate clearance.",

    lines: [
      {
        productId: "p001",
        productCode: "RIZ-25KG",
        productName: "Riz 25kg",
        uom: "SACK",
        orderedQuantity: 100,
        unitPrice: 15000,
        taxable: true,
        vatAmount: 288750,
        totalAmount: 1788750
      },
      {
        productId: "p004",
        productCode: "CIM-50KG",
        productName: "Ciment 50kg",
        uom: "BAG",
        orderedQuantity: 200,
        unitPrice: 4800,
        taxable: true,
        vatAmount: 184800,
        totalAmount: 1144800
      }
    ],

    subtotalAmount: 2460000,
    taxAmount: 473550,
    grandTotal: 2933550,
    preparedBy: "Supply Manager",
    approvedBy: "Operations Director",
    remarks: "Quarterly stock replenishment for Northern region.",
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-01-20T09:15:00Z"
  },
  {
    idPO: "PO-2026-002",
    poNumber: "PURCH-002",

    supplierId: "c003",
    supplierName: "Ministry of Education",
    supplierCode: "CLI-003",
    supplierEmail: "procurement@minedu.gov.cm",
    supplierContact: "+237690000003",
    supplierAddress: "Yaoundé, Centre Ville",

    deliveryName: "Head Office - Stationary Room",
    deliveryAddress: "Place de l'Indépendance, Yaoundé",
    deliveryEmail: "admin@company.cm",
    deliveryContact: "+237699887766",

    poDate: "2026-01-22T10:00:00Z",
    status: PurcaseOrderResponse.statut.EXPEDIE,
    transportMethod: PurcaseOrderResponse.transportMethod.RETRAIT_MAGASIN,
    expectedDeliveryDate: "2026-01-23T12:00:00Z",
    deliveryInstructions: "Items are for the boardroom. Deliver to 3rd floor.",

    lines: [
      {
        productId: "p007",
        productCode: "PAP-A4",
        productName: "Papier A4 (rame)",
        uom: "BOX",
        orderedQuantity: 50,
        unitPrice: 3000,
        taxable: true,
        vatAmount: 28875,
        totalAmount: 178875
      }
    ],

    subtotalAmount: 150000,
    taxAmount: 28875,
    grandTotal: 178875,
    preparedBy: "Office Clerk",
    remarks: "Bulk order for administration supplies",
    createdAt: "2026-01-22T10:00:00Z",
    updatedAt: "2026-01-22T10:00:00Z"
  },
  {
    idPO: "PO-2026-003",
    poNumber: "PURCH-003",

    supplierId: "c004",
    supplierName: "Small Shop",
    supplierCode: "CLI-004",
    supplierEmail: "shop@smallshop.cm",
    supplierContact: "+237690000004",
    supplierAddress: "Bafoussam, Market",

    deliveryName: "Bafoussam Retail Point",
    deliveryAddress: "Entrée Marché, Bafoussam",
    deliveryEmail: "bafoussam-store@company.cm",
    deliveryContact: "+237655443322",

    poDate: "2026-01-23T14:30:00Z",
    status: PurcaseOrderResponse.statut.LIVRE,
    transportMethod: PurcaseOrderResponse.transportMethod.COURSEUR,
    expectedDeliveryDate: "2026-01-23T16:00:00Z",
    deliveryInstructions: "Fragile items. Use motorcycle courier with insulated bag.",

    lines: [
      {
        productId: "p005",
        productCode: "SAV-001",
        productName: "Savon en barre",
        uom: "UNIT",
        orderedQuantity: 500,
        unitPrice: 220,
        taxable: false,
        vatAmount: 0,
        totalAmount: 110000
      }
    ],

    subtotalAmount: 110000,
    taxAmount: 0,
    grandTotal: 110000,
    preparedBy: "Store Keeper",
    approvedBy: "Branch Manager",
    createdAt: "2026-01-23T14:30:00Z",
    updatedAt: "2026-01-23T16:45:00Z"
  }
];