// -------------------------
// Enums
// -------------------------
export enum Permission {
  NEGOTIATE_PRICE = 'NEGOTIATE_PRICE',
  APPLY_DISCOUNT = 'APPLY_DISCOUNT',
  OVERRIDE_PRICE = 'OVERRIDE_PRICE',
  APPROVE_DOCUMENT = 'APPROVE_DOCUMENT',
}

export enum SaleSize {
  DETAIL = 'DETAIL',
  DEMIS_GROS = 'DEMIS_GROS',
  GROS = 'GROS',
  SUPER_GROS = 'SUPER_GROS',
}

// -------------------------
// Main Response Model
// -------------------------
export interface SellerAuthResponse {
  // Seller Identity
  id: string; // UUID maps to string
  username: string;
  permissions: Permission[];
  permittedSaleSizes: SaleSize[];

  // Organization (The Company)
  organizationId: string;
  organizationName: string;
  organizationLogoUri: string | null;
  organizationEmail: string;
  taxNumber: string | null;

  // Agency (The Branch)
  agencyId: string;
  agencyName: string;
  agencyEmail: string | null;
  agencyPhone: string | null;
  agencyWhatsapp: string | null;
  agencyCity: string;
  agencyAddress: string;

  // Sales Point (Specific Stall/Register)
  salesPointId: string;
  salesPointName: string;
  salesPointAddress: string;

  createdAt: string; // ISO 8601 Instant string
}

// -------------------------
// Auth Wrapper (Token + Seller)
// -------------------------
export interface LoginResponse {
  token: string;
  type: string;
  seller: SellerAuthResponse;
}