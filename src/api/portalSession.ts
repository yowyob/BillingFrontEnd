const PORTAL_STORAGE_KEY = 'portalSession';

export interface PortalSession {
  accessToken: string;
  id: string;
  clientId: string;
  organizationId: string;
  email: string;
  name: string;
  partyRole: 'CUSTOMER' | 'SUPPLIER';
  mustChangePassword: boolean;
}

export const getPortalSession = (): PortalSession | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(PORTAL_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as PortalSession;
  } catch (e) {
    console.error('Failed to parse stored portal session', e);
    return null;
  }
};

export const setPortalSession = (session: PortalSession) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify(session));
};

export const clearPortalSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PORTAL_STORAGE_KEY);
};
