'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import SearchIcon from "@mui/icons-material/Search";
import FactoryIcon from "@mui/icons-material/Factory"; // Changed icon for Producer
import ScaleIcon from "@mui/icons-material/Scale";
import CreditCardIcon from "@mui/icons-material/CreditCard"; 
import HomeIcon from "@mui/icons-material/Home"; 
import ReceiptIcon from "@mui/icons-material/Receipt"; 
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; // For Transport
import { Search } from 'lucide-react';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { PurcaseOrderResponse, PurchaseOrderResponse } from '@/src/api/models/PurchaseOrderLine';
import { MOCK_PURCHASE_ORDERS } from '@/src/api/models/PurchaseOrderLine';
import { BonDAchatService } from '@/src/src2/api/services/BonDAchatService';
import { mapBackendBAArrayToUIArray } from '@/src/Mappers/BonAchatMapper';
import { toast } from 'sonner';

interface Props {
  producers: UpdatedClientResponse[]; // Using the clients array as producers
  setMainSelectedProducer: (data: UpdatedClientResponse) => void;
  selectedProducer?: UpdatedClientResponse;
  purchaseOrder?: PurchaseOrderResponse;
  setPurchaseOrder: (data: PurchaseOrderResponse) => void;
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const readOnlyStyles = "w-full border border-gray-100 bg-gray-50 rounded-lg py-2 px-3 text-sm text-gray-600 cursor-not-allowed font-medium";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const ProducerHeader = ({ producers, setMainSelectedProducer, selectedProducer, purchaseOrder, setPurchaseOrder }: Props) => {
  // --- States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<UpdatedClientResponse[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("");
  
  const [systemDate, setSystemDate] = useState<string | null>(null);
  const [buyer, setBuyer] = useState<UpdatedSellerResponse | null>(null);
  
  const [internalRefFilter, setInternalRefFilter] = useState<string>("");
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrderResponse[]>([]);
  const [showRefDropdown, setShowRefDropdown] = useState(false);

  const [orders,setOrders]=useState<PurchaseOrderResponse[]>();
  const containerRef = useRef<HTMLDivElement>(null);
   useEffect(()=>{
        const findFactures = async () => {
      try {
        // 1. Appel au service API généré
        const data = await BonDAchatService.getAllBonsAchat()
        
        // 2. Transformation des données Backend -> UI via le mapper
        // Nous utilisons la version 'Array' pour traiter toute la liste d'un coup
        const transformed = mapBackendBAArrayToUIArray(data);
        
        console.log("Factures chargées et mappées:", transformed);
        
        // 3. Mise à jour de l'état local (ex: setInvoices ou setFactures)
        setOrders(transformed);
        
      } catch (error) {
        console.error("Erreur lors du chargement des factures:", error);
        toast.error("Failed to load purchase order data.")
      }
    };
    findFactures()
      },[])

  const [formData, setFormData] = useState({
    poDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default +7 days for POs
    transportMethod: PurcaseOrderResponse.transportMethod.LIVRAISON_PROPRE as string,
    deliveryName: "Central Warehouse",
    deliveryAddress: "",
    deliveryEmail: "",
    remarks: "",
  });

  // --- Initial Setup ---
  useEffect(() => {
    const stored = localStorage.getItem("seller"); // Use the same seller context as the buyer
    if (stored) setBuyer(JSON.parse(stored));
    setSystemDate(new Date().toISOString().split('T')[0]);
  }, []);

  // --- Producer (Supplier) Search Logic ---
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term || (selectedProducer && term === selectedProducer.raisonSociale?.toLowerCase())) {
      setFilteredResults([]);
      return;
    }
    const matches = producers.filter(p =>
      p.idClient?.toLowerCase().includes(term) ||
      p.raisonSociale?.toLowerCase().includes(term) ||
      p.codeClient?.toLowerCase().includes(term)
    );
    setFilteredResults(matches);
  }, [searchTerm, producers, selectedProducer]);

  // --- Linked PO Reference Search ---
  useEffect(() => {
    if (internalRefFilter.trim() === "") {
      setFilteredPOs([]);
      return;
    }
    const filtered = orders?.filter((po) =>
      po.poNumber?.toLowerCase().includes(internalRefFilter.toLowerCase())
    );
    setFilteredPOs(filtered??[]);
  }, [internalRefFilter]);

  const handleSelectReference = (refPO: PurchaseOrderResponse) => {
    setInternalRefFilter(refPO.poNumber || "");
    setShowRefDropdown(false);
    
    // Merge referenced PO data
    setPurchaseOrder({
      ...refPO,
      idPO: purchaseOrder?.idPO || refPO.idPO,
      status: PurcaseOrderResponse.statut.BROUILLON,
    });

    const producer = producers.find(p => p.idClient === refPO.supplierId);
    if (producer) {
      setMainSelectedProducer(producer);
      setSearchTerm(producer.raisonSociale || "");
    }
  };

  // --- ID Generation (PO Format) ---
  useEffect(() => {
    if (!purchaseOrder?.idPO) {
      const agency = buyer?.agency || "HQ";
      const type = "PO"; 
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      setGeneratedId(`${agency}-${type}-${date}-${suffix}`);
    } 
  }, [buyer, selectedProducer]);

  // --- Final Sync to Parent ---
  useEffect(() => {
    if (selectedProducer && setPurchaseOrder && purchaseOrder) {
      setPurchaseOrder({
        ...purchaseOrder,
        supplierId: selectedProducer.idClient,
        supplierName: selectedProducer.raisonSociale,
        supplierAddress: selectedProducer.adresse,
        deliveryAddress:selectedProducer.adresse,
        deliveryContact:selectedProducer.telephone,
        deliveryEmail:selectedProducer.telephone,
        
        poDate: formData.poDate,
        poNumber:purchaseOrder.poNumber??generatedId,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        transportMethod: formData.transportMethod as PurcaseOrderResponse.transportMethod,
        deliveryName: formData.deliveryName,
        remarks: formData.remarks,
      });
    }
  }, [selectedProducer, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelect = (producer: UpdatedClientResponse) => {
    setMainSelectedProducer(producer);
    setSearchTerm(producer.raisonSociale || "");
    setShowResults(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 " ref={containerRef}>
      {/* SECTION 1: PRODUCER SEARCH & PO ID */}
      <div className="p-6 border-b border-gray-50 bg-gray-50/10">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5">
            <label className={labelStyles}>Producer/Supplier Search</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input type="text" className={`${inputStyles} pl-10 font-bold`} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }} placeholder="Search Producer..." />
              {showResults && filteredResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border rounded-xl shadow-xl max-h-48 overflow-auto">
                  {filteredResults.map(p => (
                    <div key={p.idClient} onClick={() => handleSelect(p)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b last:border-0">
                      <div><p className="text-sm font-bold">{p.raisonSociale}</p><p className="text-[10px] text-gray-400">{p.codeClient}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className={labelStyles}>Supplier Name</label>
            <div className="relative">
              <HomeIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input readOnly value={selectedProducer?.raisonSociale|| ""} className={`${readOnlyStyles} pl-10`} placeholder="N/A" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className={labelStyles}>Supplier Address</label>
            <div className="relative">
              <HomeIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input readOnly value={selectedProducer?.adresse || ""} className={`${readOnlyStyles} pl-10`} placeholder="N/A" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <label className={labelStyles}>Generated PO #</label>
            <div className="relative">
              <ReceiptIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input readOnly value={purchaseOrder?.poNumber??generatedId} className={`${readOnlyStyles} pl-10 font-mono text-secondary-mid`} />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PROCUREMENT DETAILS */}
      <div className="p-6 grid grid-cols-12 gap-x-5 gap-y-6">
        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Existing PO Reference (Link)</label>
          <div className="relative">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg">
              <SearchIcon className="ml-3 text-gray-300" sx={{ fontSize: 18 }} />
              <input type="text" className="w-full bg-transparent outline-none py-2 px-2 text-sm text-gray-700 font-mono" placeholder="Link previous PO..." value={internalRefFilter} onChange={(e) => { setInternalRefFilter(e.target.value); setShowRefDropdown(true); }} />
            </div>
            {showRefDropdown && filteredPOs.length > 0 && (
              <div className="absolute z-[110] w-full mt-2 bg-white border shadow-2xl rounded-xl max-h-48 overflow-auto p-1">
                {filteredPOs.map((po) => (
                  <div key={po.idPO} onClick={() => handleSelectReference(po)} className="px-4 py-3 hover:bg-secondary-super-light cursor-pointer flex flex-col rounded-lg">
                    <span className="text-[11px] font-black font-mono uppercase">{po.poNumber}</span>
                    <span className="text-[10px] text-gray-400">{po.supplierName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Transport Method</label>
          <div className="relative">
            <LocalShippingIcon className="absolute left-3 top-2.5 text-gray-300 z-10" sx={{ fontSize: 16 }} />
            <select name="transportMethod" value={formData.transportMethod} onChange={handleInputChange} className={`${inputStyles} pl-9 appearance-none`}>
              {Object.entries(PurcaseOrderResponse.transportMethod || {}).map(([key, value]) => (
                <option key={key} value={value}>{value.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

       

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Creation Date</label>
          <input type="date" name="poDate" className={inputStyles} value={formData.poDate} onChange={handleInputChange} />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Expected Delivery</label>
          <input type="date" name="expectedDeliveryDate" className={`${inputStyles} border-amber-200 bg-amber-50/20`} value={formData.expectedDeliveryDate} onChange={handleInputChange} />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>System  Date</label>
          <input type="date" readOnly className={readOnlyStyles} value={systemDate || ""} />
        </div>

       
      </div>
    </div>
  );
};

export default ProducerHeader;