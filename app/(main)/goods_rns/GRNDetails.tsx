'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedProductResponse } from '@/src/api/models/UpdatedProductResponse';
import SearchIcon from "@mui/icons-material/Search";
import { Trash2, Plus, Package, ClipboardCheck, AlertCircle, Pencil, ShieldCheck, XCircle } from "lucide-react";
import { GoodsReceiptNoteResponse,GoodReceiptResponse, GoodsReceiptLineResponse } from '@/src/api/models/GoodsReceiptNote';
import SummaryCard from '@/components/SummaryCard';
import { ProductsService } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

interface Props {
  grn: GoodsReceiptNoteResponse | undefined;
  setGrn: (data: GoodsReceiptNoteResponse) => void;
}

const GRNDetails = ({ grn, setGrn }: Props) => {
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<UpdatedProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<UpdatedProductResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<UpdatedProductResponse | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);

  useEffect(() => {
    const orgId = getStoredSeller()?.organizationId;
    if (!orgId) return;
    ProductsService.getProductsByOrganization(orgId)
      .then(data => setProducts(data as unknown as UpdatedProductResponse[]))
      .catch(() => {
        // fall back to empty — non-blocking
      });
  }, []);

  const [lineData, setLineData] = useState({
    orderedQuantity: 0,
    receivedQuantity: 0,
    acceptedQuantity: 0,
    rejectedQuantity: 0,
    uom: "Unit",
    rate: 0
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // --- Logic for Automatic Calculation ---
  const handleQtyChange = (field: string, value: number) => {
    setLineData((prev) => {
      const updated = { ...prev, [field]: value };

      // 1. If Ordered is set -> default everything else to match (Perfect Shipment)
      if (field === "orderedQuantity") {
        updated.receivedQuantity = value;
        updated.acceptedQuantity = value;
        updated.rejectedQuantity = 0;
      }

      // 2. If Received is set -> default Accepted to match Received
      if (field === "receivedQuantity") {
        updated.acceptedQuantity = value;
        updated.rejectedQuantity = 0;
      }

      // 3. If Accepted is changed -> calculate Rejected (Received - Accepted)
      if (field === "acceptedQuantity") {
        updated.rejectedQuantity = Math.max(0, updated.receivedQuantity - value);
      }

      // 4. If Rejected is changed -> calculate Accepted (Received - Rejected)
      if (field === "rejectedQuantity") {
        updated.acceptedQuantity = Math.max(0, updated.receivedQuantity - value);
      }

      return updated;
    });
  };

  useEffect(() => {
    const term = productSearch.toLowerCase().trim();
    if (!term || (selectedProduct && term === selectedProduct.nomProduit?.toLowerCase())) {
      setFilteredProducts([]);
      return;
    }
    const filtered = products.filter(p =>
      p.idProduit?.toLowerCase().includes(term) ||
      p.nomProduit?.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  }, [productSearch, selectedProduct]);

  const addLine = () => {
    if (!selectedProduct || !grn) return;

    const newLine: GoodsReceiptLineResponse = {
      productId: selectedProduct.idProduit,
      description: selectedProduct.nomProduit,
      uom: lineData.uom || selectedProduct.uom || "Unit",
      orderedQuantity: lineData.orderedQuantity,
      receivedQuantity: lineData.receivedQuantity,
      acceptedQuantity: lineData.acceptedQuantity,
      rejectedQuantity: lineData.rejectedQuantity,
      rate: lineData.rate,
      lineAmount: lineData.acceptedQuantity * lineData.rate,
      shortQuantity: Math.max(0, lineData.orderedQuantity - lineData.receivedQuantity),
      excessQuantity: Math.max(0, lineData.receivedQuantity - lineData.orderedQuantity),
      damagedQuantity: lineData.rejectedQuantity 
    };

    setGrn({ ...grn, lines: [...(grn.lines || []), newLine] });
    setSelectedProduct(null);
    setProductSearch("");
    setLineData({ orderedQuantity: 0, receivedQuantity: 0, acceptedQuantity: 0, rejectedQuantity: 0, uom: "Unit", rate: 0 });
  };

  const removeLine = (index: number) => {
    if (!grn) return;
    const newLines = [...(grn.lines || [])];
    newLines.splice(index, 1);
    setGrn({ ...grn, lines: newLines });
  };

  const handleEdit = (line: GoodsReceiptLineResponse, index: number) => {
    const productToEdit = products.find(p => p.idProduit === line.productId);
    if (productToEdit) {
      setSelectedProduct(productToEdit);
      setProductSearch(productToEdit.nomProduit || "");
    }
    setLineData({
      orderedQuantity: line.orderedQuantity || 0,
      receivedQuantity: line.receivedQuantity || 0,
      acceptedQuantity: line.acceptedQuantity || 0,
      rejectedQuantity: line.rejectedQuantity || 0,
      uom: line.uom || "Unit",
      rate: line.rate || 0
    });
    removeLine(index);
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalReceived = grn?.lines?.reduce((acc, line) => acc + (line.receivedQuantity || 0), 0) || 0;
  const totalAccepted = grn?.lines?.reduce((acc, line) => acc + (line.acceptedQuantity || 0), 0) || 0;
  const totalRejected = grn?.lines?.reduce((acc, line) => acc + (line.rejectedQuantity || 0), 0) || 0;

  return (
    <div className="space-y-6 font-sans pb-10" ref={containerRef}>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
        <div className="flex items-center justify-between mb-6 border-b border-blue-50 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" size={18} />
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Reception Entry</h3>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-12 md:col-span-4 relative">
            <label className={labelStyles}>Product</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input
                type="text" className={`${inputStyles} pl-10 border-blue-50 focus:border-blue-500 font-bold`}
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductResults(true); }}
                onFocus={() => setShowProductResults(true)} 
                placeholder="Search Product..."
              />
            </div>
            {showProductResults && filteredProducts.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-48 overflow-auto">
                {filteredProducts.map(p => (
                  <div key={p.idProduit} onClick={() => {
                    setSelectedProduct(p);
                    setProductSearch(p.nomProduit || "");
                    setLineData(prev => ({...prev, uom: p.uom || "Unit", rate: p.cout || 0}));
                    setShowProductResults(false);
                  }} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-none flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">{p.nomProduit}</span>
                    <span className="text-[10px] font-mono text-gray-400">{p.uom}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-6 md:col-span-2">
            <label className={labelStyles}>Ordered</label>
            <input type="number" className={inputStyles} value={lineData.orderedQuantity} onChange={(e) => handleQtyChange("orderedQuantity", Number(e.target.value))} />
          </div>

          <div className="col-span-6 md:col-span-2">
            <label className={labelStyles}>Received</label>
            <input type="number" className={`${inputStyles} border-blue-200 bg-blue-50/30 font-bold`} value={lineData.receivedQuantity} onChange={(e) => handleQtyChange("receivedQuantity", Number(e.target.value))} />
          </div>

          <div className="col-span-6 md:col-span-2">
            <label className={labelStyles}>Accepted</label>
            <input type="number" className={`${inputStyles} border-emerald-200 bg-emerald-50/30 font-bold text-emerald-700`} value={lineData.acceptedQuantity} onChange={(e) => handleQtyChange("acceptedQuantity", Number(e.target.value))} />
          </div>

          <div className="col-span-6 md:col-span-2">
            <label className={labelStyles}>Rejected</label>
            <input type="number" className={`${inputStyles} border-red-200 bg-red-50/30 font-bold text-red-700`} value={lineData.rejectedQuantity} onChange={(e) => handleQtyChange("rejectedQuantity", Number(e.target.value))} />
          </div>

          <div className="col-span-12 flex justify-end mt-2">
            <button type="button" onClick={addLine} disabled={!selectedProduct} className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-[42px] font-bold text-sm uppercase transition-all shadow-lg">
              <Plus size={18} className="mr-2 inline" /> Add to Receipt
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-secondary-light overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-secondary-background border-b border-secondary-light">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary-gray">Product</th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase">Ordered</th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase">Received</th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-emerald-600">Accepted</th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-red-500">Rejected</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-super-light">
            {grn?.lines?.map((line, idx) => (
              <tr key={idx} className="hover:bg-secondary-background/50">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold">{line.description}</p>
                  <p className="text-[10px] text-gray-400">Rate: {line.rate?.toLocaleString()} XAF</p>
                </td>
                <td className="px-6 py-4 text-center text-gray-500">{line.orderedQuantity}</td>
                <td className="px-6 py-4 text-center font-bold text-blue-600">{line.receivedQuantity}</td>
                <td className="px-6 py-4 text-center font-black text-emerald-600">{line.acceptedQuantity}</td>
                <td className="px-6 py-4 text-center font-bold text-red-400">{line.rejectedQuantity}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(line, idx)} className="p-2 text-secondary-mid"><Pencil size={15} /></button>
                  <button onClick={() => removeLine(idx)} className="p-2 text-red-400"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Total Received" value={totalReceived} icon={<Package />} variant="default" />
        <SummaryCard title="Accepted" value={totalAccepted} icon={<ShieldCheck />} variant="emerald" />
        <SummaryCard title="Rejected" value={totalRejected} icon={<XCircle />} variant="danger" />
      </div>
    </div>
  );
}

export default GRNDetails;