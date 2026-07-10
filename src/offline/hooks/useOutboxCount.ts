'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { offlineDb } from '../db/database';
import { getStoredSeller } from '@/src/api/session';

export const useOutboxCount = () => {
  const seller = getStoredSeller();
  const orgId = seller?.organizationId;

  const count = useLiveQuery(async () => {
    if (!orgId) return 0;
    const entries = await offlineDb.outbox
      .where('organizationId')
      .equals(orgId)
      .filter((e) => e.status === 'PENDING' || e.status === 'CONFLICT' || e.status === 'FAILED')
      .toArray();
    return entries.length;
  }, [orgId]);

  return count ?? 0;
};

export const useOutboxEntries = () => {
  const seller = getStoredSeller();
  const orgId = seller?.organizationId;

  return useLiveQuery(async () => {
    if (!orgId) return [];
    return offlineDb.outbox
      .where('organizationId')
      .equals(orgId)
      .filter((e) => e.status !== 'SYNCING')
      .sortBy('timestamp');
  }, [orgId]);
};

export const usePendingSyncCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = async () => {
      const seller = getStoredSeller();
      if (!seller?.organizationId) return;

      const [pendingDevis, pendingFactures, pendingPaiements, pendingProformas, pendingBC, pendingBL, pendingNC, pendingBA, pendingBO, outbox] = await Promise.all([
        offlineDb.devis.where('organizationId').equals(seller.organizationId).filter((d) => d.syncStatus === 'pending').count(),
        offlineDb.factures.where('organizationId').equals(seller.organizationId).filter((f) => f.syncStatus === 'pending').count(),
        offlineDb.paiements.where('organizationId').equals(seller.organizationId).filter((p) => p.syncStatus === 'pending').count(),
        offlineDb.proformas.where('organizationId').equals(seller.organizationId).filter((p) => p.syncStatus === 'pending').count(),
        offlineDb.bon_commandes.where('organizationId').equals(seller.organizationId).filter((b) => b.syncStatus === 'pending').count(),
        offlineDb.bon_livraisons.where('organizationId').equals(seller.organizationId).filter((b) => b.syncStatus === 'pending').count(),
        offlineDb.note_credits.where('organizationId').equals(seller.organizationId).filter((n) => n.syncStatus === 'pending').count(),
        offlineDb.bon_achats.where('organizationId').equals(seller.organizationId).filter((b) => b.syncStatus === 'pending').count(),
        offlineDb.back_orders.where('organizationId').equals(seller.organizationId).filter((b) => b.syncStatus === 'pending').count(),
        offlineDb.outbox.where('organizationId').equals(seller.organizationId).filter((e) => e.status === 'PENDING').count(),
      ]);

      setCount(outbox || pendingDevis + pendingFactures + pendingPaiements + pendingProformas + pendingBC + pendingBL + pendingNC + pendingBA + pendingBO);
    };

    update();
    const interval = setInterval(update, 10_000);
    return () => clearInterval(interval);
  }, []);

  return count;
};
