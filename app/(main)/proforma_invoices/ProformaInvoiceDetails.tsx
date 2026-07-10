'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedProductResponse, ClientSaleSize } from '@/src/api/models/UpdatedProductResponse';
import SearchIcon from "@mui/icons-material/Search";
import { Trash2, Pencil, Plus, ShoppingCart, Tag, Calculator, Receipt } from "lucide-react";
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import SummaryCard from '../../../components/SummaryCard';
import { Permission, UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { UpdatedProformaInvoiceResponse } from '@/src/api/models/UpdatedProformaInvoiceResponse';
import { ProductsService } from '@/src/src2/api';
import { getProductsOfflineFirst } from '@/src/offline/services/referenceService';

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

interface Props {
  client: UpdatedClientResponse | undefined;
  ProformaInvoice: UpdatedProformaInvoiceResponse | undefined;
  setProformaInvoice: (data: UpdatedProformaInvoiceResponse) => void;
}

const ProformaInvoiceDetails = ({ client, ProformaInvoice, setProformaInvoice }: Props) => {
  const [productSearch, setProductSearch] = useState("");
  const [produits, setProduits] = useState<UpdatedProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<UpdatedProductResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<UpdatedProductResponse | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ClientSaleSize.size | "">("");
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [currentRemiseLine, setCurrentRemiseLine] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [filterAvailable, setfilterAvailable] = useState<boolean>(false);
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load Seller from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) setSeller(JSON.parse(stored));
  }, []);

  // Load Products for the seller's organization
  useEffect(() => {
    if (!seller?.organizationId) return;
    getProductsOfflineFirst(() => ProductsService.getProductsByOrganization(seller.organizationId))
      .then(data => setProduits(data as unknown as UpdatedProductResponse[]))
      .catch(() => {
        // fall back to empty — non-blocking
      });
  }, [seller?.organizationId]);

  // 1. Filter Products Logic
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
    if (filterAvailable) {
      filtered = filtered.filter(p => (p.stockQuantity ?? 0) > 0);
    }
    setFilteredProducts(filtered);
  }, [productSearch, selectedProduct, filterAvailable]);

  // 2. Handle Price and Discount Logic for the Entry Form
  useEffect(() => {
    if (!selectedProduct || !selectedSize) {
      setSelectedPrice(0);
      setCurrentRemiseLine(0);
      return;
    }

    const sizeConfig = selectedProduct.allowedSaleSizes?.find(s => s.size === selectedSize);
    const useTaxedTier = (client?.ntva && ProformaInvoice?.applyVat);
    
    const basePrice = useTaxedTier ? (sizeConfig?.unitPriceWithTax || 0) : (sizeConfig?.unitPrice || 0);
    let finalPrice = basePrice;
    let discountAmount = 0;

    const now = new Date();
    const activePromo = selectedProduct.activePromotions?.find(promo => {
      const start = new Date(promo.startDate);
      const end = new Date(promo.endDate);
      return promo.saleSize.toString() === selectedSize.toString() && promo.active && now >= start && now <= end;
    });

    if (activePromo) {
      if (activePromo.promotionalPrice) {
        finalPrice = activePromo.promotionalPrice;
        discountAmount = (basePrice - finalPrice) * quantity;
      } else if (activePromo.discountPercentage) {
        discountAmount = (basePrice * (activePromo.discountPercentage / 100)) * quantity;
        finalPrice = basePrice * (1 - activePromo.discountPercentage / 100);
      }
    }

    setSelectedPrice(finalPrice);
    setCurrentRemiseLine(discountAmount);
  }, [selectedSize, selectedProduct, client?.ntva, ProformaInvoice?.applyVat, quantity]);

  // 3. Update existing lines when VAT/Client toggle changes
  useEffect(() => {
    if (!ProformaInvoice?.lignesDevis?.length || produits.length === 0) return;

    const useTaxedTier = (ProformaInvoice.applyVat && client?.ntva);
    const now = new Date();

    const updatedLines = ProformaInvoice.lignesDevis.map(line => {
      const product = produits.find(p => p.idProduit === line.idProduit);
      if (!product) return line;

      const sizeStr = line.description?.split(' - ')[1];
      const sizeConfig = product.allowedSaleSizes?.find(s => s.size === sizeStr);

      const basePrice = useTaxedTier ? (sizeConfig?.unitPriceWithTax || 0) : (sizeConfig?.unitPrice || 0);
      let newPrice = basePrice;
      let remise = 0;

      const activePromo = product.activePromotions?.find(promo => {
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);
        return promo.saleSize.toString() === sizeStr && promo.active && now >= start && now <= end;
      });

      if (activePromo) {
        if (activePromo.promotionalPrice) {
          newPrice = activePromo.promotionalPrice;
          remise = (basePrice - newPrice) * (line.quantite ?? 0);
        } else if (activePromo.discountPercentage) {
          remise = (basePrice * (activePromo.discountPercentage / 100)) * (line.quantite ?? 0);
          newPrice = basePrice * (1 - activePromo.discountPercentage / 100);
        }
      }

      return {
        ...line,
        prixUnitaire: newPrice,
        montantTotal: Math.round((line.quantite ?? 0) * newPrice),
        remiseMontant: remise
      };
    });

    if (JSON.stringify(updatedLines) !== JSON.stringify(ProformaInvoice.lignesDevis)) {
      setProformaInvoice({ ...ProformaInvoice, lignesDevis: updatedLines });
    }
  }, [ProformaInvoice?.applyVat, client?.ntva, produits]);

  // 4. Financial Totals Calculation
  useEffect(() => {
    if (!ProformaInvoice?.lignesDevis) return;

    const rawSum = ProformaInvoice.lignesDevis.reduce((acc, curr) => acc + (curr.montantTotal || 0), 0);
    if (rawSum === 0 && ProformaInvoice.lignesDevis.length === 0 && (ProformaInvoice.montantTTC || 0) === 0) return;

    let ht: number, tva: number, ttc: number;

    if (ProformaInvoice.applyVat && client?.ntva) {
      ttc = rawSum;
      ht = ttc / 1.1925;
      tva = ttc - ht;
    } else {
      ht = rawSum;
      tva = ht * 0.1925;
      ttc = ht + tva;
    }

    const percentage = ProformaInvoice?.remiseGlobalePourcentage || 0;
    const globalDiscountFromPercent = ttc * (percentage / 100);
    const finalAmount = Math.round(ttc - globalDiscountFromPercent);

    const hasChanged = 
      Math.round(ht) !== Math.round(ProformaInvoice.montantHT || 0) ||
      Math.round(tva) !== Math.round(ProformaInvoice.montantTVA || 0) ||
      Math.round(ttc) !== Math.round(ProformaInvoice.montantTTC || 0) ||
      Math.round(finalAmount) !== Math.round(ProformaInvoice.finalAmount || 0);

    if (hasChanged) {
      setProformaInvoice({ 
        ...ProformaInvoice, 
        montantHT: ht, 
        montantTVA: tva, 
        montantTTC: ttc,
        finalAmount: finalAmount,
        remiseGlobaleMontant: Math.round(globalDiscountFromPercent)
      });
    }
  }, [ProformaInvoice?.lignesDevis, ProformaInvoice?.applyVat, client?.ntva, ProformaInvoice?.remiseGlobalePourcentage]);

  const addLine = () => {
    if (!selectedProduct || !selectedSize || !ProformaInvoice) return;

    const newLine = {
      idProduit: selectedProduct.idProduit,
      nomProduit: selectedProduct.nomProduit,
      quantite: quantity,
      prixUnitaire: selectedPrice,
      montantTotal: Math.round(quantity * selectedPrice),
      remiseMontant: currentRemiseLine,
      description: `${selectedProduct.nomProduit} - ${selectedSize}`,
      isTaxLine: false
    };

    setProformaInvoice({
      ...ProformaInvoice,
      lignesDevis: [...(ProformaInvoice.lignesDevis || []), newLine]
    });

    setSelectedProduct(null);
    setProductSearch("");
    setQuantity(1);
    setSelectedSize("");
  };

  const removeLine = (index: number) => {
    if (!ProformaInvoice) return;
    const newLines = [...(ProformaInvoice.lignesDevis || [])];
    newLines.splice(index, 1);
    setProformaInvoice({ ...ProformaInvoice, lignesDevis: newLines });
  };

  const handleEdit = (line: any, index: number) => {
    const productToEdit = produits.find(p => p.idProduit === line.idProduit);
    if (!productToEdit) return;
    setSelectedProduct(productToEdit);
    setProductSearch(productToEdit.nomProduit || "");
    const size = line.description?.split(' - ')[1] || "";
    setSelectedSize(size as ClientSaleSize.size);
    setQuantity(line.quantite);
    removeLine(index);
  };

  return (
    <div className="space-y-6 font-sans pb-10" ref={containerRef}>
      {/* LINE ITEM ENTRY FORM */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-secondary-mid" size={18} />
            <h3 className="text-sm font-black text-secondary uppercase tracking-tight">Line Item Entry</h3>
          </div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-[10px] font-bold text-gray-400 uppercase group-hover:text-secondary-mid transition-colors">In Stock Only</span>
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-200 text-secondary-mid focus:ring-secondary-mid"
              checked={filterAvailable} 
              onChange={() => setfilterAvailable(!filterAvailable)} 
            />
          </label>
        </div>

        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-12 md:col-span-4 relative">
            <label className={labelStyles}>Product Name</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input
                type="text" className={`${inputStyles} pl-10`}
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                onFocus={() => setShowProductResults(true)} placeholder="Search Product..."
              />
            </div>
            {showProductResults && filteredProducts.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-48 overflow-auto">
                {filteredProducts.map(p => (
                  <div key={p.idProduit} onClick={() => {
                    setSelectedProduct(p);
                    setProductSearch(p.nomProduit || "");
                    setShowProductResults(false);
                  }} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-none flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">{p.nomProduit}</span>
                    <span className="text-[10px] font-mono text-gray-400">{p.idProduit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-4 md:col-span-1">
            <label className={labelStyles}>Qty</label>
            <input type="number" className={inputStyles} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" />
          </div>

          <div className="col-span-8 md:col-span-3">
            <label className={labelStyles}>Unit Price (CFA)</label>
            <input 
              type="number" 
              className={`${inputStyles} font-black ${
                !(selectedProduct?.allowedSaleSizes?.find(s => s.size === selectedSize)?.isNegotiable && seller?.Permissions.includes(Permission.NEGOTIATE_PRICE)) ? "bg-gray-50 text-gray-400" : "bg-white border-blue-200"
              }`}
              value={selectedPrice} 
              onChange={(e) => setSelectedPrice(Number(e.target.value))}
              readOnly={!(selectedProduct?.allowedSaleSizes?.find(s => s.size === selectedSize)?.isNegotiable && seller?.Permissions.includes(Permission.NEGOTIATE_PRICE))}
            />
          </div>

          <div className="col-span-8 md:col-span-3">
            <label className={labelStyles}>Stock Available</label>
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 text-sm font-black text-gray-400 h-[38px] flex items-center">
              {selectedProduct?.stockQuantity ?? '--'}
            </div>
          </div>

          <div className="col-span-4 md:col-span-1 pt-[21px]">
            <button
              type="button" onClick={addLine} disabled={!selectedProduct || !selectedSize}
              className="w-full bg-secondary-mid hover:bg-secondary text-white rounded-xl h-[38px] shadow-lg disabled:opacity-30 flex items-center justify-center transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* PRICING TIERS */}
        <div className="grid grid-cols-12 gap-6 mt-6 pt-6 border-t border-gray-50">
          <div className="col-span-12 md:col-span-7">
            <label className={labelStyles}>Pricing Tier</label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              {selectedProduct ? (
                selectedProduct.allowedSaleSizes?.filter(s => client?.allowedSaleSizes?.includes(s.size as any) && seller?.permittedSaleSizes.includes(s.size as any)).map((s) => (
                  <button
                    key={s.size} type="button" onClick={() => setSelectedSize(s.size)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedSize === s.size ? "bg-secondary-mid text-white shadow-md transform scale-105" : "bg-white text-gray-400 border border-gray-100 shadow-sm"}`}
                  >
                    {s.size.replace('_', ' ')}
                  </button>
                ))
              ) : <span className="text-[10px] text-gray-400 italic">Select a product to view tiers...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Product</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Tier</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Qty</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Subtotal</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ProformaInvoice?.lignesDevis?.map((line, idx) => (
              <tr key={`${line.idProduit}-${idx}`} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-700">{line.nomProduit}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{line.idProduit}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase">
                    {line.description?.split(' - ')[1]}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-bold text-gray-600">{line.quantite}</td>
                <td className="px-6 py-4 text-right font-black text-secondary">{line.montantTotal?.toLocaleString()} CFA</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(line, idx)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button>
                    <button onClick={() => removeLine(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FINANCIAL SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        <SummaryCard title="Total HT" value={ProformaInvoice?.montantHT} icon={<Calculator size={16}/>} variant="default" />
        <SummaryCard title="TVA (19.25%)" value={ProformaInvoice?.montantTVA} icon={<Tag size={16}/>} variant="emerald" />
        <SummaryCard title="Total TTC" value={ProformaInvoice?.montantTTC} icon={<Receipt size={16}/>} variant="default" />
        <SummaryCard title="Total Discount" value={ProformaInvoice?.remiseGlobaleMontant} icon={<Tag size={16}/>} variant="accent" />
        <SummaryCard title="Final Total" value={ProformaInvoice?.finalAmount} icon={<Receipt size={16}/>} variant="dark" />
      </div>
    </div>
  );
}

export default ProformaInvoiceDetails;