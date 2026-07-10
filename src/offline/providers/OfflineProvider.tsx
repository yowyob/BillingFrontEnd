'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { startSyncEngine } from '../sync/syncEngine';
import { syncReferenceData } from '../sync/referenceSync';
import { subscribeToConnectivity } from '../network/connectivity';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 24 * 60 * 60_000,
      retry: (failureCount, error) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
        return failureCount < 2;
      },
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 1,
    },
  },
});

export default function OfflineProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      const handleOnline = () => setOnline(true);
      const handleOffline = () => setOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    });

    const stopSync = startSyncEngine();

    const unsubConnectivity = subscribeToConnectivity((online) => {
      if (online) {
        syncReferenceData().catch(console.error);
      }
    });

    syncReferenceData().catch(console.error);

    return () => {
      stopSync();
      unsubConnectivity();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
