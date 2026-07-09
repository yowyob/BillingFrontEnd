'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedProductResponse } from '@/src/api/models/UpdatedProductResponse';
import SearchIcon from "@mui/icons-material/Search";
import { Trash2, Pencil, Plus, Package, Tag, Calculator, Receipt, Truck, Scale } from "lucide-react";
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import { PurchaseOrderResponse,PurcaseOrderResponse, PurchaseOrderLineResponse } from '@/src/api/models/PurchaseOrderLine';
import SummaryCard from '@/components/SummaryCard';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { ProductsService } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

interface Props {
  producer: UpdatedClientResponse | undefined;
  purchaseOrder: PurchaseOrderResponse | undefined;
  setPurchaseOrder: (data: PurchaseOrderResponse) => void;
}

const PurchaseOrderDetails = ({ producer, purchaseOrder, setPurchaseOrder }: Props) => {
  const [productSearch, setProductSearch] = useState("");
  const [produits, setProduits] = useState<UpdatedProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<UpdatedProductResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<UpdatedProductResponse | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);

  // Local Form State
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [taxable, setTaxable] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load Products for the seller's organization
  useEffect(() => {
    const orgId = getStoredSeller()?.organizationId;
    if (!orgId) return;
    ProductsService.getProductsByOrganization(orgId)
      .then(data => setProduits(data as unknown as UpdatedProductResponse[]))
      .catch(() => {
        // fall back to empty — non-blocking
      });
  }, []);

  // 1. Catalog Filtering
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

  // 2. Default Price on Selection
  useEffect(() => {
    if (selectedProduct) {
      setUnitPrice(selectedProduct.cout || 0);
    }
  }, [selectedProduct]);

  // 3. Totals Calculation Sync
  useEffect(() => {
    if (!purchaseOrder) return;

    const subtotal = (purchaseOrder.lines || []).reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const tax = (purchaseOrder.lines || []).reduce((acc, curr) => acc + (curr.vatAmount || 0), 0);
    const total = subtotal + tax;

    if (Math.round(total) !== Math.round(purchaseOrder.grandTotal || 0)) {
      setPurchaseOrder({ 
        ...purchaseOrder, 
        subtotalAmount: subtotal, 
        taxAmount: tax, 
        grandTotal: total
      });
    }
  }, [purchaseOrder?.lines]);

  const addLine = () => {
    if (!selectedProduct || !purchaseOrder) return;

    const lineVat = taxable ? (unitPrice * quantity * 0.1925) : 0;

    const newLine: PurchaseOrderLineResponse = {
      productId: selectedProduct.idProduit,
      productCode: selectedProduct.idProduit, // Mapping internal ID to code
      productName: selectedProduct.nomProduit,
      uom: "UNIT", // Default UOM
      orderedQuantity: quantity,
      unitPrice: unitPrice,
      taxable: taxable,
      vatAmount: lineVat,
      totalAmount: Math.round(quantity * unitPrice)
    };

    setPurchaseOrder({
      ...purchaseOrder,
      lines: [...(purchaseOrder.lines || []), newLine]
    });

    // Reset Form
    setSelectedProduct(null);
    setProductSearch("");
    setQuantity(1);
    setUnitPrice(0);
  };

  const removeLine = (index: number) => {
    if (!purchaseOrder) return;
    const newLines = [...(purchaseOrder.lines || [])];
    newLines.splice(index, 1);
    setPurchaseOrder({ ...purchaseOrder, lines: newLines });
  };

  return (
    <div className="space-y-6 font-sans pb-10" ref={containerRef}>
      
      {/* PROCUREMENT ENTRY FORM */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
          <div className="flex items-center gap-2">
            <Package className="text-secondary-mid" size={18} />
            <h3 className="text-sm font-black text-secondary uppercase tracking-tight">Purchase Item Entry</h3>
          </div>
          <div className="flex items-center gap-4">
             <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Apply VAT to Line</span>
                <input 
                    type="checkbox" checked={taxable} 
                    onChange={(e) => setTaxable(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-200 text-secondary-mid focus:ring-secondary-mid"
                />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-start">
          {/* 1. Product Search */}
          <div className="col-span-12 md:col-span-4 relative">
            <label className={labelStyles}>Product / Item Code</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input
                type="text" className={`${inputStyles} pl-10`}
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                onFocus={() => setShowProductResults(true)} placeholder="Search catalogue..."
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
                    <div>
                      <p className="text-sm font-bold text-gray-700">{p.nomProduit}</p>
                      <p className="text-[9px] text-gray-400 font-mono">CODE: {p.idProduit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Quantity */}
          <div className="col-span-4 md:col-span-2">
            <label className={labelStyles}>Ordered Qty</label>
            <div className="relative">
               <input type="number" className={inputStyles} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" />
               <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-300">UOM</span>
            </div>
          </div>

          {/* 3. Unit Price */}
          <div className="col-span-8 md:col-span-3">
            <label className={labelStyles}>Supplier Unit Price (HT)</label>
            <div className="relative group">
              <input 
                type="number" 
                className={`${inputStyles} font-black text-secondary-mid`}
                value={unitPrice} 
                onChange={(e) => setUnitPrice(Number(e.target.value))}
              />
            </div>
          </div>

          {/* 4. Line Total Preview */}
          <div className="col-span-8 md:col-span-2">
            <label className={labelStyles}>Line Total (HT)</label>
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 text-sm font-black text-gray-500 h-[38px] flex items-center">
              {(quantity * unitPrice).toLocaleString()}
            </div>
          </div>

          {/* 5. Add Button */}
          <div className="col-span-4 md:col-span-1 pt-[21px]">
            <button
              type="button" onClick={addLine} disabled={!selectedProduct}
              className="w-full bg-secondary-mid hover:bg-secondary text-white rounded-xl h-[38px] shadow-lg disabled:opacity-30 flex items-center justify-center transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* PURCHASE ORDER TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Product Code & Name</th>
               <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Apply Tax</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Qty (UOM)</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Unit Price</th>
              
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">VAT</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Total (HT)</th>
              <th className="px-6 py-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {purchaseOrder?.lines?.map((line, idx) => (
              <tr key={`${line.productId}-${idx}`} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-700">{line.productName}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{line.productCode}</p>
                </td>
                 <td className="px-6 py-4 text-center font-bold text-gray-600">
                 <input type="checkbox"
                 checked={line.taxable}
                 />
                </td>
                <td className="px-6 py-4 text-center font-bold text-gray-600">
                  {line.orderedQuantity} <span className="text-[9px] text-gray-400 ml-1">{line.uom}</span>
                </td>
                <td className="px-6 py-4 text-right text-gray-500 font-medium">
                  {line.unitPrice?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-emerald-600 font-bold">
                  {line.vatAmount?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-black text-secondary">
                  {line.totalAmount?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => removeLine(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FINANCIAL SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <SummaryCard title="Subtotal (HT)" value={purchaseOrder?.subtotalAmount} icon={<Calculator />} variant="default" />
        <SummaryCard title="Total VAT Amount" value={purchaseOrder?.taxAmount} icon={<Tag />} variant="emerald" />
        <SummaryCard title="Grand Total (TTC)" value={purchaseOrder?.grandTotal} icon={<Receipt />} variant="dark" />
      </div>
    </div>
  );
}

export default PurchaseOrderDetails;