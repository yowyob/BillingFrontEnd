'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home"; 
import ReceiptIcon from "@mui/icons-material/Receipt"; 
import { Truck, MapPin, Phone, User, Building2 } from 'lucide-react';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { MOCK_SALES_ORDERS, UpdatedSalesOrderResponse } from '@/src/api/models/UpdatedSalesOrder';
import { DeliveryNoteResponse } from '@/src/api/models/DeliveryNoteResponse';
import { transformSalesOrderToDeliveryNote } from '@/src/api/transformation/deliveryOrderTransformation';
import { BonCommandeService } from '@/src/src2/api/services/BonCommandeService';
import { mapBonCommandeListToSalesOrderList } from '@/src/Mappers/BonCommandeMapper';
import { toast } from 'sonner';

interface Props {
  clients: UpdatedClientResponse[];
  setMainSelectedClient: (data: UpdatedClientResponse) => void;
  selectClient?: UpdatedClientResponse;
  deliveryNote?: DeliveryNoteResponse;
  setDeliveryNote: (data: DeliveryNoteResponse) => void;
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const readOnlyStyles = "w-full border border-gray-100 bg-gray-50 rounded-lg py-2 px-3 text-sm text-gray-600 cursor-not-allowed font-medium";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const ClientHeader = ({ clients, setMainSelectedClient, selectClient, deliveryNote, setDeliveryNote }: Props) => {
  const [searchTerm, setSearchTerm] = useState(selectClient?.raisonSociale || "");
  const [filteredResults, setFilteredResults] = useState<UpdatedClientResponse[]>([]);
  const [selectedClient, setSelectedClient] = useState<UpdatedClientResponse | null>(selectClient || null);
  const [showResults, setShowResults] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("");
  
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  const [soSearchTerm, setSoSearchTerm] = useState("");
  const [filteredSOs, setFilteredSOs] = useState<any[]>([]);
  const [showSoDropdown, setShowSoDropdown] = useState(false);
  const [orders,setOrders]=useState<UpdatedSalesOrderResponse[]>()
  useEffect(() => {
      const findDevis = async () => {
        try {
          const data = await BonCommandeService.getAllBonCommandes()
          // Utilisation de votre mapper pour transformer les données backend -> UI
          const transformed = mapBonCommandeListToSalesOrderList(data)
          console.log(transformed)
          setOrders(transformed)
        } catch (error) {
          console.error("Erreur lors du chargement des devis:", error);
          toast.error("Failed to load sales orders.")
        }
      };

      findDevis();
    }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    deliveryDate: new Date().toISOString().split('T')[0],
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    recipientCity: ""
  });

