'use client';

import React, { useEffect, useState } from 'react';
import { UpdatedCreditNoteResponse } from '@/src/api/models/UpdatedCreditNoteResponse';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { Download, Printer } from 'lucide-react';
import { generateNoteCreditHTML } from '@/src/api/printGenerators/noteCreditPrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';
import { sendPrintRequest } from '@/src/api/Utils/printerModule';
import { downloadHtmlAsPdf } from '@/src/api/Utils/pdfDownload';
import { toast } from 'sonner';

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: UpdatedCreditNoteResponse;
  onConfirmPrint: () => void;
}

const CreditNotePrintPreviewModal = ({ isOpen, onClose, data, onConfirmPrint }: PrintPreviewProps) => {
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

  // generateNoteCreditHTML expects NoteCreditResponse's field names
  // (numeroNoteCredit, lignesNoteCredit, motif, statut) — this admin page's
  // UpdatedCreditNoteResponse names them differently, so they're adapted
  // here rather than duplicating the whole shared template.
  useEffect(() => {
    let isMounted = true;
    if (seller && data) {
      const adapted = {
        ...data,
        numeroNoteCredit: data.numeroCreditNote,
        lignesNoteCredit: data.lignesCreditNote,
        motif: data.reason,
        statut: data.etat,
      };
      generateQRBase64(`https://yourcompany.com/verify?cn=${data.numeroCreditNote}`, 200)
        .then((qrBase64) => generateNoteCreditHTML(adapted, seller, qrBase64))
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
      await downloadHtmlAsPdf(generatedHTML, `CreditNote-${data.numeroCreditNote || "draft"}`);
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
    }).format(Math.abs(amount || 0)); // Showing absolute value in table rows for clarity

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '---';

  return (
    <div className="fixed inset-0 z-[200] bg-primary/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-secondary-background w-full max-w-5xl max-h-[95vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-secondary-light">
        
        {/* Preview Header */}
        <div className="bg-white px-8 py-4 border-b border-secondary-light flex justify-between items-center no-print">
          <div>
            <h2 className="text-secondary-mid font-black uppercase text-xs tracking-widest">Credit Note Preview</h2>
            <p className="text-[10px] text-secondary-gray font-bold uppercase tracking-tight">Review credit adjustments before validation</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onClose} 
              className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-secondary-gray hover:text-primary transition-all"
            >
              Back to Editor
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || !generatedHTML}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-primary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={14} /> {isDownloading ? "Downloading…" : "Download"}
            </button>
            <button
              onClick={handlePrint}
              disabled={!generatedHTML}
              className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-secondary-mid text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Printer size={14} /> Issue & Print Credit Note
            </button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="overflow-y-auto p-4 md:p-12 flex justify-center bg-secondary-background/50 custom-scrollbar">
          
          <div className="origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform">
            
            {/* A4 Paper Sheet */}
            <div 
              id="print-area" 
              className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl flex flex-col text-primary relative"
            >
              
              {/* Branding Header */}
              <div className="flex justify-between items-start border-b-2 border-primary pb-8 mb-10">
                <div>
                  <div className="h-16 w-16 bg-primary rounded-2xl mb-6 flex items-center justify-center text-white font-black text-3xl shadow-lg uppercase overflow-hidden">
                    {seller?.organizationLogoUri ? (
                      <img src={seller.organizationLogoUri} alt="Org Logo" className="h-full w-full object-contain" />
                    ) : (
                      seller?.organizationName?.charAt(0) || 'C'
                    )}
                  </div>
                  <h1 className="text-4xl font-black text-primary tracking-tighter italic">CREDIT NOTE</h1>
                  <div className="mt-4 flex gap-8">
                    <div className="space-y-1">
                      <p className="text-[9px] text-secondary-gray font-bold uppercase tracking-widest">Avoir No</p>
                      <p className="text-sm font-black text-secondary-mid">{data.numeroCreditNote || 'DRAFT'}</p>
                    </div>
                    {data.numeroFactureOrigine && (
                        <div className="space-y-1">
                            <p className="text-[9px] text-secondary-gray font-bold uppercase tracking-widest">Ref. Invoice</p>
                            <p className="text-sm font-black text-primary">{data.numeroFactureOrigine}</p>
                        </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-black text-sm text-primary uppercase mb-2">{seller?.organizationName || 'Your Business Name'}</p>
                  <address className="text-[10px] text-secondary-gray leading-relaxed not-italic">
                    {seller?.agencyAddress}<br />
                    {seller?.agencyCity}, Cameroon<br />
                    <span className="font-bold">TAX ID:</span> {seller?.taxNumber || 'N/A'}<br />
                  </address>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <p className="text-[10px] font-black text-secondary-mid uppercase mb-4 tracking-widest border-l-2 border-secondary-mid pl-3">Client Details</p>
                  <p className="text-base font-black text-primary mb-1">{data.nomClient}</p>
                  <p className="text-xs text-secondary-gray leading-relaxed w-3/4">
                    {data.adresseClient || "No address provided"}
                  </p>
                  {data.telephoneClient && <p className="text-xs text-secondary-gray mt-1 font-medium">{data.telephoneClient}</p>}
                </div>
                
                <div className="flex justify-end">
                  <div className="space-y-3 w-full max-w-[200px]">
                    <div className="flex justify-between items-center border-b border-secondary-super-light pb-1">
                      <span className="text-[9px] font-bold text-secondary-gray uppercase">Date Issued</span>
                      <span className="text-xs font-black text-primary">{formatDate(data.dateEmission)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-secondary-super-light pb-1">
                      <span className="text-[9px] font-bold text-secondary-gray uppercase">Reason</span>
                      <span className="text-[10px] font-black text-secondary-mid uppercase">{data.reason?.replace(/_/g, ' ') || '---'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-secondary-super-light pb-1">
                      <span className="text-[9px] font-bold text-secondary-gray uppercase">Refund Mode</span>
                      <span className="text-[10px] font-black text-primary uppercase">{data.modeReglement || '---'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-grow">
                <table className="w-full mb-8 border-collapse">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-left rounded-l-lg">Description / Product</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-center w-20">Qty</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right w-32">Unit Price</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right w-32 rounded-r-lg">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-super-light">
                    {data.lignesCreditNote?.map((ligne, i) => (
                      <tr key={i}>
                        <td className="py-4 px-4">
                          <p className="text-xs font-bold text-primary">{ligne.nomProduit || 'Item'}</p>
                          <p className="text-[9px] text-secondary-gray italic">{ligne.description}</p>
                        </td>
                        <td className="py-4 px-4 text-center text-xs text-secondary-gray font-bold">{ligne.quantite}</td>
                        <td className="py-4 px-4 text-right text-xs text-secondary-gray">{formatCurrency(ligne.prixUnitaire)}</td>
                        <td className="py-4 px-4 text-right text-xs font-black text-primary">{formatCurrency(ligne.montantTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="mt-8 pt-8 border-t-2 border-secondary-super-light">
                <div className="flex justify-between">
                  <div className="w-1/2">
                    <p className="text-[9px] font-black text-secondary-gray uppercase mb-3 tracking-widest">Notes & Conditions</p>
                    <p className="text-[10px] text-secondary-gray leading-relaxed pr-10">
                      {data.notes || `This credit note is issued as a result of ${data.reason?.toLowerCase().replace(/_/g, ' ')}. The amount will be ${data.modeReglement === 'CREDIT_CLIENT' ? 'credited to your customer account' : 'refunded via ' + data.modeReglement}.`}
                    </p>
                    
                    <div className="mt-12">
                       <p className="text-[8px] font-black text-secondary-gray uppercase mb-2">Authorized Signature</p>
                       <div className="w-48 h-20 border border-secondary-light rounded-xl bg-secondary-background"></div>
                    </div>
                  </div>

                  <div className="w-72">
                    <div className="space-y-3 bg-primary p-6 rounded-2xl text-white shadow-xl border-b-4 border-secondary-mid">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold opacity-60 uppercase tracking-widest">Sub-Total HT</span>
                        <span className="font-bold">{formatCurrency(data.montantHT)}</span>
                      </div>
                      
                      {data.applyVat && (
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold opacity-60 uppercase tracking-widest">VAT Refund (19.25%)</span>
                          <span className="font-bold">{formatCurrency(data.montantTVA)}</span>
                        </div>
                      )}

                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-secondary-super-light">Total Refund Amount</span>
                        <span className="text-2xl font-black">
                          {formatCurrency(data.finalAmount || data.montantTTC)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-10 text-center">
                <p className="text-[8px] text-secondary-gray font-bold uppercase tracking-[0.4em]">
                  Document Generated via System Pro • {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditNotePrintPreviewModal;