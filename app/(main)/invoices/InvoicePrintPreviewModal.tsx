'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UpdatedFactureResponse, FactureResponse } from '@/src/api/models/UpdatedFactureResponse';
import { Printer, X, FileText, Receipt, Building2, Phone, MapPin, Download } from 'lucide-react';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { QRCode } from 'react-qrcode-logo';
import { toast } from 'sonner';
import { generateFactureHTML } from '@/src/api/printGenerators/facturePrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';
import { sendPrintRequest } from '@/src/api/Utils/printerModule';
import { downloadHtmlAsPdf } from '@/src/api/Utils/pdfDownload';

type PrintFormat = 'A4' | 'Thermal';

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: UpdatedFactureResponse;
  onConfirmPrint: () => void;
}

const InvoicePrintPreviewModal = ({ isOpen, onClose, data, onConfirmPrint }: PrintPreviewProps) => {
  const [format, setFormat] = useState<PrintFormat>('A4');
  const printAreaRef = useRef<HTMLDivElement>(null);
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
        toast.error("Failed to load seller data for preview.")
      }
    }
  }, [isOpen]);

  // Builds the same HTML sent to the printer module / PDF download — kept
  // separate from the on-screen JSX preview above, which stays hand-styled.
  useEffect(() => {
    let isMounted = true;
    if (seller && data) {
      generateQRBase64(`https://yourcompany.com/pay?invoice=${data.numeroFacture}`, 200)
        .then((qrBase64) => generateFactureHTML(data, seller, qrBase64))
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
      await downloadHtmlAsPdf(generatedHTML, `Invoice-${data.numeroFacture || "draft"}`);
    } catch (err) {
      toast.error("Failed to generate PDF for download.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  // Data to be scanned
  const qrData = JSON.stringify({
    invoiceNumber: data.numeroFacture,
    idDevis: data.idDevisOrigine,
    clientId: data.idClient,
    clientName: data.nomClient,
    date: data.dateFacturation,
    amount: data.finalAmount,
    currency: data.devise,
    applyVat: data.applyVat,
    taxAmount: data.montantTVA,
    paymentUrl: `https://yourcompany.com/pay?invoice=${data.numeroFacture}`
  });

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
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
            <button onClick={handlePrint} disabled={!generatedHTML} className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all disabled:opacity-50">
              <Printer size={16} /> Print Document
            </button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="overflow-y-auto p-4 md:p-12 flex justify-center bg-slate-200/40 custom-scrollbar">
          <div ref={printAreaRef} id="print-area" className="origin-top transition-all duration-500">
            
            {format === 'A4' ? (
              <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl flex flex-col text-slate-900 relative">
                 {/* A4 HEADER: DYNAMIC SELLER DATA */}
                 <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-10">
                    <div className="flex gap-6">
                      {seller?.organizationLogoUri ? (
                        <img src={seller.organizationLogoUri} alt="Org Logo" className="h-20 w-20 object-contain rounded-xl border border-slate-100" />
                      ) : (
                        <div className="h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
                          {seller?.organizationName?.charAt(0) || 'I'}
                        </div>
                      )}
                      <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-2">Invoice</h1>
                        <p className="text-xs font-bold text-blue-600">{data.numeroFacture || "DRAFT"}</p>
                        <div className="mt-4 space-y-0.5">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Prepared by</p>
                            <p className="text-[11px] font-bold text-slate-700">{seller?.username} @ {seller?.salePoint}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 items-start">
                       <div className="text-right">
                          <h2 className="font-black text-base uppercase text-slate-900 mb-1">{seller?.organizationName}</h2>
                          <div className="text-[10px] text-slate-500 space-y-0.5 leading-tight">
                             <p>{seller?.agencyAddress}</p>
                             <p>{seller?.agencyCity}, Cameroon</p>
                             <p className="pt-1 font-bold text-slate-700 uppercase">Tax ID: {seller?.taxNumber || "N/A"}</p>
                             <p className="text-blue-600">{seller?.organizationEmail}</p>
                          </div>
                       </div>
                       {/* QR CODE A4 CORNER */}
                       <div className="border p-1 rounded-lg bg-white shadow-sm">
                         <QRCode 
        value={qrData} 
        size={90}               // Increased size
        qrStyle="dots" 
        eyeRadius={8}           // Larger eye corners
        ecLevel="L"             // Medium error correction for better balance
        quietZone={4}
      />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-3 border-l-4 border-blue-600 pl-3">Bill To</p>
                      <p className="text-base font-black tracking-tight">{data.nomClient}</p>
                      <p className="text-xs text-slate-500 w-3/4 leading-relaxed">{data.adresseClient || "No address provided"}</p>
                    </div>
                    <div className="flex justify-end">
                      <div className="w-full max-w-[180px] space-y-2">
                         <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                           <span className="text-[9px] font-bold text-slate-400 uppercase">Issue Date</span>
                           <span className="text-xs font-black">{formatDate(data.dateFacturation)}</span>
                         </div>
                         <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                           <span className="text-[9px] font-bold text-slate-400 uppercase">Due Date</span>
                           <span className="text-xs font-black text-red-600">{formatDate(data.dateEcheance)}</span>
                         </div>
                      </div>
                    </div>
                 </div>

                 <table className="w-full mb-10">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="py-4 px-5 text-[9px] font-black uppercase text-left rounded-l-xl">Description</th>
                        <th className="py-4 px-5 text-[9px] font-black uppercase text-center">Qty</th>
                        <th className="py-4 px-5 text-[9px] font-black uppercase text-right">Price</th>
                        <th className="py-4 px-5 text-[9px] font-black uppercase text-right rounded-r-xl">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.lignesFacture?.map((ligne, i) => (
                        <tr key={i} className="text-xs">
                          <td className="py-5 px-5 font-bold text-slate-800">{ligne.nomProduit}</td>
                          <td className="py-5 px-5 text-center font-medium">{ligne.quantite}</td>
                          <td className="py-5 px-5 text-right font-medium">{formatCurrency(ligne.prixUnitaire)}</td>
                          <td className="py-5 px-5 text-right font-black">{formatCurrency(ligne.montantTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>

                 <div className="mt-auto pt-8 border-t-2 border-slate-100 flex justify-between items-end">
                    <div className="w-1/2">
                       <p className="text-[9px] font-black text-slate-400 uppercase mb-3">Notes & Payment</p>
                       <p className="text-[10px] text-slate-500 italic leading-relaxed">{data.notes || "Please mention the invoice number on your transfer."}</p>
                    </div>
                    <div className="w-72 space-y-2">
                      <div className="flex justify-between px-4 text-[10px] font-bold text-slate-400 uppercase"><span>Subtotal HT</span><span>{formatCurrency(data.montantHT)}</span></div>
                      {data.applyVat && <div className="flex justify-between px-4 text-[10px] font-bold text-slate-400 uppercase"><span>VAT (19.25%)</span><span>{formatCurrency(data.montantTVA)}</span></div>}
                      <div className="bg-slate-900 p-6 rounded-[1.5rem] text-white shadow-xl mt-4">
                        <div className="flex justify-between items-center mb-1 opacity-60 text-[9px] font-black uppercase tracking-widest">
                           <span>Total TTC</span>
                           <span>{data.devise}</span>
                        </div>
                        <div className="text-3xl font-black text-right border-b border-white/10 pb-4">{formatCurrency(data.finalAmount)}</div>
                        <div className="flex justify-between pt-4 text-[10px] font-bold">
                           <span className="text-blue-400 uppercase">Balance Due</span>
                           <span className={data.montantRestant === 0 ? 'text-emerald-400' : 'text-orange-400'}>
                             {data.montantRestant === 0 ? 'FULLY PAID' : formatCurrency(data.montantRestant)}
                           </span>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            ) : (
              /* --- THERMAL RECEIPT --- */
              <div className="bg-white w-[80mm] p-6 shadow-2xl flex flex-col text-black border border-slate-200" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '13px' }}>
                <div className="text-center border-b border-dashed border-black pb-4 mb-4">
                  <p className="font-black text-lg uppercase leading-tight">{seller?.organizationName}</p>
                  <p className="text-[10px] font-bold">TAX ID: {seller?.taxNumber || "N/A"}</p>
                  <p className="text-[10px]">{seller?.agency}</p>
                  <p className="text-[10px]">{seller?.agencyPhone}</p>
                </div>

                <div className="mb-4 text-[11px] space-y-1 uppercase font-bold">
                  <div className="flex justify-between"><span>INV:</span><span>{data.numeroFacture}</span></div>
                  <div className="flex justify-between"><span>Date:</span><span>{formatDate(data.dateFacturation)}</span></div>
                  <div className="flex justify-between"><span>Seller:</span><span>{seller?.username}</span></div>
                </div>

                <div className="border-b border-dashed border-black mb-3"></div>
                <div className="space-y-4 mb-4">
                  {data.lignesFacture?.map((ligne, i) => (
                    <div key={i}>
                      <p className="font-black uppercase leading-tight">{ligne.nomProduit}</p>
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
                    <span>{formatCurrency(data.finalAmount)}</span>
                  </div>
                </div>

                {/* THERMAL QR CODE CORNER */}
                <div className="flex flex-col items-center mt-6 pt-4 border-t border-dashed border-black">
                 <QRCode 
        value={qrData} 
        size={90}               // Increased size
        qrStyle="dots" 
        eyeRadius={8}           // Larger eye corners
        ecLevel="L"             // Medium error correction for better balance
        quietZone={4}
      />
                  <p className="text-[9px] mt-2 font-black">SCAN TO VERIFY</p>
                </div>

                <div className="text-center mt-6 text-[10px] italic uppercase">
                  <p>Customer: {data.nomClient}</p>
                  <p className="mt-2 font-black">{data.etat}</p>
                  <p className="mt-4 font-bold tracking-widest">Powered by Gemini</p>
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

export default InvoicePrintPreviewModal;