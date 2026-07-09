import type { LigneFactureResponse } from './LigneFactureResponse';
import type { DocPermissionResponse } from '../../src2/api/models/DocPermissionResponse';

export type UpdatedSupplierFactureResponse = {
    idFacture?: string;
    numeroFacture?: string;
    dateFacturation?: string;
    dateEcheance?: string;
    dateSysteme?: string;
    etat?: FactureResponse.etat;
    type?: string;
    idFournisseur?: string;
    nomFournisseru?: string;
    adresseFournisseur?: string;
    emailFournisseur?: string;
    telephoneFournisseur?: string;
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
    modeReglement?: FactureResponse.modeReglement;
    conditionsPaiement?: string;
    nbreEcheance?: number;
    nosRef?: string;
    vosRef?: string;
    referenceCommande?: string;
    idGRN?: string;
    numeroGRN?:string
    
    lignesFacture?: Array<LigneSupplierFactureResponse>;
    notes?: string;
    
   createdBy?:string;
    organizationId?: string;
    agencyId?: string;
    createdAt?: string;
    updatedAt?: string;
    docPermission?: DocPermissionResponse;

};

export namespace FactureResponse {
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
        AUTRE = 'AUTRE'
    }
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LigneSupplierFactureResponse = {
     idLigne?: string;
    quantite?: number;
    description?: string;
    debit?: number;
    credit?: number;
    isTaxLine?: boolean;
    idProduit?: string;
    nomProduit?: string;
    prixUnitaire?: number;
    montantTotal?: number;
    remisePourcentage?: number;
    remiseMontant?: number;
};



export const MOCK_SUPPLIER_FACTURES: UpdatedSupplierFactureResponse[] = [
  {
    idFacture: "fact-2026-001",
    numeroFacture: "FS-2026-0001",
    dateFacturation: "2026-01-23T10:00:00Z",
    dateEcheance: "2026-02-23T10:00:00Z",
    dateSysteme: "2026-01-23T10:05:00Z",
    etat: FactureResponse.etat.BROUILLON,
    type: "FOURNISSEUR",
    
    // Mapping from your Client: abc_distributors (c002)
    idFournisseur: "c002", 
    nomFournisseru: "ABC Distributors",
    adresseFournisseur: "Yaoundé, Bastos",
    emailFournisseur: "contact@abc-distributors.cm",
    telephoneFournisseur: "+237690000002",
    
    // Financial Totals (Sum of lines below + 19.25% VAT)
    montantHT: 122000, 
    montantTVA: 23485, 
    montantTTC: 145485,
    montantTotal: 145485,
    montantRestant: 145485,
    finalAmount: 145485,
    
    applyVat: true,
    devise: "XAF",
    tauxChange: 1,
    modeReglement: FactureResponse.modeReglement.VIREMENT,
    conditionsPaiement: "Net 30 Days",
    nbreEcheance: 1,
    
    // References to your PO and GRN mocks
    nosRef: "PURCH-001",
    vosRef: "GRN/2026/001",
    referenceCommande: "PURCH-001",
    idGRN: "grn-8821-2026",
    numeroGRN: "GRN/2026/001",
    
    lignesFacture: [
      {
        idLigne: "inv-l-001",
        idProduit: "p001", // Product: Riz 25kg
        nomProduit: "Riz 25kg",
        description: "Riz 25kg - Lot de gros",
        quantite: 5,
        prixUnitaire: 16000, // Using GROS price from p001
        montantTotal: 80000,
        debit: 0,
        credit: 80000,
        isTaxLine: true,
        remisePourcentage: 0,
        remiseMontant: 0
      },
      {
        idLigne: "inv-l-002",
        idProduit: "p002", // Product: Huile végétale 5L
        nomProduit: "Huile végétale 5L",
        description: "Huile végétale 5L - Carton",
        quantite: 5, // Just below Demis-Gros threshold
        prixUnitaire: 8400, 
        montantTotal: 42000,
        debit: 0,
        credit: 42000,
        isTaxLine: true,
        remisePourcentage: 0,
        remiseMontant: 0
      }
    ],
    notes: "Facture générée pour ABC Distributors basée sur la réception GRN/2026/001.",
    createdAt: "2026-01-23T10:05:00Z",
    updatedAt: "2026-01-23T10:05:00Z"
  },
  {
    idFacture: "fact-2026-002",
    numeroFacture: "FS-2026-0002",
    dateFacturation: "2026-01-23T14:30:00Z",
    dateEcheance: "2026-01-23T14:30:00Z",
    dateSysteme: "2026-01-23T14:30:00Z",
    etat: FactureResponse.etat.PAYE,
    type: "FOURNISSEUR",
    
    // Mapping from your Client: min_edu (c003)
    idFournisseur: "c003",
    nomFournisseru: "Ministry of Education",
    adresseFournisseur: "Yaoundé, Centre Ville",
    emailFournisseur: "procurement@minedu.gov.cm",
    telephoneFournisseur: "+237690000003",
    
    montantHT: 35000,
    montantTVA: 0, // Admin usually tax exempt or handled differently
    montantTTC: 35000,
    montantTotal: 35000,
    montantRestant: 0,
    finalAmount: 35000,
    
    applyVat: false,
    devise: "XAF",
    tauxChange: 1,
    modeReglement: FactureResponse.modeReglement.ESPECES,
    conditionsPaiement: "Paiement à la livraison",
    
    nosRef: "PURCH-002",
    vosRef: "GRN/2026/002",
    idGRN: "grn-8822-2026",
    numeroGRN: "GRN/2026/002",
    
    lignesFacture: [
      {
        idLigne: "inv-l-003",
        idProduit: "p007", // Product: Papier A4
        nomProduit: "Papier A4 (rame)",
        description: "Fournitures de bureau - Rames A4",
        quantite: 10,
        prixUnitaire: 3500,
        montantTotal: 35000,
        debit: 0,
        credit: 35000,
        isTaxLine: false,
        remisePourcentage: 0,
        remiseMontant: 0
      }
    ],
    notes: "Règlement immédiat effectué par caisse.",
    createdAt: "2026-01-23T14:30:00Z",
    updatedAt: "2026-01-23T15:00:00Z"
  }
];