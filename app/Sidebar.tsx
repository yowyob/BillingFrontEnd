"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStoredSeller } from "@/src/api/session";
import { hasPageAccess } from "@/src/api/uiPermissions";
import {
  Assessment as AssessmentIcon,
  RequestQuote as RequestQuoteIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  AssignmentReturn as CreditNoteIcon,
  CardMembership as StoreCreditIcon,
  LocalShipping as DeliveryIcon,
  Inventory as GoodsReceiptIcon,
  ShoppingBag as PurchaseOrderIcon,
  Description as SupplierInvoiceIcon,
  BusinessCenter as SalesSectionIcon,
  Factory as PurchaseSectionIcon,
  MenuBook as JournalSectionIcon,
  AutoStories as GeneralLedgerIcon,
  HistoryEdu as AuditLogIcon,
  AccountBalanceWallet as PaymentJournalIcon,
  AdminPanelSettings as AdminSectionIcon,
  Apartment as OrganizationIcon,
  Groups as SellersIcon,
  ContactPage as CustomersIcon,
  Warehouse as SuppliersIcon,
  PointOfSale as SalesPointsIcon,
  PlayCircleOutline as SessionsIcon,
  Inventory2 as ProductsIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";

const iconMap: Record<string, React.ElementType> = {
  AssessmentIcon,
  RequestQuoteIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  CreditNoteIcon,
  StoreCreditIcon,
  DeliveryIcon,
  GoodsReceiptIcon,
  PurchaseOrderIcon,
  SupplierInvoiceIcon,
  SalesSectionIcon,
  PurchaseSectionIcon,
  JournalSectionIcon,
  GeneralLedgerIcon,
  AuditLogIcon,
  PaymentJournalIcon,
  AdminSectionIcon,
  OrganizationIcon,
  SellersIcon,
  CustomersIcon,
  SuppliersIcon,
  SalesPointsIcon,
  SessionsIcon,
  ProductsIcon,
  SettingsIcon
};

const MENU_SECTIONS = [
  {
    id: "sales",
    label: "Sales Management",
    icon: "SalesSectionIcon",
    items: [
      { content: "Quotations", Icon: "RequestQuoteIcon", path: "/quotations" },
      { content: "Quotation Proposals", Icon: "RequestQuoteIcon", path: "/quotation_proposals" },
      { content: "Proforma Invoice", Icon: "ReceiptIcon", path: "/proforma_invoices" },
      { content: "Sales Orders", Icon: "ShoppingCartIcon", path: "/sales_orders" },
      { content: "Invoices", Icon: "ReceiptIcon", path: "/invoices" },
      { content: "Delivery Note", Icon: "DeliveryIcon", path: "/delivery_notes" },
      { content: "Credit Notes", Icon: "CreditNoteIcon", path: "/credit_notes" },
      { content: "Back Orders", Icon: "GoodsReceiptIcon", path: "/back_orders" },
    ],
  },
  {
    id: "purchasing",
    label: "Purchasing & Logistics",
    icon: "PurchaseSectionIcon",
    items: [
      { content: "Purchase Order", Icon: "PurchaseOrderIcon", path: "/purchase_orders" },
      { content: "Goods Receipt Note", Icon: "GoodsReceiptIcon", path: "/goods_rns" },
      { content: "Supplier Invoice", Icon: "SupplierInvoiceIcon", path: "/supplier_invoice" },
    ],
  },
  {
    id: "journals",
    label: "Accounting Journals",
    icon: "JournalSectionIcon",
    items: [
       { content: "Quotation Journal", Icon: "GeneralLedgerIcon", path: "/journals/quotations" },
      { content: "Sale Order Journal", Icon: "GeneralLedgerIcon", path: "/journals/sales" },
      { content: "Purchase Order Journal", Icon: "GeneralLedgerIcon", path: "/journals/purchasing" },
      { content: "Client Invoice Journal", Icon: "PaymentJournalIcon", path: "/journals/payments" },
      { content: "Supplier Invoice Journal", Icon: "AuditLogIcon", path: "/journals/audit" },
    ],
  },
  {
    id: "orgs",
    label: "Organization",
    icon: "OrganizationIcon",
    items: [
      { content: "Agencies", Icon: "OrganizationIcon", path: "/organization/agencies" },
      { content: "Sellers", Icon: "SellersIcon", path: "/organization/sellers" },
      { content: "Customers", Icon: "CustomersIcon", path: "/organization/customers" },
      { content: "Suppliers", Icon: "SuppliersIcon", path: "/organization/fournisseurs" },
      { content: "Sale Points", Icon: "SalesPointsIcon", path: "/organization/salespoints" },
      { content: "Sessions", Icon: "SessionsIcon", path: "/organization/sessions" },
      { content: "Products", Icon: "ProductsIcon", path: "/organization/products" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "SettingsIcon",
    items: [
      { content: "Preferences", Icon: "SettingsIcon", path: "/settings" },
    ],
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [openSectionId, setOpenSectionId] = useState<string | null>("sales");

  const handleIconClick = (id: string) => {
    setOpenSectionId(openSectionId === id ? null : id);
  };

  const visibleSections = useMemo(() => {
    const uiPermissions = getStoredSeller()?.uiPermissions;
    return MENU_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => hasPageAccess(item.path, uiPermissions)),
    })).filter((section) => section.items.length > 0);
  }, [pathname]);

  const currentSection = visibleSections.find((s) => s.id === openSectionId);

  return (
    <div className="flex" style={{ height: '100%', minHeight: '100%' }}>
      {/* Icon Rail */}
      <aside
        className="w-16 flex flex-col bg-white border-r-4 shadow-xl z-20"
        style={{ borderColor: "var(--color-secondary-mid)", minHeight: '100%' }}
      >
        <Link href="/dashboard">
          <div className="flex justify-center py-6 border-b border-gray-100 cursor-pointer">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white bg-[var(--color-secondary-mid)] shadow-lg shadow-secondary-mid/20">
              B
            </div>
          </div>
        </Link>

        <nav className="flex-1 flex flex-col items-start py-4">
          {visibleSections.map((section) => {
            const Icon = iconMap[section.icon];
            const isOpen = openSectionId === section.id;
            const isAnyItemActive = section.items.some((item) => pathname === item.path);

            return (
              <button
                key={section.id}
                onClick={() => handleIconClick(section.id)}
                title={section.label}
                className={`w-full h-16 flex items-center justify-center transition-all relative
                  ${isOpen ? "bg-[var(--color-secondary-super-light)] text-[var(--color-secondary-mid)]" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <div
                  className={`w-1 flex h-8 rounded-r-full absolute left-0 transition-all
                  ${isAnyItemActive ? "bg-[var(--color-secondary-mid)]" : "bg-transparent"}`}
                />
                {Icon && <Icon fontSize="medium" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Secondary Panel */}
      <div
        className={`flex flex-col bg-white shadow-2xl border-r transition-all duration-300 ease-in-out overflow-hidden no-scrollbar
          ${openSectionId ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"}`}
        style={{ borderColor: "var(--color-secondary-light)", minHeight: '100%' }}
      >
        {currentSection && (
          <div className="w-64 flex-1 p-6 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
                  {currentSection.label}
                </h2>
                <div className="h-1 w-6 bg-secondary-mid mt-1 rounded-full" />
              </div>
              <button
                onClick={() => setOpenSectionId(null)}
                className="text-gray-300 hover:text-secondary-mid transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-1.5">
              {currentSection.items.map((item) => {
                const ItemIcon = iconMap[item.Icon];
                const isItemActive = pathname === item.path;

                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                      ${
                        isItemActive
                          ? "bg-[var(--color-secondary-mid)] text-white font-bold shadow-lg shadow-secondary-mid/30 translate-x-1"
                          : "text-gray-500 hover:bg-[var(--color-secondary-super-light)] hover:text-[var(--color-secondary-mid)] hover:translate-x-1"
                      }`}
                    >
                      {ItemIcon && (
                        <ItemIcon
                          fontSize="small"
                          className={isItemActive ? "text-white" : "text-gray-400 group-hover:text-secondary-mid"}
                        />
                      )}
                      <span className="text-sm tracking-tight">{item.content}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
