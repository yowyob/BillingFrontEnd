'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UpdatedDevisResponse } from '@/src/api/models/UpdatedDevisResponse';
import { Printer, X, FileText, Receipt, Download } from 'lucide-react';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { generateQuotationHTML } from '@/src/api/printGenerators/quotationPrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';
import { sendPrintRequest } from '@/src/api/Utils/printerModule';
import { downloadHtmlAsPdf } from '@/src/api/Utils/pdfDownload';
import { toast } from 'sonner';

type PrintFormat = 'A4' | 'Thermal';

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: UpdatedDevisResponse;
  onConfirmPrint: () => void;
}


const PrintPreviewModal = ({ isOpen, onClose, data, onConfirmPrint }: PrintPreviewProps) => {
  const [format, setFormat] = useState<PrintFormat>('A4');
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  const [generatedHTML,setGeneratedHTML]=useState<string>("")
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadHtmlAsPdf(generatedHTML, `Quotation-${data.numeroDevis || "draft"}`);
    } catch (err) {
      toast.error("Failed to generate PDF for download.");
    } finally {
      setIsDownloading(false);
    }
  };


  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) {
      try {
        setSeller(JSON.parse(stored));
       
      } catch (e) {
        console.error("Failed to parse seller data", e);
        toast.error("Failed to load seller data for preview.")
      }
    }
  }, [isOpen]);

  useEffect(() => {
  // Use a flag to prevent setting state on an unmounted component
  let isMounted = true;

  if (seller && data) {
    const loadHTML = async () => {
      try {
        // Use actual document data for the QR, not just Google
        
        
        const qrBase64 = await generateQRBase64("https://google.com", 200);
        const html = generateQuotationHTML(data, seller, qrBase64);

        if (isMounted) {
          setGeneratedHTML(html);
        }
      } catch (err) {
        console.error("Failed to generate preview HTML", err);
        toast.error("Failed to generate document preview.")
      }
    };

    loadHTML();
  }

  return () => {
    isMounted = false; // Cleanup flag
  };
}, [seller, data, isOpen]); // Added data and isOpen to ensure it refreshes correctly

  if (!isOpen) return null;

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: data.devise || 'XAF',
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '---';

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 flex items-center justify-center p-4">
      <div className="bg-slate-50 w-full max-w-5xl max-h-[95vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white/20">
        
        {/* Preview Header */}
        <div className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center no-print">
          <div className="flex items-center gap-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Print Configuration</p>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button onClick={() => setFormat('A4')} className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${format === 'A4' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
                  <FileText size={14} /> Standard A4
                </button>
                <button onClick={() => setFormat('Thermal')} className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${format === 'Thermal' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
                  <Receipt size={14} /> POS Receipt
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || !generatedHTML}
              className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-900 hover:bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={16} /> {isDownloading ? "Downloading…" : "Download"}
            </button>
            <button
              onClick={() => sendPrintRequest(generatedHTML)}
              disabled={!generatedHTML}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all disabled:opacity-50"
            >
              <Printer size={16} /> Print Now
            </button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="overflow-y-auto p-4 md:p-12 flex justify-center bg-slate-200/40 custom-scrollbar">
          <div ref={printAreaRef} id="print-area" className="origin-top transition-all duration-500">
            
            {format === 'A4' ? (
              /* --- A4 QUOTATION TEMPLATE --- */
            <div 
                className="shadow-2xl"
                dangerouslySetInnerHTML={{ __html: generatedHTML }} 
              />
            ) : (
              /* --- THERMAL RECEIPT TEMPLATE --- */
              <div className="bg-white w-[80mm] p-6 shadow-2xl flex flex-col text-black border border-slate-200" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '13px' }}>
                <div className="text-center border-b border-dashed border-black pb-4 mb-4">
                  <p className="font-black text-lg uppercase tracking-tight">{seller?.organizationName}</p>
                  <p className="text-[10px] font-bold">TAX ID: {seller?.taxNumber || "N/A"}</p>
                  <p className="text-[10px]">{seller?.agency}</p>
                  <p className="text-[10px]">{seller?.agencyPhone}</p>
                </div>

                <div className="mb-4 text-[11px] space-y-1 uppercase font-bold text-center">
                  <p className="text-sm underline">QUOTATION</p>
                  <p>Ref: {data.numeroDevis}</p>
                  <p>Date: {formatDate(data.dateCreation)}</p>
                </div>

                <div className="border-b border-dashed border-black mb-3"></div>
                <div className="space-y-4 mb-4">
                  {data.lignesDevis?.map((ligne, i) => (
                    <div key={i}>
                      <p className="font-black uppercase leading-tight">{ligne.description}</p>
                      <div className="flex justify-between text-[11px]">
                        <span>{ligne.quantite} x {formatCurrency(ligne.prixUnitaire)}</span>
                        <span className="font-bold">{formatCurrency(ligne.montantTotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-b border-dashed border-black mb-3"></div>

                <div className="space-y-1.5 text-[12px] font-bold">
                  <div className="flex justify-between uppercase"><span>HT Sub:</span><span>{formatCurrency(data.montantHT)}</span></div>
                  {data.applyVat && <div className="flex justify-between uppercase"><span>VAT 19.25%:</span><span>{formatCurrency(data.montantTVA)}</span></div>}
                  <div className="flex justify-between text-lg font-black pt-2 mt-2 border-t border-black">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(data.applyVat ? data.montantTTC : data.montantHT)}</span>
                  </div>
                </div>

                <div className="text-center mt-10 pt-4 border-t border-dashed border-black text-[10px] italic uppercase">
                  <p>Client: {data.nomClient}</p>
                  <p className="mt-4 font-bold tracking-widest uppercase">System Pro v2.0</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          #print-area { transform: scale(1) !important; box-shadow: none !important; margin: 0 !important; }
          @page { margin: ${format === 'A4' ? '10mm' : '0'}; size: ${format === 'A4' ? 'A4' : '80mm 250mm'}; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default PrintPreviewModal;