export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'failed' | 'conflict';

export type OutboxStatus = 'PENDING' | 'SYNCING' | 'FAILED' | 'CONFLICT';

export type OutboxAction =
  | 'CREATE_DEVIS'
  | 'UPDATE_DEVIS'
  | 'VALIDATE_DEVIS'
  | 'CONVERT_DEVIS'
  | 'CREATE_FACTURE'
  | 'UPDATE_FACTURE'
  | 'VALIDATE_FACTURE'
  | 'COMPTABILISER_FACTURE'
  | 'CREATE_PAIEMENT'
  | 'CREATE_PROFORMA'
  | 'UPDATE_PROFORMA'
  | 'CREATE_BON_COMMANDE'
  | 'UPDATE_BON_COMMANDE'
  | 'CREATE_BON_LIVRAISON'
  | 'UPDATE_BON_LIVRAISON'
  | 'CREATE_NOTE_CREDIT'
  | 'UPDATE_NOTE_CREDIT'
  | 'CREATE_BON_ACHAT'
  | 'UPDATE_BON_ACHAT'
  | 'CREATE_BACK_ORDER'
  | 'UPDATE_BACK_ORDER'
  | 'CREATE_FACTURE_FOURNISSEUR'
  | 'UPDATE_FACTURE_FOURNISSEUR'
  | 'CREATE_BON_RECEPTION'
  | 'UPDATE_BON_RECEPTION';

