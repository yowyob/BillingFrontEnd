'use client';

import { useOutboxEntries } from '@/src/offline/hooks/useOutboxCount';
import { discardOutboxEntry, retryOutboxEntry } from '@/src/offline/sync/outbox';
import { processOutbox } from '@/src/offline/sync/syncEngine';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const OutboxPanel = () => {
  const entries = useOutboxEntries() ?? [];
  const conflicts = entries.filter((e) => e.status === 'CONFLICT' || e.status === 'FAILED');

  if (conflicts.length === 0) return null;

  const handleRetry = async (id: string) => {
    await retryOutboxEntry(id);
    await processOutbox();
    toast.success('Synchronisation relancée.');
  };

  const handleDiscard = async (id: string) => {
    await discardOutboxEntry(id);
    toast.info('Élément retiré de la file de synchronisation.');
  };

  return (
    <div className="mx-5 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-amber-600" />
        <h3 className="text-sm font-black text-amber-800 uppercase">
          {conflicts.length} conflit(s) de synchronisation
        </h3>
      </div>
      <ul className="space-y-2">
        {conflicts.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-100">
            <div>
              <p className="text-xs font-bold text-gray-700">{entry.action}</p>
              <p className="text-[10px] text-gray-400 truncate max-w-md">{entry.lastError}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRetry(entry.id)}
                className="p-2 hover:bg-amber-100 rounded-lg text-amber-700"
                title="Réessayer"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => handleDiscard(entry.id)}
                className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                title="Annuler"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OutboxPanel;
