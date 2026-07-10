'use client';

import { useEffect, useState } from 'react';
import { isBrowserOnline, pingBackendHealth, subscribeToConnectivity } from '../network/connectivity';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isBackendReachable, setIsBackendReachable] = useState(true);

  useEffect(() => {
    setIsOnline(isBrowserOnline());

    const checkBackend = async () => {
      if (!isBrowserOnline()) {
        setIsBackendReachable(false);
        return;
      }
      const reachable = await pingBackendHealth();
      setIsBackendReachable(reachable);
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30_000);

    const unsubscribe = subscribeToConnectivity((online) => {
      setIsOnline(online);
      if (online) checkBackend();
      else setIsBackendReachable(false);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return {
    isOnline,
    isBackendReachable,
    isFullyOnline: isOnline && isBackendReachable,
  };
};
