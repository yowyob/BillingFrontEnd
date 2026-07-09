'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { X, Send, ShieldCheck, Check, Mail, Loader2, Eye, Settings2 } from 'lucide-react';
import { UpdatedDevisResponse } from '@/src/api/models/UpdatedDevisResponse';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { toast } from 'sonner';
import { DevisService } from '@/src/src2/api/services/DevisService';
import { EmailRequest } from '@/src/src2/api/models/EmailRequest';
import { generateQuotationHTML } from '@/src/api/printGenerators/quotationPrint';
import { generateQRBase64 } from '@/src/api/Utils/qrCode';

type PermissionsState = { [key: string]: boolean };

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: (permissions: PermissionsState) => void;
  clientEmail: string;
  data?: UpdatedDevisResponse;
}

const EmailPreviewModal = ({ isOpen, onClose, onSend, data, clientEmail }: EmailPreviewModalProps) => {
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings');
  
  const [permissions, setPermissions] = useState<PermissionsState>({
    view: true,
    accept: true,
    reject: true,
    modify: false,
  });

  // 1. Load Seller & Generate Preview HTML
  useEffect(() => {
    if (isOpen && data) {
      const stored = localStorage.getItem("seller");
      const sellerData = stored ? JSON.parse(stored) : null;
      setSeller(sellerData);

      const generatePreview = async () => {
        try {
          const qr = await generateQRBase64(`https://verify.com/${data.idDevis}`, 150);
          const html = generateQuotationHTML(data, sellerData, qr);
          setPreviewHtml(html);
        } catch (e) {
          console.error("Preview generation failed", e);
        }
      };
      generatePreview();
    }
  }, [isOpen, data]);

  const handleFinalSend = async () => {
    if (!data?.idDevis || !seller || !previewHtml) {
      toast.error("Preparation incomplete");
      return;
    }
    setIsSending(true);
    try {
      const emailRequest: EmailRequest = {
        id: data.idDevis.toString(),
        htmlContent: previewHtml,
        organizationRaisonSociale: seller.organizationName,
        canView: permissions.view,
        canAccept: permissions.accept,
        canReject: permissions.reject,
        canModify: permissions.modify,
      };
      await DevisService.sendQuotationEmail(emailRequest);
      toast.success("Quotation sent successfully!");
      if (onSend) onSend(permissions);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Send failed");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      {/* Expanded Modal Width to accommodate Preview */}
      <div className="bg-white w-full max-w-7xl h-[85vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Send Quotation</h3>
              <p className="text-xs text-blue-600 font-semibold">{clientEmail}</p>
            </div>
          </div>

         {/* Toggle Tabs: Visible on mobile/tablet, Hidden on Large screens (Desktop) */}
<div className="flex lg:hidden bg-slate-100 p-0.5 rounded-xl border border-slate-200">
  <button 
    onClick={() => setActiveTab('settings')}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
      activeTab === 'settings' 
        ? 'bg-white shadow-sm text-slate-900' 
        : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <Settings2 size={14} /> 
    Settings
  </button>
  
  <button 
    onClick={() => setActiveTab('preview')}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
      activeTab === 'preview' 
        ? 'bg-white shadow-sm text-slate-900' 
        : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <Eye size={14} /> 
    Preview
  </button>
</div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2"><X size={20} /></button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden bg-slate-50">
          
          {/* Left: Settings (Permissions) - Hidden on mobile if preview active */}
          <div className={`${activeTab === 'settings' ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 border-r border-slate-200 bg-white p-6 flex-col gap-6 overflow-y-auto`}>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-blue-600" />
                Portal Access
              </label>
              {['view', 'accept', 'reject', 'modify'].map((id) => (
                <button
                  key={id}
                  onClick={() => setPermissions(p => ({ ...p, [id]: !p[id] }))}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${permissions[id] ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-100'}`}
                >
                   <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${permissions[id] ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                    {permissions[id] && <Check size={10} strokeWidth={4} />}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 capitalize">{id} Access</span>
                </button>
              ))}
            </div>
            <div className="mt-auto p-4 bg-amber-50 rounded-2xl border border-amber-100">
               <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                 The client will receive a secure link to view and interact with this quotation based on the permissions selected above.
               </p>
            </div>
          </div>

          {/* Right: Live HTML Preview */}
          <div className={`${activeTab === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 p-4 lg:p-8 justify-center overflow-y-auto`}>
            <div className="w-full max-w-[210mm] bg-white shadow-2xl ring-1 ring-slate-200 rounded-sm overflow-hidden h-fit origin-top scale-[0.95] lg:scale-100">
              {previewHtml ? (
                <iframe
                  title="Quotation Preview"
                  srcDoc={previewHtml}
                  className="w-full h-[1100px] border-none"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts"
                />
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-slate-300" size={32} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Generating Preview...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-8 py-4 bg-white border-t border-slate-100 flex justify-end items-center gap-4">
          <button onClick={onClose} className="text-xs font-bold text-slate-400">Cancel</button>
          <button 
            onClick={handleFinalSend}
            disabled={isSending || !previewHtml}
            className="px-8 py-3 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send to Client
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewModal;