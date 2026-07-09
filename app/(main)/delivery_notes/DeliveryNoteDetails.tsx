'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedProductResponse } from '@/src/api/models/UpdatedProductResponse';
import SearchIcon from "@mui/icons-material/Search";
import { Trash2, Plus, Box, Package, ClipboardCheck, AlertCircle, Pencil, Split } from "lucide-react";
import { DeliveryNoteResponse, DeliveryNoteLineResponse } from '@/src/api/models/DeliveryNoteResponse';
import SummaryCard from '@/components/SummaryCard';
import { ProductsService } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";
const readOnlyStyles = "w-full border border-gray-100 bg-gray-50 rounded-lg py-2 px-3 text-sm cursor-not-allowed font-bold";

interface Props {
  deliveryNote: DeliveryNoteResponse | undefined;
  setDeliveryNote: (data: DeliveryNoteResponse) => void;
  isPartial: boolean;
}

const DeliveryNoteDetails = ({ deliveryNote, setDeliveryNote, isPartial }: Props) => {
  const [productSearch, setProductSearch] = useState("");
  const [produits, setProduits] = useState<UpdatedProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<UpdatedProductResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<UpdatedProductResponse | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);

  // Standard mode
  const [quantity, setQuantity] = useState<number>(1);

  // Partial mode
  const [quantiteTotal, setQuantiteTotal] = useState<number>(1);
  const [quantiteLivree, setQuantiteLivree] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orgId = getStoredSeller()?.organizationId;
    if (!orgId) return;
    ProductsService.getProductsByOrganization(orgId)
      .then(data => setProduits(data as unknown as UpdatedProductResponse[]))
      .catch(() => {
        // fall back to empty — non-blocking
      });
  }, []);

  useEffect(() => {
    const term = productSearch.toLowerCase().trim();
    if (!term || (selectedProduct && term === selectedProduct.nomProduit?.toLowerCase())) {
      setFilteredProducts([]);
      return;
    }
    setFilteredProducts(produits.filter(p =>
      p.idProduit?.toLowerCase().includes(term) ||
      p.nomProduit?.toLowerCase().includes(term)
    ));
  }, [productSearch, selectedProduct, produits]);

  const addLine = () => {
    if (!selectedProduct || !deliveryNote) return;

    const newLine: DeliveryNoteLineResponse = isPartial
      ? {
          productId: selectedProduct.idProduit,
          idProduit: selectedProduct.idProduit,
          description: selectedProduct.nomProduit,
          quantiteTotal,
          quantiteLivree,
          quantiteRestante: Math.max(0, quantiteTotal - quantiteLivree),
          quantity: quantiteLivree,
          unitPrice: 0,
          amount: 0,
        }
      : {
          productId: selectedProduct.idProduit,
          idProduit: selectedProduct.idProduit,
          description: selectedProduct.nomProduit,
          quantity,
          unitPrice: 0,
          amount: 0,
        };

    setDeliveryNote({ ...deliveryNote, lines: [...(deliveryNote.lines || []), newLine] });
    setSelectedProduct(null);
    setProductSearch("");
    setQuantity(1);
    setQuantiteTotal(1);
    setQuantiteLivree(1);
  };

  const removeLine = (index: number) => {
    if (!deliveryNote) return;
    const newLines = [...(deliveryNote.lines || [])];
    newLines.splice(index, 1);
    setDeliveryNote({ ...deliveryNote, lines: newLines });
  };

  const handleEdit = (line: DeliveryNoteLineResponse, index: number) => {
    const prod = produits.find(p => p.idProduit === line.productId || p.idProduit === line.idProduit);
    if (prod) { setSelectedProduct(prod); setProductSearch(prod.nomProduit || ""); }
    else setProductSearch(line.description || "");

    if (isPartial) {
      setQuantiteTotal(line.quantiteTotal || 1);
      setQuantiteLivree(line.quantiteLivree || 1);
    } else {
      setQuantity(line.quantity || 1);
    }
    removeLine(index);
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalQtyDelivered = (deliveryNote?.lines || []).reduce((a, l) => a + (isPartial ? (l.quantiteLivree || 0) : (l.quantity || 0)), 0);
  const totalQtyMissing = (deliveryNote?.lines || []).reduce((a, l) => a + (l.quantiteRestante || 0), 0);
  const totalItems = deliveryNote?.lines?.length || 0;

  return (
    <div className="space-y-6 font-sans pb-10" ref={containerRef}>

      {/* ENTRY FORM */}
      <div className={`bg-white p-6 rounded-2xl shadow-sm border ${isPartial ? 'border-blue-100' : 'border-blue-100'}`}>
        <div className={`flex items-center justify-between mb-6 border-b pb-4 ${isPartial ? 'border-blue-50' : 'border-blue-50'}`}>
          <div className="flex items-center gap-2">
            <Package className={isPartial ? 'text-blue-600' : 'text-blue-600'} size={18} />
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">
              {isPartial ? 'Partial Shipment Entry' : 'Shipment Item Entry'}
            </h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
            isPartial
              ? 'text-blue-600 bg-blue-50 border-blue-100'
              : 'text-blue-600 bg-blue-50 border-blue-100'
          }`}>
            {isPartial ? <Split size={14} /> : <AlertCircle size={14} />}
            {isPartial ? 'Partial Delivery Mode' : 'Logistics Mode'}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-start">
          {/* Product */}
          <div className={`relative ${isPartial ? 'col-span-12 md:col-span-4' : 'col-span-12 md:col-span-6'}`}>
            <label className={labelStyles}>Product to Ship</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input
                type="text"
                className={`${inputStyles} pl-10`}
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                onFocus={() => setShowProductResults(true)}
                placeholder="Search Inventory..."
              />
            </div>
            {showProductResults && filteredProducts.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-48 overflow-auto">
                {filteredProducts.map(p => (
                  <div key={p.idProduit} onClick={() => { setSelectedProduct(p); setProductSearch(p.nomProduit || ""); setShowProductResults(false); }}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-none flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">{p.nomProduit}</span>
                    <span className="text-[10px] font-mono text-gray-400">Stock: {p.stockQuantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isPartial ? (
            <>
              {/* Total Qty */}
              <div className="col-span-4 md:col-span-2">
                <label className={labelStyles}>Total Qty</label>
                <input
                  type="number"
                  className={inputStyles}
                  value={quantiteTotal}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setQuantiteTotal(v);
                    setQuantiteLivree(v);
                  }}
                  min="1"
                />
              </div>

              {/* To Be Delivered */}
              <div className="col-span-4 md:col-span-2">
                <label className={labelStyles}>To Be Delivered</label>
                <input
                  type="number"
                  className={`${inputStyles} border-blue-100 focus:border-blue-500`}
                  value={quantiteLivree}
                  onChange={(e) => { const v = Math.min(Number(e.target.value), quantiteTotal); setQuantiteLivree(v); }}
                  min="0"
                  max={quantiteTotal}
                />
              </div>

              {/* Remaining — computed */}
              <div className="col-span-4 md:col-span-2">
                <label className={labelStyles}>Remaining</label>
                <input
                  readOnly
                  type="number"
                  className={`${readOnlyStyles} text-blue-600 border-blue-100 bg-blue-50`}
                  value={Math.max(0, quantiteTotal - quantiteLivree)}
                />
              </div>
            </>
          ) : (
            <div className="col-span-12 md:col-span-4">
              <label className={labelStyles}>Quantity to Deliver</label>
              <input
                type="number"
                className={`${inputStyles} border-blue-50`}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
              />
            </div>
          )}

          {/* Add button */}
          <div className="col-span-12 md:col-span-2 pt-[21px]">
            <button
              type="button"
              onClick={addLine}
              disabled={!selectedProduct || (isPartial && quantiteLivree === 0)}
              className={`w-full text-white rounded-xl h-[38px] shadow-lg transition-all flex items-center justify-center disabled:opacity-40 ${
                isPartial
                  ? 'bg-blue-500 hover:bg-blue-700 shadow-blue-200'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* LINES TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-light overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-secondary-background border-b border-secondary-light">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray">Product</th>
              {isPartial ? (
                <>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray text-center">Total Qty</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray text-center">To Be Delivered</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray text-center">Remaining</th>
                </>
              ) : (
                <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray text-center">Qty</th>
              )}
              <th className="px-6 py-4 text-right w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-super-light">
            {(deliveryNote?.lines || []).length === 0 ? (
              <tr>
                <td colSpan={isPartial ? 5 : 3} className="px-6 py-10 text-center text-gray-300 text-sm">No lines added yet</td>
              </tr>
            ) : deliveryNote?.lines?.map((line, idx) => (
              <tr key={idx} className="group hover:bg-secondary-background/50">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-primary">{line.description}</p>
                </td>
                {isPartial ? (
                  <>
                    <td className="px-6 py-4 text-center font-bold text-gray-600">{line.quantiteTotal ?? '—'}</td>
                    <td className="px-6 py-4 text-center font-bold text-blue-600">{line.quantiteLivree ?? '—'}</td>
                    <td className="px-6 py-4 text-center">
                      {(line.quantiteRestante ?? 0) > 0 ? (
                        <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-sm">{line.quantiteRestante}</span>
                      ) : (
                        <span className="font-bold text-gray-400 text-sm">0</span>
                      )}
                    </td>
                  </>
                ) : (
                  <td className="px-6 py-4 text-center font-bold text-primary">{line.quantity}</td>
                )}
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(line, idx)} className="p-2 text-secondary-mid hover:bg-secondary-super-light rounded-lg"><Pencil size={15} /></button>
                    <button onClick={() => removeLine(idx)} className="p-2 text-red-400 hover:text-red-500 hover:bg-secondary-super-light rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        <SummaryCard title="Total Unique Items" value={totalItems} icon={<Box />} variant="default" />
        <SummaryCard title="Total Qty Delivered" value={totalQtyDelivered} icon={<ClipboardCheck />} variant="emerald" />
        {isPartial && totalQtyMissing > 0 && (
          <SummaryCard title="Total Qty Missing" value={totalQtyMissing} icon={<Split />} variant="dark" />
        )}
      </div>
    </div>
  );
};

export default DeliveryNoteDetails;
