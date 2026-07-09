/* eslint-disable */
export type DocPermissionResponse = {
    idPermission?: string;
    sellerId?: string;
    docId?: string;
    docType?: 'DEVIS' | 'FACTURE' | 'FACTURE_PROFORMA' | 'BACK_ORDER' | 'NOTE_CREDIT' | 'BON_ACHAT' | 'BON_COMMANDE' | 'BON_LIVRAISON' | 'BON_RECEPTION' | 'FACTURE_FOURNISSEUR';
    permission?: 'OWNER' | 'EDITOR' | 'VIEWER';
    assignedAt?: string;
    updatedAt?: string;
};
