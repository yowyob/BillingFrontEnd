"use client";

import React, { useEffect, useState ,useCallback} from "react";

import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import ClientHeader from "./ClientHeader";
import QuotationDetails from "./QuotationDetails";
import { CheckCircle2, Save,Receipt } from "lucide-react";
import { DevisResponse } from "@/src/api";
import { UpdatedClientResponse } from "@/src/api/models/UpdatedClientResponse";
import { UpdatedDevisResponse } from "@/src/api/models/UpdatedDevisResponse";
import { MOCK_QUOTATIONS } from "@/src/api/models/UpdatedDevisResponse";
import { mapUpdatedResponseToCreateRequest } from "@/src/Mappers/DevisMapper";
import { DevisService } from "@/src/src2/api";
import { toast } from 'sonner';
import { UpdatedSellerResponse } from "@/src/api/models/UpdatedSellerResponse";
import { getVisibleClients } from "@/src/api/scopedTiers";
interface Props {
  isOpen: boolean;
  onClose: (param: boolean) => void;
  clientData?:UpdatedClientResponse|undefined,
  quotationData?:UpdatedDevisResponse
  
  
}

interface headerData {
  clientId: string,
  creationDate: Date,
  validityDate: Date,
  applyVat?: boolean,
  paymentMethod?: string;             
  remiseGlobalePourcentage?: number;  
  isReferal?:boolean,
  nosRef?:string,
}

