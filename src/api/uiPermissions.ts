import { SellerUIPermissionsResponse } from "../src2/api/models/SellerUIPermissionsResponse";

type SectionKey = keyof Pick<SellerUIPermissionsResponse,
  | "sectionSalesManagement" | "sectionPurchasingLogistics" | "sectionAccountingJournals"
  | "sectionOrganization" | "sectionSettings">;

type PageKey = keyof Omit<SellerUIPermissionsResponse,
  | SectionKey | "id" | "organizationId" | "agencyId" | "sellerId" | "createdAt" | "updatedAt">;

interface PermissionMenuItem {
  path: string;
  key: PageKey;
}

interface PermissionMenuSection {
  sectionKey: SectionKey;
  items: PermissionMenuItem[];
}

// Single source of truth mapping every sidebar path to the UI permission flag that
// gates it — mirrors Sidebar.tsx's MENU_SECTIONS and PermissionsModal.tsx's UI_PERMISSION_GROUPS.
export const PERMISSION_MENU: PermissionMenuSection[] = [
  {
    sectionKey: "sectionSalesManagement",
    items: [
      { path: "/quotations", key: "salesQuotations" },
      { path: "/proforma_invoices", key: "salesProformaInvoice" },
      { path: "/sales_orders", key: "salesSalesOrders" },
      { path: "/invoices", key: "salesInvoices" },
      { path: "/delivery_notes", key: "salesDeliveryNote" },
      { path: "/credit_notes", key: "salesCreditNotes" },
      { path: "/back_orders", key: "salesBackOrders" },
    ],
  },
  {
    sectionKey: "sectionPurchasingLogistics",
    items: [
      { path: "/purchase_orders", key: "purchasingPurchaseOrder" },
      { path: "/goods_rns", key: "purchasingGoodsReceiptNote" },
      { path: "/supplier_invoice", key: "purchasingSupplierInvoice" },
    ],
  },
  {
    sectionKey: "sectionAccountingJournals",
    items: [
      { path: "/journals/quotations", key: "journalsQuotation" },
      { path: "/journals/sales", key: "journalsSaleOrder" },
      { path: "/journals/purchasing", key: "journalsPurchaseOrder" },
      { path: "/journals/payments", key: "journalsClientInvoice" },
      { path: "/journals/audit", key: "journalsSupplierInvoice" },
    ],
  },
  {
    sectionKey: "sectionOrganization",
    items: [
      { path: "/organization/agencies", key: "organizationAgencies" },
      { path: "/organization/sellers", key: "organizationSellers" },
      { path: "/organization/customers", key: "organizationCustomers" },
      { path: "/organization/fournisseurs", key: "organizationSuppliers" },
      { path: "/organization/salespoints", key: "organizationSalePoints" },
      { path: "/organization/sessions", key: "organizationSessions" },
      { path: "/organization/products", key: "organizationProducts" },
    ],
  },
  {
    sectionKey: "sectionSettings",
    items: [
      { path: "/settings", key: "settingsPreferences" },
    ],
  },
];

/** True if the given permission flags allow showing this menu item/path. */
export const isItemAllowed = (
  section: PermissionMenuSection,
  item: PermissionMenuItem,
  uiPermissions: SellerUIPermissionsResponse | null | undefined
): boolean => {
  // Permissions never configured for this seller (legacy/unmigrated data) — fail open
  // rather than silently locking someone out of everything they used to see.
  if (!uiPermissions) return true;
  return !!uiPermissions[section.sectionKey] && !!uiPermissions[item.key];
};

/** True if the given pathname is reachable under the current permissions. Paths not
 * present in PERMISSION_MENU (dashboard, profile, settings root redirects, etc.) are
 * always allowed — only sidebar-linked pages are gated. */
export const hasPageAccess = (
  pathname: string,
  uiPermissions: SellerUIPermissionsResponse | null | undefined
): boolean => {
  if (!uiPermissions) return true;
  for (const section of PERMISSION_MENU) {
    const item = section.items.find((i) => pathname === i.path || pathname.startsWith(i.path + "/"));
    if (item) {
      return isItemAllowed(section, item, uiPermissions);
    }
  }
  return true;
};
