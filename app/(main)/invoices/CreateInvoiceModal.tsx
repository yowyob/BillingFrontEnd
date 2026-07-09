'use client';

import React, { useEffect, useState, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Save, Receipt, Calculator } from "lucide-react";

// API & Types
import { FactureResponse } from "@/src/api";
import { UpdatedClientResponse } from "@/src/api/models/UpdatedClientResponse";
import { UpdatedFactureResponse } from "@/src/api/models/UpdatedFactureResponse";
// Assuming you have equivalent sub-components for Invoices
import ClientHeader from "./ClientHeader"; // Ensure this handles UpdatedFactureResponse
import InvoiceDetails from "./InvoiceDetails";
import InvoicePrintPreviewModal from "./InvoicePrintPreviewModal";
import { mapUpdatedFactureToCreateRequest } from "@/src/Mappers/FactureMapper";
import { FactureService } from "@/src/src2/api/services/FactureService";
import { useRouter } from "next/navigation";
import { UpdatedSellerResponse } from "@/src/api/models/UpdatedSellerResponse";
import { toast } from 'sonner';
import { getVisibleClients } from "@/src/api/scopedTiers";

interface Props {
  isOpen: boolean;
  onClose: (param: boolean) => void;
  clientData?: UpdatedClientResponse;
  factureData?: UpdatedFactureResponse;
  
}

const CreateInvoiceModal = ({ isOpen, onClose, clientData, factureData }: Props) => {
  const [selectedClient, setSelectedClient] = useState<UpdatedClientResponse | undefined>(clientData);
  const [facture, setFacture] = useState<UpdatedFactureResponse | undefined>();
  const [seller,setSeller]=useState<UpdatedSellerResponse>()
  const [clients, setClients] = useState<UpdatedClientResponse[]>([]);
          useEffect( () => {
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

  const router=useRouter()
  // 1. INITIALIZATION LOGIC
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      if (factureData) {
        // Mode: EDIT
        setFacture(factureData);
        setSelectedClient(clientData);
      } else {
        // Mode: CREATE
        // Dans votre useEffect, section Mode: CREATE
      const newFacture: Partial<UpdatedFactureResponse> = {
        // ... reste du code
        lignesFacture: [],
        montantHT: 0,
        montantTVA: 0,
        montantTTC: 0,
        montantRestant: 0,
        applyVat: true,
        // CORRECTION : On garde le format complet avec l'heure
        dateFacturation: new Date().toISOString(), 
        dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
        setFacture(newFacture as UpdatedFactureResponse);
        setSelectedClient(clientData);
      }
    } else {
      document.body.style.overflow = "unset";
      setFacture(undefined);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, factureData, clientData]);

  // 2. SAVE LOGIC
  const handleSave = async () => {
    if (!selectedClient || !facture) return;

    const formatToLocalDateTime = (dateStr?: string) => {
    if (!dateStr) return new Date().toISOString();
    return dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00Z`;
  };

    const finalPayload: UpdatedFactureResponse = {
      ...facture,
      // Client Mapping
      idClient: selectedClient.idClient,
      nomClient: selectedClient.raisonSociale || selectedClient.username,
      emailClient: selectedClient.email,
      adresseClient: selectedClient.adresse,
      telephoneClient: selectedClient.telephone,
      dateFacturation: formatToLocalDateTime(facture.dateFacturation),
      dateEcheance: formatToLocalDateTime(facture.dateEcheance),
      // Ensure financials are finalized
      montantTotal: facture.montantTTC,
      montantRestant:  facture.montantTTC,
      
      // Metadata
      updatedAt: new Date().toISOString(),
       organizationId:seller?.organizationId,
      agencyId:seller?.agencyId,
      // Preserve origin on edit; brand-new invoices created here are always
      // through the regular web sales flow, not a POS terminal register.
      originType: facture.originType ?? 'SALES',
      createdBy:seller?.Id
    };

    console.log("Saving Facture Payload:", finalPayload);

    const tranformed=mapUpdatedFactureToCreateRequest(finalPayload)
    console.log(tranformed)



    if (!factureData?.idFacture) {
      console.log("API CALL: Creating new Invoice...");
      await FactureService.createFacture(tranformed);

    } else {
      console.log("API CALL: Updating existing Invoice...");
      if (factureData.idFacture) {
        await FactureService.updateFacture(factureData.idFacture, tranformed);
      }
    }
    toast.success(factureData?.idFacture ? "Invoice updated successfully." : "Invoice created successfully.")
    router.refresh()
    onClose(false);
  };

  // 3. CHANGE HANDLER
  const handleFactureChange = useCallback((param: Partial<UpdatedFactureResponse>) => {
    setFacture((prev) => {
      const base = prev || factureData || {};
      return {
        ...base,
        ...param
      } as UpdatedFactureResponse;
    });
  }, [factureData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 " 
        onClick={() => onClose(false)} 
      />

      <div className="relative w-full max-w-5xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <Receipt size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">
                {factureData ? "Edit Invoice" : "New Invoice"}
              </h2>
              <p className="text-xs text-gray-400 font-bold">{facture?.numeroFacture}</p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50">
          <ClientHeader 
            clients={clients} 
            setMainSelectedClient={setSelectedClient}
            selectClient={selectedClient}
            // Passing invoice specific object
            Invoice={facture as any} 
            setInvoice={setFacture as any}
          />

          <InvoiceDetails 
            invoice={facture} 
            setInvoice={setFacture} 
            client={selectedClient} 
          />
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
              <span className="text-2xl font-black text-secondary-mid">
                {facture?.montantTTC?.toLocaleString()} <small className="text-xs">{facture?.devise}</small>
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
                disabled={!selectedClient || (facture?.lignesFacture?.length ?? 0) === 0}
                className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
              >
                <Save size={18} />
                SAVE & GENERATE INVOICE
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;