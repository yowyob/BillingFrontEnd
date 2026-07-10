'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedProductResponse } from '@/src/api/models/UpdatedProductResponse';
import SearchIcon from "@mui/icons-material/Search";
import { Trash2, Pencil, Plus, Package, Tag, Calculator, Receipt, Truck } from "lucide-react";
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import { UpdatedSupplierFactureResponse, LigneSupplierFactureResponse } from '@/src/api/models/UpdatedSupplierFactureResponse';
import SummaryCard from '@/components/SummaryCard';
import { GoodsReceiptNoteResponse } from '@/src/api/models/GoodsReceiptNote';
import { ProductsService } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { getProductsOfflineFirst } from '@/src/offline/services/referenceService';

// Updated Styles using your theme variables
const inputStyles = "w-full border border-secondary-light rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary/10 focus:border-secondary transition-all text-sm text-primary bg-white shadow-sm placeholder:text-secondary-gray";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-secondary-gray mb-1 block ml-0.5";

interface Props {
  supplier: UpdatedClientResponse | undefined;
  invoice: UpdatedSupplierFactureResponse | undefined;
  setInvoice: (data: UpdatedSupplierFactureResponse) => void;
  selectedGRN?: GoodsReceiptNoteResponse;
}

const SupplierInvoiceDetails = ({ supplier, invoice, setInvoice, selectedGRN }: Props) => {
  const [productSearch, setProductSearch] = useState("");
  const [produits, setProduits] = useState<UpdatedProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<UpdatedProductResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<UpdatedProductResponse | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load Products for the seller's organization
  useEffect(() => {
    const orgId = getStoredSeller()?.organizationId;
    if (!orgId) return;
    getProductsOfflineFirst(() => ProductsService.getProductsByOrganization(orgId))
      .then(data => setProduits(data as unknown as UpdatedProductResponse[]))
      .catch(() => {
        // fall back to empty — non-blocking
      });
  }, []);

  // 1. Filter Products
  useEffect(() => {
    const term = productSearch.toLowerCase().trim();
    if (!term || (selectedProduct && term === selectedProduct.nomProduit?.toLowerCase())) {
      setFilteredProducts([]);
      return;
    }
    let filtered = produits.filter(p =>
      p.idProduit?.toLowerCase().includes(term) ||
      p.nomProduit?.toLowerCase().includes(term)
    );
    if (selectedGRN) {
      const receivedIds = selectedGRN.lines?.map(i => i.productId);
      filtered = filtered.filter(p => receivedIds?.includes(p.idProduit));
    }
    setFilteredProducts(filtered);
  }, [productSearch, selectedProduct, selectedGRN, produits]);

  // 2. Default Cost Logic
  useEffect(() => {
    if (selectedProduct) setUnitCost(selectedProduct.cout || 0);
  }, [selectedProduct]);

  // 3. Totals Calculation
  useEffect(() => {
    if (!invoice) return;
    const rawHT = (invoice.lignesFacture || []).reduce((acc, curr) => acc + (curr.montantTotal || 0), 0);
    const discountPercent = invoice.remiseGlobalePourcentage || 0;
    const discountAmount = rawHT * (discountPercent / 100);
    const taxableAmount = rawHT - discountAmount;
    const tva = invoice.applyVat ? taxableAmount * 0.1925 : 0;
    const ttc = taxableAmount + tva;

    setInvoice({
      ...invoice,
      montantHT: Math.round(taxableAmount),
      montantTVA: Math.round(tva),
      montantTTC: Math.round(ttc),
      finalAmount: Math.round(ttc),
      remiseGlobaleMontant: Math.round(discountAmount)
    });
  }, [invoice?.lignesFacture, invoice?.applyVat, invoice?.remiseGlobalePourcentage]);

  const addLine = () => {
    if (!selectedProduct || !invoice) return;
    const newLine: LigneSupplierFactureResponse = {
      idProduit: selectedProduct.idProduit,
      nomProduit: selectedProduct.nomProduit,
      quantite: quantity,
      prixUnitaire: unitCost,
      montantTotal: Math.round(quantity * unitCost),
      description: `Purchase: ${selectedProduct.nomProduit}`,
      debit: Math.round(quantity * unitCost),
      credit: 0
    };
    setInvoice({ ...invoice, lignesFacture: [...(invoice.lignesFacture || []), newLine] });
    setSelectedProduct(null); setProductSearch(""); setQuantity(1); setUnitCost(0);
  };

  const removeLine = (index: number) => {
    if (!invoice) return;
    const newLines = [...(invoice.lignesFacture || [])];
    newLines.splice(index, 1);
    setInvoice({ ...invoice, lignesFacture: newLines });
  };

  const handleEdit = (line: LigneSupplierFactureResponse, index: number) => {
    const productToEdit = produits.find(p => p.idProduit === line.idProduit);
    if (!productToEdit) return;
    setSelectedProduct(productToEdit);
    setProductSearch(productToEdit.nomProduit || "");
    setQuantity(line.quantite || 1);
    setUnitCost(line.prixUnitaire || 0);
    removeLine(index);
  };

  return (
    <div className="space-y-6 font-sans pb-10" ref={containerRef}>
      {/* PURCHASE ENTRY UI */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-light">
        <div className="flex items-center justify-between mb-6 border-b border-secondary-super-light pb-4">
          <div className="flex items-center gap-2">
            <Package className="text-secondary" size={18} />
            <h3 className="text-sm font-black text-primary uppercase tracking-tight">Supplier Item Entry</h3>
          </div>
          {selectedGRN && (
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary-super-light text-secondary rounded-full border border-secondary-light">
              <Truck size={12} />
              <span className="text-[10px] font-bold uppercase">Linked to: {selectedGRN.grnNumber}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-12 md:col-span-5 relative">
            <label className={labelStyles}>Product / Item</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-secondary-gray" sx={{ fontSize: 18 }} />
              <input
                type="text" className={`${inputStyles} pl-10`}
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                placeholder="Search..."
              />
            </div>
            {showProductResults && filteredProducts.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-secondary-light rounded-xl shadow-2xl max-h-48 overflow-auto">
                {filteredProducts.map(p => (
                  <div key={p.idProduit} onClick={() => { setSelectedProduct(p); setProductSearch(p.nomProduit || ""); setShowProductResults(false); }} className="px-4 py-2 hover:bg-secondary-super-light cursor-pointer border-b border-secondary-background last:border-none flex justify-between items-center transition-colors">
                    <span className="text-sm font-bold text-primary">{p.nomProduit}</span>
                    <span className="text-[9px] font-mono text-secondary-gray">{p.idProduit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-4 md:col-span-2">
            <label className={labelStyles}>Qty</label>
            <input type="number" className={inputStyles} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>

          <div className="col-span-8 md:col-span-4">
            <label className={labelStyles}>Unit Cost (XAF)</label>
            <input type="number" className={`${inputStyles} font-bold text-secondary-mid`} value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} />
          </div>

          <div className="col-span-12 md:col-span-1 pt-[21px]">
            <button
              type="button" onClick={addLine} disabled={!selectedProduct}
              className="w-full bg-secondary hover:bg-primary text-white rounded-xl h-[38px] shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-light overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-secondary-background border-b border-secondary-light">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray">Description</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray text-center">Qty</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray text-right">Unit Cost</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray text-right">Total HT</th>
              <th className="px-6 py-4 text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-background">
            {invoice?.lignesFacture?.map((line, idx) => (
              <tr key={`${line.idProduit}-${idx}`} className="group hover:bg-secondary-super-light transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-primary">{line.nomProduit}</p>
                  <p className="text-[10px] text-secondary-gray font-mono">{line.idProduit}</p>
                </td>
                <td className="px-6 py-4 text-center font-bold text-primary">{line.quantite}</td>
                <td className="px-6 py-4 text-right text-sm text-secondary-gray">{line.prixUnitaire?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-black text-secondary">{line.montantTotal?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(line, idx)} className="p-2 text-secondary hover:bg-white rounded-lg shadow-sm transition-all"><Pencil size={15} /></button>
                    <button onClick={() => removeLine(idx)} className="p-2 text-rose-500 hover:bg-white rounded-lg shadow-sm transition-all"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        <SummaryCard title="Subtotal" value={invoice?.montantHT} icon={<Calculator size={18}/>} variant="default" />
        <SummaryCard title="TVA (19.25%)" value={invoice?.montantTVA} icon={<Tag size={18}/>} variant="secondary" />
        <SummaryCard title="Total Discount" value={invoice?.remiseGlobaleMontant} icon={<Tag size={18}/>} variant="accent" />
        <SummaryCard title="Final Amount" value={invoice?.finalAmount} icon={<Receipt size={18}/>} variant="dark" />
      </div>
    </div>
  );
};

export default SupplierInvoiceDetails;