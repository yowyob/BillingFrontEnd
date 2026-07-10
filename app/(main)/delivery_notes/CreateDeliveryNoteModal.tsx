'use client';

import React, { useEffect, useState, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Save, Truck, Split, AlertTriangle, Package } from "lucide-react";

import { DeliveryNoteResponse } from "@/src/api/models/DeliveryNoteResponse";
import { UpdatedClientResponse } from "@/src/api/models/UpdatedClientResponse";
import ClientHeader from "./ClientHeader";
import DeliveryNoteDetails from "./DeliveryNoteDetails";
import DeliveryNoteLogistics from "./DeliveryNoteLogistics";
import { createBonLivraisonOffline, updateBonLivraisonOffline } from "@/src/offline/services/bonLivraisonService";
import { createBackOrderOffline } from "@/src/offline/services/backOrderService";
import { isFullyOnline } from "@/src/offline/network/connectivity";
import { mapDeliveryNoteToRequest } from "@/src/Mappers/DeliveryNoteMapper";
import { BackOrderRequest } from "@/src/src2/api/models/BackOrderRequest";
import { toast } from 'sonner';
import { UpdatedSellerResponse } from "@/src/api/models/UpdatedSellerResponse";
import { getVisibleClients } from "@/src/api/scopedTiers";

interface Props {
  isOpen: boolean;
  onClose: (param: boolean) => void;
  clientData?: UpdatedClientResponse;
  deliveryNoteData?: DeliveryNoteResponse;
}

