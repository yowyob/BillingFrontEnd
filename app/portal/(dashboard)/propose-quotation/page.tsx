"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PortalApi } from "@/src/api/portalApi";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import ProposeQuotationModal from "./ProposeQuotationModal";

const COLUMNS = ["Proposal #", "Date", "Status", "Total", "Seller Feedback"];

const STATUS_STYLES: Record<string, string> = {
  ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  REJECTED: "bg-red-50 text-red-500 border-red-200",
  BROUILLON: "bg-amber-50 text-amber-600 border-amber-200",
};

export default function ProposeQuotationPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    PortalApi.getQuotationProposals()
      .then(setProposals)
      .catch((err) => console.error("Failed to load quotation proposals", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Propose a Quotation</h1>
          <p className="text-secondary-gray text-sm font-medium">Draft your own request — a seller will review it and get back to you.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} /> New Proposal
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-secondary-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-super-light/30 border-b border-secondary-light">
                {COLUMNS.map((col) => (
                  <th key={col} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gray whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <TableSkeleton cols={COLUMNS.length} />
              ) : proposals.length === 0 ? (
                <EmptyState title="No proposals yet" message="Quotations you propose will appear here." />
              ) : (
                proposals.map((p) => (
                  <tr key={p.idProposal} className="hover:bg-secondary-super-light/40 transition-all">
                    <td className="px-8 py-5 font-black text-primary">{p.numeroProposal}</td>
                    <td className="px-8 py-5 text-sm text-secondary-gray font-bold">
                      {p.dateCreation ? new Date(p.dateCreation).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 w-fit rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[p.statut] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {p.statut}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-primary">
                      {p.montantTTC?.toLocaleString()} {p.devise}
                    </td>
                    <td className="px-8 py-5 text-sm text-secondary-gray font-medium max-w-xs truncate">
                      {p.commentary || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProposeQuotationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={load}
      />
    </div>
  );
}
