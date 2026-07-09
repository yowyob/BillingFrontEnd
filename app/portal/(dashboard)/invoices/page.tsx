"use client";

import React, { useEffect, useState } from "react";
import { PortalApi } from "@/src/api/portalApi";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import InvoicePreviewModal from "./InvoicePreviewModal";

const COLUMNS = ["Invoice #", "Date", "Due Date", "Status", "Total", "Remaining"];

const STATUS_STYLES: Record<string, string> = {
  PAYEE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  PAID: "bg-emerald-50 text-emerald-600 border-emerald-200",
  EN_RETARD: "bg-red-50 text-red-500 border-red-200",
  OVERDUE: "bg-red-50 text-red-500 border-red-200",
  EN_ATTENTE: "bg-amber-50 text-amber-600 border-amber-200",
  PENDING: "bg-amber-50 text-amber-600 border-amber-200",
};

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    PortalApi.getInvoices()
      .then(setInvoices)
      .catch((err) => console.error("Failed to load invoices", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary tracking-tight">Invoices</h1>
        <p className="text-secondary-gray text-sm font-medium">Invoices issued to your account.</p>
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
              ) : invoices.length === 0 ? (
                <EmptyState title="No invoices yet" message="Invoices issued to you will appear here." />
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.idFacture}
                    onClick={() => setSelected(inv)}
                    className="hover:bg-secondary-super-light/40 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-5 font-black text-primary">{inv.numeroFacture}</td>
                    <td className="px-8 py-5 text-sm text-secondary-gray font-bold">
                      {inv.dateFacturation ? new Date(inv.dateFacturation).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-8 py-5 text-sm text-secondary-gray font-bold">
                      {inv.dateEcheance ? new Date(inv.dateEcheance).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 w-fit rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[inv.etat] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {inv.etat}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-primary">
                      {inv.montantTTC?.toLocaleString()} {inv.devise}
                    </td>
                    <td className="px-8 py-5 font-bold text-secondary-gray">
                      {inv.montantRestant?.toLocaleString()} {inv.devise}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvoicePreviewModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        invoice={selected}
      />
    </div>
  );
}
