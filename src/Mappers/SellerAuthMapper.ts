import { Permission, SaleSize, SellerRole, UpdatedSellerResponse } from "../api/models/UpdatedSellerResponse";
import { SellerAuthResponse } from "../src2/api/models/SellerAuthResponse";

/**
 * Converts a SellerAuthResponse (Backend DTO) to UpdatedSellerResponse (Frontend Model)
 * Handles field renaming and data flattening.
 */
export const mapAuthToUpdatedSeller = (data: SellerAuthResponse): UpdatedSellerResponse => {
  return {
    // Auth
    accessToken: data.accessToken ?? '',

    // Basic Info & Renaming
    Id: data.Id ?? '',
    username: data.username ?? '',
    role: (data.role as SellerRole) ?? SellerRole.SELLER,
    agency: data.agency ?? '',
    salePoint: data.salePoint ?? '',

    // Collections
    Permissions: (data.Permissions ?? []) as Permission[],
    permittedSaleSizes: (data.permittedSaleSizes ?? []) as SaleSize[],

    // Organization Info (The Company)
    organizationId: data.organizationId ?? '',
    organizationName: data.organizationName ?? '',
    organizationLogoUri: data.organizationLogoUri ?? '', // Ensure string, not null
    organizationEmail: data.organizationEmail ?? '',
    taxNumber: data.taxNumber ?? '',

    // Agency Info (The Branch)
    agencyId: data.agencyId ?? '',
    agencyEmail: data.agencyEmail ?? '',
    agencyPhone: data.agencyPhone ?? '',
    agencyCity: data.agencyCity ?? '',
    agencyAddress: data.agencyAddress ?? '',

    // Sales Point Info
    salesPointId: data.salesPointId ?? '',
    salesPointAddress: data.salesPointAddress ?? '',

    // Meta
    createdAt: data.createdAt ?? '',
    mustChangePassword: data.mustChangePassword ?? false,

    uiPermissions: data.uiPermissions ?? null
  };
};