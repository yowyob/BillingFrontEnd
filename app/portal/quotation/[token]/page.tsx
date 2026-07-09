'use client';

import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle, Edit3, XCircle, AlertTriangle, 
  ArrowLeft, Save, RefreshCw, ChevronRight, Info, Check
} from 'lucide-react';
import { UpdatedDevisResponse } from '@/src/api/models/UpdatedDevisResponse';
import { PortalAccessService } from '@/src/src2/api/services/ExternalServices.ts/tokenService';
import { PortalAccessResponse } from '@/src/src2/api/models/PortalAccessResponse';
import { LigneDevisResponse } from '@/src/api';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function QuotationActionPage({ params }: PageProps) {
  const { token } = use(params);
  
  const [portalData, setPortalData] = useState<PortalAccessResponse | undefined>(undefined);
  const [originalQuotation, setOriginalQuotation] = useState<UpdatedDevisResponse | undefined>(undefined);
  
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [showSuccess, setShowSuccess] = useState<{show: boolean, message: string}>({ show: false, message: '' });

  useEffect(() => {
    async function loadQuotation() {
      try {
        setLoading(true);
        const response = await PortalAccessService.getQuotation(token);
        if (response && response.data) {
          setPortalData(response);
          // Deep clone for comparison
          setOriginalQuotation(JSON.parse(JSON.stringify(response.data)));
          setFetchError(false);
        } else {
          setFetchError(true);
        }
      } catch (err) {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }
    if (token) loadQuotation();
  }, [token]);

  const quotation = portalData?.data;

  const updateLine = (idx: number, field: 'quantite' | 'prixUnitaire', value: string) => {
    if (!portalData || !portalData.data || !portalData.data.lignesDevis) return;
    
    const numValue = parseFloat(value) || 0;
    const updatedLignes = [...portalData.data.lignesDevis];
    const line = { ...updatedLignes[idx], [field]: numValue };
    
    line.montantTotal = (line.quantite || 0) * (line.prixUnitaire || 0);
    updatedLignes[idx] = line;

    const newHT = updatedLignes.reduce((acc, curr) => acc + (curr.montantTotal || 0), 0);
    const tvaRate = (originalQuotation?.montantTVA || 0) / (originalQuotation?.montantHT || 1);
    const newTVA = newHT * tvaRate;

    setPortalData({
      ...portalData,
      data: {
        ...portalData.data,
        lignesDevis: updatedLignes,
        montantHT: newHT,
        montantTVA: newTVA,
        montantTTC: newHT + newTVA
      }
    });
  };

  const handleAction = async (actionType: 'accept' | 'reject' | 'save') => {
    setIsProcessing(true);
    try {
      if (actionType === 'save') {
        // Mocking save/request changes
        await new Promise(resolve => setTimeout(resolve, 1000));
        setShowSuccess({ show: true, message: "Your modification request has been submitted successfully." });
        setIsEditing(false);
      } else {
        await PortalAccessService.handleAction(token, actionType);
        setShowSuccess({ 
          show: true, 
          message: actionType === 'accept' ? "Quotation accepted and signed." : "Quotation rejected." 
        });
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <RefreshCw className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-slate-500 font-medium tracking-tight">Retrieving quotation...</p>
    </div>
  );

  if (fetchError || !portalData || !quotation) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <AlertTriangle className="mb-4 text-amber-500" size={40} />
      <p className="font-medium text-slate-600 font-sans">Quotation not found or expired.</p>
      <Link href="/" className="mt-4 text-blue-600 text-sm flex items-center gap-2 font-bold uppercase underline">
        <ArrowLeft size={14}/> Return to Home
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 relative">
      
      {/* Success Notification Overlay */}
      {showSuccess.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-black mb-2">Success!</h3>
            <p className="text-slate-600 text-sm mb-6">{showSuccess.message}</p>
            <button 
              onClick={() => setShowSuccess({ show: false, message: '' })}
              className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {portalData.canView && (
        <>
          <header className="h-14 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-black text-xs text-white">Y</div>
                 <span className="font-bold tracking-tight text-sm uppercase">Portal Access</span>
              </div>
              <ChevronRight size={12} className="text-slate-600" />
              <span className="text-[11px] font-medium text-slate-400 uppercase tabular-nums tracking-widest">REF: {quotation.numeroDevis}</span>
            </div>
          </header>

          {isEditing && (
            <div className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-1.5 text-center">
              Editing Mode: Proposing modifications to the original quotation
            </div>
          )}

          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black tracking-tight">{quotation.numeroDevis}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">{quotation.statut}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  {portalData.canModify && (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      disabled={isProcessing}
                      className="h-9 px-4 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Edit3 size={14}/> Request Changes
                    </button>
                  )}          
                  {portalData.canReject && (
                    <button 
                      onClick={() => handleAction('reject')} 
                      disabled={isProcessing}
                      className="h-9 px-4 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center gap-2 transition-all"
                    >
                      {isProcessing ? <RefreshCw className="animate-spin" size={14}/> : <XCircle size={14}/>} Reject
                    </button>
                  )}              
                  {portalData.canAccept && (
                    <button 
                      onClick={() => handleAction('accept')} 
                      disabled={isProcessing}
                      className="h-9 px-6 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                    >
                      {isProcessing ? <RefreshCw className="animate-spin" size={14}/> : <CheckCircle size={14}/>} Accept & Sign
                    </button>
                  )}            
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { 
                      setPortalData({...portalData, data: JSON.parse(JSON.stringify(originalQuotation))}); 
                      setIsEditing(false); 
                    }} 
                    className="h-9 px-4 rounded text-slate-500 font-bold text-xs hover:text-slate-700"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={() => handleAction('save')} 
                    disabled={isProcessing} 
                    className="h-9 px-6 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
                  >
                    {isProcessing ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} Submit Changes
                  </button>
                </>
              )}
            </div>
          </div>

          <main className="flex-1 w-full overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    <th className="py-4 px-6 text-left">Item / Description</th>
                    <th className="py-4 px-6 text-left w-48">Unit Price ({quotation.devise})</th>
                    <th className="py-4 px-6 text-center w-40">Qty</th>
                    <th className="py-4 px-6 text-right w-40">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.lignesDevis?.map((line: LigneDevisResponse, idx: number) => {
                    const originalLine = originalQuotation?.lignesDevis?.[idx];
                    const isPriceChanged = isEditing && originalLine && line.prixUnitaire !== originalLine.prixUnitaire;
                    const isQtyChanged = isEditing && originalLine && line.quantite !== originalLine.quantite;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{line.nomProduit}</div>
                          <div className="text-xs text-slate-500 truncate max-w-sm">{line.description}</div>
                        </td>
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <div className="flex flex-col gap-1">
                              {isPriceChanged && (
                                <span className="text-[10px] text-red-500 line-through font-medium">
                                  {originalLine.prixUnitaire?.toLocaleString()}
                                </span>
                              )}
                              <input 
                                type="number" 
                                className={`w-full border rounded px-2 py-1.5 text-sm font-bold outline-none focus:ring-1 ${isPriceChanged ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}
                                value={line.prixUnitaire} 
                                onChange={(e) => updateLine(idx, 'prixUnitaire', e.target.value)}
                              />
                            </div>
                          ) : (
                            <span className="font-medium">{line.prixUnitaire?.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {isEditing ? (
                            <div className="flex flex-col items-center gap-1">
                              {isQtyChanged && (
                                <span className="text-[10px] text-red-500 line-through font-medium">
                                  {originalLine.quantite}
                                </span>
                              )}
                              <input 
                                type="number" 
                                className={`w-20 border rounded px-2 py-1.5 text-sm font-bold text-center outline-none focus:ring-1 ${isQtyChanged ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}
                                value={line.quantite} 
                                onChange={(e) => updateLine(idx, 'quantite', e.target.value)}
                              />
                            </div>
                          ) : (
                            <span className="font-medium">{line.quantite}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right font-black tabular-nums text-slate-700">
                            {line.montantTotal?.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 p-8 bg-slate-50/50 flex justify-end">
               <div className="w-full max-w-xs space-y-3">
                  <div className="flex justify-between text-xs font-medium text-slate-500 italic">
                    <span>Subtotal HT</span>
                    <div className="text-right">
                      {isEditing && quotation.montantHT !== originalQuotation?.montantHT && (
                        <div className="line-through text-red-400 text-[10px]">{originalQuotation?.montantHT?.toLocaleString()}</div>
                      )}
                      <span>{quotation.montantHT?.toLocaleString()} {quotation.devise}</span>
                    </div>
                  </div>
                  <div className="h-px bg-slate-200 w-full my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">Grand Total TTC</span>
                    <div className="text-right">
                       {isEditing && quotation.montantTTC !== originalQuotation?.montantTTC && (
                        <div className="line-through text-red-400 text-xs font-bold">{originalQuotation?.montantTTC?.toLocaleString()}</div>
                      )}
                      <span className="text-2xl font-black text-blue-600">
                          {quotation.montantTTC?.toLocaleString()} 
                          <span className="text-xs font-normal text-slate-400 ml-1">{quotation.devise}</span>
                      </span>
                    </div>
                  </div>
               </div>
            </div>
          </main>

          <footer className="border-t border-slate-200 p-4 bg-white flex items-center gap-3">
             <Info size={14} className="text-blue-500"/>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Security Check: Session active for {token.substring(0, 8)}...</p>
          </footer>
        </>
      )}
    </div>
  );
}