const CreateDeliveryNoteModal = ({ isOpen, onClose, clientData, deliveryNoteData }: Props) => {
  const [selectedClient, setSelectedClient] = useState<UpdatedClientResponse | undefined>(clientData);
  const [deliveryNote, setDeliveryNote] = useState<DeliveryNoteResponse | undefined>();
  const [isPartial, setIsPartial] = useState(false);
  const [showBackOrderPrompt, setShowBackOrderPrompt] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<DeliveryNoteResponse | null>(null);
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

  // Init
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (deliveryNoteData) {
        setDeliveryNote(deliveryNoteData);
        setSelectedClient(clientData);
        setIsPartial(deliveryNoteData.isPartial ?? false);
      } else {
        setDeliveryNote({
          etat: DeliveryNoteResponse.etat.BROUILLON,
          deliveryDate: new Date().toISOString().split('T')[0],
          lines: [],
          totalAmount: 0,
          termsAndConditions: "Goods must be checked upon arrival.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setSelectedClient(clientData);
        setIsPartial(false);
      }
    } else {
      document.body.style.overflow = "unset";
      setDeliveryNote(undefined);
      setShowBackOrderPrompt(false);
      setPendingPayload(null);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, deliveryNoteData, clientData]);

  const handlePartialToggle = () => {
    const next = !isPartial;
    setIsPartial(next);
    if (!deliveryNote) return;

    if (next) {
      // Turning ON — copy quantity → quantiteTotal & quantiteLivree, restante = 0
      setDeliveryNote({
        ...deliveryNote,
        lines: (deliveryNote.lines || []).map(l => ({
          ...l,
          quantiteTotal: l.quantiteTotal ?? l.quantity ?? 0,
          quantiteLivree: l.quantiteLivree ?? l.quantity ?? 0,
          quantiteRestante: 0,
        })),
      });
    } else {
      // Turning OFF — restore quantity from quantiteLivree, strip partial fields
      setDeliveryNote({
        ...deliveryNote,
        lines: (deliveryNote.lines || []).map(l => ({
          ...l,
          quantity: l.quantiteLivree ?? l.quantity,
          quantiteTotal: undefined,
          quantiteLivree: undefined,
          quantiteRestante: undefined,
        })),
      });
    }
  };

  const buildPayload = (): DeliveryNoteResponse | null => {
    if (!selectedClient || !deliveryNote) return null;
    return {
      ...deliveryNote,
      isPartial,
      etat: isPartial ? DeliveryNoteResponse.etat.PARTIELLE : deliveryNote.etat,
      idClient: selectedClient.idClient,
      nomClient: selectedClient.raisonSociale || selectedClient.username,
      adresseClient: selectedClient.adresse,
      emailClient: selectedClient.email,
      telephoneClient: selectedClient.telephone,
      recipientName: deliveryNote.recipientName || selectedClient.raisonSociale,
      recipientPhone: deliveryNote.recipientPhone || selectedClient.telephone,
      recipientAddress: deliveryNote.recipientAddress || selectedClient.adresse,
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = async () => {
    if (!selectedClient || !deliveryNote || (deliveryNote.lines?.length ?? 0) === 0) {
      toast.error("Please select a client and add at least one item.");
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    // If partial and has missing items → prompt about back order first
    if (isPartial) {
      const hasMissing = (payload.lines || []).some(l => (l.quantiteRestante ?? 0) > 0);
      if (hasMissing) {
        setPendingPayload(payload);
        setShowBackOrderPrompt(true);
        return;
      }
    }

    await persistDN(payload, false);
  };

  const persistDN = async (payload: DeliveryNoteResponse, createBO: boolean) => {
    const apiPayload = mapDeliveryNoteToRequest(payload);
    apiPayload.createdBy = seller?.Id;
    apiPayload.organizationId = seller?.organizationId;
    apiPayload.agencyId = seller?.agencyId;
    try {
      const online = await isFullyOnline();
      if (!deliveryNoteData?.idDN) {
        await createBonLivraisonOffline(apiPayload);
      } else {
        await updateBonLivraisonOffline(deliveryNoteData.idDN, apiPayload);
      }

      if (createBO) {
        await createBackOrderFromDN(payload);
      }

      const offlineMsg = !online ? " (sauvegardé localement, synchronisation en attente)" : "";
      toast.success((deliveryNoteData ? "Delivery note updated." : "Delivery note created.") + offlineMsg);
      onClose(true);
    } catch {
      toast.error("Failed to save delivery note. Please try again.");
    }
  };

  const createBackOrderFromDN = async (payload: DeliveryNoteResponse) => {
    const missingLines = (payload.lines || [])
      .filter(l => (l.quantiteRestante ?? 0) > 0)
      .map(l => ({
        idProduit: l.productId,
        nomProduit: l.description,
        quantiteCommandee: l.quantiteTotal,
        quantiteRecue: l.quantiteLivree,
        quantiteEnAttente: l.quantiteRestante,
        prixUnitaire: l.unitPrice,
      }));

    try {
      await createBackOrderOffline({
        idBonLivraison: payload.idDN ?? '',
        numeroBonLivraison: payload.deliveryNoteNumber,
        idClient: payload.idClient,
        nomClient: payload.nomClient,
        lignes: missingLines,
        statut: BackOrderRequest.statut.EN_ATTENTE,
        notes: `Generated from partial delivery ${payload.deliveryNoteNumber || ''} (SO: ${payload.SaleOrderNumber || ''})`,
        organizationId: seller?.organizationId,
        agencyId: seller?.agencyId,
        createdBy: seller?.Id,
      });
      const online = await isFullyOnline();
      toast.success(`Back order created${!online ? ' (sync en attente)' : ''}.`);
    } catch {
      toast.error("Delivery note saved but back order creation failed.");
    }
  };

  const handleBackOrderConfirm = async (createBO: boolean) => {
    setShowBackOrderPrompt(false);
    if (pendingPayload) await persistDN(pendingPayload, createBO);
    setPendingPayload(null);
  };

  const handleNoteChange = useCallback((param: Partial<DeliveryNoteResponse>) => {
    setDeliveryNote(prev => ({ ...(prev || {}), ...param } as DeliveryNoteResponse));
  }, []);

  const missingCount = isPartial
    ? (deliveryNote?.lines || []).filter(l => (l.quantiteRestante ?? 0) > 0).length
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      <div className="absolute inset-0" onClick={() => onClose(false)} />

      <div className="relative w-full max-w-5xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* HEADER */}
        <div className="px-8 py-5 border-b border-secondary-light flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Truck size={26} />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary uppercase tracking-tight">
                {deliveryNoteData ? "Edit Delivery Note" : "New Delivery Note"}
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-xs text-secondary-gray font-bold">{deliveryNote?.deliveryNoteNumber}</p>
                {deliveryNote?.SaleOrderNumber && (
                  <span className="text-[10px] bg-secondary-super-light text-secondary-mid px-2 py-0.5 rounded border border-secondary-light font-black uppercase">
                    SO: {deliveryNote.SaleOrderNumber}
                  </span>
                )}
                {isPartial && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200 font-black uppercase flex items-center gap-1">
                    <Split size={10} /> Partial
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Partial delivery toggle strip — always visible */}
        <div className="px-8 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <Split size={16} className="text-blue-600" />
            <div>
              <p className="text-xs font-black text-gray-700 uppercase tracking-wide">Partial Delivery</p>
              <p className="text-[10px] text-gray-400 font-medium">
                {isPartial
                  ? 'Active — reduce Qty Delivered per line to flag missing items'
                  : 'Toggle on to deliver part of the order and track missing items'}
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={handlePartialToggle}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
              isPartial ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              isPartial ? 'translate-x-8' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {isPartial && (
          <div className="px-8 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
            <AlertTriangle size={14} className="text-blue-500 shrink-0" />
            <p className="text-[11px] font-bold text-blue-700">
              Total Qty and Delivered are equal by default — reduce Delivered to create missing items. A back order linked to the Sales Order will be offered on save.
            </p>
          </div>
        )}

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-secondary-super-light/10">
          <ClientHeader
            clients={clients}
            setMainSelectedClient={setSelectedClient}
            selectClient={selectedClient}
            deliveryNote={deliveryNote}
            setDeliveryNote={setDeliveryNote}
          />
          <DeliveryNoteLogistics
            deliveryNote={deliveryNote}
            setDeliveryNote={setDeliveryNote}
            client={selectedClient}
          />
          <DeliveryNoteDetails
            deliveryNote={deliveryNote}
            setDeliveryNote={setDeliveryNote}
            isPartial={isPartial}
          />
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-secondary-light bg-white flex justify-between items-center gap-4 shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-secondary-gray uppercase tracking-widest">
              {isPartial ? 'Lines with Missing Items' : 'Estimated Value'}
            </span>
            {isPartial ? (
              <span className="text-3xl font-black text-blue-600">
                {missingCount} <small className="text-sm text-gray-400 font-bold">line(s)</small>
              </span>
            ) : (
              <span className="text-3xl font-black text-primary">
                {deliveryNote?.totalAmount?.toLocaleString()} <small className="text-sm text-secondary-mid font-bold">XAF</small>
              </span>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onClose(false)} className="text-xs font-black text-secondary-gray hover:text-primary uppercase tracking-widest transition-colors">
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedClient || (deliveryNote?.lines?.length ?? 0) === 0}
              className="flex items-center gap-3 bg-secondary-mid hover:bg-primary text-white px-10 py-4 rounded-xl font-black text-sm shadow-xl shadow-secondary/20 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
            >
              <Save size={20} />
              {isPartial ? 'SAVE PARTIAL DELIVERY' : 'SAVE DELIVERY NOTE'}
            </button>
          </div>
        </div>
      </div>

      {/* BACK ORDER PROMPT */}
      {showBackOrderPrompt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-50 rounded-2xl shrink-0">
                <Package className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-primary">Missing Items Detected</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {(pendingPayload?.lines || []).filter(l => (l.quantiteRestante ?? 0) > 0).length} line(s) have undelivered quantities.
                  Do you want to create a back order for these items, linked to Sales Order <span className="font-bold text-secondary-mid">{pendingPayload?.SaleOrderNumber || '—'}</span>?
                </p>
              </div>
            </div>

            {/* Missing lines preview */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2 max-h-40 overflow-y-auto">
              {(pendingPayload?.lines || []).filter(l => (l.quantiteRestante ?? 0) > 0).map((l, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{l.description}</span>
                  <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                    {l.quantiteRestante} missing
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleBackOrderConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-wider"
              >
                No, just save DN
              </button>
              <button
                onClick={() => handleBackOrderConfirm(true)}
                className="flex-1 px-4 py-3 rounded-xl bg-secondary-mid hover:bg-primary text-white text-sm font-black shadow-lg shadow-secondary/20 transition-all active:scale-95 uppercase tracking-wider"
              >
                Yes, create back order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDeliveryNoteModal;
