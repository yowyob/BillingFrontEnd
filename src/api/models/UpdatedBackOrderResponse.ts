import type { DocPermissionResponse } from '../../src2/api/models/DocPermissionResponse';

export type BackOrderLine = {
    id?: string;
    productId?: string;
    productName?: string;
    quantiteCommandee?: number;
    quantiteRecue?: number;
    quantiteManquante?: number;
    unitPrice?: number;
};

export type UpdatedBackOrderResponse = {
    id?: string;
    numeroBackOrder?: string;
    idBonLivraison?: string;
    numeroBonLivraison?: string;
    idClient?: string;
    nomClient?: string;
    adresseClient?: string;
    emailClient?: string;
    telephoneClient?: string;
    statut?: BackOrderStatus.statut;
    lignes?: BackOrderLine[];
    remarques?: string;
    createdAt?: string;
    updatedAt?: string;
    organizationId?: string;
    agencyId?: string;
    docPermission?: DocPermissionResponse;
};

export namespace BackOrderStatus {
    export enum statut {
        EN_ATTENTE = 'EN_ATTENTE',
        PARTIELLEMENT_LIVRE = 'PARTIELLEMENT_LIVRE',
        LIVRE = 'LIVRE',
        ANNULE = 'ANNULE',
    }
}

export const MOCK_BACK_ORDERS: UpdatedBackOrderResponse[] = [
    {
        id: 'bo-001',
        idBonLivraison: 'dn-001',
        numeroBonLivraison: 'DN-2026-001',
        nomClient: 'Client ACME',
        statut: BackOrderStatus.statut.EN_ATTENTE,
        lignes: [
            { id: 'l1', productId: 'p001', productName: 'Riz 25kg', quantiteCommandee: 100, quantiteRecue: 60, quantiteManquante: 40, unitPrice: 18000 },
        ],
        remarques: 'Livraison partielle reçue',
        createdAt: new Date().toISOString(),
    },
];
