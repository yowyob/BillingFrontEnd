'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { offlineDb } from '@/src/offline/db/database';
import { CloudUpload } from 'lucide-react';

type EntityType = 'devis' | 'factures' | 'paiements' | 'proformas' | 'bon_commandes' | 'bon_livraisons' | 'note_credits' | 'bon_achats' | 'back_orders';

interface Props {
  entityId?: string;
  entityType: EntityType;
}

const SyncStatusIndicator = ({ entityId, entityType }: Props) => {
  const status = useLiveQuery(async () => {
    if (!entityId) return null;

    switch (entityType) {
      case 'devis': {
        const entity = await offlineDb.devis.get(entityId);
        return entity?.syncStatus ?? null;
      }
      case 'factures': {
        const entity = await offlineDb.factures.get(entityId);
        return entity?.syncStatus ?? null;
      }
      case 'paiements': {
        const entity = await offlineDb.paiements.get(entityId);
        return entity?.syncStatus ?? null;
      }
      case 'proformas': {
        const entity = await offlineDb.proformas.get(entityId);
        return entity?.syncStatus ?? null;
      }
      case 'bon_commandes': {
        const entity = await offlineDb.bon_commandes.get(entityId);
        return entity?.syncStatus ?? null;
      }
      case 'bon_livraisons': {
        const entity = await offlineDb.bon_livraisons.get(entityId);
        return entity?.syncStatus ?? null;
      }
      case 'note_credits': {
        const entity = await offlineDb.note_credits.get(entityId);
        return entity?.syncStatus ?? null;
      }
      case 'bon_achats': {
        const entity = await offlineDb.bon_achats.get(entityId);
        return entity?.syncStatus ?? null;
      }
      case 'back_orders': {
        const entity = await offlineDb.back_orders.get(entityId);
        return entity?.syncStatus ?? null;
      }
      default:
        return null;
    }
  }, [entityId, entityType]);

  if (!status || status === 'synced') return null;

  const labels: Record<string, string> = {
    pending: 'En attente de sync',
    syncing: 'Synchronisation...',
    conflict: 'Conflit',
    failed: 'Échec sync',
  };

  const colors: Record<string, string> = {
    pending: 'bg-blue-50 text-blue-600 border-blue-200',
    syncing: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    conflict: 'bg-red-50 text-red-600 border-red-200',
    failed: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${colors[status] ?? colors.pending}`}>
      <CloudUpload size={10} />
      {labels[status] ?? status}
    </span>
  );
};

export default SyncStatusIndicator;
