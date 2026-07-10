import { OpenAPI } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { offlineDb } from '../db/database';
import type { OutboxEntry } from '../db/types';
import { isFullyOnline } from '../network/connectivity';
import {
  getPendingOutbox,
  removeOutboxEntry,
  updateOutboxStatus,
} from './outbox';

let isSyncing = false;
let syncListeners: Array<(count: number) => void> = [];

export const onSyncStatusChange = (listener: (pendingCount: number) => void) => {
  syncListeners.push(listener);
  return () => {
    syncListeners = syncListeners.filter((l) => l !== listener);
  };
};

const notifyListeners = async () => {
  const pending = await getPendingOutbox();
  syncListeners.forEach((l) => l(pending.length));
};

const executeOutboxRequest = async (entry: OutboxEntry): Promise<Response> => {
  const seller = getStoredSeller();
  const base = OpenAPI.BASE || '';
  const url = `${base}${entry.endpoint}`;
  const token = seller?.accessToken ?? '';

  const headers: Record<string, string> = {
    ...entry.headers,
    Accept: 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return fetch(url, {
    method: entry.method,
    headers,
    body: entry.method !== 'DELETE' ? JSON.stringify(entry.payload) : undefined,
  });
};

const markEntitySynced = async (entry: OutboxEntry): Promise<void> => {
  if (!entry.entityId) return;

  const now = new Date().toISOString();
  switch (entry.action) {
    case 'CREATE_DEVIS':
    case 'UPDATE_DEVIS':
    case 'VALIDATE_DEVIS':
    case 'CONVERT_DEVIS':
      await offlineDb.devis.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
    case 'CREATE_FACTURE':
    case 'UPDATE_FACTURE':
    case 'VALIDATE_FACTURE':
    case 'COMPTABILISER_FACTURE':
      await offlineDb.factures.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
    case 'CREATE_PAIEMENT':
      await offlineDb.paiements.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
    case 'CREATE_PROFORMA':
    case 'UPDATE_PROFORMA':
      await offlineDb.proformas.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
    case 'CREATE_BON_COMMANDE':
    case 'UPDATE_BON_COMMANDE':
      await offlineDb.bon_commandes.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
    case 'CREATE_BON_LIVRAISON':
    case 'UPDATE_BON_LIVRAISON':
      await offlineDb.bon_livraisons.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
    case 'CREATE_NOTE_CREDIT':
    case 'UPDATE_NOTE_CREDIT':
      await offlineDb.note_credits.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
    case 'CREATE_BON_ACHAT':
    case 'UPDATE_BON_ACHAT':
      await offlineDb.bon_achats.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
    case 'CREATE_BACK_ORDER':
    case 'UPDATE_BACK_ORDER':
      await offlineDb.back_orders.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
    case 'CREATE_FACTURE_FOURNISSEUR':
    case 'UPDATE_FACTURE_FOURNISSEUR':
      await offlineDb.factures_fournisseur.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
    case 'CREATE_BON_RECEPTION':
    case 'UPDATE_BON_RECEPTION':
      await offlineDb.bon_receptions.update(entry.entityId, { syncStatus: 'synced', updatedAt: now });
      break;
  }
};

const markEntityConflict = async (entry: OutboxEntry, error: string): Promise<void> => {
  if (!entry.entityId) return;

  switch (entry.action) {
    case 'CREATE_DEVIS':
    case 'UPDATE_DEVIS':
    case 'VALIDATE_DEVIS':
    case 'CONVERT_DEVIS':
      await offlineDb.devis.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
    case 'CREATE_FACTURE':
    case 'UPDATE_FACTURE':
    case 'VALIDATE_FACTURE':
    case 'COMPTABILISER_FACTURE':
      await offlineDb.factures.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
    case 'CREATE_PAIEMENT':
      await offlineDb.paiements.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
    case 'CREATE_PROFORMA':
    case 'UPDATE_PROFORMA':
      await offlineDb.proformas.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
    case 'CREATE_BON_COMMANDE':
    case 'UPDATE_BON_COMMANDE':
      await offlineDb.bon_commandes.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
    case 'CREATE_BON_LIVRAISON':
    case 'UPDATE_BON_LIVRAISON':
      await offlineDb.bon_livraisons.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
    case 'CREATE_NOTE_CREDIT':
    case 'UPDATE_NOTE_CREDIT':
      await offlineDb.note_credits.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
    case 'CREATE_BON_ACHAT':
    case 'UPDATE_BON_ACHAT':
      await offlineDb.bon_achats.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
    case 'CREATE_BACK_ORDER':
    case 'UPDATE_BACK_ORDER':
      await offlineDb.back_orders.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
    case 'CREATE_FACTURE_FOURNISSEUR':
    case 'UPDATE_FACTURE_FOURNISSEUR':
      await offlineDb.factures_fournisseur.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
    case 'CREATE_BON_RECEPTION':
    case 'UPDATE_BON_RECEPTION':
      await offlineDb.bon_receptions.update(entry.entityId, { syncStatus: 'conflict', updatedAt: new Date().toISOString() });
      break;
  }
  console.error(`[Sync] Conflict on ${entry.action}:`, error);
};

export const processOutbox = async (): Promise<{ synced: number; failed: number }> => {
  if (isSyncing) return { synced: 0, failed: 0 };

  const online = await isFullyOnline();
  if (!online) return { synced: 0, failed: 0 };

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const pending = await getPendingOutbox();

    for (const entry of pending) {
      await updateOutboxStatus(entry.id, 'SYNCING');

      try {
        const response = await executeOutboxRequest(entry);

        if (response.ok) {
          await removeOutboxEntry(entry.id);
          await markEntitySynced(entry);
          synced++;
          continue;
        }

        const isNetworkError = response.status === 503 || response.status === 502 || response.status === 504;
        const errorText = await response.text().catch(() => response.statusText);

        if (isNetworkError) {
          await updateOutboxStatus(entry.id, 'PENDING', errorText);
          break;
        }

        if (response.status >= 400) {
          await updateOutboxStatus(entry.id, 'CONFLICT', errorText);
          await markEntityConflict(entry, errorText);
          failed++;
          continue;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Network error';
        await updateOutboxStatus(entry.id, 'PENDING', message);
        break;
      }
    }
  } finally {
    isSyncing = false;
    await notifyListeners();
  }

  return { synced, failed };
};

export const startSyncEngine = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const runSync = () => {
    processOutbox().catch(console.error);
  };

  runSync();

  const interval = setInterval(runSync, 30_000);

  const handleOnline = () => runSync();
  window.addEventListener('online', handleOnline);

  return () => {
    clearInterval(interval);
    window.removeEventListener('online', handleOnline);
  };
};
