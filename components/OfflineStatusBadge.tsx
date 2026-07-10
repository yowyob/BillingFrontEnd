'use client';

import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/src/offline/hooks/useOnlineStatus';
import { useOutboxCount } from '@/src/offline/hooks/useOutboxCount';
import { processOutbox } from '@/src/offline/sync/syncEngine';

const OfflineStatusBadge = () => {
  const { isOnline, isBackendReachable, isFullyOnline } = useOnlineStatus();
  const outboxCount = useOutboxCount();

  const handleForceSync = () => {
    processOutbox().catch(console.error);
  };

  if (isFullyOnline && outboxCount === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
        <Wifi size={14} className="text-green-600" />
        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">En ligne</span>
      </div>
    );
  }

  if (isOnline && !isBackendReachable) {
    return (
      <button
        onClick={handleForceSync}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-colors"
        title="Serveur inaccessible — données locales utilisées"
      >
        <CloudOff size={14} className="text-yellow-600" />
        <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">
          Serveur indisponible
          {outboxCount > 0 && ` · ${outboxCount} en attente`}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleForceSync}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors"
      title="Mode hors ligne — synchronisation automatique au retour de la connexion"
    >
      <WifiOff size={14} className="text-orange-600" />
      <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
        Hors ligne
        {outboxCount > 0 && ` · ${outboxCount} en attente`}
      </span>
      {outboxCount > 0 && <RefreshCw size={12} className="text-orange-500" />}
    </button>
  );
};

export default OfflineStatusBadge;
