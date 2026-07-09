/**
 * Converts a Purchase Order Response into a Goods Receipt Note Response.
 * By default, it assumes all items ordered are received and accepted.
 */
import { PurchaseOrderResponse } from "../models/PurchaseOrderLine";
import { GoodsReceiptNoteResponse,GoodReceiptResponse,GoodsReceiptLineResponse } from "../models/GoodsReceiptNote";

export const convertPurchaseOrderToGRN = (
  po: PurchaseOrderResponse
): GoodsReceiptNoteResponse => {
  const now = new Date().toISOString();

  return {
    // Generate a temporary GRN ID and Number (usually handled by backend, but good for UI)
    
    

    // Mapping Supplier Info
    supplierId: po.supplierId,
    supplierName: po.supplierName,

    // Reference the source Purchase Order
    purchaseOrderId: po.idPO,
    purchaseOrderNumber: po.poNumber,

    // Date defaults
    receiptDate: now,
    documentDate: now,
    systemDate: now,

    // Initial Status
    status: GoodReceiptResponse.statut.DRAFT,

    // Map Line Items
    lines: (po.lines || []).map((line): GoodsReceiptLineResponse => {
      const orderedQty = line.orderedQuantity || 0;
      
      return {
        productId: line.productId,
        description: line.productName,
        uom: line.uom,
        
        // Logical defaults: assume perfect delivery initially
        orderedQuantity: orderedQty,
        receivedQuantity: orderedQty,
        acceptedQuantity: orderedQty,
        rejectedQuantity: 0,
        shortQuantity: 0,
        damagedQuantity: 0,
        excessQuantity: 0,
        
        rate: line.unitPrice,
        // Line amount based on accepted quantity
        lineAmount: (line.unitPrice || 0) * orderedQty
      };
    }),

    preparedBy: "Current User", // Should be replaced by actual auth user
    remarks: po.remarks ? `Generated from PO: ${po.remarks}` : `Based on PO ${po.poNumber}`,
    
    createdAt: now,
    updatedAt: now
  };
};