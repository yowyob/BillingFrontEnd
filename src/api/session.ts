import { OpenAPI } from '@/src/src2/api';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';

const SELLER_STORAGE_KEY = 'seller';

export const getStoredSeller = (): UpdatedSellerResponse | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(SELLER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UpdatedSellerResponse;
  } catch (e) {
    console.error('Failed to parse stored seller data', e);
    return null;
  }
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SELLER_STORAGE_KEY);
};

export const updateStoredSellerProfileImage = (profileImageUrl: string) => {
  const seller = getStoredSeller();
  if (!seller) return;
  localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify({ ...seller, profileImageUrl }));
};

// The generated client (src/src2/api/core/OpenAPI.ts) hard-codes BASE to
// localhost:8080 — override it here so a deployed build can point at the
// real Billing backend via env var, same convention as MEDIA_FILE_URL/tokenService.
OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Attaches the logged-in seller's access token to every request made
// through the generated API client (FactureService, BackOrderService, etc.).
OpenAPI.TOKEN = async () => getStoredSeller()?.accessToken ?? '';

// Billing's OrganizationFilter reads X-Organization-ID off every request to
// populate the reactive org context (used by Kernel-backed adapters like
// ClientController/AgencyController). Without this, those calls fail with
// "Organization ID absent du contexte réactif".
OpenAPI.HEADERS = async () => ({
  'X-Organization-ID': getStoredSeller()?.organizationId ?? '',
});