const QuotationFormModal = ({ isOpen, onClose,clientData,quotationData}: Props) => {
  const router=useRouter()
  const [selectedClient, setSelectedClient] = useState<UpdatedClientResponse|undefined>(clientData);
  
  const [headerData, setHeaderData] = useState<headerData>();

  const [quotation, setQuotation] = useState<UpdatedDevisResponse | undefined>();

  const [clients, setClients] = useState<UpdatedClientResponse[]>([]);



      const [seller,setSeller]=useState<UpdatedSellerResponse>()
        useEffect(() => {
          // Ensuring code runs only on client
          const stored = localStorage.getItem("seller");
          if (stored) {
            setSeller(JSON.parse(stored));
          }
        }, []);

      useEffect(() => {
        if (!isOpen) return;
        getVisibleClients()
          .then((data) => setClients(data as unknown as UpdatedClientResponse[]))
          .catch(() => toast.error("Failed to load clients."));
      }, [isOpen]);




  // 1. INITIALIZATION LOGIC
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      if (quotationData) {
        // Mode: EDIT
        setQuotation(quotationData);
        setSelectedClient(clientData);
      


      } else {
        // Mode: CREATE (Initialize with defaults)
        const newQuo: Partial<UpdatedDevisResponse> = {
          
          statut: DevisResponse.statut.BROUILLON,
          devise: "XAF",
          lignesDevis: [], // Start with empty lines
          montantHT: 0,
          montantTTC: 0,
          montantTVA: 0,
         
        };
        setQuotation(newQuo as UpdatedDevisResponse);
        setSelectedClient(clientData);
      }
    } else {
      document.body.style.overflow = "unset";
      // Clear state on close to avoid stale data when re-opening
      setQuotation(undefined);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, quotationData, clientData]);


  
  useEffect(() => {
    
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);
 const handleSave =async () => {


  if(quotationData==undefined){}
    // Combine everything for the API request
    // 1. Ensure we have a valid quotation object to work with
if (!quotation) return;

const finalPayload: UpdatedDevisResponse = {
  ...quotation,

  // String Fallbacks: Ensuring required strings aren't undefined
  idClient: selectedClient?.idClient || "",
  nomClient: selectedClient?.raisonSociale || "Unknown Client",
  emailClient: selectedClient?.email || "",

  // Date Safety: Only call .toISOString() if the date exists, otherwise use current date
  dateCreation: headerData?.creationDate?.toISOString() ?? new Date().toISOString(),
  dateValidite: headerData?.validityDate?.toISOString() ?? new Date().toISOString(),

  // VAT Toggle Logic
  applyVat: headerData?.applyVat ?? false,

  // Enum/Metadata Safety
  statut: quotation.statut || UpdatedDevisResponse.statut.BROUILLON,
  devise: quotation.devise || "XAF",

  // Numerical Safety: Using ?? 0 to satisfy 'number' requirement
  // We use the local 'quotation' values which were calculated in your state
  montantHT: quotation.montantHT ?? 0,
  finalAmount: quotation.finalAmount ?? 0,

  montantTTC: headerData?.applyVat 
    ? (quotation.montantTTC ?? 0) 
    : (quotation.montantHT ?? 0),
    
  montantTVA: headerData?.applyVat 
    ? (quotation.montantTVA ?? 0) 
    : 0,
    
  // Ensure lines are always an array
  lignesDevis: quotation.lignesDevis || [],

  organizationId:seller?.organizationId,
  agencyId:seller?.agencyId,
  createdBy:seller?.Id

};

    const request = mapUpdatedResponseToCreateRequest(finalPayload);
    console.log(finalPayload)
    console.log(request)

  try {
    if (!quotationData?.idDevis) {
      // MODE CRÉATION (also covers a prefilled-but-not-yet-saved draft, e.g. transformed from a proposal)
      await DevisService.createDevis(request);
      console.log("Devis créé");
    } else {
      // MODE ÉDITION
      await DevisService.updateDevis(quotationData.idDevis, request);
      console.log("Devis mis à jour");
    }

    toast.success(quotationData?.idDevis ? "Quotation updated successfully." : "Quotation created successfully.")
    router.refresh();
    onClose(false);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
    toast.error("Failed to save quotation. Please try again.")
  } finally {
   // setIsSaving(false); // Déverrouille le bouton dans tous les cas
  }
  };

 const handleQuotationDataChange = useCallback((param: Partial<UpdatedDevisResponse>) => {
    setQuotation((prev) => {
      // Merge previous state with new parameters
      const base = prev || quotationData || {};
      return {
        ...base,
        ...param
      } as UpdatedDevisResponse;

    })
    
    
    
  }, [quotationData]);

 

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
    {/* Background Overlay */}
    <div 
      className="absolute inset-0" 
      onClick={() => onClose(false)} 
    />

    <div className="relative w-full max-w-5xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      
      {/* HEADER - Adjusted for Quotation Branding */}
      <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
            {/* Using Receipt or FileText as per your visual preference */}
            <Receipt size={24} /> 
          </div>
          <div>
            <h2 className="text-xl font-black text-secondary uppercase tracking-tight">
              {quotationData?.idDevis ? "Edit Quotation" : "New Quotation"}
            </h2>
            <p className="text-xs text-gray-400 font-bold">{quotation?.numeroDevis}</p>
          </div>
        </div>
        <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <CloseIcon className="text-gray-400" />
        </button>
      </div>

      {/* BODY - Matching Invoice Padding and Spacing */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50">
        <ClientHeader 
          clients={clients} 
          setMainSelectedClient={setSelectedClient}
          selectClient={selectedClient}
          quotation={quotation}
          setQuotation={setQuotation}
        />

        <QuotationDetails 
          quotation={quotation} 
          setQuotation={setQuotation} 
          client={selectedClient} 
        />
      </div>

      {/* FOOTER - Updated with Total Summary and Discard Logic */}
      <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Quotation</span>
            <span className="text-2xl font-black text-secondary-mid">
              {quotation?.montantTTC?.toLocaleString()} <small className="text-xs">{quotation?.devise || 'XAF'}</small>
            </span>
         </div>

         <div className="flex items-center gap-4">
            <button 
              onClick={() => onClose(false)}
              className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={handleSave}
              disabled={!selectedClient || (quotation?.lignesDevis?.length ?? 0) === 0}
              className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
            >
              <Save size={18} />
              {quotationData?.idDevis ? "UPDATE QUOTATION" : "SAVE & GENERATE DEVIS"}
            </button>
         </div>
      </div>
    </div>
  </div>
);}
export default QuotationFormModal;