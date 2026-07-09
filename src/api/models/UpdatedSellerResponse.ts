import { SellerUIPermissionsResponse } from "../../src2/api/models/SellerUIPermissionsResponse";

// -------------------------
// Sale size enum
// -------------------------
export enum SaleSize {
  DETAIL = 'DETAIL',
  DEMIS_GROS = 'DEMIS_GROS',
  GROS = 'GROS',
  SUPER_GROS = 'SUPER_GROS',
}

// -------------------------
//  permission enum
// -------------------------
export enum Permission {
  NEGOTIATE_PRICE = 'NEGOTIATE_PRICE',
  APPLY_DISCOUNT = 'APPLY_DISCOUNT',
  OVERRIDE_PRICE = 'OVERRIDE_PRICE',
  APPROVE_DOCUMENT="APPROVE_DOCUMENT",

}

// -------------------------
// Seller role enum
// -------------------------
export enum SellerRole {
  POS_SELLER = 'POS_SELLER',
  SELLER = 'SELLER',
  AGENCY_MANAGER = 'AGENCY_MANAGER',
  OWNER = 'OWNER',
}




// -------------------------
// Updated seller type
// -------------------------
export type UpdatedSellerResponse = {
  accessToken: string;
  Id:string,
  username: string;
  role: SellerRole;
  agency: string;
  salePoint: string;
  profileImageUrl?: string;

 
 Permissions: Permission[];


  permittedSaleSizes: SaleSize[];

  
   
   
    // Organization (The Company)
     organizationId:string;
    organizationName:string;
     organizationLogoUri:string;
    organizationEmail:string;
    taxNumber:string;

    // Agency (The Branch)
    agencyId:string;
    
   agencyEmail:string;
    agencyPhone:string;
    
    agencyCity:string;
     agencyAddress:string;

    // Sales Point (Specific Stall/Register)
    salesPointId:string;
    
     salesPointAddress:string;

     createdAt:string;

     mustChangePassword: boolean;

     uiPermissions?: SellerUIPermissionsResponse | null;
};








