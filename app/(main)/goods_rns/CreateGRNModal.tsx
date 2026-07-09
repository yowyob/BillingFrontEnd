"use client";

import React, { useEffect, useState, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Save, Receipt, Truck } from "lucide-react";

// API & Types
import { GoodsReceiptNoteResponse,GoodReceiptResponse } from "@/src/api/models/GoodsReceiptNote";
import { UpdatedClientResponse } from "@/src/api/models/UpdatedClientResponse";

// GRN Sub-components
import ClientHeader from "./ClientHeader";
import GRNDetails from "./GRNDetails";
import { mapInternalToBondeReceptionCreateRequest } from "@/src/Mappers/GRNMapper";
import { BondeReceptionControllerService } from "@/src/src2/api";
import { toast } from 'sonner';
import { UpdatedSellerResponse } from "@/src/api/models/UpdatedSellerResponse";
import { getVisibleFournisseurs } from "@/src/api/scopedTiers";
interface Props {
  isOpen: boolean;
  onClose: (param: boolean) => void;
  clientData?: UpdatedClientResponse; // Acts as Supplier/Producer
  grnData?: GoodsReceiptNoteResponse;
}

const CreateGRNModal = ({ isOpen, onClose, clientData, grnData }: Props) => {
  const [selectedClient, setSelectedClient] = useState<UpdatedClientResponse | undefined>(clientData);
  const [grn, setGrn] = useState<GoodsReceiptNoteResponse | undefined>();
  const [producers, setProducers] = useState<UpdatedClientResponse[]>([]);
  const [seller, setSeller] = useState<UpdatedSellerResponse>();

  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) {
      setSeller(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    getVisibleFournisseurs()
      .then((data) => setProducers(data.map((f) => ({
        ...f,
        idClient: f.idFournisseur,
        typeClient: f.typeFournisseur as unknown as UpdatedClientResponse["typeClient"],
        codeClient: f.codeFournisseur,
      })) as unknown as UpdatedClientResponse[]))
      .catch(() => toast.error("Failed to load suppliers."));
  }, [isOpen]);

  // 1. INITIALIZATION LOGIC
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      if (grnData) {
        // Mode: EDIT
        setGrn(grnData);
        setSelectedClient(clientData);
      } else {
        // Mode: CREATE
        const newGRN: Partial<GoodsReceiptNoteResponse> = {
        
          status: GoodReceiptResponse.statut.DRAFT,
          lines: [],
          receiptDate: new Date().toISOString(),
          documentDate: new Date().toISOString(),
          systemDate: new Date().toISOString(),
          remarks: "",
        };
        setGrn(newGRN as GoodsReceiptNoteResponse);
        setSelectedClient(clientData);
      }
    } else {
      document.body.style.overflow = "unset";
      setGrn(undefined);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, grnData, clientData]);

  // 2. SAVE LOGIC
  const handleSave = async () => {
    if (!selectedClient || !grn) return;

    const finalPayload: GoodsReceiptNoteResponse = {
      ...grn,
      // Supplier Mapping (Equivalent to Client Mapping)
      supplierId: selectedClient.idClient,
      supplierName: selectedClient.raisonSociale || selectedClient.username,
      
      // Metadata
      updatedAt: new Date().toISOString(),
      createdAt: grn.createdAt || new Date().toISOString()
    };

    const apiPayload = mapInternalToBondeReceptionCreateRequest(finalPayload);
    apiPayload.createdBy = seller?.Id;
    apiPayload.organizationId = seller?.organizationId;
    apiPayload.agencyId = seller?.agencyId;

    console.log("Saving GRN Payload:", finalPayload);

    try {
      if (!grnData?.idGRN) {
        await BondeReceptionControllerService.createBon(apiPayload)
      } else if (grnData.idGRN) {
        await BondeReceptionControllerService.updateBon(grnData.idGRN, apiPayload)
      }
      toast.success(grnData?.idGRN ? "GRN updated successfully." : "GRN created successfully.")
      onClose(false);
    } catch (error) {
      console.error("Failed to save GRN:", error);
      toast.error("Failed to save GRN. Please try again.")
    }
  };

  // 3. CHANGE HANDLER
  const handleGRNChange = useCallback((param: Partial<GoodsReceiptNoteResponse>) => {
    setGrn((prev) => {
      const base = prev || grnData || {};
      return {
        ...base,
        ...param
      } as GoodsReceiptNoteResponse;
    });
  }, [grnData]);

  if (!isOpen) return null;

  // Calculate total received quantity for the footer display
  const totalReceived = grn?.lines?.reduce((acc, line) => acc + (line.receivedQuantity || 0), 0) || 0;

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
              <Truck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">
                {grnData ? "Edit Goods Receipt" : "New Goods Receipt"}
              </h2>
              <p className="text-xs text-gray-400 font-bold">{grn?.grnNumber}</p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50">
          <ClientHeader
            producers={producers}
            setMainSelectedProducer={setSelectedClient}
            selectedProducer={selectedClient}
            grn={grn as any} 
            setGrn={setGrn as any}
          />

          <GRNDetails 
            grn={grn} 
            setGrn={setGrn} 
          
          />
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Items Received</span>
              <span className="text-2xl font-black text-secondary-mid">
                {totalReceived.toLocaleString()} <small className="text-xs">UNITS</small>
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
                disabled={!selectedClient || (grn?.lines?.length ?? 0) === 0}
                className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
              >
                <Save size={18} />
                SAVE & GENERATE GRN
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGRNModal;