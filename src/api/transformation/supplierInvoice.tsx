import { FactureResponse } from '../models/FactureResponse';
import { LigneFactureResponse } from '../models/LigneFactureResponse';
import { UpdatedSupplierFactureResponse } from '../models/UpdatedSupplierFactureResponse';
import { PurchaseOrderResponse } from '../models/PurchaseOrderLine';
import { GoodsReceiptNoteResponse } from '../models/GoodsReceiptNote';

/**
 * Combines PO (Financials) and GRN (Logistics) to generate a Supplier Facture.
 * Validates tax per line and uses accepted quantities for the final amount.
 */
export const generateFactureFromPOandGRN = (
  po: PurchaseOrderResponse,
  grn: GoodsReceiptNoteResponse
): UpdatedSupplierFactureResponse => {
  const now = new Date().toISOString();
  const VAT_RATE = 0.1925; // Standard Cameroon VAT

  // 1. Map the lines based on GRN Accepted Quantity + PO Pricing
  const lignesFacture: LigneFactureResponse[] = (grn.lines || []).map((grnLine) => {
    // Cross-reference with PO to get the correct price and tax status
    const poLine = po.lines?.find(l => l.productId === grnLine.productId);
    
    const qty = grnLine.acceptedQuantity || 0;
    const price = poLine?.unitPrice || grnLine.rate || 0;
    const lineTotal = qty * price;

    return {
      idProduit: grnLine.productId,
      nomProduit: grnLine.description || poLine?.productName,
      description: grnLine.description || poLine?.productName,
      quantite: qty,
      prixUnitaire: price,
      montantTotal: lineTotal,
      // In Accounts Payable: Credit the supplier for the amount owed
      debit: 0, 
      credit: lineTotal,
      isTaxLine: poLine?.taxable ?? false,
      remisePourcentage: 0,
      remiseMontant: 0
    };
  });

  // 2. Calculate Header Totals
  const totalHT = lignesFacture.reduce((sum, line) => sum + (line.montantTotal || 0), 0);
  
  // Per-line tax calculation (Accurate 3-way match logic)
  const totalTVA = lignesFacture
    .filter(line => line.isTaxLine)
    .reduce((sum, line) => sum + ((line.montantTotal || 0) * VAT_RATE), 0);
    
  const totalTTC = totalHT + totalTVA;

  return {
    // Document Metadata
    dateFacturation: now,
    dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    etat: FactureResponse.etat.BROUILLON,
    type: "FOURNISSEUR",
    
    // Supplier Mapping (Source: PO)
    idFournisseur: po.supplierId,
    nomFournisseru: po.supplierName,
    adresseFournisseur: po.supplierAddress,
    emailFournisseur: po.supplierEmail,
    telephoneFournisseur: po.supplierContact,
    
    // Financial Totals
    montantHT: totalHT,
    montantTVA: totalTVA,
    montantTTC: totalTTC,
    montantTotal: totalTTC,
    montantRestant: totalTTC,
    finalAmount: totalTTC,
    
    // Currency & Config
    applyVat: totalTVA > 0,
    devise: "XAF",
    tauxChange: 1,
    
    // Logistics Reference
    idGRN: grn.idGRN,
    numeroGRN: grn.grnNumber,
    referenceCommande: po.poNumber,
    
    lignesFacture: lignesFacture,
    notes: `Facturation générée à partir du bon de réception ${grn.grnNumber} (PO Ref: ${po.poNumber}).`,
    
    createdAt: now,
    updatedAt: now
  };
};