export interface BaseLocalEntity {
  organizationId: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LocalTiersClient extends BaseLocalEntity {
  idClient: string;
  raisonSociale?: string;
  numeroTva?: string;
  limiteCredit?: number;
  soldeCourant?: number;
  codeClient?: string;
  actif?: boolean;
  email?: string;
  telephone?: string;
  adresse?: string;
  username?: string;
  categorie?: string;
  siteWeb?: string;
  allowedSaleSizes?: string[];
  typeClient?: string;
  ntva?: boolean;
  [key: string]: unknown;
}

export interface LocalTiersFournisseur extends BaseLocalEntity {
  idFournisseur: string;
  raisonSociale?: string;
  codeFournisseur?: string;
  actif?: boolean;
  email?: string;
  telephone?: string;
  adresse?: string;
  username?: string;
  categorie?: string;
  siteWeb?: string;
  allowedSaleSizes?: string[];
  typeFournisseur?: string;
  ntva?: boolean;
  [key: string]: unknown;
}

export interface LocalProduct extends BaseLocalEntity {
  idProduit: string;
  nomProduit?: string;
  typeProduit?: string;
  prixVente?: number;
  cout?: number;
  categorie?: string;
  reference?: string;
  codeBarre?: string;
  photo?: string;
  active?: boolean;
  uom?: string;
  allowedSaleSizes?: unknown[];
  activePromotions?: unknown[];
  stockQuantity?: number;
  availableQuantity?: number;
  reservedQuantity?: number;
  [key: string]: unknown;
}

export interface LocalTaxe extends BaseLocalEntity {
  id: string;
  code?: string;
  taux?: number;
  description?: string;
  nomTaxe?: string;
  calculTaxe?: number;
  actif?: boolean;
}

export interface LocalDevis extends BaseLocalEntity {
  idDevis: string;
  codeDevis?: string;
  numeroDevis?: string;
  idClient: string;
  dateCreation: string;
  dateValidite?: string;
  statut: string;
  montantHt: number;
  montantTtc: number;
  montantHT?: number;
  montantTTC?: number;
  montantTVA?: number;
  lignes: unknown[];
  lignesDevis?: unknown[];
  nomClient?: string;
  agencyId?: string;
  createdBy?: string;
  [key: string]: unknown;
}

export interface LocalFacture extends BaseLocalEntity {
  idFacture: string;
  codeFacture?: string;
  numeroFacture?: string;
  idClient: string;
  dateFacture: string;
  dateFacturation?: string;
  dateEcheance?: string;
  statut: string;
  etat?: string;
  montantHt: number;
  montantTtc: number;
  montantHT?: number;
  montantTTC?: number;
  montantTVA?: number;
  montantRestant: number;
  lignes: unknown[];
  lignesFacture?: unknown[];
  nomClient?: string;
  agencyId?: string;
  createdBy?: string;
  [key: string]: unknown;
}

export interface LocalPaiement extends BaseLocalEntity {
  idPaiement: string;
  idFacture: string;
  idClient: string;
  montant: number;
  datePaiement: string;
  date?: string;
  modePaiement: string;
  journal?: string;
  agencyId?: string;
  [key: string]: unknown;
}

export interface LocalProforma extends BaseLocalEntity {
  idFactureProforma: string;
  numeroProformaInvoice?: string;
  idClient: string;
  dateCreation: string;
  statut: string;
  montantHt: number;
  montantTtc: number;
  montantHT?: number;
  montantTTC?: number;
  montantTVA?: number;
  lignes: unknown[];
  nomClient?: string;
  agencyId?: string;
  createdBy?: string;
  [key: string]: unknown;
}

export interface LocalBonCommande extends BaseLocalEntity {
  idBonCommande: string;
  numeroCommande: string;
  idClient: string;
  dateCommande: string;
  statut: string;
  montantHt: number;
  montantTtc: number;
  montantHT?: number;
  montantTTC?: number;
  lignes: unknown[];
  nomClient?: string;
  agencyId?: string;
  createdBy?: string;
  [key: string]: unknown;
}

export interface LocalBonLivraison extends BaseLocalEntity {
  idBonLivraison: string;
  numeroBonLivraison?: string;
  idClient: string;
  dateLivraison: string;
  statut: string;
  montantHt: number;
  montantTtc: number;
  montantHT?: number;
  montantTTC?: number;
  lignes: unknown[];
  nomClient?: string;
  agencyId?: string;
  createdBy?: string;
  [key: string]: unknown;
}

export interface LocalNoteCredit extends BaseLocalEntity {
  idNoteCredit: string;
  numeroNoteCredit?: string;
  idClient: string;
  dateEmission: string;
  statut: string;
  montantHt: number;
  montantTtc: number;
  montantHT?: number;
  montantTTC?: number;
  montantTVA?: number;
  lignes: unknown[];
  nomClient?: string;
  agencyId?: string;
  createdBy?: string;
  [key: string]: unknown;
}

export interface LocalBonAchat extends BaseLocalEntity {
  idBonAchat: string;
  numeroBonAchat: string;
  supplierId: string;
  dateBonAchat: string;
  statut: string;
  montantHt: number;
  montantTtc: number;
  subtotalAmount?: number;
  grandTotal?: number;
  lignes: unknown[];
  supplierName?: string;
  agencyId?: string;
  createdBy?: string;
  [key: string]: unknown;
}

export interface LocalBackOrder extends BaseLocalEntity {
  idBackOrder: string;
  numeroBackOrder?: string;
  idBonLivraison: string;
  idClient?: string;
  dateCreation: string;
  statut: string;
  lignes: unknown[];
  nomClient?: string;
  agencyId?: string;
  createdBy?: string;
  [key: string]: unknown;
}

export interface LocalFactureFournisseur extends BaseLocalEntity {
  idFactureFournisseur: string;
  numeroFacture?: string;
  idFournisseur?: string;
  nomFournisseur?: string;
  adresseFournisseur?: string;
  emailFournisseur?: string;
  telephoneFournisseur?: string;
  lines: unknown[];
  montantHT?: number;
  montantTVA?: number;
  montantTTC?: number;
  montantTotal?: number;
  modeReglement?: string;
  nbreEcheance?: number;
  montantRestant?: number;
  dateFacture?: string;
  dateEcheance?: string;
  statut: string;
  applyVat?: boolean;
  devise?: string;
  notes?: string;
  pdfPath?: string;
  createdBy?: string;
  idBonReception?: string;
  numeroBonReception?: string;
  dateSysteme?: string;
  agencyId?: string;
  [key: string]: unknown;
}

export interface LocalBonReception extends BaseLocalEntity {
  idBonReception: string;
  numeroReception?: string;
  idFournisseur?: string;
  nomFournisseur?: string;
  lines: unknown[];
  dateReception?: string;
  statut: string;
  notes?: string;
  createdBy?: string;
  dateSysteme?: string;
  numeroBonAchat?: string;
  idBonAchat?: string;
  agenceDeTransport?: string;
  agencyId?: string;
  [key: string]: unknown;
}

export interface OutboxEntry {
  id: string;
  action: OutboxAction;
  payload: Record<string, unknown>;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  timestamp: string;
  status: OutboxStatus;
  attempts: number;
  lastError?: string;
  entityId?: string;
  organizationId: string;
}
