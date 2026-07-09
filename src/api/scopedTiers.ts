import {
  ClientResponse,
  ClientsService,
  CustomerAssignmentsService,
  FournisseurResponse,
  FournisseursService,
  ProducerAssignmentsService,
} from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { SellerRole } from "@/src/api/models/UpdatedSellerResponse";

const PRIVILEGED_ROLES: string[] = [SellerRole.OWNER, SellerRole.AGENCY_MANAGER];

const isPrivileged = (role?: string): boolean => !role || PRIVILEGED_ROLES.includes(role);

/**
 * 
 * owners/agency managers, only their assigned customers for sellers/POS sellers.
 */
export const getVisibleClients = async (): Promise<ClientResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];
  if (isPrivileged(seller.role)) {
    return ClientsService.getAllClients();
  }
  if (!seller.Id) return [];
  return CustomerAssignmentsService.getCustomersForSeller(seller.Id, seller.organizationId);
};

/**
 * Producers/suppliers a seller is allowed to create documents for: every
 * producer for owners/agency managers, only their assigned producers otherwise.
 */
export const getVisibleFournisseurs = async (): Promise<FournisseurResponse[]> => {
  const seller = getStoredSeller();
  if (!seller?.organizationId) return [];
  if (isPrivileged(seller.role)) {
    return FournisseursService.getAllFournisseurs();
  }
  if (!seller.Id) return [];
  return ProducerAssignmentsService.getProducersForSeller(seller.Id, seller.organizationId);
};
