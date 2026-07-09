'use client';

import React, { useEffect, useState } from 'react';
import { DeliveryNoteResponse } from '@/src/api/models/DeliveryNoteResponse';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { Download, Printer } from 'lucide-react';
import { generateBonLivraisonHTML } from '@/src/api/printGenerators/bonLivraisonPrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';
import { sendPrintRequest } from '@/src/api/Utils/printerModule';
import { downloadHtmlAsPdf } from '@/src/api/Utils/pdfDownload';
import { toast } from 'sonner';

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: DeliveryNoteResponse;
  onConfirmPrint: () => void;
}

const DeliveryNotePrintPreviewModal = ({ isOpen, onClose, data, onConfirmPrint }: PrintPreviewProps) => {
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

  // generateBonLivraisonHTML expects BonLivraisonResponse's field names
  // (numeroBonLivraison, lignes with quantite/prixUnitaire/montant,
  // dateLivraison, saleOrderNumber) — this admin page's DeliveryNoteResponse
  // names them differently, so they're adapted here rather than duplicating
  // the whole shared template.
  useEffect(() => {
    let isMounted = true;
    if (seller && data) {
      const adapted = {
        ...data,
        numeroBonLivraison: data.deliveryNoteNumber,
        lignes: data.lines?.map((line) => ({
          ...line,
          description: line.description,
          quantite: line.quantity,
          prixUnitaire: line.unitPrice,
          montant: line.amount,
        })),
        dateLivraison: data.deliveryDate,
        saleOrderNumber: data.SaleOrderNumber,
        partial: data.isPartial,
      };
      generateQRBase64(`https://yourcompany.com/verify?dn=${data.deliveryNoteNumber}`, 200)
        .then((qrBase64) => generateBonLivraisonHTML(adapted, seller, qrBase64))
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
      await downloadHtmlAsPdf(generatedHTML, `DeliveryNote-${data.deliveryNoteNumber || "draft"}`);
    } catch (err) {
      toast.error("Failed to generate PDF for download.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '---';

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Preview Header */}
        <div className="bg-white px-8 py-4 border-b border-slate-100 flex justify-between items-center no-print">
          <div>
            <h2 className="text-blue-600 font-black uppercase text-xs tracking-widest">Delivery Note Preview</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Review shipment quantities and recipient details</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onClose} 
              className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
            >
              Back to Editor
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || !generatedHTML}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-900 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={14} /> {isDownloading ? "Downloading…" : "Download"}
            </button>
            <button
              onClick={handlePrint}
              disabled={!generatedHTML}
              className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Printer size={14} /> Validate & Print Slip
            </button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="overflow-y-auto p-4 md:p-12 flex justify-center bg-slate-50 custom-scrollbar">
          
          <div className="origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform">
            
            {/* A4 Paper Sheet */}
            <div 
              id="print-area" 
              className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl flex flex-col text-slate-900 relative"
            >
              
              {/* Branding Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-10">
                <div>
                  <div className="h-16 w-16 bg-slate-900 rounded-2xl mb-6 flex items-center justify-center text-white font-black text-3xl shadow-lg uppercase overflow-hidden">
                    {seller?.organizationLogoUri ? (
                      <img src={seller.organizationLogoUri} alt="Org Logo" className="h-full w-full object-contain" />
                    ) : (
                      seller?.organizationName?.charAt(0) || 'D'
                    )}
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Delivery Note</h1>
                  <div className="mt-4 flex gap-8">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Slip No</p>
                      <p className="text-sm font-black text-blue-600">{data.deliveryNoteNumber || 'DRAFT'}</p>
                    </div>
                    {data.SaleOrderNumber && (
                        <div className="space-y-1">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Order Ref</p>
                            <p className="text-sm font-black text-slate-900">{data.SaleOrderNumber}</p>
                        </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-black text-sm text-slate-900 uppercase mb-2">Your Business Name</p>
                  <address className="text-[10px] text-slate-400 leading-relaxed not-italic">
                    Industrial Zone, Warehouse 4<br />
                    Douala, Cameroon<br />
                    <span className="font-bold">Logistics Div.</span>
                  </address>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest border-l-2 border-blue-600 pl-3">Delivery Destination</p>
                  <p className="text-base font-black text-slate-900 mb-1">{data.recipientName || data.nomClient}</p>
                  <p className="text-xs text-slate-500 leading-relaxed w-3/4">
                    {data.recipientAddress || data.adresseClient || "No address provided"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{data.recipientPhone || data.telephoneClient}</p>
                </div>
                
                <div className="flex justify-end">
                  <div className="space-y-3 w-full max-w-[200px]">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Ship Date</span>
                      <span className="text-xs font-black text-slate-900">{formatDate(data.deliveryDate)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Carrier</span>
                      <span className="text-[10px] font-black text-blue-600 uppercase">{data.deliveryAgency || 'Internal Fleet'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Status</span>
                      <span className="text-[10px] font-black text-slate-900 uppercase">{data.etat}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table - Focused on Product & Qty Only */}
              <div className="flex-grow">
                <table className="w-full mb-8 border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-left rounded-l-lg">Description / Product Reference</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-center rounded-r-lg w-40">Quantity Shipped</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.lines?.map((line, i) => (
                      <tr key={i}>
                        <td className="py-5 px-4">
                          <p className="text-xs font-bold text-slate-900">{line.description || 'Item'}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">SKU: {line.productId || line.idProduit}</p>
                        </td>
                        <td className="py-5 px-4 text-center">
                           <span className="text-sm font-black text-slate-900 bg-slate-50 px-4 py-1 rounded-md border border-slate-100">
                              {line.quantity}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Logistics Footer */}
              <div className="mt-8 pt-8 border-t-2 border-slate-100">
                <div className="flex justify-between">
                  <div className="w-1/2">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest">Delivery Terms</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed pr-10 italic">
                      {data.termsAndConditions || "Items received must be checked against this slip. Any missing or damaged goods must be reported immediately upon receipt."}
                    </p>
                    
                    <div className="mt-12 flex gap-8">
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Released By (Whse)</p>
                          <div className="w-32 h-16 border border-slate-200 rounded-xl bg-slate-50"></div>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Recipient Signature</p>
                          <div className="w-48 h-16 border border-slate-200 rounded-xl bg-slate-50"></div>
                       </div>
                    </div>
                  </div>

                  <div className="w-72">
                    <div className="space-y-3 bg-slate-900 p-6 rounded-2xl text-white shadow-xl border-b-4 border-blue-600">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold opacity-60 uppercase tracking-widest">Unique Line Items</span>
                        <span className="font-bold">{data.lines?.length || 0}</span>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-blue-400">Total Units Shipped</span>
                        <span className="text-3xl font-black">
                          {data.lines?.reduce((acc, curr) => acc + (curr.quantity || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-10 text-center">
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.4em]">
                  Logistics Document • System Pro • {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNotePrintPreviewModal;