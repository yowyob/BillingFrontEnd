'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard"; 
import HomeIcon from "@mui/icons-material/Home"; 
import PercentIcon from '@mui/icons-material/Percent';
import { Truck, Search, FileText, Hash, Calendar, Layers, CheckCircle2 } from 'lucide-react';

import { UpdatedSupplierFactureResponse, FactureResponse } from '@/src/api/models/UpdatedSupplierFactureResponse';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { MOCK_GOODS_RN, GoodsReceiptNoteResponse } from '@/src/api/models/GoodsReceiptNote';


import { MOCK_PURCHASE_ORDERS, PurchaseOrderResponse } from '@/src/api/models/PurchaseOrderLine';
import { generateFactureFromPOandGRN } from '@/src/api/transformation/supplierInvoice';
import { BondeReceptionControllerService } from '@/src/src2/api/services/BondeReceptionControllerService';
import { mapGRNArrayToInternalArray } from '@/src/Mappers/GRNMapper';
import { BonDAchatService } from '@/src/src2/api/services/BonDAchatService';
import { mapBackendBAArrayToUIArray } from '@/src/Mappers/BonAchatMapper';
import { toast } from 'sonner';

interface Props {
  suppliers: UpdatedClientResponse[]; 
  setSelectedSupplier: (data: UpdatedClientResponse) => void;
  selectedSupplier?: UpdatedClientResponse;
  invoice?: UpdatedSupplierFactureResponse;
  setInvoice: (data: UpdatedSupplierFactureResponse | ((prev: any) => any)) => void;
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const readOnlyStyles = "w-full border border-gray-100 bg-gray-50 rounded-lg py-2 px-3 text-sm text-gray-600 cursor-not-allowed font-medium";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const SupplierHeader = ({ suppliers, setSelectedSupplier, selectedSupplier, invoice, setInvoice }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<UpdatedClientResponse[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("");
  const [systemDate, setSystemDate] = useState<string>("");
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);

 


  // GRN Filter State
  const [grnSearch, setGrnSearch] = useState("");
  const [filteredGRNs, setFilteredGRNs] = useState<GoodsReceiptNoteResponse[]>([]);
  const [showGRNDropdown, setShowGRNDropdown] = useState(false);
  const [purchaseOrders,setPurchaseOrders]=useState<PurchaseOrderResponse[]>(MOCK_PURCHASE_ORDERS)
  const [grns,setGRNS]=useState<GoodsReceiptNoteResponse[]>()


   useEffect(() => {
       const findFactures = async () => {
         try {
           const data = await BondeReceptionControllerService.getBons()
           const transformed = mapGRNArrayToInternalArray(data)
  
           //aslo felct the purchase orders
           const purchase_order=await BonDAchatService.getAllBonsAchat()
           const trans=mapBackendBAArrayToUIArray(purchase_order)
           setPurchaseOrders(trans)
           setGRNS(transformed)
         } catch (error) {
           console.error("Erreur lors du chargement des factures:", error);
           toast.error("Failed to load GRN and purchase order data.")
         }
       };
       findFactures()
     }, [])


  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    dateFacturation: new Date().toISOString().split('T')[0],
    dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applyVat: true,
    modeReglement: "" as FactureResponse.modeReglement,
    remiseGlobalePourcentage: 0,
    nbreEcheance: 1,
    externalInvoiceNumber: "", 
    numeroGRN: "", 
    purchaseOrderNumber: "" 
  });

  // 1. INITIAL LOAD
  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) setSeller(JSON.parse(stored));
    setSystemDate(new Date().toISOString().split('T')[0]);
  }, []);

  // 2. GRN Filter Logic (Searching against the grnNumber in your mock)
  useEffect(() => {
    if (grnSearch.trim() === "") {
      setFilteredGRNs([]);
      return;
    }
    const filtered = grns?.filter((g) =>
      g.grnNumber?.toLowerCase().includes(grnSearch.toLowerCase())
    );
    setFilteredGRNs(filtered??[]);
  }, [grnSearch]);

  // 3. Supplier Search Logic
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term || (selectedSupplier && term === selectedSupplier.raisonSociale?.toLowerCase())) {
      setFilteredResults([]);
      return;
    }
    const matches = suppliers.filter(s =>
      s.idClient?.toLowerCase().includes(term) ||
      s.raisonSociale?.toLowerCase().includes(term)
    );
    setFilteredResults(matches);
  }, [searchTerm, suppliers, selectedSupplier]);

  // 4. Internal Bill ID Generation
  useEffect(() => {
    const agency = seller?.agency || "HQ";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = generatedId.split('-').pop() || Math.floor(1000 + Math.random() * 9000).toString();
    const newId = `${agency}-SUP-INV-${dateStr}-${suffix}`;
    
    if (newId !== generatedId) setGeneratedId(newId);
    if (invoice && invoice.numeroFacture !== newId) {
        setInvoice((prev: any) => ({ ...prev, numeroFacture: newId }));
    }
  }, [seller, invoice?.idFacture]);

  // 5. Sync Header Data with Parent Invoice Object
  useEffect(() => {
    if (selectedSupplier && invoice) {
      setInvoice((prev: any) => ({
        ...prev,
        numeroFacture:invoice.numeroFacture??generatedId,
        idFournisseur: selectedSupplier.idClient,
        nomFournisseru: selectedSupplier.raisonSociale,
        adresseFournisseur: selectedSupplier.adresse,
        emailFournisseur: selectedSupplier.email,
        telephoneFournisseur: selectedSupplier.telephone,
        dateFacturation: formData.dateFacturation,
        dateEcheance: formData.dateEcheance,
        dateSysteme: systemDate,
        applyVat: formData.applyVat,
        modeReglement: formData.modeReglement,
        remiseGlobalePourcentage: Number(formData.remiseGlobalePourcentage),
        nbreEcheance: Number(formData.nbreEcheance),
        numeroGRN: formData.numeroGRN,
        externalInvoiceNumber: formData.externalInvoiceNumber,
        referenceCommande: formData.purchaseOrderNumber
      }));
    }
  }, [selectedSupplier, formData, systemDate,generatedId]);

  const handleSelectGRN = (grn: GoodsReceiptNoteResponse) => {
    // 1. Identify the linked Purchase Order using the PO number from the GRN
    const pO: PurchaseOrderResponse | undefined = purchaseOrders.find(
      (p) => p.poNumber === grn.purchaseOrderNumber
    );

    if (pO) {
      // 2. Use the transformation utility to generate a structured invoice
      // This fills the lines based on accepted quantities and purchase rates
      const transformedInvoice = generateFactureFromPOandGRN(pO, grn);
      
      // 3. Update the global invoice state
      setInvoice({
        ...transformedInvoice,
        // Ensure we preserve the internal Bill ID generated by the header
        numeroFacture: generatedId,
        dateFacturation: formData.dateFacturation,
        dateEcheance: formData.dateEcheance,
        modeReglement: formData.modeReglement,
        applyVat: formData.applyVat
      });

      // 4. Update the local Header form state
      setFormData(prev => ({ 
        ...prev, 
        numeroGRN: grn.grnNumber || "",
        purchaseOrderNumber: grn.purchaseOrderNumber || "" 
      }));

      // 5. Close dropdown and update search display
      setGrnSearch(grn.grnNumber || "");
      setShowGRNDropdown(false);

      // 6. Synchronize the Supplier selection based on the GRN/PO data
      const supplierMatch = suppliers.find(s => s.idClient === grn.supplierId);
      if (supplierMatch) {
          setSelectedSupplier(supplierMatch);
          setSearchTerm(supplierMatch.raisonSociale || "");
      }
    } else {
      console.error("No matching Purchase Order found for this GRN");
      toast.error("No matching Purchase Order found for this GRN.")
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100" ref={containerRef}>
      {/* TOP SECTION: IDENTITIES */}
      <div className="p-6 border-b border-gray-50 bg-gray-50/10">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5">
            <label className={labelStyles}>Supplier Search</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input 
                type="text" 
                className={`${inputStyles} pl-10`} 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }} 
                placeholder="Search Supplier..." 
              />
              {showResults && filteredResults.length > 0 && (
                <div className="absolute z-[110] w-full mt-2 bg-white border rounded-xl shadow-xl max-h-48 overflow-auto">
                  {filteredResults.map(s => (
                    <div key={s.idClient} onClick={() => { setSelectedSupplier(s); setSearchTerm(s.raisonSociale || ""); setShowResults(false); }} className="px-4 py-2 hover:bg-emerald-50 cursor-pointer flex justify-between items-center border-b last:border-0">
                      <div><p className="text-sm font-bold">{s.raisonSociale}</p><p className="text-[10px] text-gray-400">{s.idClient}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <label className={labelStyles}>Purchase Order Reference</label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 text-gray-300" size={18} />
              <input 
                name="purchaseOrderNumber"
                className={`${inputStyles} pl-10 font-bold text-emerald-700`} 
                value={formData.purchaseOrderNumber}
                onChange={handleInputChange}
                placeholder="Linked PO #" 
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <label className={labelStyles}>Internal Bill ID</label>
            <input readOnly value={generatedId} className={`${readOnlyStyles} font-mono text-emerald-600`} />
          </div>
        </div>
      </div>

      {/* MAIN FORM GRID */}

        
      <div className="p-6 grid grid-cols-12 gap-x-5 gap-y-6">
        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Supplier Name</label>
          <div className="relative">
            <HomeIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 16 }} />
            <input readOnly value={selectedSupplier?.raisonSociale || ""} className={`${readOnlyStyles} pl-9`} placeholder="---" />
          </div>
        </div>
        
         <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Supplier Address</label>
          <div className="relative">
            <HomeIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 16 }} />
            <input readOnly value={selectedSupplier?.adresse || ""} className={`${readOnlyStyles} pl-9`} placeholder="---" />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Link Goods Receipt (GRN)</label>
          <div className="relative">
            <Truck className="absolute left-3 top-2.5 text-gray-300" size={16} />
            <input 
              className={`${inputStyles} pl-9`} 
              placeholder="Search GRN..."
              value={grnSearch}
              onChange={(e) => { setGrnSearch(e.target.value); setShowGRNDropdown(true); }}
              onFocus={() => setShowGRNDropdown(true)}
            />
            {showGRNDropdown && filteredGRNs.length > 0 && (
              <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 shadow-2xl rounded-xl max-h-40 overflow-auto p-1">
                {filteredGRNs.map((g) => (
                  <div key={g.idGRN} onClick={() => handleSelectGRN(g)} className="px-3 py-2 hover:bg-emerald-50 cursor-pointer rounded-lg flex justify-between items-center group">
                    <span className="text-xs font-black text-gray-700">{g.grnNumber}</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      

        {/* Row 2: Financial Conditions */}
        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Payment Method</label>
          <div className="relative">
            <CreditCardIcon className="absolute left-3 top-2.5 text-gray-300 z-10" sx={{ fontSize: 16 }} />
            <select name="modeReglement" value={formData.modeReglement} onChange={handleInputChange} className={`${inputStyles} pl-9 appearance-none`}>
              <option value="">Select Method</option>
              {Object.values(FactureResponse.modeReglement).map((mode) => (
                <option key={mode} value={mode}>{mode.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-span-12 md:col-span-2">
          <label className={labelStyles}>Installments</label>
          <div className="relative">
            <Layers className="absolute left-3 top-2.5 text-gray-300" size={14} />
            <input type="number" name="nbreEcheance" className={`${inputStyles} pl-8`} value={formData.nbreEcheance} onChange={handleInputChange} min="1" />
          </div>
        </div>

      

        <div className="col-span-12 md:col-span-3">
            <label className={labelStyles}>System Entry Date</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input readOnly value={systemDate} className={`${readOnlyStyles} pl-9`} />
            </div>
        </div>

        {/* Row 3: Dates */}
        <div className="col-span-12 md:col-span-3">
          <label className={labelStyles}>Invoice Issue Date</label>
          <input type="date" name="dateFacturation" className={inputStyles} value={formData.dateFacturation} onChange={handleInputChange} />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className={labelStyles}>Payment Due Date</label>
          <input type="date" name="dateEcheance" className={inputStyles} value={formData.dateEcheance} onChange={handleInputChange} />
        </div>

       
      </div>
    </div>
  );
};

export default SupplierHeader;