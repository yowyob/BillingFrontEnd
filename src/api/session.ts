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
