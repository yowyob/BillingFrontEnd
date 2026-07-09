'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchIcon from "@mui/icons-material/Search"
import { MoreVertical, Eye, ReceiptText } from 'lucide-react'
import { toast } from 'sonner'
import { QuotationProposalsService } from '@/src/src2/api'
import { UpdatedDevisResponse } from '@/src/api/models/UpdatedDevisResponse'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import ActionButton from '@/components/ActionButton'
import ProposalReviewModal from './ProposalReviewModal'

const COLUMNS = ["Proposal #", "Client", "Date", "Status", "Total"];

const STATUS_STYLES: Record<string, string> = {
  ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  REJECTED: "bg-red-50 text-red-500 border-red-200",
  BROUILLON: "bg-amber-50 text-amber-600 border-amber-200",
};

const QuotationProposalsPage = () => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    QuotationProposalsService.getAll()
      .then(setProposals)
      .catch(() => toast.error("Failed to load quotation proposals."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) =>
      p.nomClient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numeroProposal?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, proposals]);

  const handleDecided = (id: string, statut: string, commentary?: string) => {
    setProposals((prev) => prev.map((p) => (p.idProposal === id ? { ...p, statut, commentary: commentary ?? p.commentary } : p)));
  };

  const handleTransformToQuotation = (proposal: any) => {
    setActiveMenuId(null);
    const devis: Partial<UpdatedDevisResponse> = {
      dateCreation: new Date().toISOString(),
      dateValidite: proposal.dateValidite || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      statut: UpdatedDevisResponse.statut.BROUILLON,
      idClient: proposal.idClient,
      nomClient: proposal.nomClient,
      emailClient: proposal.emailClient,
      lignesDevis: (proposal.lignesProposal ?? []).map((l: any) => ({
        quantite: l.quantite,
        description: `${l.nomProduit} - ${l.saleSize}`,
        idProduit: l.idProduit,
        nomProduit: l.nomProduit,
        prixUnitaire: l.prixUnitaire,
        montantTotal: l.montantTotal,
        remiseMontant: 0,
      })),
      montantHT: proposal.montantHT,
      montantTVA: proposal.montantTVA,
      montantTTC: proposal.montantTTC,
      applyVat: proposal.applyVat,
      devise: proposal.devise || 'XAF',
    };
    // The page's own client list is a static mock (pre-existing, unrelated to
    // this feature) — its real idClient wouldn't be found there, so build a
    // minimal client object straight from the proposal's own data instead.
    const client = {
      idClient: proposal.idClient,
      raisonSociale: proposal.nomClient,
      email: proposal.emailClient,
    };

    localStorage.setItem("quotationFromProposal", JSON.stringify(devis));
    localStorage.setItem("quotationClientFromProposal", JSON.stringify(client));
    localStorage.setItem("modalOpen", "open");
    router.push("/quotations");
  };

  return (
    <div className='max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 bg-secondary-super-light/20 min-h-screen'>

      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-secondary text-4xl font-black tracking-tight'>Quotation Proposals</h1>
          <p className='text-gray-500 mt-1 font-medium'>Quotations drafted by clients themselves via the portal, awaiting your review</p>
        </div>

        <div className='flex items-center bg-white border border-secondary-light/50 px-4 py-2.5 rounded-2xl shadow-sm focus-within:border-secondary-mid transition-all w-full md:w-80'>
          <input
            type="text"
            className='border-none outline-none text-gray-700 w-full bg-transparent text-sm font-medium'
            placeholder='Search proposal #, client name...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className='text-secondary-mid' />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {COLUMNS.map((col) => (
                  <th key={col} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="px-6 py-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <TableSkeleton cols={COLUMNS.length + 1} />
              ) : filteredProposals.length === 0 ? (
                <EmptyState title="No proposals yet" message="Quotation proposals submitted by clients will appear here." />
              ) : (
                filteredProposals.map((p) => (
                  <tr key={p.idProposal} className="hover:bg-gray-50/60 transition-all">
                    <td className="px-6 py-4 font-black text-secondary">{p.numeroProposal}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-600">{p.nomClient}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-bold">
                      {p.dateCreation ? new Date(p.dateCreation).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 w-fit rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[p.statut] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {p.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-secondary">
                      {p.montantTTC?.toLocaleString()} {p.devise}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === p.idProposal ? null : p.idProposal)}
                        className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === p.idProposal && (
                        <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                          <ActionButton
                            label="View"
                            onClick={() => { setSelected(p); setActiveMenuId(null); }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-blue-600"
                          >
                            <Eye size={14} />
                          </ActionButton>

                          {p.statut === 'ACCEPTED' && (
                            <ActionButton
                              label="Transform to Quotation"
                              onClick={() => handleTransformToQuotation(p)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-emerald-50 transition-all text-emerald-600"
                            >
                              <ReceiptText size={14} />
                            </ActionButton>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProposalReviewModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        proposal={selected}
        onDecided={handleDecided}
      />
    </div>
  );
};

export default QuotationProposalsPage;