  // Initial Data Loading
  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) setSeller(JSON.parse(stored));
  }, []);

  // ID Generation Logic (Fixed to prevent rerender loops)
  useEffect(() => {
    if (seller && !deliveryNote?.deliveryNoteNumber && !generatedId) {
      const agency = seller?.agency || "HQ";
      const type = "DN";
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      setGeneratedId(`${agency}-${type}-${date}-${suffix}`);
    } else if (deliveryNote?.deliveryNoteNumber) {
      setGeneratedId(deliveryNote.deliveryNoteNumber);
    }
  }, [seller, deliveryNote?.deliveryNoteNumber]);

  // Client Search Logic
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term || (selectedClient && term === selectedClient.raisonSociale?.toLowerCase())) {
      setFilteredResults([]);
      return;
    }
    const matches = clients.filter(c =>
      c.idClient?.toLowerCase().includes(term) ||
      c.raisonSociale?.toLowerCase().includes(term)
    );
    setFilteredResults(matches);
  }, [searchTerm, clients, selectedClient]);

  // Sales Order Search Logic
  useEffect(() => {
    if (soSearchTerm.trim() === "") {
      setFilteredSOs([]);
      return;
    }
    const matches = orders?.filter((so) =>
      so.numeroSalesOrder?.toLowerCase().includes(soSearchTerm.toLowerCase())
    );
    setFilteredSOs(matches??[]);
  }, [soSearchTerm]);

  const handleSelectSalesOrder = (so: any) => {
    const transformed = transformSalesOrderToDeliveryNote(so);
    setSoSearchTerm(so.numeroSalesOrder);
    setShowSoDropdown(false);
    
    setDeliveryNote(transformed);
    setFormData({
      recipientName: transformed.recipientName || "",
      recipientPhone: transformed.recipientPhone || "",
      recipientAddress: transformed.recipientAddress || "",
      recipientCity: transformed.recipientCity || "",
      deliveryDate: transformed.deliveryDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    });

    const client = clients.find(c => c.idClient === transformed.idClient);
    if (client) {
      setSelectedClient(client);
      setSearchTerm(client.raisonSociale || "");
      setMainSelectedClient(client);
    }
  };

  // Sync state to parent
  useEffect(() => {
    if (selectedClient && deliveryNote) {
      setDeliveryNote({
        ...deliveryNote,
        
        idClient: selectedClient.idClient,
        nomClient: selectedClient.raisonSociale,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientAddress: formData.recipientAddress,
        recipientCity: formData.recipientCity,
        deliveryDate: formData.deliveryDate,
        deliveryNoteNumber: deliveryNote.deliveryNoteNumber??generatedId
      });
    }
  }, [selectedClient, formData, generatedId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" ref={containerRef}>
      
      {/* SECTION 1: CLIENT IDENTIFICATION (PAYER) */}
      <div className="p-6 border-b border-gray-50 bg-gray-50/10">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5">
            <label className={labelStyles}>Client Search</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input type="text" className={`${inputStyles} pl-10`} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }} placeholder="Search Client..." />
              {showResults && filteredResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border rounded-xl shadow-xl max-h-48 overflow-auto">
                  {filteredResults.map(c => (
                    <div key={c.idClient} onClick={() => { setSelectedClient(c); setMainSelectedClient(c); setSearchTerm(c.raisonSociale || ""); setShowResults(false); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-0">
                      <div><p className="text-sm font-bold">{c.raisonSociale}</p><p className="text-[10px] text-gray-400">{c.idClient}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <label className={labelStyles}>Sales Order Source</label>
            <div className="relative">
              <Truck className="absolute left-3 top-2.5 text-blue-400" size={16} />
              <input type="text" className={`${inputStyles} pl-10 font-bold border-blue-100 bg-blue-50/30`} placeholder="Link Sales Order..." value={soSearchTerm || deliveryNote?.SaleOrderNumber || ""} onChange={(e) => { setSoSearchTerm(e.target.value); setShowSoDropdown(true); }} />
              {showSoDropdown && filteredSOs.length > 0 && (
                <div className="absolute z-[110] w-full mt-2 bg-white border shadow-2xl rounded-xl max-h-48 overflow-auto p-1">
                  {filteredSOs.map((so) => (
                    <div key={so.idSalesOrder} onClick={() => handleSelectSalesOrder(so)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex flex-col rounded-lg">
                      <span className="text-[11px] font-black text-blue-600 font-mono uppercase">{so.numeroSalesOrder}</span>
                      <span className="text-[10px] text-gray-400">{so.nomClient}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <label className={labelStyles}>Delivery Note ID</label>
            <div className="relative">
              <ReceiptIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input readOnly value={generatedId} className={`${readOnlyStyles} pl-10 font-mono text-blue-600`} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CLIENT INFO & RECIPIENT DETAILS */}
      <div className="p-6 grid grid-cols-12 gap-x-5 gap-y-6">
        
        {/* Row 1: Client Details (Read Only) */}
        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Client Name (Payer)</label>
          <div className="relative">
             <Building2 className="absolute left-3 top-2.5 text-gray-300" size={16} />
             <input readOnly value={selectedClient?.raisonSociale || "---"} className={`${readOnlyStyles} pl-10`} />
          </div>
        </div>

        <div className="col-span-12 md:col-span-5">
          <label className={labelStyles}>Client Billing Address</label>
          <div className="relative">
             <HomeIcon className="absolute left-3 top-2.5 text-gray-200" sx={{ fontSize: 18 }} />
             <input readOnly value={selectedClient?.adresse || "---"} className={`${readOnlyStyles} pl-10`} />
          </div>
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className={labelStyles}>Client Phone Number</label>
          <div className="relative">
             <Phone className="absolute left-3 top-2.5 text-gray-300" size={16} />
             <input readOnly value={selectedClient?.telephone || "---"} className={`${readOnlyStyles} pl-10`} />
          </div>
        </div>

      

       
      </div>
    </div>
  );
};

export default ClientHeader;