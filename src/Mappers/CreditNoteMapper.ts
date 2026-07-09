import { UpdatedCreditNoteResponse, CreditNoteResponse } from '../api/models/UpdatedCreditNoteResponse';
import { NoteCreditRequest, NoteCreditResponse, LigneNoteCredit } from '../src2/api';
import { LigneFactureResponse } from '../api';

/**
 * Utility to ensure date strings are valid ISO datetime strings
 */
const ensureIsoString = (date?: string | Date): string | undefined => {
    if (!date) return undefined;
    const d = new Date(date);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
};

/**
 * Maps Internal Model -> API Request
 */
export const mapCreditNoteToRequest = (
    cn: UpdatedCreditNoteResponse
): NoteCreditRequest => {
    return {
        numeroNoteCredit: cn.numeroCreditNote,
        numeroFactureOrigine: cn.numeroFactureOrigine,

        // Enforced Datetime
        dateEmission: ensureIsoString(cn.dateEmission),
        dateSysteme: ensureIsoString(cn.dateSysteme),

        idClient: cn.idClient,
        nomClient: cn.nomClient,
        adresseClient: cn.adresseClient,
        emailClient: cn.emailClient,
        telephoneClient: cn.telephoneClient,

        montantHT: cn.montantHT,
        montantTVA: cn.montantTVA,
        montantTTC: cn.montantTTC,
        montantTotal: cn.montantTTC,
        devise: cn.devise,

        statut: cn.etat as unknown as NoteCreditRequest.statut,
        modeReglement: mapPaymentMode(cn.modeReglement),

        lignesNoteCredit: (cn.lignesCreditNote ?? []).map(mapLigneToNoteCredit),

        notes: cn.notes,
        pdfPath: cn.pdfPath,
        motif: cn.reason,
        organizationId: cn.organizationId,
        agencyId: cn.agencyId,
        createdBy: cn.createdBy,
    };
};

/**
 * Maps API Response -> Internal Model
 */
export const mapCNResponseToInternalCreditNote = (
    res: NoteCreditResponse
): UpdatedCreditNoteResponse => {
    return {
        idCreditNote: res.idNoteCredit,
        numeroCreditNote: res.numeroNoteCredit,
        idFactureOrigine: res.idFactureOrigine,
        numeroFactureOrigine: res.numeroFactureOrigine,

        // Enforced Datetime
        dateEmission: ensureIsoString(res.dateEmission),
        dateSysteme: ensureIsoString(res.dateSysteme),
        createdAt: ensureIsoString(res.createdAt),
        updatedAt: ensureIsoString(res.updatedAt),

        etat: res.statut as unknown as CreditNoteResponse.etat,
        reason: res.motif as unknown as CreditNoteResponse.reason,

        idClient: res.idClient,
        nomClient: res.nomClient,
        adresseClient: res.adresseClient,
        emailClient: res.emailClient,
        telephoneClient: res.telephoneClient,

        montantHT: res.montantHT,
        montantTVA: res.montantTVA,
        montantTTC: res.montantTTC,
        finalAmount: res.montantTotal,
        devise: res.devise,

        modeReglement: mapResponsePaymentMode(res.modeReglement),
        lignesCreditNote: res.lignesNoteCredit || [],

        notes: res.notes,
        pdfPath: res.pdfPath,
        docPermission: res.docPermission,
    };
};

/**
 * HELPERS
 */

const mapLigneToNoteCredit = (ligne: LigneFactureResponse): LigneNoteCredit => ({
    idProduit: ligne.idProduit,
    nomProduit: ligne.nomProduit,
    quantite: ligne.quantite,
    prixUnitaire: ligne.prixUnitaire,
    montantTotal: ligne.montantTotal,
    description: ligne.description,
    debit: ligne.debit,
    credit: ligne.credit,
    isTaxLine: ligne.isTaxLine,
});

const mapPaymentMode = (mode?: CreditNoteResponse.modeReglement): NoteCreditRequest.modeReglement => {
    if (!mode) return NoteCreditRequest.modeReglement.AUTRE;
    if (mode === CreditNoteResponse.modeReglement.CREDIT_CLIENT) return NoteCreditRequest.modeReglement.BON_D_ACHAT;
    return mode as unknown as NoteCreditRequest.modeReglement;
};

const mapResponsePaymentMode = (mode?: NoteCreditResponse.modeReglement): CreditNoteResponse.modeReglement => {
    if (!mode) return CreditNoteResponse.modeReglement.AUTRE;
    if (mode === NoteCreditResponse.modeReglement.BON_D_ACHAT) return CreditNoteResponse.modeReglement.CREDIT_CLIENT;
    return mode as unknown as CreditNoteResponse.modeReglement;
};

export const mapCreditNoteArrayToInternalArray = (responses: NoteCreditResponse[]): UpdatedCreditNoteResponse[] => {
    return responses.map(res => mapCNResponseToInternalCreditNote(res));
};