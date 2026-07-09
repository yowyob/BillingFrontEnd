'use client';

import React, { useEffect, useState } from 'react';
import { UpdatedProformaInvoiceResponse } from '@/src/api/models/UpdatedProformaInvoiceResponse';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { Download, Printer } from 'lucide-react';
import { generateFactureProformaHTML } from '@/src/api/printGenerators/factureProformaPrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';
import { sendPrintRequest } from '@/src/api/Utils/printerModule';
import { downloadHtmlAsPdf } from '@/src/api/Utils/pdfDownload';
import { toast } from 'sonner';

interface ProformaPrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: UpdatedProformaInvoiceResponse;
  onConfirmPrint: () => void;
}

const ProformaPrintPreviewModal = ({ isOpen, onClose, data, onConfirmPrint }: ProformaPrintPreviewProps) => {
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

  // generateFactureProformaHTML expects ProformaInvoiceResponse's line
  // array as data.lignesFactureProforma — this admin page's
  // UpdatedProformaInvoiceResponse calls it lignesDevis, so it's adapted
  // here rather than duplicating the whole shared template.
  useEffect(() => {
    let isMounted = true;
    if (seller && data) {
      const adapted = {
        ...data,
        lignesFactureProforma: data.lignesDevis,
      };
      generateQRBase64(`https://yourcompany.com/verify?pf=${data.numeroProformaInvoice}`, 200)
        .then((qrBase64) => generateFactureProformaHTML(adapted, seller, qrBase64))
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
      await downloadHtmlAsPdf(generatedHTML, `Proforma-${data.numeroProformaInvoice || "draft"}`);
    } catch (err) {
      toast.error("Failed to generate PDF for download.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  // --- Internal Helpers ---
  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: data.devise || 'XAF',
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '---';

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-100 w-full max-w-5xl max-h-[95vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Preview Header */}
        <div className="bg-white px-8 py-4 border-b flex justify-between items-center no-print">
          <div>
            <h2 className="text-primary font-black uppercase text-xs tracking-widest">Document Preview</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Verify Proforma details and totals</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all"
            >
              Back to Editor
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || !generatedHTML}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={14} /> {isDownloading ? "Downloading…" : "Download"}
            </button>
            <button
              onClick={handlePrint}
              disabled={!generatedHTML}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Printer size={14} /> Confirm & Print
            </button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="overflow-y-auto p-4 md:p-12 flex justify-center bg-gray-200/40 custom-scrollbar">
          
          {/* Scaling Wrapper */}
          <div className="origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform">
            
            {/* A4 Paper Sheet */}
            <div 
              id="print-area" 
              className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl flex flex-col text-slate-800 relative"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              
              {/* Branding Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-10">
                <div>
                  <div className="h-16 w-16 bg-blue-600 rounded-2xl mb-6 flex items-center justify-center text-white font-black text-3xl shadow-lg overflow-hidden">
                    {seller?.organizationLogoUri ? (
                      <img src={seller.organizationLogoUri} alt="Org Logo" className="h-full w-full object-contain" />
                    ) : (
                      seller?.organizationName?.charAt(0) || 'P'
                    )}
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">FACTURE<br/>PROFORMA</h1>
                  <div className="mt-4 space-y-1">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">Référence</p>
                    <p className="text-sm font-black text-slate-700">{data.numeroProformaInvoice || '---'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-black text-sm text-slate-900 uppercase mb-2">{seller?.organizationName || 'Your Business Name'}</p>
                  <address className="text-[10px] text-gray-500 leading-relaxed not-italic">
                    {seller?.agencyAddress}<br />
                    {seller?.agencyCity}, Cameroun<br />
                    <span className="font-bold text-gray-400">TAX ID:</span> {seller?.taxNumber || 'N/A'}<br />
                    <span className="font-bold text-gray-400">Email:</span> {seller?.organizationEmail}
                  </address>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest border-l-2 border-blue-600 pl-3">Destinataire</p>
                  <p className="text-base font-black text-slate-900 mb-1">{data.nomClient}</p>
                  <p className="text-xs text-gray-500 leading-relaxed w-3/4">
                    {data.adresseClient || "Aucune adresse fournie"}
                  </p>
                  {data.emailClient && <p className="text-xs text-gray-400 mt-1">{data.emailClient}</p>}
                </div>
                
                <div className="flex justify-end">
                  <div className="space-y-3 w-full max-w-[200px]">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Date d'émission</span>
                      <span className="text-xs font-black text-slate-800">{formatDate(data.dateCreation)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Validité Offre</span>
                      <span className="text-xs font-black text-slate-800">{data.validiteOffreJours || 30} Jours</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Mode de Règlement</span>
                      <span className="text-xs font-black text-slate-800">{data.modeReglement?.replace('_', ' ') || '---'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-grow">
                <table className="w-full mb-8 border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-left rounded-l-lg">Description</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-center w-20">Qté</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right w-32">Prix Unitaire</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right w-32 rounded-r-lg">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.lignesDevis?.map((ligne, i) => (
                      <tr key={i}>
                        <td className="py-4 px-4">
                          <p className="text-xs font-bold text-slate-700">{ligne.description || ligne.nomProduit}</p>
                        </td>
                        <td className="py-4 px-4 text-center text-xs text-slate-500 font-bold">{ligne.quantite}</td>
                        <td className="py-4 px-4 text-right text-xs text-slate-500">{formatCurrency(ligne.prixUnitaire)}</td>
                        <td className="py-4 px-4 text-right text-xs font-black text-slate-900">{formatCurrency(ligne.montantTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="mt-8 pt-8 border-t-2 border-slate-100">
                <div className="flex justify-between">
                  <div className="w-1/2">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest">Notes & Conditions</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed italic pr-10">
                      {data.notes || "Ceci est une facture proforma sans valeur comptable. Elle sert de proposition commerciale."}
                    </p>
                    
                    <div className="mt-12 flex gap-10">
                      <div>
                        <div className="w-32 border-b border-slate-200 h-8"></div>
                        <p className="text-[8px] font-black text-slate-300 uppercase mt-2">Signature Client</p>
                      </div>
                      <div>
                        <div className="w-32 border-b border-slate-200 h-8"></div>
                        <p className="text-[8px] font-black text-slate-300 uppercase mt-2">Cachet Entreprise</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-64">
                    <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-400 uppercase">Sous-Total HT</span>
                        <span className="font-black text-slate-700">{formatCurrency(data.montantHT)}</span>
                      </div>
                      
                      {data.applyVat && (
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-400 uppercase">TVA</span>
                          <span className="font-black text-slate-700">{formatCurrency(data.montantTVA)}</span>
                        </div>
                      )}

                      {/* Optional: Global Discount if exists */}
                      {(data.remiseGlobaleMontant ?? 0) > 0 && (
                        <div className="flex justify-between items-center text-[10px] text-red-600">
                          <span className="font-bold uppercase text-red-400">Remise</span>
                          <span className="font-black">-{formatCurrency(data.remiseGlobaleMontant)}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Net à payer</span>
                        <span className="text-lg font-black text-slate-900">
                          {formatCurrency(data.finalAmount || data.montantTTC)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-10 text-center">
                <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.4em]">
                  Proforma générée via System Pro • {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProformaPrintPreviewModal;