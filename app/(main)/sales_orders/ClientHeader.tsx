'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ScaleIcon from "@mui/icons-material/Scale";
import CreditCardIcon from "@mui/icons-material/CreditCard"; 
import HomeIcon from "@mui/icons-material/Home"; 
import ReceiptIcon from "@mui/icons-material/Receipt"; 
import GroupAddIcon from '@mui/icons-material/GroupAdd'; 
import { Search } from 'lucide-react';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { UpdatedSalesOrderResponse, SalesOrderResponse } from '@/src/api/models/UpdatedSalesOrder';
import { MOCK_QUOTATIONS, UpdatedDevisResponse } from '@/src/api/models/UpdatedDevisResponse';
import { MOCK_SALES_ORDERS } from '@/src/api/models/UpdatedSalesOrder';
import { transformDevisToSalesOrder } from '@/src/api/transformation/saleorderTranformation';
import { DevisService } from '@/src/src2/api/services/DevisService';
import { mapBackendArrayToUpdatedDevisArray } from '@/src/Mappers/DevisMapper';
import { BonCommandeService } from '@/src/src2/api';
import { mapBonCommandeListToSalesOrderList } from '@/src/Mappers/BonCommandeMapper';
import { toast } from 'sonner';

interface Props {
  clients: UpdatedClientResponse[];
  setMainSelectedClient: (data: UpdatedClientResponse) => void;
  selectClient?: UpdatedClientResponse;
  sales_order?: UpdatedSalesOrderResponse;
  setSalesOrder: (data: UpdatedSalesOrderResponse) => void;
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const readOnlyStyles = "w-full border border-gray-100 bg-gray-50 rounded-lg py-2 px-3 text-sm text-gray-600 cursor-not-allowed font-medium";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const ClientHeader = ({ clients, setMainSelectedClient, selectClient, sales_order, setSalesOrder }: Props) => {
  // --- States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<UpdatedClientResponse[]>([]);

const [selectedClient, setSelectedClient] = useState<UpdatedClientResponse | null>(selectClient ?? null);
  const [showResults, setShowResults] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("");
  
  const [searchReferalTerm, setSearchReferalTerm] = useState("");
  const [filteredReferalResults, setFilteredReferalResults] = useState<UpdatedClientResponse[]>([]);
  const [selectedReferalClient, setSelectedReferalClient] = useState<UpdatedClientResponse | null>(null);
  const [showReferalResults, setShowReferalResults] = useState(false);
  
  const [systemDate, setSystemDate] = useState<string | null>(null);
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  
  const [vosRefFilter, setVosRefFilter] = useState<string>("");
  const [filteredsales_orders, setFilteredsales_orders] = useState<UpdatedSalesOrderResponse[]>([]);
  const [showRefDropdown, setShowRefDropdown] = useState(false);
  
  const [quoSearchTerm, setQuoSearchTerm] = useState("");
  const [filteredQuos, setFilteredQuos] = useState<any[]>([]);
  const [showQuoDropdown, setShowQuoDropdown] = useState(false);

  const [quotations,setQuotations]=useState<UpdatedDevisResponse[]>(MOCK_QUOTATIONS)


   const [orders, setOrders] = useState<UpdatedSalesOrderResponse[]>(MOCK_SALES_ORDERS); 
    
  
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

   useEffect(() => {
    const findDevis = async () => {
      try {
        const data = await DevisService.getAllDevis();
        const transformed = mapBackendArrayToUpdatedDevisArray(data);
        setQuotations(transformed);
      } catch (error) {
        console.error("Erreur lors du chargement des devis:", error);
        toast.error("Failed to load quotations.")
      }
    };
  
    findDevis(); 
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    creationDate: new Date().toISOString().split('T')[0],
    validityDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applyVat: true,
    paymentMethod: "",
    transportMethod: SalesOrderResponse.transportMethod.RETRAIT_MAGASIN as string,
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    nosRef: "",
    vosRef: "",
    isReferral: false,
    remiseGlobalePourcentage: 0,
    nbreEcheance: 1,
    nomClient:1,
  });

  // --- Initial Setup ---
  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) setSeller(JSON.parse(stored));
    setSystemDate(new Date().toISOString().split('T')[0]);
  }, []);

  // --- RESTORED: Client Search Filtering Logic ---
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

  // --- RESTORED: Referral Search Filtering Logic ---
  useEffect(() => {
    const term = searchReferalTerm.toLowerCase().trim();
    if (!term || (selectedReferalClient && term === selectedReferalClient.raisonSociale?.toLowerCase())) {
      setFilteredReferalResults([]);
      return;
    }
    const matches = clients.filter(c =>
      c.idClient?.toLowerCase().includes(term) ||
      c.raisonSociale?.toLowerCase().includes(term)
    );
    setFilteredReferalResults(matches);
  }, [searchReferalTerm, clients, selectedReferalClient]);

  // --- Quotation Search Logic ---
  useEffect(() => {
    if (quoSearchTerm.trim() === "") {
      setFilteredQuos([]);
      return;
    }
    const matches = quotations.filter((q) =>
      q.numeroDevis?.toLowerCase().includes(quoSearchTerm.toLowerCase())
    );
    setFilteredQuos(matches);
  }, [quoSearchTerm]);

  const handleSelectQuotation = (quo: any) => {
    const transformed = transformDevisToSalesOrder(quo);
    setQuoSearchTerm(quo.numeroDevis);
    setShowQuoDropdown(false);
    
    setSalesOrder({
      ...transformed,
      numeroSalesOrder:generatedId,

      
    });
    setFormData(prev => ({
      ...prev,
    
      applyVat: transformed.applyVat ?? prev.applyVat,
      paymentMethod: transformed.modeReglement || "",
      transportMethod: transformed.transportMethod || prev.transportMethod,
      recipientName: transformed.recipientName || "",
      recipientPhone: transformed.recipientPhone || "",
      recipientAddress: transformed.recipientAddress || "",
      nosRef: transformed.numeroDevisOrigine || "",
    }));

    const client = clients.find(c => c.idClient === transformed.idClient);
    if (client) {
      setSelectedClient(client);
      setSearchTerm(client.raisonSociale || "");
      setMainSelectedClient(client);
    }
  };

  // --- Reference Search Logic (Existing SOs) ---
  useEffect(() => {
    if (vosRefFilter.trim() === "") {
      setFilteredsales_orders([]);
      return;
    }
    const filtered = orders.filter((q) =>
      q.numeroSalesOrder?.toLowerCase().includes(vosRefFilter.toLowerCase())
    );
    setFilteredsales_orders(filtered);
  }, [vosRefFilter]);

  const handleSelectReference = (refQuo: UpdatedSalesOrderResponse) => {
    setVosRefFilter(refQuo.numeroSalesOrder || "");
    setShowRefDropdown(false);
    setSalesOrder({
      ...refQuo,
      numeroSalesOrder: sales_order?.numeroSalesOrder || refQuo.numeroSalesOrder, 
      statut: SalesOrderResponse.statut.BROUILLON,
    });
    setFormData(prev => ({
      ...prev,
      paymentMethod: refQuo.modeReglement || "",
      applyVat: refQuo.applyVat || false,
      recipientName: refQuo.recipientName || "",
      recipientAddress: refQuo.recipientAddress || "",
      recipientPhone: refQuo.recipientPhone || "",
      nosRef: refQuo.numeroSalesOrder || "",
    }));
    const client = clients.find(c => c.idClient === refQuo.idClient);
    if (client) {
      setSelectedClient(client);
      setSearchTerm(client.raisonSociale || "");
      setMainSelectedClient(client);
    }
  };

  // --- ID Generation ---
  useEffect(() => {
    if (!sales_order?.idSalesOrder) {
      const agency = seller?.agency || "HQ";
      const type = "SO"; 
      const taxFlag = formData.applyVat && selectedClient?.ntva ? "T" : "NT";
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      setGeneratedId(`${agency}-${type}-${taxFlag}-${date}-${suffix}`);
    } 
  }, [formData.applyVat, seller, selectedClient]);

  // --- Final Sync to Parent ---
  useEffect(() => {
    if (selectedClient && setSalesOrder && sales_order) {

      console.log(generatedId)
      setSalesOrder({
        ...sales_order,
        idClient: selectedClient.idClient,
        numeroSalesOrder:sales_order.numeroSalesOrder??generatedId,
        nomClient: selectedClient.raisonSociale,
        dateCreation: formData.creationDate,
        applyVat: formData.applyVat,
        modeReglement: formData.paymentMethod as SalesOrderResponse.modeReglement,
        transportMethod: formData.transportMethod as SalesOrderResponse.transportMethod,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientAddress: formData.recipientAddress,
        nosRef: formData.nosRef,
        vosRef: formData.vosRef,
      });
    }
  }, [selectedClient, formData,generatedId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSelect = (client: UpdatedClientResponse) => {
    setSelectedClient(client);
    setMainSelectedClient(client);
    setSearchTerm(client.raisonSociale || "");
    setShowResults(false);
    setFormData(prev => ({ ...prev, applyVat: !!client.ntva }));
  };

  const handleSelectReferal = (client: UpdatedClientResponse) => {
    setSelectedReferalClient(client);
    setSearchReferalTerm(client.raisonSociale || "");
    setShowReferalResults(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" ref={containerRef}>
      {/* SECTION 1: SEARCH & PRIMARY ID */}
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
                    <div key={c.idClient} onClick={() => handleSelect(c)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b last:border-0">
                      <div><p className="text-sm font-bold">{c.raisonSociale}</p><p className="text-[10px] text-gray-400">{c.idClient}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <label className={labelStyles}>Client Name</label>
            <div className="relative">
              <HomeIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input readOnly value={selectedClient?.raisonSociale || ""} className={`${readOnlyStyles} pl-10`} placeholder="N/A" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <label className={labelStyles}>Client Address</label>
            <div className="relative">
              <HomeIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input readOnly value={selectedClient?.adresse || ""} className={`${readOnlyStyles} pl-10`} placeholder="N/A" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <label className={labelStyles}>Sales Order ID</label>
            <div className="relative">
              <ReceiptIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input readOnly value={sales_order?.numeroSalesOrder??generatedId} className={`${readOnlyStyles} pl-10 font-mono text-secondary-mid`} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FORM DETAILS */}
      <div className="p-6 grid grid-cols-12 gap-x-5 gap-y-6">
        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Quotation Reference (Origin)</label>
          <div className="relative">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-secondary-mid/10 transition-all">
              <SearchIcon className="ml-3 text-gray-300" sx={{ fontSize: 18 }} />
              <input type="text" className="w-full bg-transparent outline-none py-2 px-2 text-sm text-gray-700 font-mono" placeholder="Search Quotation #..." value={quoSearchTerm || sales_order?.numeroDevisOrigine || ""} onChange={(e) => { setQuoSearchTerm(e.target.value); setShowQuoDropdown(true); }} onFocus={() => setShowQuoDropdown(true)} />
            </div>
            {showQuoDropdown && filteredQuos.length > 0 && (
              <div className="absolute z-[110] w-full mt-2 bg-white border shadow-2xl rounded-xl max-h-48 overflow-auto p-1">
                {filteredQuos.map((q) => (
                  <div key={q.idDevis} onClick={() => handleSelectQuotation(q)} className="px-4 py-3 hover:bg-secondary-super-light cursor-pointer flex flex-col rounded-lg">
                    <span className="text-[11px] font-black text-primary font-mono uppercase">{q.numeroDevis}</span>
                    <span className="text-[10px] text-gray-400">{q.nomClient}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Internal Ref (Nos Ref)</label>
          <input type="text" name="nosRef" className={inputStyles} value={formData.nosRef} onChange={handleInputChange} placeholder="Reference..." />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Client Ref (Vos Ref)</label>
          <div className="relative">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg">
              <Search size={14} className="text-gray-400" />
              <input type="text" placeholder="Link Sales Order..." className="bg-transparent outline-none text-sm w-full font-bold text-gray-700" value={vosRefFilter} onChange={(e) => { setVosRefFilter(e.target.value); setShowRefDropdown(true); }} />
            </div>
            {showRefDropdown && filteredsales_orders.length > 0 && (
              <div className="absolute z-[100] w-full mt-2 bg-white border shadow-2xl rounded-xl max-h-40 overflow-auto p-1">
                {filteredsales_orders.map((q) => (
                  <div key={q.numeroSalesOrder} onClick={() => handleSelectReference(q)} className="px-3 py-2 hover:bg-secondary-super-light cursor-pointer rounded-lg">
                    <span className="text-[10px] font-black text-primary uppercase">{q.numeroSalesOrder}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Payment Method</label>
          <div className="relative">
            <CreditCardIcon className="absolute left-3 top-2.5 text-gray-300 z-10" sx={{ fontSize: 16 }} />
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className={`${inputStyles} pl-9 appearance-none`}>
              <option value="">Select Method</option>
              {Object.entries(SalesOrderResponse.modeReglement || {}).map(([key, value]) => (
                <option key={key} value={value}>{value.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

         <div className="col-span-12 md:col-span-3">
              <label className={labelStyles}>Authorized Sizes</label>
              <div className="flex flex-wrap gap-2 min-h-[38px] p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                {selectedClient?.allowedSaleSizes?.map((size) => (
                  <span key={size} className="flex items-center gap-1 px-2 py-0.5 bg-white border rounded shadow-sm text-[9px] font-black text-gray-600 uppercase">
                    <ScaleIcon className="text-secondary-mid" sx={{ fontSize: 10 }} /> {size}
                  </span>
                )) || <span className="text-[10px] text-gray-300 italic">None</span>}
              </div>
            </div>

       

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Date of Issue</label>
          <input type="date" name="creationDate" className={inputStyles} value={formData.creationDate} onChange={handleInputChange} />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>System Date</label>
          <input type="date" readOnly className={readOnlyStyles} value={systemDate || ""} />
        </div>

        <div className="col-span-12 pt-4 border-t border-gray-50 flex flex-col gap-4">
           <div className="flex gap-6">
            {selectedClient?.ntva && (
                <label className="flex items-center gap-3 cursor-pointer bg-emerald-50 p-2 px-4 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-700 uppercase">Apply VAT</span>
                <input type="checkbox" name="applyVat" checked={formData.applyVat} onChange={handleInputChange} className="accent-emerald-600" />
                </label>
            )}
          
           </div>

          
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;