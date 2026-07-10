import { OpenAPI } from '@/src/src2/api';

let cachedOnline: boolean | null = null;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL_MS = 30_000;

export const isBrowserOnline = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
};

export const pingBackendHealth = async (): Promise<boolean> => {
  if (!isBrowserOnline()) return false;

  const now = Date.now();
  if (cachedOnline !== null && now - lastHealthCheck < HEALTH_CHECK_INTERVAL_MS) {
    return cachedOnline;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const base = OpenAPI.BASE || '';
    const response = await fetch(`${base}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);
    cachedOnline = response.ok;
  } catch {
    cachedOnline = false;
  }

  lastHealthCheck = now;
  return cachedOnline;
};

export const isFullyOnline = async (): Promise<boolean> => {
  if (!isBrowserOnline()) return false;
  return pingBackendHealth();
};

export const invalidateOnlineCache = () => {
  cachedOnline = null;
  lastHealthCheck = 0;
};

export const subscribeToConnectivity = (callback: (online: boolean) => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    invalidateOnlineCache();
    callback(true);
  };
  const handleOffline = () => {
    invalidateOnlineCache();
    callback(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
