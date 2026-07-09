'use client';

import React, { useEffect, useState } from 'react';
import { UpdatedBackOrderResponse } from '@/src/api/models/UpdatedBackOrderResponse';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { Download, Printer } from 'lucide-react';
import { generateBackOrderHTML } from '@/src/api/printGenerators/backOrderPrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';
import { sendPrintRequest } from '@/src/api/Utils/printerModule';
import { downloadHtmlAsPdf } from '@/src/api/Utils/pdfDownload';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: UpdatedBackOrderResponse;
  onConfirmPrint: () => void;
}

const BackOrderPrintPreviewModal = ({ isOpen, onClose, data, onConfirmPrint }: Props) => {
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

  // generateBackOrderHTML expects BackOrderResponse's field names (lines
  // with nomProduit/quantiteEnAttente, dateCreation, notes) — this admin
  // page's UpdatedBackOrderResponse names them differently, so they're
  // adapted here rather than duplicating the whole shared template.
  useEffect(() => {
    let isMounted = true;
    if (seller && data) {
      const adapted = {
        ...data,
        lignes: data.lignes?.map((line) => ({
          ...line,
          nomProduit: line.productName,
          quantiteEnAttente: line.quantiteManquante,
        })),
        dateCreation: data.createdAt,
        notes: data.remarques,
      };
      generateQRBase64(`https://yourcompany.com/verify?bo=${data.numeroBackOrder}`, 200)
        .then((qrBase64) => generateBackOrderHTML(adapted, seller, qrBase64))
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
      await downloadHtmlAsPdf(generatedHTML, `BackOrder-${data.numeroBackOrder || "draft"}`);
    } catch (err) {
      toast.error("Failed to generate PDF for download.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '---';

  const formatAmount = (n?: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(n || 0);

  const totalMissing = (data.lignes || []).reduce((a, l) => a + (l.quantiteManquante || 0), 0);
  const totalValue = (data.lignes || []).reduce((a, l) => a + ((l.quantiteManquante || 0) * (l.unitPrice || 0)), 0);

  const statusColors: Record<string, string> = {
    EN_ATTENTE: 'bg-amber-100 text-amber-700',
    PARTIELLEMENT_LIVRE: 'bg-blue-100 text-blue-700',
    LIVRE: 'bg-emerald-100 text-emerald-700',
    ANNULE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="fixed inset-0 z-[200] bg-primary/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-secondary-background w-full max-w-5xl max-h-[95vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-secondary-light">

        {/* Preview Toolbar */}
        <div className="bg-white px-8 py-4 border-b border-secondary-light flex justify-between items-center no-print">
          <div>
            <h2 className="text-secondary-mid font-black uppercase text-xs tracking-widest">Back Order Preview</h2>
            <p className="text-[10px] text-secondary-gray font-bold uppercase tracking-tight">Review missing items before printing</p>
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
              <Printer size={14} /> Print Back Order
            </button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="overflow-y-auto p-4 md:p-12 flex justify-center bg-secondary-background/50">
          <div className="origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform">

            {/* A4 Paper */}
            <div
              id="print-area"
              className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl flex flex-col text-primary relative"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-primary pb-8 mb-10">
                <div>
                  <div className="h-16 w-16 bg-secondary-mid rounded-2xl mb-6 flex items-center justify-center text-white font-black text-3xl shadow-lg uppercase overflow-hidden">
                    {seller?.organizationLogoUri ? (
                      <img src={seller.organizationLogoUri} alt="Org Logo" className="h-full w-full object-contain" />
                    ) : (
                      seller?.organizationName?.charAt(0) || 'B'
                    )}
                  </div>
                  <h1 className="text-4xl font-black text-primary tracking-tighter italic">BACK ORDER</h1>
                  <div className="mt-4 flex gap-8">
                    <div className="space-y-1">
                      <p className="text-[9px] text-secondary-gray font-bold uppercase tracking-widest">BO Reference</p>
                      <p className="text-sm font-black text-secondary-mid">{data.numeroBackOrder || 'DRAFT'}</p>
                    </div>
                    {data.numeroBonLivraison && (
                      <div className="space-y-1">
                        <p className="text-[9px] text-secondary-gray font-bold uppercase tracking-widest">Delivery Order</p>
                        <p className="text-sm font-black text-primary">{data.numeroBonLivraison}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-[9px] text-secondary-gray font-bold uppercase tracking-widest">Status</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${statusColors[data.statut || ''] || 'bg-gray-100 text-gray-600'}`}>
                        {data.statut?.replace(/_/g, ' ') || '---'}
                      </span>
                    </div>
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

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <p className="text-[10px] font-black text-secondary-mid uppercase mb-4 tracking-widest border-l-2 border-secondary-mid pl-3">Client Details</p>
                  <p className="text-base font-black text-primary mb-1">{data.nomClient || '---'}</p>
                  {data.remarques && (
                    <p className="text-xs text-secondary-gray leading-relaxed mt-2 italic">
                      Note: {data.remarques}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <div className="space-y-3 w-full max-w-[220px]">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                      <span className="text-[9px] font-bold text-secondary-gray uppercase">Date Created</span>
                      <span className="text-xs font-black text-primary">{formatDate(data.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                      <span className="text-[9px] font-bold text-secondary-gray uppercase">Last Updated</span>
                      <span className="text-xs font-black text-primary">{formatDate(data.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                      <span className="text-[9px] font-bold text-secondary-gray uppercase">Total Lines</span>
                      <span className="text-xs font-black text-secondary-mid">{data.lignes?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lines Table */}
              <div className="flex-grow">
                <table className="w-full mb-8 border-collapse">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-left rounded-l-lg">Product</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-center w-24">Ordered</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-center w-24">Received</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-center w-24">Missing</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right w-32">Unit Price</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right w-36 rounded-r-lg">Value Missing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(data.lignes || []).map((line, i) => (
                      <tr key={i}>
                        <td className="py-4 px-4">
                          <p className="text-xs font-bold text-primary">{line.productName || 'Item'}</p>
                          <p className="text-[9px] text-secondary-gray font-mono">{line.productId}</p>
                        </td>
                        <td className="py-4 px-4 text-center text-xs text-gray-600">{line.quantiteCommandee}</td>
                        <td className="py-4 px-4 text-center text-xs text-emerald-600 font-bold">{line.quantiteRecue}</td>
                        <td className="py-4 px-4 text-center text-xs font-black text-secondary-mid">{line.quantiteManquante}</td>
                        <td className="py-4 px-4 text-right text-xs text-secondary-gray">{formatAmount(line.unitPrice)}</td>
                        <td className="py-4 px-4 text-right text-xs font-black text-primary">
                          {formatAmount((line.quantiteManquante || 0) * (line.unitPrice || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-8 pt-8 border-t-2 border-gray-100">
                <div className="flex justify-between">
                  <div className="w-1/2">
                    <p className="text-[9px] font-black text-secondary-gray uppercase mb-3 tracking-widest">Remarks</p>
                    <p className="text-[10px] text-secondary-gray leading-relaxed pr-10">
                      {data.remarques || 'No additional remarks provided for this back order.'}
                    </p>
                    <div className="mt-12">
                      <p className="text-[8px] font-black text-secondary-gray uppercase mb-2">Authorized Signature</p>
                      <div className="w-48 h-20 border border-gray-200 rounded-xl bg-gray-50"></div>
                    </div>
                  </div>

                  <div className="w-72">
                    <div className="space-y-3 bg-primary p-6 rounded-2xl text-white shadow-xl border-b-4 border-secondary-mid">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold opacity-60 uppercase tracking-widest">Total Missing Items</span>
                        <span className="font-black text-secondary-light">{totalMissing}</span>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Value of Missing</span>
                        <span className="text-2xl font-black">{formatAmount(totalValue)}</span>
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

export default BackOrderPrintPreviewModal;
