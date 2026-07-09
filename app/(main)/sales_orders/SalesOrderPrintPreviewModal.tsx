'use client';

import React, { useEffect, useState } from 'react';
import { UpdatedSalesOrderResponse } from '@/src/api/models/UpdatedSalesOrder';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { Truck, MapPin, Phone, Download, Printer } from "lucide-react";
import { generateBonCommandeHTML } from '@/src/api/printGenerators/bonCommandePrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';
import { sendPrintRequest } from '@/src/api/Utils/printerModule';
import { downloadHtmlAsPdf } from '@/src/api/Utils/pdfDownload';
import { toast } from 'sonner';

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: UpdatedSalesOrderResponse;
  onConfirmPrint: () => void;
}

const SalesOrderPrintPreview = ({ isOpen, onClose, data, onConfirmPrint }: PrintPreviewProps) => {
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  const [generatedHTML, setGeneratedHTML] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) {
      try {
        setSeller(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse seller data", e);
      }
    }
  }, []);

  // generateBonCommandeHTML expects BonCommandeResponse's field names
  // (numeroCommande, lines, dateCommande) — this admin page's
  // UpdatedSalesOrderResponse names them differently, so they're adapted
  // here rather than duplicating the whole shared template.
  useEffect(() => {
    let isMounted = true;
    if (seller && data) {
      const adapted = {
        ...data,
        numeroCommande: data.numeroSalesOrder,
        lines: data.lignesSalesOrder,
        dateCommande: data.dateCreation,
      };
      generateQRBase64(`https://yourcompany.com/verify?so=${data.numeroSalesOrder}`, 200)
        .then((qrBase64) => generateBonCommandeHTML(adapted, seller, qrBase64))
        .then((html) => { if (isMounted) setGeneratedHTML(html); })
        .catch((err) => {
          console.error("Failed to generate printable HTML", err);
          toast.error("Failed to prepare document for print/download.");
        });
    }
    return () => { isMounted = false; };
  }, [seller, data, isOpen]);

  const handlePrint = async () => {
    try {
      await sendPrintRequest(generatedHTML);
      onConfirmPrint();
    } catch (err) {
      toast.error("Failed to reach the printer module. Is it running?");
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadHtmlAsPdf(generatedHTML, `SalesOrder-${data.numeroSalesOrder || "draft"}`);
    } catch (err) {
      toast.error("Failed to generate PDF for download.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.devise || 'XAF',
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '---';

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-100 w-full max-w-5xl max-h-[95vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header Controls */}
        <div className="bg-white px-8 py-4 border-b flex justify-between items-center no-print">
          <div>
            <h2 className="text-primary font-black uppercase text-xs tracking-widest">Order Preview</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Sales Order Document</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all">
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || !generatedHTML}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-secondary-mid text-secondary-mid rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={14} /> {isDownloading ? "Downloading…" : "Download"}
            </button>
            <button
              onClick={handlePrint}
              disabled={!generatedHTML}
              className="flex items-center gap-2 px-8 py-2.5 bg-secondary-mid hover:bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              <Printer size={14} /> Confirm & Print Order
            </button>
          </div>
        </div>

        {/* Paper Viewport */}
        <div className="overflow-y-auto p-4 md:p-12 flex justify-center bg-gray-200/40 custom-scrollbar">
          <div className="origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform">
            
            <div id="print-area" className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl flex flex-col text-slate-800 relative">
              
              {/* Branding */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div>
                  <div className="h-14 w-14 bg-slate-900 rounded-xl mb-4 flex items-center justify-center text-white font-black text-2xl overflow-hidden">
                    {seller?.organizationLogoUri ? (
                      <img src={seller.organizationLogoUri} alt="Org Logo" className="h-full w-full object-contain" />
                    ) : (
                      seller?.organizationName?.charAt(0) || 'S'
                    )}
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Sales Order</h1>
                  <p className="text-sm font-black text-slate-700 mt-2">{data.numeroSalesOrder || 'Draft Order'}</p>
                </div>

                <div className="text-right">
                  <p className="font-black text-sm text-slate-900 uppercase">{seller?.organizationName || 'Your Business Name'}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{seller?.agencyCity}, Cameroon • TAX ID: {seller?.taxNumber || 'N/A'}</p>
                  <div className="mt-4 inline-block bg-slate-100 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                    Status: {data.statut}
                  </div>
                </div>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-3 gap-8 mb-8">
                {/* Billing To */}
                <div className="border-l-2 border-slate-100 pl-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Bill To (Client)</p>
                  <p className="text-sm font-black text-slate-900">{data.nomClient}</p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-1">{data.adresseClient}</p>
                  <p className="text-[10px] text-gray-500">{data.telephoneClient}</p>
                </div>

                {/* Delivery To */}
                <div className="border-l-2 border-secondary-mid pl-4 bg-secondary-super-light/10">
                  <p className="text-[9px] font-black text-secondary-mid uppercase mb-2 tracking-widest">Ship To (Recipient)</p>
                  <p className="text-sm font-black text-slate-900">{data.recipientName || data.nomClient}</p>
                  <div className="flex items-start gap-1 mt-1 text-[10px] text-gray-500">
                    <MapPin size={10} className="mt-0.5 shrink-0" />
                    <span>{data.recipientAddress || 'N/A'}, {data.recipientCity || ''}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Phone size={10} className="shrink-0" />
                    <span>{data.recipientPhone || 'N/A'}</span>
                  </div>
                </div>
                
                {/* Logistics Info */}
                <div className="text-right space-y-2">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Order Date</span>
                    <span className="text-xs font-black">{formatDate(data.dateCreation)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Transport Method</span>
                    <span className="text-xs font-black flex justify-end items-center gap-1 uppercase">
                      <Truck size={12} /> {data.transportMethod?.replace('_', ' ') || 'STANDARD'}
                    </span>
                  </div>
                  {data.agencyInfo && (
                    <div className="bg-slate-50 p-1 rounded">
                      <span className="text-[8px] font-bold text-gray-400 uppercase block">Via Agency</span>
                      <span className="text-[10px] font-black">{data.agencyInfo.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="flex-grow">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="py-2.5 px-4 text-[9px] font-black uppercase text-left rounded-l-lg">Product / Description</th>
                      <th className="py-2.5 px-4 text-[9px] font-black uppercase text-center w-20">Qty</th>
                      <th className="py-2.5 px-4 text-[9px] font-black uppercase text-right w-32">Unit Price</th>
                      <th className="py-2.5 px-4 text-[9px] font-black uppercase text-right w-32 rounded-r-lg">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.lignesSalesOrder?.map((line, i) => (
                      <tr key={i}>
                        <td className="py-3 px-4">
                          <p className="text-[11px] font-bold text-slate-700">{line.nomProduit || line.description}</p>
                          <p className="text-[9px] text-gray-400 italic">{line.idProduit}</p>
                        </td>
                        <td className="py-3 px-4 text-center text-[11px] font-bold">{line.quantite}</td>
                        <td className="py-3 px-4 text-right text-[11px]">{formatCurrency(line.prixUnitaire)}</td>
                        <td className="py-3 px-4 text-right text-[11px] font-black">{formatCurrency(line.montantTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals and Signatures */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex justify-between items-start">
                  <div className="w-1/2 space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Instructions</p>
                      <p className="text-[10px] text-gray-500 italic pr-6 leading-relaxed">
                        {data.notes || "No specific instructions provided."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div>
                        <div className="h-16 border border-dashed border-slate-200 rounded-lg mb-2"></div>
                        <p className="text-[8px] font-black text-center text-slate-400 uppercase">Warehouse Release</p>
                      </div>
                      <div>
                        <div className="h-16 border border-dashed border-slate-200 rounded-lg mb-2"></div>
                        <p className="text-[8px] font-black text-center text-slate-400 uppercase">Customer Signature</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-64 space-y-2">
                    <div className="flex justify-between items-center text-[10px] px-2">
                      <span className="font-bold text-gray-400 uppercase">Subtotal (Excl. Tax)</span>
                      <span className="font-black">{formatCurrency(data.montantHT)}</span>
                    </div>
                    {data.applyVat && (
                      <div className="flex justify-between items-center text-[10px] px-2">
                        <span className="font-bold text-gray-400 uppercase">VAT (19.25%)</span>
                        <span className="font-black">{formatCurrency(data.montantTVA)}</span>
                      </div>
                    )}
                    <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center mt-4">
                      <span className="text-[10px] font-black uppercase tracking-wider">Total Amount</span>
                      <span className="text-xl font-black">
                        {formatCurrency(data.applyVat ? data.montantTTC : data.montantHT)}
                      </span>
                    </div>
                    <p className="text-[9px] text-center text-gray-400 font-bold uppercase mt-2">
                      Payment Method: {data.modeReglement?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-8 flex justify-between items-center border-t border-slate-50">
                <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">
                  Generated on {new Date().toLocaleString('en-US')}
                </p>
                <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">
                  Page 1 of 1
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderPrintPreview;