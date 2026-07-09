'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedProductResponse, ClientSaleSize } from '@/src/api/models/UpdatedProductResponse';
import SearchIcon from "@mui/icons-material/Search";
import { Trash2, Pencil, Plus, ShoppingCart, Tag, Calculator, Receipt, RotateCcw, AlertCircle } from "lucide-react";
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import { UpdatedCreditNoteResponse, CreditNoteResponse } from '@/src/api/models/UpdatedCreditNoteResponse';
import SummaryCard from '@/components/SummaryCard';
import { Permission, UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { ProductsService } from '@/src/src2/api';

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

interface Props {
  client: UpdatedClientResponse | undefined;
  creditNote: UpdatedCreditNoteResponse | undefined;
  setCreditNote: (data: UpdatedCreditNoteResponse) => void;
}

const CreditNoteDetails = ({ client, creditNote, setCreditNote }: Props) => {
  const [productSearch, setProductSearch] = useState("");
  const [produits, setProduits] = useState<UpdatedProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<UpdatedProductResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<UpdatedProductResponse | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ClientSaleSize.size | "">("");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) setSeller(JSON.parse(stored));
  }, []);

  // Load Products for the seller's organization
  useEffect(() => {
    if (!seller?.organizationId) return;
    ProductsService.getProductsByOrganization(seller.organizationId)
      .then(data => setProduits(data as unknown as UpdatedProductResponse[]))
      .catch(() => {
        // fall back to empty — non-blocking
      });
  }, [seller?.organizationId]);

  // 1. Filter Products for Credit Note (Allows searching all products to return)
  useEffect(() => {
    const term = productSearch.toLowerCase().trim();
    if (!term || (selectedProduct && term === selectedProduct.nomProduit?.toLowerCase())) {
      setFilteredProducts([]);
      return;
    }
    const filtered = produits.filter(p =>
      p.idProduit?.toLowerCase().includes(term) ||
      p.nomProduit?.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  }, [productSearch, selectedProduct, produits]);

  // 2. Derive the refund unit price from the product's price at the selected tier
  useEffect(() => {
    if (!selectedProduct || !selectedSize) {
      setUnitPrice(0);
      return;
    }
    const sizeConfig = selectedProduct.allowedSaleSizes?.find(s => s.size === selectedSize);
    setUnitPrice(sizeConfig?.unitPrice || 0);
  }, [selectedProduct, selectedSize]);

  // 3. Totals Calculation (HT, TVA, TTC) - Credit Notes are usually negative or "Balance"
  useEffect(() => {
    if (!creditNote) return;

    // We calculate based on items, then negate the final result for the summary
    const rawSum = (creditNote.lignesCreditNote || []).reduce((acc, curr) => acc + (Math.abs(curr.montantTotal || 0)), 0);
    
    let ht: number, tva: number, ttc: number;

    if (creditNote.applyVat) {
      ttc = rawSum;
      ht = ttc / 1.1925;
      tva = ttc - ht;
    } else {
      ht = rawSum;
      tva = 0;
      ttc = ht;
    }

    // Update state with negative values to represent credit
    const hasChanged = 
      Math.round(-ht) !== Math.round(creditNote.montantHT || 0) ||
      Math.round(-ttc) !== Math.round(creditNote.montantTTC || 0);

    if (hasChanged) {
      setCreditNote({ 
        ...creditNote, 
        montantHT: -ht, 
        montantTVA: -tva, 
        montantTTC: -ttc,
        finalAmount: -ttc
      });
    }
  }, [creditNote?.lignesCreditNote, creditNote?.applyVat]);

  const addLine = () => {
    if (!selectedProduct || !selectedSize || !creditNote) return;

    const newLine = {
      idLigne: `L-CN-${Date.now()}`,
      idProduit: selectedProduct.idProduit,
      nomProduit: selectedProduct.nomProduit,
      quantite: quantity,
      prixUnitaire: unitPrice,
      // Montant total is negative for credit notes
      montantTotal: -(quantity * unitPrice),
      credit: quantity * unitPrice,
      debit: 0,
      description: `Return: ${selectedProduct.nomProduit} - ${selectedSize}`,
    };

    setCreditNote({
      ...creditNote,
      lignesCreditNote: [...(creditNote.lignesCreditNote || []), newLine as any]
    });

    setSelectedProduct(null);
    setProductSearch("");
    setQuantity(1);
    setSelectedSize("");
  };

  const removeLine = (index: number) => {
    if (!creditNote) return;
    const newLines = [...(creditNote.lignesCreditNote || [])];
    newLines.splice(index, 1);
    setCreditNote({ ...creditNote, lignesCreditNote: newLines });
  };


  const handleEdit = (line: any, index: number) => {
    // 1. Find the product to populate the search and tiers
    const productToEdit = produits.find(p => p.idProduit === line.idProduit);
    if (!productToEdit) return;

    // 2. Set the form states
    setSelectedProduct(productToEdit);
    setProductSearch(productToEdit.nomProduit || "");
    
    // Extract size from description (assuming format "Return: Name - SIZE")
    const descriptionParts = line.description?.split(' - ');
    const size = descriptionParts?.[descriptionParts.length - 1] || "";
    setSelectedSize(size as ClientSaleSize.size);
    
    setQuantity(line.quantite);
    setUnitPrice(line.prixUnitaire);

    // 3. Remove the line from the list so it can be updated
    removeLine(index);
    
    // 4. Scroll to top of form for better UX
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

return (
    <div className="space-y-6 font-sans pb-10" ref={containerRef}>
      {/* FORM UI */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-light">
        <div className="flex items-center justify-between mb-6 border-b border-secondary-super-light pb-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="text-secondary-mid" size={18} />
            <h3 className="text-sm font-black text-primary uppercase tracking-tight">Return Item Entry</h3>
          </div>
          <div className="flex items-center gap-2 text-secondary-mid bg-secondary-super-light px-3 py-1 rounded-full border border-secondary-light">
            <AlertCircle size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Credit Note Mode</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-12 md:col-span-4 relative">
            <label className={labelStyles}>Product to Return</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-secondary-gray" sx={{ fontSize: 18 }} />
              <input
                type="text" className={`${inputStyles} pl-10 border-secondary-light focus:border-secondary-mid`}
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                onFocus={() => setShowProductResults(true)} placeholder="Search Product..."
              />
            </div>
            {showProductResults && filteredProducts.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-secondary-light rounded-xl shadow-2xl max-h-48 overflow-auto">
                {filteredProducts.map(p => (
                  <div key={p.idProduit} onClick={() => {
                    setSelectedProduct(p);
                    setProductSearch(p.nomProduit || "");
                    setShowProductResults(false);
                  }} className="px-4 py-3 hover:bg-secondary-super-light cursor-pointer border-b last:border-none flex justify-between items-center">
                    <span className="text-sm font-bold text-primary">{p.nomProduit}</span>
                    <span className="text-[10px] font-mono text-secondary-gray">{p.idProduit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-4 md:col-span-2">
            <label className={labelStyles}>Qty Returned</label>
            <input type="number" className={`${inputStyles} border-secondary-light`} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" />
          </div>

          <div className="col-span-8 md:col-span-4">
            <label className={labelStyles}>Refund Unit Price (CFA)</label>
            <input 
              readOnly
              type="number" 
              className={`${inputStyles} bg-secondary-background font-bold text-primary border-secondary-light cursor-not-allowed`} 
              value={unitPrice} 
            />
          </div>

          <div className="col-span-12 md:col-span-2 pt-[21px]">
            <button
              type="button" onClick={addLine} disabled={!selectedProduct || !selectedSize}
              className="w-full bg-secondary-mid hover:bg-primary text-white rounded-xl h-[38px] shadow-lg shadow-secondary/20 transition-all flex items-center justify-center disabled:opacity-30"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="col-span-12 mt-2">
            <label className={labelStyles}>Pricing Tier</label>
            <div className="flex flex-wrap gap-2 p-3 bg-secondary-background/50 rounded-xl border border-dashed border-secondary-light min-h-[58px]">
              {selectedProduct ? (
                selectedProduct.allowedSaleSizes?.filter(s => (client?.allowedSaleSizes?.includes(s.size as any) && seller?.permittedSaleSizes.includes(s.size as any))).map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelectedSize(s.size)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedSize === s.size
                        ? "bg-secondary-mid text-white shadow-md transform scale-105"
                        : "bg-white text-secondary-gray border border-secondary-light hover:border-secondary-mid/30 shadow-sm"
                    }`}
                  >
                    {s.size.replace('_', ' ')}
                  </button>
                ))
              ) : (
                <div className="flex items-center gap-2 h-full ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-light animate-pulse" />
                  <span className="text-[10px] text-secondary-gray italic font-medium">Select a product...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-light overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-secondary-background border-b border-secondary-light">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray">Returned Product</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray text-center">Qty</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray text-right">Credit Amount</th>
              <th className="px-6 py-4 text-right w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-super-light">
            {creditNote?.lignesCreditNote?.map((line, idx) => (
              <tr key={idx} className="group hover:bg-secondary-background/50">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-primary">{line.nomProduit}</p>
                  <p className="text-[10px] text-secondary-mid font-medium italic">{line.description}</p>
                </td>
                <td className="px-6 py-4 text-center font-bold text-primary">{line.quantite}</td>
                <td className="px-6 py-4 text-right font-black text-secondary">
                  {line.montantTotal?.toLocaleString()} CFA
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(line, idx)} className="p-2 text-secondary-mid hover:bg-secondary-super-light rounded-lg"><Pencil size={15} /></button>
                    <button onClick={() => removeLine(idx)} className="p-2 text-red-400 hover:text-primary hover:bg-secondary-super-light rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {/* Assumes SummaryCard variants use these colors internally */}
        <SummaryCard title="Credit HT" value={creditNote?.montantHT} icon={<Calculator />} variant="default" />
        <SummaryCard title="VAT Refund" value={creditNote?.montantTVA} icon={<Tag />} variant="emerald" />
        <SummaryCard title="Total Credit" value={creditNote?.montantTTC} icon={<Receipt />} variant="dark" />
        
      </div>
    </div>
  );
}

export default CreditNoteDetails;