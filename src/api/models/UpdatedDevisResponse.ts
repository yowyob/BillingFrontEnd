/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LigneDevisResponse } from './LigneDevisResponse';
import type { DocPermissionResponse } from '../../src2/api/models/DocPermissionResponse';
export type UpdatedDevisResponse = {
    idDevis?: string;
    numeroDevis?: string;
    dateCreation?: string;
    dateValidite?: string;
    type?: string;
    statut?: UpdatedDevisResponse.statut;
    montantTotal?: number;
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    lignesDevis?: Array<LigneDevisResponse>;
    montantHT?: number;
    montantTVA?: number;
    montantTTC?: number;
    devise?: string;
    tauxChange?: number;
    conditionsPaiement?: string;
    notes?: string;
    referenceExterne?: string;
    pdfPath?: string;
    envoyeParEmail?: boolean;
    dateEnvoiEmail?: string;
    dateAcceptation?: string;
    dateRefus?: string;
    motifRefus?: string;
    idFactureConvertie?: string;
    remiseGlobalePourcentage?: number;
    remiseGlobaleMontant?: number;
    validiteOffreJours?: number;
    createdAt?: string;
    updatedAt?: string;
   




   
    //added fields
    applyVat:boolean
     dateSysteme?:string;
     modeReglement?:UpdatedDevisResponse.modeReglement;
     nosRef?:string;
     vosRef?:string;
     nbreEcheance?:number;
     referalClientId?:string
     finalAmount:number

     organizationId?:string;
      agencyId?:string;
      createdBy?:string;
      docPermission?: DocPermissionResponse;

};
export namespace UpdatedDevisResponse {
    export enum statut {
        BROUILLON = 'BROUILLON',
        ENVOYE = 'ENVOYE',
        ACCEPTE = 'ACCEPTE',
        REFUSE = 'REFUSE',
        EXPIRE = 'EXPIRE',
        ANNULE = 'ANNULE',
        CONVERTI_EN_FACTURE = 'CONVERTI_EN_FACTURE',
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




export const MOCK_QUOTATIONS: UpdatedDevisResponse[] = [
  {
    idDevis: "DV-2026-001",
    numeroDevis: "AG1-INV-T-2026-000124",
    dateCreation: "2026-01-10T11:00:00Z",
    dateValidite: "2026-02-10T11:00:00Z",
    type: "VENTE",
    statut: UpdatedDevisResponse.statut.BROUILLON,
    idClient: "c001",
    nomClient: "John Doe Retail",
    adresseClient: "Street 123, Douala",
    emailClient: "john@retail.com",
    telephoneClient: "+237 600000000",
    applyVat: true,
    modeReglement: UpdatedDevisResponse.modeReglement.ESPECES,
    lignesDevis: [
      {
        idProduit: "p002",
        nomProduit: "Huile végétale 5L",
        quantite: 2,
        prixUnitaire: 6900,
        montantTotal: 13800,
        description: "Huile végétale 5L - DETAIL",
        isTaxLine: false,
        remiseMontant: 1200 // Assumed: (7500 - 6900) * 2
      },
      {
        idProduit: "p005",
        nomProduit: "Savon en barre",
        quantite: 10,
        prixUnitaire: 357.75,
        montantTotal: 3578,
        description: "Savon en barre - DETAIL",
        isTaxLine: false,
        remiseMontant: 0
      }
    ],
    montantHT: 14573,
    montantTVA: 2805,
    montantTTC: 17378,
    montantTotal: 17378, // Usually same as TTC
    remiseGlobalePourcentage: 5,
    remiseGlobaleMontant: 869, // 17378 * 0.05
    finalAmount: 16509, // 17378 - 869
    devise: "XAF",
    tauxChange: 1,
    nosRef: "REF-001",
    nbreEcheance: 3,
    validiteOffreJours: 30,
    notes: "Scenario: Client ntva=true, applyVat=true. p002 has active promo (6900), p005 uses unitPriceWithTax.",
    createdAt: "2026-01-10T11:00:00Z",
    updatedAt: "2026-01-10T11:00:00Z"
  },
  {
    idDevis: "DV-2026-002",
    numeroDevis: "AG1-INV-T-2026-000125",
    dateCreation: "2026-01-10T11:15:00Z",
    dateValidite: "2026-01-20T11:15:00Z",
    type: "GROS",
    statut: UpdatedDevisResponse.statut.ENVOYE,
    idClient: "c002",
    nomClient: "ABC Distributors",
    adresseClient: "Zone Industrielle, Yaoundé",
    emailClient: "contact@abc.com",
    applyVat: false,
    modeReglement: UpdatedDevisResponse.modeReglement.VIREMENT,
    lignesDevis: [
      {
        idProduit: "p001",
        nomProduit: "Riz 25kg",
        quantite: 20,
        prixUnitaire: 14400,
        montantTotal: 288000,
        description: "Riz 25kg - GROS",
        isTaxLine: false,
        remiseMontant: 32000
      },
      {
        idProduit: "p004",
        nomProduit: "Ciment 50kg",
        quantite: 100,
        prixUnitaire: 3995,
        montantTotal: 399500,
        description: "Ciment 50kg - SUPER_GROS",
        isTaxLine: false,
        remiseMontant: 70500
      }
    ],
    montantHT: 687500,
    montantTVA: 0,
    montantTTC: 687500,
    montantTotal: 687500,
    remiseGlobalePourcentage: 0,
    remiseGlobaleMontant: 0,
    finalAmount: 687500,
    devise: "XAF",
    tauxChange: 1,
    validiteOffreJours: 10,
    referalClientId: "ref-999",
    notes: "Scenario: Client ntva=false, applyVat=false. p001 GROS (16000 - 10%), p004 SUPER_GROS (4700 - 15%).",
    createdAt: "2026-01-10T11:15:00Z",
    updatedAt: "2026-01-11T09:00:00Z"
  }
];