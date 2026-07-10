"use client";

import React, { useEffect, useState ,useCallback} from "react";

import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import ClientHeader from "./ClientHeader";
import ProformaInvoiceDetails from "./ProformaInvoiceDetails";
import { CheckCircle2, Save,Receipt } from "lucide-react";
import { DevisResponse } from "@/src/api";
import { UpdatedClientResponse } from "@/src/api/models/UpdatedClientResponse";
import { UpdatedProformaInvoiceResponse,MOCK_PROFORMA_INVOICE } from "@/src/api/models/UpdatedProformaInvoiceResponse";
import { mapUIToProformaRequest } from "@/src/Mappers/ProformaMapper";
import { createProformaOffline, updateProformaOffline } from "@/src/offline/services/proformaService";
import { isFullyOnline } from "@/src/offline/network/connectivity";
import { toast } from 'sonner';
import { UpdatedSellerResponse } from "@/src/api/models/UpdatedSellerResponse";
import { getVisibleClients } from "@/src/api/scopedTiers";
interface Props {
  isOpen: boolean;
  onClose: (param: boolean) => void;
  clientData?:UpdatedClientResponse|undefined,
  ProformaInvoiceData?:UpdatedProformaInvoiceResponse
  
  
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

const CreateProformaInvoiceModal = ({ isOpen, onClose,clientData,ProformaInvoiceData}: Props) => {
  const [selectedClient, setSelectedClient] = useState<UpdatedClientResponse|undefined>(clientData);
  
  const [headerData, setHeaderData] = useState<headerData>();

  const [ProformaInvoice, setProformaInvoice] = useState<UpdatedProformaInvoiceResponse | undefined>();

  const [clients, setClients] = useState<UpdatedClientResponse[]>([]);
  const [seller, setSeller] = useState<UpdatedSellerResponse>();

  useEffect(() => {
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
      
      if (ProformaInvoiceData) {
        // Mode: EDIT
        setProformaInvoice(ProformaInvoiceData);
        setSelectedClient(clientData);
      


      } else {
        // Mode: CREATE (Initialize with defaults)
        const newQuo: Partial<UpdatedProformaInvoiceResponse> = {
          numeroProformaInvoice: `QUO-${new Date().getTime()}`, // Temporary ID or call gen function
          
          statut: DevisResponse.statut.BROUILLON,
          devise: "XAF",
          lignesDevis: [], // Start with empty lines
          montantHT: 0,
          montantTTC: 0,
          montantTVA: 0,
         
        };
        setProformaInvoice(newQuo as UpdatedProformaInvoiceResponse);
        setSelectedClient(clientData);
      }
    } else {
      document.body.style.overflow = "unset";
      // Clear state on close to avoid stale data when re-opening
      setProformaInvoice(undefined);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, ProformaInvoiceData, clientData]);


  
  useEffect(() => {
    
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);
 const handleSave =async  () => {


  if(ProformaInvoiceData==undefined){}
    // Combine everything for the API request
    const finalPayload: UpdatedProformaInvoiceResponse = {
    ...ProformaInvoice,
    
    idClient: selectedClient?.idClient,
    nomClient: selectedClient?.raisonSociale,
    emailClient: selectedClient?.email,
    dateCreation: headerData?.creationDate.toISOString(),
    applyVat: headerData?.applyVat ?? false,
    
    statut: ProformaInvoice?.statut || DevisResponse.statut.BROUILLON,
    devise: ProformaInvoice?.devise || "XAF",

    // FIX: Add fallbacks for numbers to satisfy the interface
    finalAmount: ProformaInvoice?.finalAmount ?? 0,
    montantHT: ProformaInvoice?.montantHT ?? 0,

    montantTTC: headerData?.applyVat 
      ? (ProformaInvoice?.montantTTC ?? 0)
      : (ProformaInvoice?.montantHT ?? 0),
      
    montantTVA: headerData?.applyVat 
      ? (ProformaInvoice?.montantTVA ?? 0)
      : 0,
};

  const apiPayload = mapUIToProformaRequest(finalPayload);
  apiPayload.createdBy = seller?.Id;
  apiPayload.organizationId = seller?.organizationId;
  apiPayload.agencyId = seller?.agencyId;
    console.log("Saving ProformaInvoice Payload:", finalPayload);
    // Add your API call here (e.g., mutate(finalPayload))

    try {
      const online = await isFullyOnline();
      if (ProformaInvoiceData?.idProformaInvoice == undefined) {
        await createProformaOffline(apiPayload);
      } else if (ProformaInvoice?.idProformaInvoice) {
        await updateProformaOffline(ProformaInvoice.idProformaInvoice, apiPayload);
      }
      const offlineMsg = !online ? " (sauvegardé localement, synchronisation en attente)" : "";
      toast.success(
        (ProformaInvoiceData?.idProformaInvoice ? "Proforma updated successfully." : "Proforma invoice created successfully.") + offlineMsg
      );
      onClose(false);
    } catch (error) {
      console.error("Failed to save proforma invoice:", error);
      toast.error("Failed to save proforma invoice. Please try again.")
    }
  };

 const handleProformaInvoiceDataChange = useCallback((param: Partial<UpdatedProformaInvoiceResponse>) => {
    setProformaInvoice((prev) => {
      // Merge previous state with new parameters
      const base = prev || ProformaInvoiceData || {};
      return {
        ...base,
        ...param
      } as UpdatedProformaInvoiceResponse;

    })
    
    
    
  }, [ProformaInvoiceData]);

 

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
    {/* Background Overlay */}
    <div 
      className="absolute inset-0" 
      onClick={() => onClose(false)} 
    />

    <div className="relative w-full max-w-5xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      
      {/* HEADER - Adjusted for ProformaInvoice Branding */}
      <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
            {/* Using Receipt or FileText as per your visual preference */}
            <Receipt size={24} /> 
          </div>
          <div>
            <h2 className="text-xl font-black text-secondary uppercase tracking-tight">
              {ProformaInvoiceData ? "Edit ProformaInvoice" : "New ProformaInvoice"}
            </h2>
            <p className="text-xs text-gray-400 font-bold">{ProformaInvoice?.numeroProformaInvoice}</p>
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
          ProformaInvoice={ProformaInvoice}
          setProformaInvoice={setProformaInvoice}
        />

        <ProformaInvoiceDetails 
          ProformaInvoice={ProformaInvoice} 
          setProformaInvoice={setProformaInvoice} 
          client={selectedClient} 
        />
      </div>

      {/* FOOTER - Updated with Total Summary and Discard Logic */}
      <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total ProformaInvoice</span>
            <span className="text-2xl font-black text-secondary-mid">
              {ProformaInvoice?.montantTTC?.toLocaleString()} <small className="text-xs">{ProformaInvoice?.devise || 'XAF'}</small>
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
              disabled={!selectedClient || (ProformaInvoice?.lignesDevis?.length ?? 0) === 0}
              className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
            >
              <Save size={18} />
              {ProformaInvoiceData?.idProformaInvoice ? "UPDATE ProformaInvoice" : "SAVE & GENERATE DEVIS"}
            </button>
         </div>
      </div>
    </div>
  </div>
);}
export default CreateProformaInvoiceModal;