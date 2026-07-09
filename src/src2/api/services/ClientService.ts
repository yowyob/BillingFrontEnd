import { ClientResponse, ClientSaleSize, UpdatedClientResponse } from "@/src/api/models/UpdatedClientResponse";

export class ClientService {

  private readonly BASE_URL = 'http:/192.168.51.1/api/v1/customers'; // Replace with your actual API URL

  /**
   * Fetches and maps clients from the backend
   */
  public async getClients(): Promise<UpdatedClientResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Add if needed
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the raw API array into your local model
      return data.map((item: any) => this.mapToClientResponse(item));
    } catch (error) {
      console.error("Could not fetch clients:", error);
      return []; // Return empty array or re-throw based on your error policy
    }
  }

  /**
   * Transformation Logic (The Mapper)
   */
  private mapToClientResponse(raw: any): UpdatedClientResponse {
    return {
      idClient: raw.id,
      username: raw.name,
      categorie: raw.businessSector,
      siteWeb: raw.website,
      // Combines address components and removes nulls/undefined
      adresse: [raw.address, raw.addressComplement, raw.city, raw.country]
        .filter(val => !!val && val !== 'string') // Clean out mock "string" values
        .join(', '),
      telephone: raw.phoneNumber,
      email: raw.email,
      typeClient: this.mapType(raw.type),
      raisonSociale: raw.shortName || raw.name,
      numeroTva: raw.customerVatNumber || raw.vatNumber,
      codeClient: raw.code,
      limiteCredit: raw.creditLimit || 0,
      soldeCourant: 0, 
      actif: raw.active,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      ntva: raw.vatSubject ?? !!raw.customerVatNumber,
      allowedSaleSizes: this.mapAllowedSizes(raw),
    };
  }

  private mapType(type: string): ClientResponse.typeClient {
    switch (type) {
      case 'INDIVIDUAL': return ClientResponse.typeClient.PARTICULIER;
      case 'COMPANY': return ClientResponse.typeClient.ENTREPRISE;
      default: return ClientResponse.typeClient.ADMINISTRATION;
    }
  }

  private mapAllowedSizes(raw: any): ClientSaleSize.size[] {
    const sizes: ClientSaleSize.size[] = [];
    if (raw.retailSale) sizes.push(ClientSaleSize.size.DETAIL);
    if (raw.semiWholesale) sizes.push(ClientSaleSize.size.DEMIS_GROS);
    if (raw.wholesale) sizes.push(ClientSaleSize.size.GROS);
    if (raw.superWholesale) sizes.push(ClientSaleSize.size.SUPER_GROS);
    return sizes;
  }
}