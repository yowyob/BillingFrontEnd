import { getPortalSession } from './portalSession';

// Deliberately NOT the generated OpenAPI client — that singleton's TOKEN/HEADERS
// are already claimed by the seller session (src/api/session.ts). The portal
// is a separate auth realm (its own JWT, its own login), so it gets its own
// tiny fetch wrapper instead of fighting over the same global config.
const BASE_URL = 'http://localhost:8080';

async function portalFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getPortalSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }
  // Some account-app services (e.g. ClientUseCase) read the org id out of a
  // reactive context populated only from this header, not from the portal
  // JWT itself — without it they fail with "Organization ID absent du
  // contexte réactif" even though the JWT's organizationId claim is right there.
  if (session?.organizationId) {
    headers['X-Organization-ID'] = session.organizationId;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Several endpoints (accept/reject, etc.) reply 200 with an empty body,
  // not 204 — res.json() on an empty body throws "Unexpected end of JSON
  // input", so read as text first and only parse when there's something there.
  const text = await res.text();
  const body = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    throw new Error((body && body.message) || `Request failed: ${res.status}`);
  }
  return body as T;
}

export interface PortalAuthResponse {
  accessToken: string;
  id: string;
  clientId: string;
  organizationId: string;
  email: string;
  name: string;
  partyRole: 'CUSTOMER' | 'SUPPLIER';
  mustChangePassword: boolean;
}

export const PortalApi = {
  login: (email: string, password: string) =>
    portalFetch<PortalAuthResponse>('/api/portal/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  changePassword: (email: string, currentPassword: string, newPassword: string) =>
    portalFetch<PortalAuthResponse>('/api/portal/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ email, currentPassword, newPassword }),
    }),

  getQuotations: () => portalFetch<any[]>('/api/portal/quotations'),
  getInvoices: () => portalFetch<any[]>('/api/portal/invoices'),
  getPurchaseOrders: () => portalFetch<any[]>('/api/portal/purchase-orders'),
  getSupplierInvoices: () => portalFetch<any[]>('/api/portal/supplier-invoices'),

  acceptQuotation: (id: string) => portalFetch<void>(`/api/portal/quotations/${id}/accept`, { method: 'POST' }),
  rejectQuotation: (id: string) => portalFetch<void>(`/api/portal/quotations/${id}/reject`, { method: 'POST' }),
  acceptPurchaseOrder: (id: string) => portalFetch<void>(`/api/portal/purchase-orders/${id}/accept`, { method: 'POST' }),
  rejectPurchaseOrder: (id: string) => portalFetch<void>(`/api/portal/purchase-orders/${id}/reject`, { method: 'POST' }),

  // Org branding for the print preview (name/logo/address). Not
  // /api/organizations/{id} — that's the account app's own unused local
  // org table and 500s for real Kernel-backed orgs. This resolves branding
  // the same way the seller-login flow does (denormalized onto a Seller row).
  getOrganizationBranding: () => portalFetch<any>('/api/portal/organization'),

  // GET /api/products/organization/{id} has no auth gate (same as
  // /api/organizations/{id}/branding), so it's fetched directly rather than
  // through portalFetch's Bearer-token wrapper.
  getProducts: (organizationId: string) =>
    fetch(`${BASE_URL}/api/products/organization/${organizationId}`).then((res) => {
      if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
      return res.json();
    }),

  // Own client record (allowedSaleSizes, name, etc.) — getClientById by
  // itself is broken for some clients (a pre-existing Kernel-lookup bug), so
  // this goes through the account app's own getAllClients-then-filter route.
  getMyClientInfo: () => portalFetch<any>('/api/portal/me/client'),

  getQuotationProposals: () => portalFetch<any[]>('/api/portal/quotation-proposals'),
  createQuotationProposal: (payload: any) =>
    portalFetch<any>('/api/portal/quotation-proposals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
