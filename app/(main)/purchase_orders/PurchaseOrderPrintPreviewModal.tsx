'use client';

import React, { useEffect, useState } from 'react';
import { PurchaseOrderResponse } from '@/src/api/models/PurchaseOrderLine';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { Truck, MapPin, Phone, Mail, Building2, Download, Printer } from 'lucide-react';
import { generatePurchaseOrderHTML } from '@/src/api/printGenerators/purchaseOrderPrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';
import { sendPrintRequest } from '@/src/api/Utils/printerModule';
import { downloadHtmlAsPdf } from '@/src/api/Utils/pdfDownload';
import { toast } from 'sonner';

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: PurchaseOrderResponse;
  onConfirmPrint: () => void;
}

const PurchaseOrderPrintPreviewModal = ({ isOpen, onClose, data, onConfirmPrint }: PrintPreviewProps) => {
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

  // generatePurchaseOrderHTML expects the raw BonAchatResponse's field names
  // for these three — this admin page's mapped PurchaseOrderResponse names
  // them differently, so they're adapted here rather than duplicating the
  // whole shared template.
  useEffect(() => {
    let isMounted = true;
    if (seller && data) {
      const adapted = {
        ...data,
        numeroBonAchat: data.poNumber,
        dateBonAchat: data.poDate,
        dateLivraisonPrevue: data.expectedDeliveryDate,
        devise: 'XAF',
      };
      generateQRBase64(`https://yourcompany.com/verify?po=${data.poNumber}`, 200)
        .then((qrBase64) => generatePurchaseOrderHTML(adapted, seller, qrBase64))
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
      await downloadHtmlAsPdf(generatedHTML, `PurchaseOrder-${data.poNumber || "draft"}`);
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
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount || 0);

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
            <h2 className="text-secondary-mid font-black uppercase text-xs tracking-widest">Purchase Order Preview</h2>
            <p className="text-[10px] text-secondary-gray font-bold uppercase tracking-tight">Verify procurement details before sending to supplier</p>
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
              className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-secondary-mid text-secondary-mid rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={14} /> {isDownloading ? "Downloading…" : "Download"}
            </button>
            <button
              onClick={handlePrint}
              disabled={!generatedHTML}
              className="flex items-center gap-2 px-8 py-2.5 bg-secondary-mid hover:bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary-mid/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Printer size={14} /> Confirm & Print PO
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
              <div className="flex justify-between items-start border-b-2 border-secondary-mid pb-8 mb-10">
                <div>
                  <div className="h-16 w-16 bg-secondary-mid rounded-2xl mb-6 flex items-center justify-center text-white font-black text-3xl shadow-lg uppercase overflow-hidden">
                    {seller?.organizationLogoUri ? (
                      <img src={seller.organizationLogoUri} alt="Org Logo" className="h-full w-full object-contain" />
                    ) : (
                      seller?.organizationName?.charAt(0) || 'S'
                    )}
                  </div>
                  <h1 className="text-4xl font-black text-secondary-mid tracking-tighter italic">PURCHASE ORDER</h1>
                  <div className="mt-4 flex gap-8">
                    <div className="space-y-1">
                      <p className="text-[9px] text-secondary-gray font-bold uppercase tracking-widest">PO Number</p>
                      <p className="text-sm font-black text-primary">{data.poNumber || 'DRAFT-PURCHASE'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-secondary-gray font-bold uppercase tracking-widest">Date Issued</p>
                      <p className="text-sm font-black text-primary">{formatDate(data.poDate || data.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-black text-sm text-secondary-mid uppercase mb-2">{seller?.organizationName || 'Your Company Name'}</p>
                  <address className="text-[10px] text-secondary-gray leading-relaxed not-italic">
                    {seller?.agencyAddress}<br />
                    {seller?.agencyCity}, Cameroon<br />
                    <span className="font-bold">Contact:</span> {seller?.organizationEmail}<br />
                  </address>
                </div>
              </div>

              {/* Information Grid: Supplier vs Delivery */}
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-secondary-mid uppercase mb-3 tracking-widest flex items-center gap-2">
                    <Building2 size={12}/> Vendor / Supplier
                  </p>
                  <p className="text-base font-black text-primary mb-1">{data.supplierName}</p>
                  <p className="text-[10px] text-secondary-gray font-bold mb-2">CODE: {data.supplierCode || 'N/A'}</p>
                  <div className="space-y-1 text-xs text-secondary-gray leading-relaxed">
                    <p>{data.supplierAddress}</p>
                    <p className="flex items-center gap-2 mt-2"><Phone size={10}/> {data.supplierContact}</p>
                    <p className="flex items-center gap-2"><Mail size={10}/> {data.supplierEmail}</p>
                  </div>
                </div>
                
                <div className="bg-secondary-mid/5 p-4 rounded-2xl border border-secondary-mid/10">
                  <p className="text-[10px] font-black text-secondary-mid uppercase mb-3 tracking-widest flex items-center gap-2">
                    <MapPin size={12}/> Ship To / Delivery Point
                  </p>
                  <p className="text-sm font-black text-primary mb-1">{data.deliveryName || "Central Warehouse"}</p>
                  <div className="space-y-1 text-xs text-secondary-gray leading-relaxed">
                    <p>{data.deliveryAddress}</p>
                    <p className="mt-2 font-bold text-primary">Expected By: {formatDate(data.expectedDeliveryDate)}</p>
                    <p className="text-[10px] uppercase font-black text-secondary-mid">Method: {data.transportMethod?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-grow">
                <table className="w-full mb-8 border-collapse">
                  <thead>
                    <tr className="bg-secondary-mid text-white">
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-left rounded-l-lg">Item Code / Description</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-center w-24">Quantity</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right w-32">Rate (HT)</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right w-24">Taxable</th>
                      <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-right w-32 rounded-r-lg">Amount (HT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-super-light">
                    {data.lines?.map((line, i) => (
                      <tr key={i}>
                        <td className="py-4 px-4">
                          <p className="text-xs font-bold text-primary">{line.productName}</p>
                          <p className="text-[9px] text-secondary-gray font-mono">{line.productCode}</p>
                        </td>
                        <td className="py-4 px-4 text-center text-xs text-primary font-black">
                          {line.orderedQuantity} <span className="text-[9px] text-secondary-gray font-normal">{line.uom}</span>
                        </td>
                        <td className="py-4 px-4 text-right text-xs text-secondary-gray">{formatCurrency(line.unitPrice)}</td>
                        <td className="py-4 px-4 text-right text-[10px] font-bold text-secondary-gray">
                          {line.taxable ? 'Yes' : 'No'}
                        </td>
                        <td className="py-4 px-4 text-right text-xs font-black text-primary">{formatCurrency(line.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="mt-8 pt-8 border-t-2 border-secondary-super-light">
                <div className="flex justify-between">
                  <div className="w-1/2">
                    <p className="text-[9px] font-black text-secondary-gray uppercase mb-3 tracking-widest">Delivery Instructions</p>
                    <p className="text-[10px] text-secondary-gray leading-relaxed pr-10 italic">
                      {data.deliveryInstructions || "No special instructions provided for this shipment."}
                    </p>
                    
                    <div className="mt-12 flex gap-8">
                       <div className="flex-1">
                          <p className="text-[8px] font-black text-secondary-gray uppercase mb-2">Prepared By</p>
                          <div className="h-12 border-b border-secondary-light flex items-end pb-1 text-[10px] font-bold text-primary">{data.preparedBy || '---'}</div>
                       </div>
                       <div className="flex-1">
                          <p className="text-[8px] font-black text-secondary-gray uppercase mb-2">Approved By</p>
                          <div className="h-12 border-b border-secondary-light flex items-end pb-1 text-[10px] font-bold text-primary">{data.approvedBy || '---'}</div>
                       </div>
                    </div>
                  </div>

                  <div className="w-72">
                    <div className="space-y-3 bg-white p-6 rounded-2xl border-2 border-secondary-mid shadow-sm">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-secondary-gray uppercase tracking-widest">Sub-Total (HT)</span>
                        <span className="font-black text-primary">{formatCurrency(data.subtotalAmount)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-secondary-gray uppercase tracking-widest">Tax Amount</span>
                        <span className="font-black text-primary">{formatCurrency(data.taxAmount)}</span>
                      </div>

                      <div className="pt-4 border-t border-secondary-super-light flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-secondary-mid">Total Order Value</span>
                        <span className="text-2xl font-black text-secondary-mid">
                          {formatCurrency(data.grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-10 text-center">
                <p className="text-[8px] text-secondary-gray font-bold uppercase tracking-[0.4em]">
                  OFFICIAL PURCHASE ORDER • GENERATED {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderPrintPreviewModal;