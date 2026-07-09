"use client";

import React, { useEffect, useState } from "react";
import { RequestQuote, Receipt, ShoppingBag, Description } from "@mui/icons-material";
import { PortalApi } from "@/src/api/portalApi";
import { getPortalSession } from "@/src/api/portalSession";

const StatCard = ({ label, value, Icon }: { label: string; value: number; Icon: React.ElementType }) => (
  <div className="bg-white rounded-2xl border border-secondary-light shadow-sm p-6 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-secondary-super-light flex items-center justify-center text-secondary-mid">
      <Icon fontSize="medium" />
    </div>
    <div>
      <p className="text-2xl font-black text-primary">{value}</p>
      <p className="text-xs font-bold text-secondary-gray uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

export default function PortalDashboardPage() {
  const session = getPortalSession();
  const isSupplier = session?.partyRole === "SUPPLIER";
  const [counts, setCounts] = useState({ a: 0, b: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaders = isSupplier
      ? [PortalApi.getPurchaseOrders(), PortalApi.getSupplierInvoices()]
      : [PortalApi.getQuotations(), PortalApi.getInvoices()];

    Promise.all(loaders)
      .then(([a, b]) => setCounts({ a: a.length, b: b.length }))
      .catch((err) => console.error("Failed to load dashboard counts", err))
      .finally(() => setLoading(false));
  }, [isSupplier]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary tracking-tight">
          Welcome, {session?.name || "Partner"}
        </h1>
        <p className="text-secondary-gray text-sm font-medium">
          {isSupplier ? "Here's a summary of your supplier account." : "Here's a summary of your customer account."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {loading ? (
          <>
            <div className="h-24 bg-white rounded-2xl border border-secondary-light animate-pulse" />
            <div className="h-24 bg-white rounded-2xl border border-secondary-light animate-pulse" />
          </>
        ) : isSupplier ? (
          <>
            <StatCard label="Purchase Orders" value={counts.a} Icon={ShoppingBag} />
            <StatCard label="Supplier Invoices" value={counts.b} Icon={Description} />
          </>
        ) : (
          <>
            <StatCard label="Quotations" value={counts.a} Icon={RequestQuote} />
            <StatCard label="Invoices" value={counts.b} Icon={Receipt} />
          </>
        )}
      </div>
    </div>
  );
}
