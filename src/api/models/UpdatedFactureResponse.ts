import type { LigneFactureResponse } from './LigneFactureResponse';
import type { DocPermissionResponse } from '../../src2/api/models/DocPermissionResponse';

export type UpdatedFactureResponse = {
    idFacture?: string;
    numeroFacture?: string;
    dateFacturation?: string;
    dateEcheance?: string;
    dateSysteme?: string;
    etat?: FactureResponse.etat;
    type?: string;
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
    modeReglement?: FactureResponse.modeReglement;
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
    referalClientId?:string,
    createdBy?:string,
    organizationId?:string,
    agencyId?:string,
    originType?: 'POS' | 'SALES',
    sessionId?:string,
    docPermission?: DocPermissionResponse;
};

export namespace FactureResponse {
    export enum etat {
        BROUILLON = 'BROUILLON',
        ENVOYE = 'ENVOYE',
        PAYE = 'PAYE',
        PARTIELLEMENT_PAYE = 'PARTIELLEMENT_PAYE',
        EN_RETARD = 'EaN_RETARD',
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
export const MOCK_FACTURE: UpdatedFactureResponse[] = [
  {
    idFacture: "FACT-2026-001",
    numeroFacture: "INV/2026/001",
    dateFacturation: "2026-01-15",
    dateEcheance: "2026-02-15",
    dateSysteme: "2026-01-15T10:00:00Z",
    etat: FactureResponse.etat.PAYE,
    type: "VENTE",
    idClient: "c001",
    nomClient: "John Doe Retail",
    adresseClient: "Douala, Akwa",
    emailClient: "john@example.com",
    telephoneClient: "+237690000001",
    
    // Logic: 18,000 * 19.25% = 3,465. Total = 21,465
    montantHT: 18000,
    montantTVA: 3465, 
    montantTTC: 21465,
    montantTotal: 21465,
    montantRestant: 0, // Coherent with status 'PAYE'
    finalAmount: 21465,
    
    remiseGlobalePourcentage: 0,
    remiseGlobaleMontant: 0,
    applyVat: true,
    devise: "XAF",
    tauxChange: 1,
    modeReglement: FactureResponse.modeReglement.ESPECES,
    conditionsPaiement: "Paiement à la réception",
    nbreEcheance: 1,
    lignesFacture: [
      {
        idLigne: "L001",
        idProduit: "p001",
        nomProduit: "Riz 25kg",
        quantite: 1,
        prixUnitaire: 18000,
        montantTotal: 18000,
        description: "Vente au détail - Riz 25kg",
        remisePourcentage: 0,
        isTaxLine: false
      }
    ],
    notes: "Client fidèle",
    envoyeParEmail: true,
    dateEnvoiEmail: "2026-01-15T10:05:00Z",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T11:00:00Z"
  },
  {
    idFacture: "FACT-2026-002",
    numeroFacture: "INV/2026/002",
    dateFacturation: "2026-01-20",
    dateEcheance: "2026-03-20",
    dateSysteme: "2026-01-20T14:30:00Z",
    etat: FactureResponse.etat.BROUILLON,
    type: "GROS_VENTE",
    idClient: "c002",
    nomClient: "ABC Distributors",
    adresseClient: "Yaoundé, Bastos",
    emailClient: "contact@abc-distributors.cm",
    telephoneClient: "+237690000002",

    // Logic: HT = 160,000. TVA (19.25%) = 30,800. TTC = 190,800.
    // Remise 10% on 190,800 = 19,080.
    // Final Amount = 171,720.
    montantHT: 160000,
    montantTVA: 30800,
    montantTTC: 190800,
    montantTotal: 171720, // Value after global discount
    montantRestant: 171720, // Coherent with status 'BROUILLON' (nothing paid)
    finalAmount: 171720,
    
    remiseGlobalePourcentage: 10,
    remiseGlobaleMontant: 19080,
    applyVat: true,
    devise: "XAF",
    tauxChange: 1,
    modeReglement: FactureResponse.modeReglement.VIREMENT,
    conditionsPaiement: "Net 60",
    referenceCommande: "PO-ABC-992",
    lignesFacture: [
      {
        idLigne: "L002",
        idProduit: "p001",
        nomProduit: "Riz 25kg",
        quantite: 10,
        prixUnitaire: 16000,
        montantTotal: 160000,
        description: "Tarif Gros - Riz 25kg",
        remisePourcentage: 10,
        isTaxLine: false
      }
    ],
    notes: "Promotion saisonnière appliquée sur le prix de gros",
    envoyeParEmail: false,
    createdAt: "2026-01-20T14:30:00Z",
    updatedAt: "2026-01-20T14:30:00Z"
  }
];