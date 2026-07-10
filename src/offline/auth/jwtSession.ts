import { jwtDecode } from 'jwt-decode';
import { getStoredSeller } from '@/src/api/session';

interface JwtPayload {
  exp?: number;
  sub?: string;
  [key: string]: unknown;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Validates session offline using locally stored JWT.
 * Allows access when offline if token exists and is not expired.
 */
export const isSessionValidOffline = (): boolean => {
  const seller = getStoredSeller();
  if (!seller?.accessToken) return false;
  return !isTokenExpired(seller.accessToken);
};

export const getTokenExpiryDate = (token: string): Date | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return null;
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
};

export const getOfflineSessionInfo = () => {
  const seller = getStoredSeller();
  if (!seller?.accessToken) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(seller.accessToken);
    return {
      seller,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null,
      isExpired: isTokenExpired(seller.accessToken),
      subject: decoded.sub,
    };
  } catch {
    return null;
  }
};
