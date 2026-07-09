'use client';

import React, { useEffect, useState, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Save, PackageCheck, Truck, Calculator } from "lucide-react";

// API & Types
import SalesOrderLogistics from "./SalesOrderLogistics";

import { UpdatedClientResponse } from "@/src/api/models/UpdatedClientResponse";
import { SalesOrderResponse } from "@/src/api/models/UpdatedSalesOrder";
import { UpdatedSalesOrderResponse } from "@/src/api/models/UpdatedSalesOrder";
// Sub-components (Assuming you have these adapted for Sales Orders)
import ClientHeader from "./ClientHeader";
import SalesOrderDetails from "./SalesOrderDetails";
import { mapSalesOrderToBonCommandeRequest } from "@/src/Mappers/BonCommandeMapper";
import { BonCommandeService } from "@/src/src2/api";
import { toast } from 'sonner';
import { UpdatedSellerResponse } from "@/src/api/models/UpdatedSellerResponse";
import { getVisibleClients } from "@/src/api/scopedTiers";

interface Props {
  isOpen: boolean;
  onClose: (param: boolean) => void;
  clientData?: UpdatedClientResponse;
  orderData?: UpdatedSalesOrderResponse;
}

const CreateSalesOrderModal = ({ isOpen, onClose, clientData, orderData }: Props) => {
  const [selectedClient, setSelectedClient] = useState<UpdatedClientResponse | undefined>(clientData);
  const [salesOrder, setSalesOrder] = useState<UpdatedSalesOrderResponse | undefined>();
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
      
      if (orderData) {
        // Mode: EDIT
        setSalesOrder(orderData);
        setSelectedClient(clientData);
      } else {
        // Mode: CREATE
        const newOrder: Partial<UpdatedSalesOrderResponse> = {
          
          statut: SalesOrderResponse.statut.BROUILLON,
          devise: "XAF",
          lignesSalesOrder: [],
          montantHT: 0,
          montantTVA: 0,
          montantTTC: 0,
          dateCreation: new Date().toISOString().split('T')[0],
          expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +3 days
          transportMethod: SalesOrderResponse.transportMethod.RETRAIT_MAGASIN,
          modeReglement: SalesOrderResponse.modeReglement.ESPECES,
        };
        setSalesOrder(newOrder as UpdatedSalesOrderResponse);
        setSelectedClient(clientData);
      }
    } else {
      document.body.style.overflow = "unset";
      setSalesOrder(undefined);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, orderData, clientData]);

  // 2. SAVE LOGIC
  const handleSave = async () => {
    if (!selectedClient || !salesOrder) return;

    const finalPayload: UpdatedSalesOrderResponse = {
      ...salesOrder,
      // Client Mapping
      idClient: selectedClient.idClient,
      nomClient: selectedClient.raisonSociale || selectedClient.username,
      emailClient: selectedClient.email,
      adresseClient: selectedClient.adresse,
      telephoneClient: selectedClient.telephone,
      
      // Default Recipient if not filled
      recipientName: salesOrder.recipientName || selectedClient.raisonSociale || selectedClient.username,
      recipientPhone: salesOrder.recipientPhone || selectedClient.telephone,
      recipientAddress: salesOrder.recipientAddress || selectedClient.adresse,

      // Metadata
      updatedAt: new Date().toISOString()
    };

    const apiPayload = mapSalesOrderToBonCommandeRequest(finalPayload);
    apiPayload.createdBy = seller?.Id;
    apiPayload.organizationId = seller?.organizationId;
    apiPayload.agencyId = seller?.agencyId;

    console.log("Saving Sales Order Payload:", finalPayload);
    console.log(salesOrder)
    

    try {
      if (!orderData?.idSalesOrder) {
        await BonCommandeService.createBonCommande(apiPayload)
      } else {
        await BonCommandeService.updateBonCommandeById(orderData.idSalesOrder, apiPayload)
      }
      toast.success(orderData?.idSalesOrder ? "Sales order updated successfully." : "Sales order created successfully.")
      onClose(false);
    } catch (error) {
      console.error("Failed to save sales order:", error);
      toast.error("Failed to save sales order. Please try again.")
    }
  };

  // 3. CHANGE HANDLER
  const handleOrderChange = useCallback((param: Partial<UpdatedSalesOrderResponse>) => {
    setSalesOrder((prev) => {
      const base = prev || orderData || {};
      return {
        ...base,
        ...param
      } as UpdatedSalesOrderResponse;
    });
  }, [orderData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0  " 
        onClick={() => onClose(false)} 
      />

      <div className="relative w-full max-w-5xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <PackageCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">
                {orderData ? "Edit Sales Order" : "New Sales Order"}
              </h2>
              <p className="text-xs text-gray-400 font-bold">{salesOrder?.numeroSalesOrder}</p>
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
            // Passing sales order specific object
            sales_order={salesOrder as any} 
            setSalesOrder={setSalesOrder as any}
          />
          <SalesOrderLogistics
           salesOrder={salesOrder} 
            setSalesOrder={setSalesOrder} 
            client={selectedClient} 
          />

          <SalesOrderDetails 
            sales_order={salesOrder} 
            setSalesOrder={setSalesOrder} 
            client={selectedClient} 
          />
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Order Value</span>
              <span className="text-2xl font-black text-secondary-mid">
                {salesOrder?.montantTTC?.toLocaleString()} <small className="text-xs">{salesOrder?.devise}</small>
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
                disabled={!selectedClient || (salesOrder?.lignesSalesOrder?.length ?? 0) === 0}
                className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
              >
                <Save size={18} />
                CONFIRM & SAVE ORDER
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSalesOrderModal;