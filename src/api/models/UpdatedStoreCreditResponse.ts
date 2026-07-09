export interface ClientStoreCredit {
    idStoreCredit: string;  

    storeCreditNumber:string;
    idCreditNote: string;      // Source document link: CN-2026-001
    creditNoteNumber: string;  // Display reference: AV/2026/001
    clientId: string;
    customerName: string;
    
    // Financial Tracking
    initialAmount: number;     // The total amount issued
    remainingAmount: number;   // The balance currently available to spend
    
    // Metadata
    status: ClientStoreCredit.status;
    expiryDate?: string;       
    createdAt: string;
    updatedAt: string;

 
}

export namespace ClientStoreCredit {
    export enum status {
        AVAILABLE = 'AVAILABLE',     // Full amou
        EXHAUSTED = 'EXHAUSTED',     // Balance is 0
        EXPIRED = 'EXPIRED'          // Past validity date
    }
}


import type { LigneFactureResponse } from './LigneFactureResponse';

export type CreditNoteResponse = {
    idCNoteCredit?: string;
    numeroNoteCredit?: string;
    numeroFacture?: string;
    dateFacturation?: string;
    dateEcheance?: string;
    dateSysteme?: string;
    etat?: CreditNoteResponse.etat;
    type?: "AVOIR"; 
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    montantHT?: number;      
    montantTVA?: number;     
    montantTTC?: number;
    montantTotal?: number;
    montantRestant?: number;
    finalAmount?: number;
    remiseGlobalePourcentage?: number;
    remiseGlobaleMontant?: number;
    applyVat?: boolean;
    devise?: string;
    tauxChange?: number;
    modeReglement?: CreditNoteResponse.modeReglement;
    conditionsPaiement?: string;
    nbreEcheance?: number;
    nosRef?: string;
    vosRef?: string;
    referenceCommande?: string;
    idDevisOrigine?: string;
    lignesFacture?: Array<LigneFactureResponse>; 
    notes?: string;
    pdfPath?: string;
    envoyeParEmail?: boolean;
    dateEnvoiEmail?: string;
    createdAt?: string;
    updatedAt?: string;
    referalClientId?: string;
};

export namespace CreditNoteResponse {
    export enum etat {
        BROUILLON = 'BROUILLON',
        ENVOYE = 'ENVOYE',
        PAYE = 'PAYE',
        PARTIELLEMENT_PAYE = 'PARTIELLEMENT_PAYE',
        EN_RETARD = 'EN_RETARD',
        ANNULE = 'ANNULE',
    }

    export enum modeReglement {
        VIREMENT = 'VIREMENT',
        CARTE_BANCAIRE = 'CARTE_BANCAIRE',
        ESPECES = 'ESPECES',
        CHEQUE = 'CHEQUE',
        PRELEVEMENT = 'PRELEVEMENT',
        PAYPAL = 'PAYPAL',
        AUTRE = 'AUTRE',
        BON_D_ACHAT = 'BON_D_ACHAT', 
    }
}

export const MOCK_CREDIT_NOTES: CreditNoteResponse[] = [
  {
    idCNoteCredit: "CN-2026-001",
    numeroNoteCredit: "AV/2026/001",
    numeroFacture: "INV/2026/010",
    dateFacturation: "2026-01-05",
    dateSysteme: "2026-01-21T10:00:00Z",
    etat: "PAYE" as CreditNoteResponse.etat,
    type: "AVOIR",
    idClient: "c001",
    nomClient: "Global Tech Solutions",
    adresseClient: "Douala, Akwa",
    emailClient: "billing@globaltech.cm",
    montantHT: -150000,
    montantTVA: -28875,
    montantTTC: -178875,
    montantTotal: -178875,
    applyVat: true,
    devise: "XAF",
    tauxChange: 1,
    modeReglement: "VIREMENT" as CreditNoteResponse.modeReglement,
    lignesFacture: [
      {
        idLigne: "L-CN-001",
        nomProduit: "Server Maintenance Rack",
        quantite: -1,
        prixUnitaire: 150000,
        montantTotal: -150000,
        description: "Return of defective hardware"
      }
    ],
    notes: "Full refund processed via bank transfer.",
    createdAt: "2026-01-21T10:00:00Z"
  },
  {
    idCNoteCredit: "CN-2026-002",
    numeroNoteCredit: "AV/2026/002",
    numeroFacture: "INV/2026/045",
    dateFacturation: "2026-01-12",
    dateSysteme: "2026-01-21T11:30:00Z",
    etat: "ENVOYE" as CreditNoteResponse.etat,
    type: "AVOIR",
    idClient: "c005",
    nomClient: "Boulangerie du Centre",
    adresseClient: "Yaoundé, Bastos",
    montantHT: -25000,
    montantTVA: -4812,
    montantTTC: -29812,
    montantTotal: -29812,
    applyVat: true,
    devise: "XAF",
    modeReglement: "BON_D_ACHAT" as CreditNoteResponse.modeReglement,
    lignesFacture: [
      {
        idLigne: "L-CN-002",
        nomProduit: "Commercial Discount",
        quantite: 1,
        prixUnitaire: -25000,
        montantTotal: -25000,
        description: "Late delivery compensation"
      }
    ],
    notes: "Issued as store credit for next purchase.",
    createdAt: "2026-01-21T11:30:00Z"
  },
  {
    idCNoteCredit: "CN-2026-003",
    numeroNoteCredit: "AV/2026/003",
    numeroFacture: "INV/2026/088",
    dateFacturation: "2026-01-18",
    dateSysteme: "2026-01-21T14:00:00Z",
    etat: "BROUILLON" as CreditNoteResponse.etat,
    type: "AVOIR",
    idClient: "c012",
    nomClient: "Supermarché Marina",
    montantHT: -12500,
    montantTVA: 0,
    montantTTC: -12500,
    montantTotal: -12500,
    applyVat: false,
    devise: "XAF",
    modeReglement: "ESPECES" as CreditNoteResponse.modeReglement,
    lignesFacture: [
      {
        idLigne: "L-CN-003",
        nomProduit: "Packaging Error Adjustment",
        quantite: 1,
        prixUnitaire: -12500,
        montantTotal: -12500,
        description: "Overcharged on packaging units"
      }
    ],
    notes: "Awaiting manager signature for cash refund.",
    createdAt: "2026-01-21T14:00:00Z"
  }
];