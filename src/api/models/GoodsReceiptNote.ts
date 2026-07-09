import type { DocPermissionResponse } from '../../src2/api/models/DocPermissionResponse';

export type GoodsReceiptNoteResponse = {
  idGRN?: string;
  grnNumber?: string;
  supplierId?: string;
  supplierName?: string;
  transporterCompanyName?: string;
  vehicleNumber?: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  receiptDate?: string;        // Actual date goods received
  documentDate?: string;       // GRN creation date
  systemDate?: string;
  status?: GoodReceiptResponse.statut;
  lines?: GoodsReceiptLineResponse[];
  preparedBy?: string;
  inspectedBy?: string;
  approvedBy?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  docPermission?: DocPermissionResponse;
};

export type GoodsReceiptLineResponse = {
  productId?: string;
  description?: string;
  uom?: string; // unit of measure
  orderedQuantity?: number;
  receivedQuantity?: number;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
  shortQuantity?: number;
  damagedQuantity?: number;
  excessQuantity?: number;
  rate?: number;
  lineAmount?: number;
};

export namespace GoodReceiptResponse {
  export enum statut {
    DRAFT = "Brouillon",
    PARTIALLY_RECEIVED = "Reçu partiellement",
    RECEIVED = "Reçu",
    REJECTED = "Rejeté",
    ANNULE = "Annulé",
  }
}

export const MOCK_GOODS_RN: GoodsReceiptNoteResponse[] = [
  {
    idGRN: "grn-8824-2026",
    grnNumber: "GRN/2026/001",
    purchaseOrderId: "PO-2026-001",
    purchaseOrderNumber: "PURCH-001",
    supplierId: "c002",
    supplierName: "ABC Distributors",
    transporterCompanyName: "Rapid Logistics Ltd",
    vehicleNumber: "LT-123-AA",
    receiptDate: "2026-01-24T09:00:00Z",
    documentDate: "2026-01-24T10:30:00Z",
    status: GoodReceiptResponse.statut.RECEIVED,
    preparedBy: "Warehouse Clerk",
    inspectedBy: "QC Lead",
    approvedBy: "Store Manager",
    remarks: "Partial delivery for Riz; Ciment received in full but 2 bags damaged.",
    lines: [
      {
        productId: "p001",
        description: "Riz 25kg",
        uom: "SACK",
        orderedQuantity: 100,
        receivedQuantity: 80,
        acceptedQuantity: 80,
        rejectedQuantity: 0,
        shortQuantity: 20,
        damagedQuantity: 0,
        excessQuantity: 0,
        rate: 15000,
        lineAmount: 1200000,
      },
      {
        productId: "p004",
        description: "Ciment 50kg",
        uom: "BAG",
        orderedQuantity: 200,
        receivedQuantity: 200,
        acceptedQuantity: 198,
        rejectedQuantity: 2,
        shortQuantity: 0,
        damagedQuantity: 2,
        excessQuantity: 0,
        rate: 4800,
        lineAmount: 960000,
      },
    ],
  },
  {
    idGRN: "grn-8821-2026",
    grnNumber: "GRN/2026/001",
    supplierId: "sup-445",
    supplierName: "Agro-Industries Cameroon",
    transporterCompanyName: "Rapid Logistics Ltd",
    vehicleNumber: "LT-552-CA",
    purchaseOrderId: "po-992",
    purchaseOrderNumber: "PO-2026-778",
    receiptDate: "2026-01-22T10:30:00Z",
    documentDate: "2026-01-23T08:15:00Z",
    systemDate: "2026-01-23T08:15:00Z",
    status: GoodReceiptResponse.statut.RECEIVED,
    preparedBy: "John Doe",
    inspectedBy: "Sarah Connor",
    approvedBy: "Robert Smith",
    remarks: "Batch inspected and 5 items rejected due to packaging damage.",
    lines: [
      {
        productId: "prod-101",
        description: "Premium Grade Cocoa Beans",
        uom: "Kilogram",
        orderedQuantity: 500,
        receivedQuantity: 500,
        acceptedQuantity: 495,
        rejectedQuantity: 5,
        shortQuantity: 0,
        damagedQuantity: 5,
        excessQuantity: 0,
        rate: 1200,
        lineAmount: 600000,
      },
    ],
    createdAt: "2026-01-23T08:15:00Z",
    updatedAt: "2026-01-23T14:20:00Z",
  },
  {
    idGRN: "grn-8822-2026",
    grnNumber: "GRN/2026/002",
    supplierId: "sup-771",
    supplierName: "Global Seed Co.",
    transporterCompanyName: "Internal Fleet",
    vehicleNumber: "CE-001-HQ",
    purchaseOrderId: "po-995",
    purchaseOrderNumber: "PO-2026-812",
    receiptDate: "2026-01-23T14:00:00Z",
    documentDate: "2026-01-23T15:00:00Z",
    systemDate: "2026-01-23T15:16:00Z",
    status: GoodReceiptResponse.statut.DRAFT,
    preparedBy: "Alice Mballa",
    remarks: "Pending quality control signature.",
    lines: [
      {
        productId: "prod-505",
        description: "Fertilizer NPK 15-15-15",
        uom: "Bag (50kg)",
        orderedQuantity: 50,
        receivedQuantity: 48,
        acceptedQuantity: 0,
        rejectedQuantity: 0,
        shortQuantity: 2,
        damagedQuantity: 0,
        excessQuantity: 0,
        rate: 25000,
        lineAmount: 1200000,
      },
    ],
    createdAt: "2026-01-23T15:16:00Z",
    updatedAt: "2026-01-23T15:16:00Z",
  },
];