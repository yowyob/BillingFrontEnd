import { UpdatedBackOrderResponse, BackOrderLine, BackOrderStatus } from '../models/UpdatedBackOrderResponse';
import { DeliveryNoteLineResponse, DeliveryNoteResponse } from '../models/DeliveryNoteResponse';

/**
 * Transforms a Back Order's still-missing items into a follow-up Delivery
 * Note draft, once the shortfall can finally go out to the client.
 * Client info carries straight over since a back order tracks a shortfall
 * against a specific client's delivery note, not a supplier PO.
 */
export const mapBackOrderToDeliveryNote = (bo: UpdatedBackOrderResponse): DeliveryNoteResponse => {
  const lines: DeliveryNoteLineResponse[] = (bo.lignes || []).map((ligne): DeliveryNoteLineResponse => ({
    productId: ligne.productId,
    idProduit: ligne.productId,
    description: ligne.productName,
    quantity: ligne.quantiteManquante,
    unitPrice: ligne.unitPrice,
    amount: (ligne.quantiteManquante || 0) * (ligne.unitPrice || 0),
  }));

  return {
    etat: DeliveryNoteResponse.etat.BROUILLON,
    idClient: bo.idClient,
    nomClient: bo.nomClient,
    adresseClient: bo.adresseClient,
    emailClient: bo.emailClient,
    telephoneClient: bo.telephoneClient,
    lines,
    totalAmount: lines.reduce((acc, l) => acc + (l.amount || 0), 0),
    termsAndConditions: `Generated from Back Order ${bo.numeroBackOrder || bo.id || ''} (client: ${bo.nomClient || 'N/A'}).`,
    deliveryDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Transforms an existing Delivery Note into a Back Order draft — used when
 * linking a delivery order in the Back Order creation form to pre-fill the
 * client and lines from what couldn't be fully delivered.
 */
export const mapDeliveryNoteToBackOrder = (dn: DeliveryNoteResponse): Partial<UpdatedBackOrderResponse> => {
  const lignes: BackOrderLine[] = (dn.lines || []).map((line): BackOrderLine => ({
    productId: line.productId || line.idProduit,
    productName: line.description,
    quantiteCommandee: line.quantity,
    quantiteRecue: line.quantiteLivree ?? 0,
    quantiteManquante: line.quantiteRestante ?? line.quantity,
    unitPrice: line.unitPrice,
  }));

  return {
    idBonLivraison: dn.idDN,
    numeroBonLivraison: dn.deliveryNoteNumber,
    idClient: dn.idClient,
    nomClient: dn.nomClient,
    adresseClient: dn.adresseClient,
    emailClient: dn.emailClient,
    telephoneClient: dn.telephoneClient,
    statut: BackOrderStatus.statut.EN_ATTENTE,
    lignes,
    remarques: `Generated from Delivery Order ${dn.deliveryNoteNumber || dn.idDN || ''} (client: ${dn.nomClient || 'N/A'}).`,
  };
};
