'use client';

import React, { useEffect, useState } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import { PortalApi } from '@/src/api/portalApi';
import { getPortalSession } from '@/src/api/portalSession';
import { generateFactureHTML } from '@/src/api/printGenerators/facturePrint';
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

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ isOpen, onClose, invoice }) => {
  const [html, setHtml] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen || !invoice) return;
    const session = getPortalSession();
    if (!session) return;

    let cancelled = false;
    (async () => {
      try {
        const [org, qrBase64] = await Promise.all([
          PortalApi.getOrganizationBranding(),
          generateQRBase64(`invoice:${invoice.idFacture}`, 200),
        ]);
        if (cancelled) return;
        const branding = {
          organizationLogoUri: org.organizationLogoUri || undefined,
          organizationName: org.organizationName || '',
          agencyAddress: org.agencyAddress || '',
          agencyCity: org.agencyCity || '',
          taxNumber: org.taxNumber || undefined,
          organizationEmail: org.organizationEmail || '',
        };
        setHtml(generateFactureHTML(invoice, branding, qrBase64));
      } catch (err) {
        console.error('Failed to build invoice preview', err);
        toast.error('Failed to load the document preview.');
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const ok = await sendPrintRequest(html);
      if (ok) toast.success('Invoice sent to printer successfully!');
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
      await downloadHtmlAsPdf(html, `Invoice-${invoice.numeroFacture || 'draft'}`);
    } catch (err) {
      toast.error('Failed to generate PDF for download.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-slate-50 w-full max-w-4xl max-h-[95vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border border-white/20">
        <div className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center">
          <p className="text-sm font-black uppercase tracking-widest text-slate-700">
            Invoice {invoice.numeroFacture}
          </p>
          <div className="flex gap-3 items-center">
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

export default InvoicePreviewModal;
