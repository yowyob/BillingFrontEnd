import { BackOrderRequest, BackOrderResponse, LigneBackOrder } from '../src2/api';
import { UpdatedBackOrderResponse, BackOrderLine, BackOrderStatus } from '../api/models/UpdatedBackOrderResponse';

export const mapBackOrderResponseToUI = (res: BackOrderResponse): UpdatedBackOrderResponse => ({
    id: res.idBackOrder,
    numeroBackOrder: res.numeroBackOrder,
    idBonLivraison: res.idBonLivraison,
    numeroBonLivraison: res.numeroBonLivraison,
    idClient: res.idClient,
    nomClient: res.nomClient,
    adresseClient: res.adresseClient,
    emailClient: res.emailClient,
    telephoneClient: res.telephoneClient,
    statut: res.statut as unknown as BackOrderStatus.statut,
    lignes: res.lignes?.map(mapLigneToUI) ?? [],
    remarques: res.notes,
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
    organizationId: res.organizationId,
    agencyId: res.agencyId,
    docPermission: res.docPermission,
});

export const mapBackOrderArrayToUI = (list: BackOrderResponse[]): UpdatedBackOrderResponse[] =>
    list.map(mapBackOrderResponseToUI);

export const mapUIToBackOrderRequest = (ui: UpdatedBackOrderResponse): BackOrderRequest => ({
    numeroBackOrder: ui.numeroBackOrder,
    idBonLivraison: ui.idBonLivraison ?? '',
    numeroBonLivraison: ui.numeroBonLivraison,
    idClient: ui.idClient,
    nomClient: ui.nomClient,
    adresseClient: ui.adresseClient,
    emailClient: ui.emailClient,
    telephoneClient: ui.telephoneClient,
    statut: ui.statut as unknown as BackOrderRequest.statut,
    lignes: ui.lignes?.map(mapLineToRequest) ?? [],
    notes: ui.remarques,
    organizationId: ui.organizationId,
    agencyId: ui.agencyId,
});

const mapLigneToUI = (l: LigneBackOrder): BackOrderLine => ({
    id: l.idProduit,
    productId: l.idProduit,
    productName: l.nomProduit,
    quantiteCommandee: l.quantiteCommandee,
    quantiteRecue: l.quantiteRecue,
    quantiteManquante: l.quantiteEnAttente,
    unitPrice: l.prixUnitaire,
});

const mapLineToRequest = (l: BackOrderLine): LigneBackOrder => ({
    idProduit: l.productId,
    nomProduit: l.productName,
    quantiteCommandee: l.quantiteCommandee,
    quantiteRecue: l.quantiteRecue,
    quantiteEnAttente: l.quantiteManquante,
    prixUnitaire: l.unitPrice,
});
