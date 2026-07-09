"use client";

import React, { useEffect, useState } from "react";
import { PortalApi } from "@/src/api/portalApi";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import PurchaseOrderActionModal from "./PurchaseOrderActionModal";

const COLUMNS = ["Order #", "Date", "Expected Delivery", "Status", "Total"];

const VISIBLE_STATUSES = new Set(["ENVOYE", "ACCEPTE", "REJETE"]);

const STATUS_STYLES: Record<string, string> = {
  ACCEPTE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  REJETE: "bg-red-50 text-red-500 border-red-200",
  ENVOYE: "bg-blue-50 text-blue-600 border-blue-200",
};

export default function PortalPurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    PortalApi.getPurchaseOrders()
      .then(setOrders)
      .catch((err) => console.error("Failed to load purchase orders", err))
      .finally(() => setLoading(false));
  }, []);

  const visibleOrders = orders.filter((po) => VISIBLE_STATUSES.has(po.status));

  const handleStatusChange = (id: string, status: string) => {
    setOrders((prev) => prev.map((po) => (po.idBonAchat === id ? { ...po, status } : po)));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary tracking-tight">Purchase Orders</h1>
        <p className="text-secondary-gray text-sm font-medium">Purchase orders placed with you as a supplier.</p>
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
              ) : visibleOrders.length === 0 ? (
                <EmptyState title="No purchase orders yet" message="Orders placed with you will appear here." />
              ) : (
                visibleOrders.map((po) => (
                  <tr
                    key={po.idBonAchat}
                    onClick={() => setSelected(po)}
                    className="hover:bg-secondary-super-light/40 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-5 font-black text-primary">{po.numeroBonAchat}</td>
                    <td className="px-8 py-5 text-sm text-secondary-gray font-bold">
                      {po.dateBonAchat ? new Date(po.dateBonAchat).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-8 py-5 text-sm text-secondary-gray font-bold">
                      {po.dateLivraisonPrevue ? new Date(po.dateLivraisonPrevue).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 w-fit rounded-lg text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[po.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-primary">
                      {po.grandTotal?.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PurchaseOrderActionModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        order={selected}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
