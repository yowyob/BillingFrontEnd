import { ClientResponse, ClientSaleSize, UpdatedClientResponse } from "../api/models/UpdatedClientResponse";

/**
 * Maps the raw API response to the UpdatedClientResponse format.
 */
export const mapToUpdatedClientResponse = (raw: any): UpdatedClientResponse => {
    return {
        idClient: raw.id,
        username: raw.name, 
        categorie: raw.businessSector,
        siteWeb: raw.website,
        // Combining address fields for a full string
        adresse: [raw.address, raw.addressComplement, raw.city]
            .filter(Boolean)
            .join(', '),
        telephone: raw.phoneNumber,
        email: raw.email,
        typeClient: mapTypeToEnum(raw.type),
        raisonSociale: raw.shortName || raw.name,
        numeroTva: raw.customerVatNumber || raw.vatNumber,
        codeClient: raw.code,
        limiteCredit: raw.creditLimit || 0,
        soldeCourant: 0, // Placeholder as not present in source
        actif: raw.active,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        ntva: raw.vatSubject ?? !!raw.customerVatNumber,
        
        // Dynamically build the allowed sizes based on boolean flags
        allowedSaleSizes: mapSaleSizes(raw)
    };
};

/**
 * Maps the source 'type' string to the local typeClient Enum
 */
const mapTypeToEnum = (type: string): ClientResponse.typeClient => {
    const mapping: Record<string, ClientResponse.typeClient> = {
        'INDIVIDUAL': ClientResponse.typeClient.PARTICULIER,
        'COMPANY': ClientResponse.typeClient.ENTREPRISE,
        'ADMINISTRATION': ClientResponse.typeClient.ADMINISTRATION
    };
    return mapping[type] || ClientResponse.typeClient.PARTICULIER;
};

/**
 * Checks boolean flags to determine which sales sizes are permitted
 */
const mapSaleSizes = (raw: any): ClientSaleSize.size[] => {
    const sizes: ClientSaleSize.size[] = [];
    
    if (raw.retailSale) sizes.push(ClientSaleSize.size.DETAIL);
    if (raw.semiWholesale) sizes.push(ClientSaleSize.size.DEMIS_GROS);
    if (raw.wholesale) sizes.push(ClientSaleSize.size.GROS);
    if (raw.superWholesale) sizes.push(ClientSaleSize.size.SUPER_GROS);
    
    return sizes;
};