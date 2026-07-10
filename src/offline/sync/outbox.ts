import { offlineDb } from '../db/database';
import type { OutboxAction, OutboxEntry, OutboxStatus } from '../db/types';
import { getStoredSeller } from '@/src/api/session';

export const createOutboxEntry = async (params: {
  action: OutboxAction;
  payload: Record<string, unknown>;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  entityId?: string;
  organizationId?: string;
}): Promise<OutboxEntry> => {
  const seller = getStoredSeller();
  const organizationId = params.organizationId ?? seller?.organizationId ?? '';

  const entry: OutboxEntry = {
    id: crypto.randomUUID(),
    action: params.action,
    payload: params.payload,
    endpoint: params.endpoint,
    method: params.method,
    headers: {
      'X-Organization-ID': organizationId,
      'Content-Type': 'application/json',
    },
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    attempts: 0,
    entityId: params.entityId,
    organizationId,
  };

  await offlineDb.outbox.add(entry);
  return entry;
};

export const getPendingOutbox = async (organizationId?: string): Promise<OutboxEntry[]> => {
  const orgId = organizationId ?? getStoredSeller()?.organizationId;
  const entries = await offlineDb.outbox
    .where('status')
    .equals('PENDING')
    .sortBy('timestamp');

  if (!orgId) return entries;
  return entries.filter((e) => e.organizationId === orgId);
};

export const getOutboxByStatus = async (status: OutboxStatus): Promise<OutboxEntry[]> => {
  return offlineDb.outbox.where('status').equals(status).sortBy('timestamp');
};

export const getOutboxCount = async (organizationId?: string): Promise<number> => {
  const orgId = organizationId ?? getStoredSeller()?.organizationId;
  const pending = await getPendingOutbox(orgId);
  const conflicts = await getOutboxByStatus('CONFLICT');
  const failed = await getOutboxByStatus('FAILED');

  const filterOrg = (entries: OutboxEntry[]) =>
    orgId ? entries.filter((e) => e.organizationId === orgId) : entries;

  return filterOrg(pending).length + filterOrg(conflicts).length + filterOrg(failed).length;
};

export const updateOutboxStatus = async (
  id: string,
  status: OutboxStatus,
  lastError?: string
): Promise<void> => {
  const entry = await offlineDb.outbox.get(id);
  if (!entry) return;

  await offlineDb.outbox.update(id, {
    status,
    lastError,
    attempts: status === 'SYNCING' ? entry.attempts + 1 : entry.attempts,
  });
};

export const removeOutboxEntry = async (id: string): Promise<void> => {
  await offlineDb.outbox.delete(id);
};

export const retryOutboxEntry = async (id: string): Promise<void> => {
  await offlineDb.outbox.update(id, { status: 'PENDING', lastError: undefined });
};

export const updateOutboxPayload = async (
  id: string,
  payload: Record<string, unknown>
): Promise<void> => {
  await offlineDb.outbox.update(id, { payload, status: 'PENDING', lastError: undefined });
};

export const discardOutboxEntry = async (id: string): Promise<void> => {
  await offlineDb.outbox.delete(id);
};
