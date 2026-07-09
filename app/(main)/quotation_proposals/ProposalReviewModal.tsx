'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { QuotationProposalsService } from '@/src/src2/api';

interface ProposalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: any;
  onDecided: (id: string, statut: string, commentary?: string) => void;
}

const ProposalReviewModal: React.FC<ProposalReviewModalProps> = ({ isOpen, onClose, proposal, onDecided }) => {
  const [commentary, setCommentary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !proposal) return null;

  const isPending = proposal.statut === 'BROUILLON';

  const handleDecision = async (accept: boolean) => {
    setIsSubmitting(true);
    try {
      if (accept) {
        await QuotationProposalsService.accept(proposal.idProposal, commentary || undefined);
        toast.success('Proposal accepted.');
        onDecided(proposal.idProposal, 'ACCEPTED', commentary || undefined);
      } else {
        await QuotationProposalsService.reject(proposal.idProposal, commentary || undefined);
        toast.success('Proposal rejected.');
        onDecided(proposal.idProposal, 'REJECTED', commentary || undefined);
      }
      onClose();
    } catch (err) {
      toast.error('Failed to record your decision. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-secondary">Proposal {proposal.numeroProposal}</p>
            <p className="text-xs text-gray-400 font-bold">{proposal.nomClient}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400">Product</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 text-center">Tier</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 text-center">Qty</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(proposal.lignesProposal ?? []).map((line: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">{line.nomProduit}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase">
                      {line.saleSize}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-600">{line.quantite}</td>
                  <td className="px-4 py-3 text-right font-black text-secondary">{line.montantTotal?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase">Total HT</p>
              <p className="text-lg font-black text-secondary">{proposal.montantHT?.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase">VAT</p>
              <p className="text-lg font-black text-secondary">{proposal.montantTVA?.toLocaleString()}</p>
            </div>
            <div className="bg-secondary-mid/10 rounded-xl p-4">
              <p className="text-[10px] font-black text-secondary-mid uppercase">Total TTC</p>
              <p className="text-lg font-black text-secondary-mid">{proposal.montantTTC?.toLocaleString()} {proposal.devise}</p>
            </div>
          </div>

          {proposal.commentary && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Client's Note</p>
              <p className="text-sm text-amber-800">{proposal.commentary}</p>
            </div>
          )}

          {isPending && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">
                Feedback for the client (optional)
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm"
                rows={3}
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="e.g. Approved — will be converted to a formal quotation shortly."
              />
            </div>
          )}
        </div>

        {isPending && (
          <div className="p-6 border-t border-gray-100 flex justify-end gap-4">
            <button
              onClick={() => handleDecision(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-black text-sm transition-all"
            >
              <XCircle size={16} /> Reject
            </button>
            <button
              onClick={() => handleDecision(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-lg transition-all"
            >
              <CheckCircle2 size={16} /> Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalReviewModal;
