'use client';

import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from "@mui/icons-material/Search";
import { Trash2, Pencil, Plus, Package, ShoppingBag } from "lucide-react";
import { UpdatedBackOrderResponse, BackOrderLine } from '@/src/api/models/UpdatedBackOrderResponse';
import { ProductsService } from '@/src/src2/api';
import { UpdatedProductResponse } from '@/src/api/models/UpdatedProductResponse';
import { toast } from 'sonner';

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

interface Props {
  backOrder: UpdatedBackOrderResponse | undefined;
  setBackOrder: (data: UpdatedBackOrderResponse) => void;
}

const BackOrderDetails = ({ backOrder, setBackOrder }: Props) => {
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<UpdatedProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<UpdatedProductResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<UpdatedProductResponse | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);

  const [quantiteCommandee, setQuantiteCommandee] = useState<number>(1);
  const [quantiteRecue, setQuantiteRecue] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load products once
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductsService.getAllProducts() as unknown as UpdatedProductResponse[];
        setProducts(data);
      } catch {
        // fall back to empty — non-blocking
      }
    };
    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    const term = productSearch.toLowerCase().trim();
    if (!term || (selectedProduct && term === selectedProduct.nomProduit?.toLowerCase())) {
      setFilteredProducts([]);
      return;
    }
    setFilteredProducts(products.filter(p =>
      p.idProduit?.toLowerCase().includes(term) ||
      p.nomProduit?.toLowerCase().includes(term)
    ));
  }, [productSearch, products, selectedProduct]);

  const handleSelectProduct = (p: UpdatedProductResponse) => {
    setSelectedProduct(p);
    setProductSearch(p.nomProduit || "");
    setUnitPrice(p.prixVente || 0);
    setShowProductResults(false);
  };

  const addLine = () => {
    if (!selectedProduct || !backOrder) return;
    const missing = Math.max(0, quantiteCommandee - quantiteRecue);
    const newLine: BackOrderLine = {
      id: `BOL-${Date.now()}`,
      productId: selectedProduct.idProduit,
      productName: selectedProduct.nomProduit,
      quantiteCommandee,
      quantiteRecue,
      quantiteManquante: missing,
      unitPrice,
    };
    setBackOrder({ ...backOrder, lignes: [...(backOrder.lignes || []), newLine] });
    setSelectedProduct(null);
    setProductSearch("");
    setQuantiteCommandee(1);
    setQuantiteRecue(0);
    setUnitPrice(0);
  };

  const removeLine = (index: number) => {
    if (!backOrder) return;
    const newLines = [...(backOrder.lignes || [])];
    newLines.splice(index, 1);
    setBackOrder({ ...backOrder, lignes: newLines });
  };

  const handleEdit = (line: BackOrderLine, index: number) => {
    const prod = products.find(p => p.idProduit === line.productId);
    if (prod) { setSelectedProduct(prod); setProductSearch(prod.nomProduit || ""); }
    setQuantiteCommandee(line.quantiteCommandee || 1);
    setQuantiteRecue(line.quantiteRecue || 0);
    setUnitPrice(line.unitPrice || 0);
    removeLine(index);
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalMissing = (backOrder?.lignes || []).reduce((acc, l) => acc + (l.quantiteManquante || 0), 0);
  const totalValue = (backOrder?.lignes || []).reduce((acc, l) => acc + ((l.quantiteManquante || 0) * (l.unitPrice || 0)), 0);

  return (
    <div className="space-y-6 font-sans pb-10" ref={containerRef}>
      {/* ENTRY FORM */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-light">
        <div className="flex items-center justify-between mb-6 border-b border-secondary-super-light pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-secondary-mid" size={18} />
            <h3 className="text-sm font-black text-primary uppercase tracking-tight">Back Order Line Entry</h3>
          </div>
          <div className="flex items-center gap-2 text-secondary-mid bg-secondary-super-light px-3 py-1 rounded-full border border-secondary-light">
            <Package size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Missing Items</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-start">
          {/* Product Search */}
          <div className="col-span-12 md:col-span-4 relative">
            <label className={labelStyles}>Product</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input
                type="text"
                className={`${inputStyles} pl-10`}
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                onFocus={() => setShowProductResults(true)}
                placeholder="Search product..."
              />
              {showProductResults && filteredProducts.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border rounded-xl shadow-xl max-h-48 overflow-auto">
                  {filteredProducts.map(p => (
                    <div key={p.idProduit} onClick={() => handleSelectProduct(p)} className="px-4 py-3 hover:bg-secondary-super-light cursor-pointer border-b last:border-0">
                      <p className="text-sm font-bold text-primary">{p.nomProduit}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{p.idProduit}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Qty Ordered */}
          <div className="col-span-4 md:col-span-2">
            <label className={labelStyles}>Qty Ordered</label>
            <input type="number" className={inputStyles} value={quantiteCommandee} onChange={(e) => setQuantiteCommandee(Number(e.target.value))} min="1" />
          </div>

          {/* Qty Received */}
          <div className="col-span-4 md:col-span-2">
            <label className={labelStyles}>Qty Received</label>
            <input type="number" className={inputStyles} value={quantiteRecue} onChange={(e) => setQuantiteRecue(Number(e.target.value))} min="0" max={quantiteCommandee} />
          </div>

          {/* Missing (computed) */}
          <div className="col-span-4 md:col-span-2">
            <label className={labelStyles}>Missing</label>
            <input
              readOnly
              type="number"
              className={`${inputStyles} bg-secondary-super-light font-bold text-secondary-mid border-secondary-light cursor-not-allowed`}
              value={Math.max(0, quantiteCommandee - quantiteRecue)}
            />
          </div>

          {/* Unit Price */}
          <div className="col-span-8 md:col-span-1">
            <label className={labelStyles}>Unit Price</label>
            <input type="number" className={inputStyles} value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} min="0" />
          </div>

          {/* Add Button */}
          <div className="col-span-4 md:col-span-1 pt-[21px]">
            <button
              type="button"
              onClick={addLine}
              disabled={!selectedProduct}
              className="w-full bg-secondary-mid hover:bg-primary text-white rounded-xl h-[38px] shadow-lg shadow-secondary-light transition-all flex items-center justify-center disabled:opacity-40"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* LINES TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Product</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Ordered</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Received</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Missing</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Unit Price</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Value Missing</th>
              <th className="px-6 py-4 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(backOrder?.lignes || []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-300 text-sm font-medium">No lines added yet</td>
              </tr>
            ) : (backOrder?.lignes || []).map((line, idx) => (
              <tr key={idx} className="group hover:bg-secondary-super-light/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-primary">{line.productName}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{line.productId}</p>
                </td>
                <td className="px-6 py-4 text-center font-bold text-gray-600">{line.quantiteCommandee}</td>
                <td className="px-6 py-4 text-center font-bold text-emerald-600">{line.quantiteRecue}</td>
                <td className="px-6 py-4 text-center">
                  <span className="font-black text-secondary-mid bg-secondary-super-light px-2 py-0.5 rounded-md text-sm">{line.quantiteManquante}</span>
                </td>
                <td className="px-6 py-4 text-right text-gray-600 font-medium">{line.unitPrice?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-black text-primary">
                  {((line.quantiteManquante || 0) * (line.unitPrice || 0)).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(line, idx)} className="p-2 text-secondary-mid hover:bg-secondary-super-light rounded-lg"><Pencil size={15} /></button>
                    <button onClick={() => removeLine(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      {(backOrder?.lignes || []).length > 0 && (
        <div className="flex justify-end">
          <div className="bg-primary p-6 rounded-2xl text-white shadow-xl w-72 space-y-3">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold opacity-60 uppercase tracking-widest">Total Missing Items</span>
              <span className="font-black text-secondary-light">{totalMissing}</span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Value of Missing</span>
              <span className="text-xl font-black">{totalValue.toLocaleString()} XAF</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackOrderDetails;
