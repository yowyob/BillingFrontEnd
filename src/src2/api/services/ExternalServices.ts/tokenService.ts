import { DevisResponse } from "../../models/DevisResponse";
import { UpdatedDevisResponse } from "@/src/api/models/UpdatedDevisResponse";
import { mapBackendToUpdatedDevis } from "@/src/Mappers/DevisMapper";
import { PortalAccessResponse } from "../../models/PortalAccessResponse";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class PortalAccessService {
  /**
   * Fetches quotation details via native fetch
   * Path: GET /portal-access/quotation/{token}
   */
  static async getQuotation(token: string): Promise<PortalAccessResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/portal-access/quotation/${token}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        console.warn(`Quotation not found for token: ${token}`);
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Ensure the returned data matches the generic structure
      const data: PortalAccessResponse= await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error in PortalAccessService:', error);
      throw error;
    }
  }

  /**
   * Triggers an action (accept/reject) for a specific token
   * Matches Backend: @GetMapping("/{token}") with @RequestParam action
   */
  static async handleAction(token: string, action: string): Promise<void> {
    try {
      // Use API_BASE_URL and ensure the path matches your Controller's @RequestMapping
      const url = `${API_BASE_URL}/portal-access/${token}?action=${action}`;
      
      const response = await fetch(url, {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Try to parse the error message from the backend (Mono.error)
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Action failed with status ${response.status}`);
      }
      
      return; 
    } catch (error) {
      console.error("Error in handleAction:", error);
      throw error;
    }
  }
}