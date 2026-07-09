import type { LigneFactureResponse } from './LigneFactureResponse';
import type { DocPermissionResponse } from '../../src2/api/models/DocPermissionResponse';

export type UpdatedCreditNoteResponse = {
    idCreditNote?: string;
    numeroCreditNote?: string; 
    idFactureOrigine?: string;  
    numeroFactureOrigine?: string; 
    dateEmission?: string;
    dateSysteme?: string;
    etat?: CreditNoteResponse.etat;
    reason?: CreditNoteResponse.reason; 
    
    // Client Infoimport { UpdatedCreditNoteResponse, CreditNoteResponse } from './path-to-credit-note-response';
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    
    // Financials
    montantHT?: number;
    montantTVA?: number;
    montantTTC?: number; 
    applyVat?: boolean;
    finalAmount?:number;
    devise?: string;
    
    // Payment/Refund Details
    modeReglement?: CreditNoteResponse.modeReglement;
    
    // Items
    lignesCreditNote?: Array<LigneFactureResponse>;
    
    notes?: string;
    pdfPath?: string;
    organizationId?: string;
    agencyId?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    docPermission?: DocPermissionResponse;
};

export namespace CreditNoteResponse {
    export enum etat {
        BROUILLON = 'BROUILLON',
        APPLIQUÉ = 'APPLIQUÉ', // Deducted from client's balance
        REMBOURSÉ = 'REMBOURSÉ', // Money sent back to client
        ANNULÉ = 'ANNULÉ',
    }

    export enum reason {
        RETOUR_MARCHANDISE = 'RETOUR_MARCHANDISE',
        ERREUR_FACTURATION = 'ERREUR_FACTURATION',
        REMISE_COMMERCIALE = 'REMISE_COMMERCIALE',
        PRODUIT_ENDOMMAGÉ = 'PRODUIT_ENDOMMAGÉ',
        AUTRE = 'AUTRE'
    }

    export enum modeReglement {
        VIREMENT = 'VIREMENT',
        ESPECES = 'ESPECES',
        CHEQUE = 'CHEQUE',
        CREDIT_CLIENT = 'CREDIT_CLIENT', // Specific to Credit Notes (Store Credit)
        MOBILE_MONEY = 'MOBILE_MONEY',
        AUTRE = 'AUTRE'
    }
}
export const MOCK_CREDIT_NOTES: UpdatedCreditNoteResponse[] = [
  {
    idCreditNote: "CN-2026-001",
    numeroCreditNote: "AV/2026/001",
    idFactureOrigine: "FACT-2026-001",
    numeroFactureOrigine: "INV/2026/001",
    dateEmission: "2026-01-18",
    dateSysteme: "2026-01-18T09:00:00Z",
    etat: CreditNoteResponse.etat.APPLIQUÉ,
    reason: CreditNoteResponse.reason.RETOUR_MARCHANDISE,
    modeReglement: CreditNoteResponse.modeReglement.CREDIT_CLIENT,
    idClient: "c001",
    nomClient: "John Doe Retail",
    adresseClient: "Akwa, Douala",
    emailClient: "john@retail.cm",
    // Financials as negative values
    montantHT: -18000,
    montantTVA: -3465,
    montantTTC: -21465, 
    finalAmount: -21465,
    applyVat: true,
    devise: "XAF",
    lignesCreditNote: [
      {
        idLigne: "L-CN-101",
        nomProduit: "Riz Long Grain 25kg",
        quantite: 1,
        prixUnitaire: 18000,
        // Using 'credit' for the positive value and 'montantTotal' as negative
        credit: 18000,
        debit: 0,
        montantTotal: -18000,
        description: "Full return - customer changed mind",
      }
    ],
    notes: "Credit added to client account for future orders.",
    createdAt: "2026-01-18T09:00:00Z"
  },
  {
    idCreditNote: "CN-2026-002",
    numeroCreditNote: "AV/2026/002",
    idFactureOrigine: "FACT-2026-005",
    numeroFactureOrigine: "INV/2026/005",
    dateEmission: "2026-01-19",
    dateSysteme: "2026-01-19T14:20:00Z",
    etat: CreditNoteResponse.etat.REMBOURSÉ,
    reason: CreditNoteResponse.reason.PRODUIT_ENDOMMAGÉ,
    modeReglement: CreditNoteResponse.modeReglement.MOBILE_MONEY,
    idClient: "c002",
    nomClient: "Sarl General Food",
    adresseClient: "Bastos, Yaoundé",
    emailClient: "logistics@sarlfood.cm",
    montantHT: -45000,
    montantTVA: -8662,
    montantTTC: -53662,
    finalAmount: -53662,
    applyVat: true,
    devise: "XAF",
    lignesCreditNote: [
      {
        idLigne: "L-CN-102",
        nomProduit: "Huile de Palme 20L",
        quantite: 3,
        prixUnitaire: 15000,
        credit: 45000,
        debit: 0,
        montantTotal: -45000,
        description: "Containers leaked during transit",
      }
    ],
    notes: "Refunded via MoMo after inspection.",
    createdAt: "2026-01-19T14:20:00Z"
  },
  {
    idCreditNote: "CN-2026-003",
    numeroCreditNote: "AV/2026/003",
    idFactureOrigine: "FACT-2026-010",
    numeroFactureOrigine: "INV/2026/010",
    dateEmission: "2026-01-20",
    dateSysteme: "2026-01-20T10:00:00Z",
    etat: CreditNoteResponse.etat.BROUILLON,
    reason: CreditNoteResponse.reason.ERREUR_FACTURATION,
    modeReglement: CreditNoteResponse.modeReglement.CREDIT_CLIENT,
    idClient: "c012",
    nomClient: "Elite Boutique",
    adresseClient: "Bonapriso, Douala",
    montantHT: -5000,
    montantTVA: 0,
    montantTTC: -5000,
    finalAmount: -5000,
    applyVat: false,
    devise: "XAF",
    lignesCreditNote: [
      {
        idLigne: "L-CN-103",
        nomProduit: "Correction Service Fee",
        quantite: 1,
        prixUnitaire: 5000,
        credit: 5000,
        debit: 0,
        montantTotal: -5000,
        description: "Overcharged on previous invoice entry",
      }
    ],
    notes: "Waiting for manager approval.",
    createdAt: "2026-01-20T10:00:00Z"
  }
];