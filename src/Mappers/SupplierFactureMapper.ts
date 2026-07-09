import { 
    UpdatedSupplierFactureResponse, 
    LigneSupplierFactureResponse, 
    FactureResponse 

} from '../api/models/UpdatedSupplierFactureResponse';
import { 
    FactureFournisseurCreateRequest, 
    LineFactureFournisseur,
    FactureFournisseurResponse 
} from '../src2/api';

/**
 * HELPER: Strips timezone to match Java LocalDateTime expectation
 */
const toLocalDateTime = (dateStr?: string): string | undefined => {
    if (!dateStr) return undefined;
    return dateStr.split('Z')[0].split('+')[0];
};

/**
 * Maps Internal Line to Request Line
 */
const mapInternalLineToRequest = (line: LigneSupplierFactureResponse): LineFactureFournisseur => ({
    quantite: line.quantite ?? 0,
    description: line.description,
    debit: line.debit ?? 0,
    credit: line.credit ?? 0,
    isTaxLine: line.isTaxLine,
    idProduit: line.idProduit,
    nomProduit: line.nomProduit,
    prixUnitaire: line.prixUnitaire,
    montantTotal: line.montantTotal,
});

/**
 * Main Mapper: Internal Supplier Invoice -> API Create Request
 */
export const mapInternalToFactureFournisseurCreateRequest = (
    data: UpdatedSupplierFactureResponse,
    creatorName?: string
): FactureFournisseurCreateRequest => {
    return {
        numeroFacture: data.numeroFacture,
        dateFacture: toLocalDateTime(data.dateFacturation),
        dateEcheance: toLocalDateTime(data.dateEcheance),

        // Enums mapping (keys match in your case, so we cast to the target enum)
        statut: data.etat as unknown as FactureFournisseurCreateRequest.statut,
        modeReglement: (data.modeReglement || FactureFournisseurCreateRequest.modeReglement.AUTRE) as unknown as FactureFournisseurCreateRequest.modeReglement,

        idFournisseur: data.idFournisseur,
        nomFournisseur: data.nomFournisseru,
        adresseFournisseur: data.adresseFournisseur,
        emailFournisseur: data.emailFournisseur,
        telephoneFournisseur: data.telephoneFournisseur,

        montantHT: data.montantHT,
        montantTVA: data.montantTVA,
        montantTTC: data.montantTTC,

        applyVat: data.applyVat,
        devise: data.devise,

        idBonReception: data.idGRN,
        numeroBonReception: data.numeroGRN,

        lines: data.lignesFacture?.map(mapInternalLineToRequest) || [],
        notes: data.notes,

        // Custom field for the creator
        createdBy: data.createdBy,
        organizationId: data.organizationId,
        agencyId: data.agencyId,
    };
};





/**
 * Maps a single Line item from Backend to Internal UI format
 */
const mapLineBackendToInternal = (
    line: any // Typically LineFactureFournisseur
): LigneSupplierFactureResponse => ({
    idLigne: line.idLigne,
    quantite: line.quantite,
    description: line.description,
    debit: line.debit ?? 0,
    credit: line.credit ?? 0,
    isTaxLine: line.isTaxLine,
    idProduit: line.idProduit,
    nomProduit: line.nomProduit,
    prixUnitaire: line.prixUnitaire,
    montantTotal: line.montantTotal,
    remisePourcentage: line.remisePourcentage ?? 0,
    remiseMontant: line.remiseMontant ?? 0,
});

/**
 * Main Mapper: FactureFournisseurResponse -> UpdatedSupplierFactureResponse
 */
export const mapBackendFactureFournisseurToInternal = (
    api: FactureFournisseurResponse
): UpdatedSupplierFactureResponse => {
    return {
        idFacture: api.idFactureFournisseur,
        numeroFacture: api.numeroFacture,
        dateFacturation: api.dateFacture,
        dateEcheance: api.dateEcheance,
        dateSysteme: api.dateSysteme,

        // Enum Casting (assuming keys match)
        etat: api.statut as unknown as FactureResponse.etat,
        modeReglement: api.modeReglement as unknown as FactureResponse.modeReglement,

        idFournisseur: api.idFournisseur,
        nomFournisseru: api.nomFournisseur,
        adresseFournisseur: api.adresseFournisseur,
        emailFournisseur: api.emailFournisseur,
        telephoneFournisseur: api.telephoneFournisseur,

        montantHT: api.montantHT,
        montantTVA: api.montantTVA,
        montantTTC: api.montantTTC,
        montantTotal: api.montantTotal,
        montantRestant: api.montantRestant,
        finalAmount: api.montantTotal,

        applyVat: api.applyVat,
        devise: api.devise,
        nbreEcheance: api.nbreEcheance,

        idGRN: api.idBonReception,
        numeroGRN: api.numeroBonReception,

        lignesFacture: api.lines?.map(mapLineBackendToInternal) || [],
        notes: api.notes,

        createdAt: api.createdAt,
        updatedAt: api.updatedAt,
        docPermission: api.docPermission,
    };
};

/**
 * Array Mapper for handling lists
 */
export const mapBackendFactureFournisseurArrayToInternal = (
    responses: FactureFournisseurResponse[] | undefined
): UpdatedSupplierFactureResponse[] => {
    if (!responses) return [];
    return responses.map(mapBackendFactureFournisseurToInternal);
};


