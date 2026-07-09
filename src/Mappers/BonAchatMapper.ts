import { 
  BonAchatRequest, 
  BonAchatResponse, 
  LigneBonAchatRequest 
} from '../src2/api';
import { 
  PurchaseOrderResponse, 
  PurchaseOrderLineResponse, 
  PurcaseOrderResponse as UIPOResponse 
} from '../api/models/PurchaseOrderLine';

/**
 * Utility to ensure date strings are compatible with Java LocalDateTime (YYYY-MM-DDTHH:mm:ssZ)
 */
const toLocalDateTime = (dateStr?: string): string | undefined => {
  if (!dateStr) return undefined;
  // If it's already a full ISO string, return it; otherwise, append the time suffix
  return dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00Z`;
};

/**
 * Helper to reconcile status differences between Backend and UI
 */
const mapStatusToUI = (backendStatus?: string): UIPOResponse.statut => {
  switch (backendStatus) {
    case 'RECU':
      return UIPOResponse.statut.LIVRE;
    case 'RECU_PARTIEL':
      return UIPOResponse.statut.EN_COURS;
    case 'REJETE':
      return UIPOResponse.statut.ANNULE;
    default:
      // Fallback for shared values like BROUILLON or ANNULE
      return (backendStatus as unknown as UIPOResponse.statut) || UIPOResponse.statut.BROUILLON;
  }
};

// =========================================================
// UI -> BACKEND (FOR SAVE/CREATE)
// =========================================================

/**
 * Maps the UI PurchaseOrderResponse to the Backend BonAchatRequest
 */
export const mapPurchaseOrderToBonAchatRequest = (
  ui: PurchaseOrderResponse
): BonAchatRequest => {
  return {
    // --- Identification ---
    numeroBonAchat: ui.poNumber || `BA-${Date.now()}`,
    supplierId: ui.supplierId || "",
    supplierName: ui.supplierName,
    supplierCode: ui.supplierCode,
    supplierEmail: ui.supplierEmail,
    supplierContact: ui.supplierContact,
    supplierAddress: ui.supplierAddress,

    // --- Delivery Info ---
    deliveryName: ui.deliveryName,
    deliveryAddress: ui.deliveryAddress,
    deliveryEmail: ui.deliveryEmail,
    deliveryContact: ui.deliveryContact,

    // --- Dates (Critical Fix for HttpMessageNotReadableException) ---
    dateBonAchat: toLocalDateTime(ui.poDate) || new Date().toISOString(),
    dateSysteme: toLocalDateTime(ui.systemDate) || new Date().toISOString(),
    dateLivraisonPrevue: toLocalDateTime(ui.expectedDeliveryDate),

    // --- Logistics & Enums ---
    transportMethod: ui.transportMethod,
    instructionsLivraison: ui.deliveryInstructions,
    
    // Status Mapping: Bridge the UI 'status' to API 'status'
    status: ui.status as unknown as BonAchatRequest.status,

    // --- Financials ---
    subtotalAmount: ui.subtotalAmount ?? 0,
    taxAmount: ui.taxAmount ?? 0,
    grandTotal: ui.grandTotal ?? 0,

    // --- Audit & Remarks ---
    preparedBy: ui.preparedBy,
    approvedBy: ui.approvedBy,
    remarks: ui.remarks,

    // --- Line Items Mapping ---
    lines: ui.lines?.map((line): LigneBonAchatRequest => ({
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      uom: line.uom,
      orderedQuantity: line.orderedQuantity ?? 0,
      unitPrice: line.unitPrice ?? 0,
      taxable: line.taxable ?? true,
      vatAmount: line.vatAmount ?? 0,
      totalAmount: line.totalAmount ?? 0,
    })) || [],
  };
};

/**
 * Bulk mapping for arrays (UI to Request)
 */
export const mapPurchaseOrderArrayToRequestArray = (
  list: PurchaseOrderResponse[]
): BonAchatRequest[] => {
  return list.map(mapPurchaseOrderToBonAchatRequest);
};

// =========================================================
// BACKEND -> UI (FOR DISPLAY/LISTS)
// =========================================================

/**
 * Maps the Backend BonAchatResponse back to the UI PurchaseOrderResponse
 */
export const mapBackendBAToPurchaseOrder = (
  backend: BonAchatResponse
): PurchaseOrderResponse => {
  return {
    // --- Identification ---
    idPO: backend.idBonAchat,
    poNumber: backend.numeroBonAchat,

    // --- Supplier Information ---
    supplierId: backend.supplierId,
    supplierName: backend.supplierName,
    supplierCode: backend.supplierCode,
    supplierEmail: backend.supplierEmail,
    supplierContact: backend.supplierContact,
    supplierAddress: backend.supplierAddress,

    // --- Delivery Information ---
    deliveryName: backend.deliveryName,
    deliveryAddress: backend.deliveryAddress,
    deliveryEmail: backend.deliveryEmail,
    deliveryContact: backend.deliveryContact,

    // --- PO Metadata ---
    poDate: backend.dateBonAchat,
    systemDate: backend.dateSysteme,
    expectedDeliveryDate: backend.dateLivraisonPrevue,
    deliveryInstructions: backend.instructionsLivraison,

    // --- Status & Logistics ---
    status: mapStatusToUI(backend.status),
    transportMethod: backend.transportMethod as unknown as UIPOResponse.transportMethod,

    // --- Line Items Mapping ---
    lines: backend.lines?.map((line): PurchaseOrderLineResponse => ({
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      uom: line.uom,
      orderedQuantity: line.orderedQuantity ?? 0,
      unitPrice: line.unitPrice ?? 0,
      taxable: line.taxable ?? true,
      vatAmount: line.vatAmount ?? 0,
      totalAmount: line.totalAmount ?? 0,
    })) || [],

    // --- Totals ---
    subtotalAmount: backend.subtotalAmount ?? 0,
    taxAmount: backend.taxAmount ?? 0,
    grandTotal: backend.grandTotal ?? 0,

    // --- Audit & Dates ---
    preparedBy: backend.preparedBy,
    approvedBy: backend.approvedBy,
    remarks: backend.remarks,
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
    docPermission: backend.docPermission,
  };
};

/**
 * Bulk mapping for lists (Backend to UI)
 */
export const mapBackendBAArrayToUIArray = (
  list: BonAchatResponse[] | undefined
): PurchaseOrderResponse[] => {
  return list?.map(mapBackendBAToPurchaseOrder) || [];
};