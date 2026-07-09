'use client';

import React, { useEffect, useState } from 'react';
import { X, Printer, CheckCircle2, XCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { PortalApi } from '@/src/api/portalApi';
import { getPortalSession } from '@/src/api/portalSession';
import { generateQuotationHTML } from '@/src/api/printGenerators/quotationPrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';
import { downloadHtmlAsPdf } from '@/src/api/Utils/pdfDownload';

async function sendPrintRequest(html: string) {
  const response = await fetch('http://localhost:3002/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html }),
  });
  return response.ok;
}

interface QuotationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: any;
  onStatusChange: (id: string, status: string) => void;
}

const QuotationActionModal: React.FC<QuotationActionModalProps> = ({ isOpen, onClose, quotation, onStatusChange }) => {
  const [html, setHtml] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !quotation) return;
    const session = getPortalSession();
    if (!session) return;

    let cancelled = false;
    (async () => {
      try {
        const [org, qrBase64] = await Promise.all([
          PortalApi.getOrganizationBranding(),
          generateQRBase64(`quotation:${quotation.idDevis}`, 200),
        ]);
        if (cancelled) return;
        const seller = {
          organizationLogoUri: org.organizationLogoUri || undefined,
          organizationName: org.organizationName || '',
          username: '',
          salePoint: '',
          agencyAddress: org.agencyAddress || '',
          agencyCity: org.agencyCity || '',
          taxNumber: org.taxNumber || undefined,
          organizationEmail: org.organizationEmail || '',
        } as any;
        setHtml(generateQuotationHTML(quotation, seller, qrBase64));
      } catch (err) {
        console.error('Failed to build quotation preview', err);
        toast.error('Failed to load the document preview.');
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, quotation]);

  if (!isOpen || !quotation) return null;

  const isPending = quotation.statut === 'ENVOYE';

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const ok = await sendPrintRequest(html);
      if (ok) toast.success('Quotation sent to printer successfully!');
      else toast.error('Printer error.');
    } catch (err) {
      toast.error('Could not connect to printer. Check if the printer service is running.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadHtmlAsPdf(html, `Quotation-${quotation.numeroDevis || 'draft'}`);
    } catch (err) {
      toast.error('Failed to generate PDF for download.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await PortalApi.acceptQuotation(quotation.idDevis);
      onStatusChange(quotation.idDevis, 'ACCEPTE');
      toast.success('Quotation accepted.');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to accept the quotation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await PortalApi.rejectQuotation(quotation.idDevis);
      onStatusChange(quotation.idDevis, 'REFUSE');
      toast.success('Quotation rejected.');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject the quotation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-slate-50 w-full max-w-4xl max-h-[95vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border border-white/20">
        <div className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center">
          <p className="text-sm font-black uppercase tracking-widest text-slate-700">
            Quotation {quotation.numeroDevis}
          </p>
          <div className="flex gap-3 items-center">
            {isPending && (
              <>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  onClick={handleAccept}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 transition-all"
                >
                  <CheckCircle2 size={16} /> Accept
                </button>
              </>
            )}
            <button
              onClick={handleDownload}
              disabled={isDownloading || !html}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-900 hover:bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={16} /> {isDownloading ? 'Downloading…' : 'Download'}
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting || !html}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all"
            >
              <Printer size={16} /> {isPrinting ? 'Printing…' : 'Print'}
            </button>
            <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-200/40">
          {html ? (
            <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}
              dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="text-slate-400 font-bold py-20">Loading preview…</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationActionModal;
