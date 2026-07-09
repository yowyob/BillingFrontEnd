"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getPortalSession, clearPortalSession } from "@/src/api/portalSession";
import {
  Dashboard as DashboardIcon,
  RequestQuote as RequestQuoteIcon,
  Receipt as ReceiptIcon,
  ShoppingBag as PurchaseOrderIcon,
  Description as SupplierInvoiceIcon,
  AddShoppingCart as ProposeIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

const CUSTOMER_ITEMS = [
  { content: "Quotations", Icon: RequestQuoteIcon, path: "/portal/quotations" },
  { content: "Propose a Quotation", Icon: ProposeIcon, path: "/portal/propose-quotation" },
  { content: "Invoices", Icon: ReceiptIcon, path: "/portal/invoices" },
];

const SUPPLIER_ITEMS = [
  { content: "Purchase Orders", Icon: PurchaseOrderIcon, path: "/portal/purchase-orders" },
  { content: "Supplier Invoices", Icon: SupplierInvoiceIcon, path: "/portal/supplier-invoices" },
];

const PortalSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const session = getPortalSession();

  const items = [
    { content: "Dashboard", Icon: DashboardIcon, path: "/portal/dashboard" },
    ...(session?.partyRole === "SUPPLIER" ? SUPPLIER_ITEMS : CUSTOMER_ITEMS),
  ];

  const handleLogout = () => {
    clearPortalSession();
    // Hard navigation, not router.replace — the list pages fetch once on
    // mount ([] deps), so a client-side transition back into the dashboard
    // after logging in as a different client can leave their component
    // instances alive and showing the previous client's stale data.
    window.location.href = "/portal/login";
  };

  return (
    <aside
      className="w-64 flex flex-col bg-white border-r-4 shadow-xl h-full shrink-0"
      style={{ borderColor: "var(--color-secondary-mid)" }}
    >
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white bg-[var(--color-secondary-mid)] shadow-lg shadow-secondary-mid/20">
          B
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Partner Portal</p>
          <p className="text-sm font-bold text-gray-800 truncate max-w-[9rem]">{session?.name || "—"}</p>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-3">
        {items.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.Icon;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${isActive
                    ? "bg-[var(--color-secondary-mid)] text-white font-bold shadow-lg shadow-secondary-mid/30 translate-x-1"
                    : "text-gray-500 hover:bg-[var(--color-secondary-super-light)] hover:text-[var(--color-secondary-mid)] hover:translate-x-1"
                  }`}
              >
                <Icon
                  fontSize="small"
                  className={isActive ? "text-white" : "text-gray-400 group-hover:text-secondary-mid"}
                />
                <span className="text-sm tracking-tight">{item.content}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogoutIcon fontSize="small" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default PortalSidebar;
