import Dexie, { type Table } from 'dexie';
import type {
  LocalBackOrder,
  LocalBonAchat,
  LocalBonCommande,
  LocalBonLivraison,
  LocalBonReception,
  LocalDevis,
  LocalFacture,
  LocalFactureFournisseur,
  LocalNoteCredit,
  LocalPaiement,
  LocalProduct,
  LocalProforma,
  LocalTaxe,
  LocalTiersClient,
  LocalTiersFournisseur,
  OutboxEntry,
} from './types';

export class BillingOfflineDB extends Dexie {
  tiers_clients!: Table<LocalTiersClient, string>;
  tiers_fournisseurs!: Table<LocalTiersFournisseur, string>;
  taxes!: Table<LocalTaxe, string>;
  devis!: Table<LocalDevis, string>;
  factures!: Table<LocalFacture, string>;
  paiements!: Table<LocalPaiement, string>;
  proformas!: Table<LocalProforma, string>;
  bon_commandes!: Table<LocalBonCommande, string>;
  bon_livraisons!: Table<LocalBonLivraison, string>;
  note_credits!: Table<LocalNoteCredit, string>;
  bon_achats!: Table<LocalBonAchat, string>;
  back_orders!: Table<LocalBackOrder, string>;
  products!: Table<LocalProduct, string>;
  factures_fournisseur!: Table<LocalFactureFournisseur, string>;
  bon_receptions!: Table<LocalBonReception, string>;
  outbox!: Table<OutboxEntry, string>;

  constructor() {
    super('BillingOfflineDB');

    this.version(1).stores({
      tiers_clients: 'idClient, organizationId, raisonSociale, actif',
      tiers_fournisseurs: 'idFournisseur, organizationId, raisonSociale, actif',
      taxes: 'id, organizationId, code',
      devis: 'idDevis, organizationId, idClient, statut, syncStatus, dateCreation',
      factures: 'idFacture, organizationId, idClient, statut, syncStatus, dateFacture',
      paiements: 'idPaiement, organizationId, idFacture, idClient, syncStatus',
      outbox: 'id, status, timestamp, organizationId, action',
    });

    this.version(2).stores({
      proformas: 'idFactureProforma, organizationId, idClient, statut, syncStatus, dateCreation',
      bon_commandes: 'idBonCommande, organizationId, idClient, statut, syncStatus, dateCommande',
      bon_livraisons: 'idBonLivraison, organizationId, idClient, statut, syncStatus, dateLivraison',
    });

    this.version(3).stores({
      note_credits: 'idNoteCredit, organizationId, idClient, statut, syncStatus, dateEmission',
      bon_achats: 'idBonAchat, organizationId, supplierId, statut, syncStatus, dateBonAchat',
      back_orders: 'idBackOrder, organizationId, idBonLivraison, statut, syncStatus, dateCreation',
    });

    this.version(4).stores({
      products: 'idProduit, organizationId, nomProduit, categorie, active',
    });

    this.version(5).stores({
      factures_fournisseur: 'idFactureFournisseur, organizationId, idFournisseur, statut, syncStatus, dateFacture',
      bon_receptions: 'idBonReception, organizationId, idFournisseur, statut, syncStatus, dateReception',
    });
  }
}

export const offlineDb = new BillingOfflineDB();

export const getOrgFilter = (organizationId: string) =>
  (entity: { organizationId: string }) => entity.organizationId === organizationId;
