'use client';

import React, { useEffect, useState } from 'react';
import { UpdatedSupplierFactureResponse, FactureResponse } from '@/src/api/models/UpdatedSupplierFactureResponse';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { Truck, MapPin, Phone, Hash, Calendar, FileText, Receipt, Download, Printer } from "lucide-react";
import { generateSupplierInvoiceHTML } from '@/src/api/printGenerators/supplierInvoicePrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';
import { sendPrintRequest } from '@/src/api/Utils/printerModule';
import { downloadHtmlAsPdf } from '@/src/api/Utils/pdfDownload';
import { toast } from 'sonner';

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: UpdatedSupplierFactureResponse;
  onConfirmPrint: () => void;
}

const SupplierInvoicePrintPreviewModal = ({ isOpen, onClose, data, onConfirmPrint }: PrintPreviewProps) => {
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

  // generateSupplierInvoiceHTML expects data.lines (this model's array is
  // lignesFacture), data.nomFournisseur (this model has the typo'd
  // nomFournisseru), and data.dateFacture (this model has dateFacturation)
  // — adapted here rather than duplicating the whole shared template. Note
  // the generator treats the supplier as the document issuer (header/brand)
  // and org as the bill-to, matching this being an invoice from the
  // supplier to us.
  useEffect(() => {
    let isMounted = true;
    if (seller && data) {
      const adapted = {
        ...data,
        lines: data.lignesFacture,
        nomFournisseur: data.nomFournisseru,
        dateFacture: data.dateFacturation,
      };
      generateQRBase64(`https://yourcompany.com/verify?inv=${data.numeroFacture}`, 200)
        .then((qrBase64) => generateSupplierInvoiceHTML(adapted, seller, qrBase64))
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
      await downloadHtmlAsPdf(generatedHTML, `SupplierInvoice-${data.numeroFacture || "draft"}`);
    } catch (err) {
      toast.error("Failed to generate PDF for download.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat('fr-CM', {
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
    <div className="fixed inset-0 z-[200] bg-primary/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-secondary-background w-full max-w-5xl max-h-[95vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20">
        
        {/* Header Controls */}
        <div className="bg-white px-8 py-5 border-b border-secondary-light flex justify-between items-center no-print">
          <div>
            <h2 className="text-primary font-black uppercase text-xs tracking-widest">Supplier Bill Preview</h2>
            <p className="text-[10px] text-secondary-gray font-bold uppercase tracking-tight">Financial Document • {data.type}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-secondary-gray hover:text-primary transition-all">
              Discard
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || !generatedHTML}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-secondary text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={14} /> {isDownloading ? "Downloading…" : "Download"}
            </button>
            <button
              onClick={handlePrint}
              disabled={!generatedHTML}
              className="flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Printer size={14} /> Confirm & Print Bill
            </button>
          </div>
        </div>

        {/* Paper Viewport */}
        <div className="overflow-y-auto p-4 md:p-12 flex justify-center custom-scrollbar">
          <div className="origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform">
            
            <div id="print-area" className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl flex flex-col text-slate-800 relative">
              
              {/* Branding & Header */}
              <div className="flex justify-between items-start border-b-4 border-primary pb-6 mb-8">
                <div>
                  <div className="h-16 w-16 bg-primary rounded-2xl mb-4 flex items-center justify-center text-white font-black text-3xl shadow-lg overflow-hidden">
                    {seller?.organizationLogoUri ? (
                      <img src={seller.organizationLogoUri} alt="Org Logo" className="h-full w-full object-contain" />
                    ) : (
                      seller?.organizationName?.charAt(0) || 'F'
                    )}
                  </div>
                  <h1 className="text-3xl font-black text-primary tracking-tighter uppercase italic">Purchase Invoice</h1>
                  <p className="text-sm font-black text-secondary mt-1">{data.numeroFacture || 'DRAFT-INV'}</p>
                </div>

                <div className="text-right">
                  <p className="font-black text-sm text-primary uppercase">{seller?.organizationName || 'Your Company Name'}</p>
                  <p className="text-[10px] text-secondary-gray mt-1 leading-relaxed">
                    {seller?.agencyAddress}, {seller?.agencyCity}, Cameroon<br/>
                    TAX ID: {seller?.taxNumber || 'N/A'}
                  </p>
                  <div className={`mt-4 inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    data.etat === FactureResponse.etat.PAYE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-secondary-super-light text-secondary border-secondary-light'
                  }`}>
                    Payment Status: {data.etat}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-8 mb-10">
                {/* Supplier Details */}
                <div className="border-l-4 border-secondary-light pl-5">
                  <p className="text-[9px] font-black text-secondary-gray uppercase mb-3 tracking-widest">Supplier Information</p>
                  <p className="text-sm font-black text-primary">{data.nomFournisseru}</p>
                  <div className="space-y-1 mt-2">
                    <p className="text-[10px] text-slate-500 flex items-center gap-2">
                        <MapPin size={10} className="text-secondary"/> {data.adresseFournisseur || 'No address provided'}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-2">
                        <Phone size={10} className="text-secondary"/> {data.telephoneFournisseur}
                    </p>
                  </div>
                </div>

                {/* References */}
                <div className="border-l-4 border-secondary pl-5 bg-secondary-background/50 p-3 rounded-r-xl">
                  <p className="text-[9px] font-black text-secondary uppercase mb-3 tracking-widest">References</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Hash size={10} className="text-secondary-gray" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Our Ref:</span>
                        <span className="text-[10px] font-black text-primary">{data.nosRef || '---'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText size={10} className="text-secondary-gray" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">GRN No:</span>
                        <span className="text-[10px] font-black text-primary">{data.numeroGRN || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Dates & Totals */}
                <div className="text-right flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-secondary-gray uppercase block mb-1">Billing Date</span>
                    <span className="text-xs font-black text-primary flex items-center justify-end gap-1">
                        <Calendar size={12} className="text-secondary"/> {formatDate(data.dateFacturation)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[9px] font-bold text-secondary-gray uppercase block mb-1">Due Date</span>
                    <span className="text-xs font-black text-rose-600">{formatDate(data.dateEcheance)}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="flex-grow">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="py-3 px-5 text-[9px] font-black uppercase text-left rounded-l-xl">Designation / Item</th>
                      <th className="py-3 px-5 text-[9px] font-black uppercase text-center w-24">Quantity</th>
                      <th className="py-3 px-5 text-[9px] font-black uppercase text-right w-36">Unit Cost</th>
                      <th className="py-3 px-5 text-[9px] font-black uppercase text-right w-36 rounded-r-xl">Total (HT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-light">
                    {data.lignesFacture?.map((line, i) => (
                      <tr key={i} className="hover:bg-secondary-background transition-colors">
                        <td className="py-4 px-5">
                          <p className="text-[11px] font-black text-primary uppercase tracking-tight">{line.nomProduit}</p>
                          <p className="text-[9px] text-secondary-gray font-mono mt-0.5">{line.idProduit}</p>
                        </td>
                        <td className="py-4 px-5 text-center text-[11px] font-black text-slate-600">{line.quantite}</td>
                        <td className="py-4 px-5 text-right text-[11px] font-medium">{formatCurrency(line.prixUnitaire)}</td>
                        <td className="py-4 px-5 text-right text-[11px] font-black text-primary">{formatCurrency(line.montantTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="mt-12 pt-8 border-t-2 border-primary/10">
                <div className="flex justify-between items-end">
                  <div className="w-1/2">
                    <div className="bg-secondary-background p-5 rounded-2xl border border-secondary-light">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Terms & Conditions</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        {data.notes || "Standard purchase terms apply. Please reference the invoice number on all payments."}
                      </p>
                      <div className="mt-4 pt-4 border-t border-secondary-light flex items-center gap-4">
                        <span className="text-[9px] font-black text-secondary uppercase">Mode:</span>
                        <span className="text-[10px] font-bold text-primary px-3 py-1 bg-white rounded-lg border border-secondary-light uppercase">
                            {data.modeReglement?.replace('_', ' ') || 'BANK TRANSFER'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-72 space-y-3">
                    <div className="flex justify-between items-center text-[10px] px-3">
                      <span className="font-bold text-secondary-gray uppercase">Subtotal (HT)</span>
                      <span className="font-black text-primary">{formatCurrency(data.montantHT)}</span>
                    </div>
                    {data.applyVat && (
                      <div className="flex justify-between items-center text-[10px] px-3">
                        <span className="font-bold text-secondary-gray uppercase">Input VAT (19.25%)</span>
                        <span className="font-black text-primary">{formatCurrency(data.montantTVA)}</span>
                      </div>
                    )}
                    {data.remiseGlobaleMontant && data.remiseGlobaleMontant > 0 && (
                      <div className="flex justify-between items-center text-[10px] px-3 text-rose-600">
                        <span className="font-bold uppercase tracking-tighter">Discount Applied</span>
                        <span className="font-black">-{formatCurrency(data.remiseGlobaleMontant)}</span>
                      </div>
                    )}
                    
                    <div className="bg-primary text-white p-5 rounded-2xl flex justify-between items-center shadow-xl shadow-primary/10">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 block">Amount Payable</span>
                        <span className="text-2xl font-black">
                          {formatCurrency(data.finalAmount)}
                        </span>
                      </div>
                      <Receipt size={24} className="opacity-20" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-10 flex justify-between items-center border-t border-secondary-super-light">
                <div className="flex gap-4">
                    <p className="text-[8px] text-secondary-gray font-black uppercase">Internal ID: {data.idFacture}</p>
                </div>
                <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                  Validated Procurement Document • 2026
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierInvoicePrintPreviewModal;