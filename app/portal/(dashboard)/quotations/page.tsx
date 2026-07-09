"use client";

import React, { useEffect, useState } from "react";
import { PortalApi } from "@/src/api/portalApi";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import QuotationActionModal from "./QuotationActionModal";

const COLUMNS = ["Quotation #", "Date", "Status", "Total"];

const VISIBLE_STATUSES = new Set(["ENVOYE", "ACCEPTE", "REFUSE"]);

const STATUS_STYLES: Record<string, string> = {
  ACCEPTE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  REFUSE: "bg-red-50 text-red-500 border-red-200",
  REJECTED: "bg-red-50 text-red-500 border-red-200",
  ENVOYE: "bg-blue-50 text-blue-600 border-blue-200",
  SENT: "bg-blue-50 text-blue-600 border-blue-200",
  BROUILLON: "bg-gray-50 text-gray-500 border-gray-200",
  DRAFT: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function PortalQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    PortalApi.getQuotations()
      .then(setQuotations)
      .catch((err) => console.error("Failed to load quotations", err))
      .finally(() => setLoading(false));
  }, []);

  const visibleQuotations = quotations.filter((q) => VISIBLE_STATUSES.has(q.statut));

  const handleStatusChange = (id: string, status: string) => {
    setQuotations((prev) => prev.map((q) => (q.idDevis === id ? { ...q, statut: status } : q)));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary tracking-tight">Quotations</h1>
        <p className="text-secondary-gray text-sm font-medium">Quotations issued to your account.</p>
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
              ) : visibleQuotations.length === 0 ? (
                <EmptyState title="No quotations yet" message="Quotations sent to you will appear here." />
              ) : (
                visibleQuotations.map((q) => (
                  <tr
                    key={q.idDevis}
                    onClick={() => setSelected(q)}
                    className="hover:bg-secondary-super-light/40 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-5 font-black text-primary">{q.numeroDevis}</td>
                    <td className="px-8 py-5 text-sm text-secondary-gray font-bold">
                      {q.dateCreation ? new Date(q.dateCreation).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 w-fit rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[q.statut] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {q.statut}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-primary">
                      {q.montantTTC?.toLocaleString()} {q.devise}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QuotationActionModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        quotation={selected}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
