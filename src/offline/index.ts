export { offlineDb } from './db/database';
export type * from './db/types';

export { isSessionValidOffline, isTokenExpired, getOfflineSessionInfo } from './auth/jwtSession';
export { isBrowserOnline, isFullyOnline, pingBackendHealth } from './network/connectivity';

export { createOutboxEntry, getOutboxCount, getPendingOutbox, retryOutboxEntry, discardOutboxEntry } from './sync/outbox';
export { processOutbox, startSyncEngine } from './sync/syncEngine';
export { syncReferenceData, getLocalClients, getLocalFournisseurs, getLocalTaxes, getLocalProducts } from './sync/referenceSync';

export { createDevisOffline, updateDevisOffline, pullAndCacheDevis } from './services/devisService';
export { createFactureOffline, updateFactureOffline, pullAndCacheFactures } from './services/factureService';
export { createPaiementOffline, getLocalPaiements, pullAndCachePaiements } from './services/paiementService';
export { createProformaOffline, updateProformaOffline, pullAndCacheProformas } from './services/proformaService';
export { createBonCommandeOffline, updateBonCommandeOffline, pullAndCacheBonCommandes } from './services/bonCommandeService';
export { createBonLivraisonOffline, updateBonLivraisonOffline, pullAndCacheBonLivraisons } from './services/bonLivraisonService';
export { createNoteCreditOffline, updateNoteCreditOffline, pullAndCacheNoteCredits } from './services/noteCreditService';
export { createBonAchatOffline, updateBonAchatOffline, pullAndCacheBonAchats } from './services/bonAchatService';
export { createBackOrderOffline, updateBackOrderOffline, pullAndCacheBackOrders } from './services/backOrderService';
export { createFactureFournisseurOffline, updateFactureFournisseurOffline, pullAndCacheFacturesFournisseur } from './services/factureFournisseurService';
export { createBonReceptionOffline, updateBonReceptionOffline, pullAndCacheBonReceptions } from './services/bonReceptionService';
export { getClientsOfflineFirst, getFournisseursOfflineFirst, getProductsOfflineFirst } from './services/referenceService';

export { useOnlineStatus } from './hooks/useOnlineStatus';
export { useOutboxCount, useOutboxEntries, usePendingSyncCount } from './hooks/useOutboxCount';
export { default as OfflineProvider } from './providers/OfflineProvider';
