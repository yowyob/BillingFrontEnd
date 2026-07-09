'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ScaleIcon from "@mui/icons-material/Scale";
import CreditCardIcon from "@mui/icons-material/CreditCard"; 
import HomeIcon from "@mui/icons-material/Home"; 
import ReceiptIcon from "@mui/icons-material/Receipt"; 
import PercentIcon from '@mui/icons-material/Percent';
import GroupAddIcon from '@mui/icons-material/GroupAdd'; 
import { CheckCircle2 } from 'lucide-react';
import { Search } from 'lucide-react';
import { DevisResponse } from '@/src/api';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { UpdatedProformaInvoiceResponse,MOCK_PROFORMA_INVOICE } from '@/src/api/models/UpdatedProformaInvoiceResponse';
import { FacturesProformaService } from '@/src/src2/api';
import { mapProformaArrayToUI } from '@/src/Mappers/ProformaMapper';
import { toast } from 'sonner';
interface Props {
  clients: UpdatedClientResponse[];
  
  setMainSelectedClient: (data: UpdatedClientResponse) => void;
  selectClient?: UpdatedClientResponse;
  ProformaInvoice?: UpdatedProformaInvoiceResponse;
  setProformaInvoice: (data: UpdatedProformaInvoiceResponse) => void;
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const readOnlyStyles = "w-full border border-gray-100 bg-gray-50 rounded-lg py-2 px-3 text-sm text-gray-600 cursor-not-allowed font-medium";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const ClientHeader = ({ clients,  setMainSelectedClient, selectClient, ProformaInvoice,setProformaInvoice }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<UpdatedClientResponse[]>([]);
  const [selectedClient, setSelectedClient] = useState<UpdatedClientResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("");
  //referal hooks
  const [searchReferalTerm, setSearchReferalTerm] = useState("");
  const [filteredReferalResults, setFilteredReferalResults] = useState<UpdatedClientResponse[]>([]);
  const [selectedReferalClient, setSelectedReferalClient] = useState<UpdatedClientResponse | null>(null);
  const [showReferalResults, setShowReferalResults] = useState(false);
  const [systemDate, setSystemDate] = useState<string | null>(null);
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
      const [ProformaInvoices, setProformaInvoices] = useState<UpdatedProformaInvoiceResponse[]>(MOCK_PROFORMA_INVOICE);
    
      useEffect(() => {
        // Ensuring code runs only on client
        const stored = localStorage.getItem("seller");
        if (stored) {
          setSeller(JSON.parse(stored));
        }
      }, []);


       useEffect(() => {
          const findDevis = async () => {
            try {
              const data = await FacturesProformaService.getAllProformas()
              // Utilisation de votre mapper pour transformer les données backend -> UI
              const transformed = mapProformaArrayToUI(data);
              console.log(transformed)
              setProformaInvoices(transformed);
            } catch (error) {
              console.error("Erreur lors du chargement des devis:", error);
              toast.error("Failed to load proforma invoices.")
            }
          };
        
          findDevis(); 
        }, []);




  

  const [formData, setFormData] = useState({
    creationDate: new Date().toISOString().split('T')[0],
    applyVat: true,
    paymentMethod: "",
    remiseGlobalePourcentage: 0,
    nbreEcheance: 1,
    nosRef: "",
    vosRef:"",
    isReferral:false
  });

  const containerRef = useRef<HTMLDivElement>(null);
  

useEffect(() => {
  
  
  const formattedDate = new Date().toISOString().split('T')[0];
  setSystemDate(formattedDate);

  //get the seller information from localstorage
  
}, []);


  
  const [vosRefFilter, setVosRefFilter] = useState<string>("");
  const [filteredProformaInvoices, setFilteredProformaInvoices] = useState<UpdatedProformaInvoiceResponse[]>([]);
  const [showRefDropdown, setShowRefDropdown] = useState(false);





  // 1. FILTER LOGIC
  useEffect(() => {
    if (vosRefFilter.trim() === "") {
      setFilteredProformaInvoices([]);
      return;
    }
    const filtered =ProformaInvoices.filter((q) =>
     ( q.numeroProformaInvoice??"").toLowerCase().includes(vosRefFilter.toLowerCase())
    );
    setFilteredProformaInvoices(filtered);
  }, [vosRefFilter]);

  const handleSelectReference = (refQuo: UpdatedProformaInvoiceResponse) => {
  setVosRefFilter(refQuo?.numeroProformaInvoice??"");
  setShowRefDropdown(false);

  // 1. Set the main ProformaInvoice state with the data from the reference
  // We kee p the current numeroProformaInvoice if we are creating a new one based on an old one
  console.log(refQuo)
  setProformaInvoice({

    ...refQuo,
    numeroProformaInvoice: ProformaInvoice?.numeroProformaInvoice || refQuo.numeroProformaInvoice, 
    statut: DevisResponse.statut.BROUILLON, // Usually reset status for new drafts
  });

  // 2. Automatically link the client associated with that old ProformaInvoice
  const associatedClient = clients.find(c => c.idClient === refQuo.idClient);
  if (associatedClient) {
    setSelectedClient(associatedClient);
  }

  // 3. Update the local form state (dates, etc.) if your header uses a separate formData state
  setFormData(prev => ({
    ...prev,
    paymentMethod: refQuo.modeReglement || prev.paymentMethod,
    remiseGlobalePourcentage: refQuo.remiseGlobalePourcentage || 0,
    applyVat: refQuo.applyVat || false,
  }));
};



  // 1. ID GENERATION
  useEffect(() => {
    if (!ProformaInvoice?.idProformaInvoice) {
      const agency = seller?.agency, type = "QUO";
      const taxFlag = formData.applyVat && selectClient?.ntva ? "T" : "NT";
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      setGeneratedId(`${agency}-${type}-${taxFlag}-${date}-${suffix}`);
    } 
  }, [ProformaInvoice, formData.applyVat]);

  // 2. EXTERNAL SYNC
  useEffect(() => {
    if (selectClient) {
      setSelectedClient(selectClient);
      setSearchTerm(selectClient.raisonSociale || "");
    }
  }, [selectClient]);

  // 3. BROADCAST TO PARENT (Critical Fix)
  // Alternative fix if you can't change the Props interface:
useEffect(() => {
  if (selectedClient && setProformaInvoice && ProformaInvoice) {
    setProformaInvoice({
      ...ProformaInvoice, // Use the object from props directly instead of 'prev'
      idClient: selectedClient.idClient,
      numeroProformaInvoice:ProformaInvoice.numeroProformaInvoice??generatedId,
      nomClient: selectedClient.raisonSociale,
      dateCreation: formData.creationDate,
     
      applyVat: formData.applyVat,
      modeReglement: formData.paymentMethod as UpdatedProformaInvoiceResponse.modeReglement,
      remiseGlobalePourcentage: Number(formData.remiseGlobalePourcentage),
      nbreEcheance: Number(formData.nbreEcheance),
      nosRef: formData.nosRef,
      vosRef:formData.vosRef,
      referalClientId: selectedReferalClient?.idClient || undefined
    });
  }
}, [selectedClient, formData, selectedReferalClient, setProformaInvoice]); // Add ProformaInvoice to dependencies if using this way

  // 4. SEARCH LOGIC
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
  
  const handleSelectReferal = (client: UpdatedClientResponse) => {
    setSelectedReferalClient(client);
    setSearchReferalTerm(client.raisonSociale || "");
    setShowReferalResults(false);
  };



  //referal search


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

  // 5. CLICK OUTSIDE
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (client: UpdatedClientResponse) => {
    setSelectedClient(client);
    setMainSelectedClient(client);
    setSearchTerm(client.raisonSociale || "");
    setShowResults(false);
    setFormData(prev => ({ ...prev, applyVat: !!client.ntva }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    
    let finalValue: any = type === 'checkbox' ? checked : value;

    if (name === "remiseGlobalePourcentage") {
      finalValue = Math.max(0, Math.min(100, Number(value)));
    }
    if (name === "nbreEcheance") {
      finalValue = Math.max(1, Number(value));
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

 return (
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" ref={containerRef}>
  {/* SECTION 1: TOP BAR - SEARCH & PRIMARY ID */}
  <div className="p-6 border-b border-gray-50 bg-gray-50/10">
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 md:col-span-5">
        <label className={labelStyles}>Client Search</label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
          <input 
            type="text" 
            className={`${inputStyles} pl-10`} 
            value={searchTerm} 
            onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }} 
            placeholder="Search Client..." 
          />
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
        <label className={labelStyles}>Client Address</label>
        <div className="relative">
          <HomeIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
          <input readOnly value={selectedClient?.adresse || ""} className={`${readOnlyStyles} pl-10`} placeholder="N/A" />
        </div>
      </div>
      <div className="col-span-12 md:col-span-3">
        <label className={labelStyles}>ProformaInvoice ID</label>
        <div className="relative">
          <ReceiptIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
          <input readOnly value={generatedId} className={`${readOnlyStyles} pl-10 font-mono text-secondary-mid`} />
        </div>
      </div>
    </div>
  </div>

  {/* SECTION 2: MAIN FORM BODY */}
  <div className="p-6 grid grid-cols-12 gap-x-5 gap-y-6">
    
    {/* Row 1: Identity & References */}
    <div className="col-span-12 md:col-span-4">
      <label className={labelStyles}>Company Name</label>
      <div className="relative">
        <PersonIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 16 }} />
        <input readOnly value={selectedClient?.raisonSociale || ""} className={`${readOnlyStyles} pl-9`} placeholder="---" />
      </div>
    </div>

    {/* Our Reference */}
    <div className="col-span-12 md:col-span-4">
      <label className={labelStyles}>Our Reference (Nos Ref)</label>
      <input 
        type="text" 
        name="nosRef" 
        className={`${!ProformaInvoice ? inputStyles : readOnlyStyles}`} 
        value={ProformaInvoice ? (ProformaInvoice.nosRef ?? "") : formData.nosRef} 
        onChange={handleInputChange}
        placeholder="e.g., BILL-2026-001"
      />
    </div>

    {/* Client Reference (Vos Ref) Filter Integration */}
    <div className="col-span-12 md:col-span-4">
      <label className={labelStyles}>Client Reference (Vos Ref)</label>
      <div className="relative">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl focus-within:border-[var(--color-secondary-mid)] transition-all">
          <Search size={14} className="text-gray-400" />
          <input 
            type="text"
            placeholder="Link ProformaInvoice Number..."
            className="bg-transparent outline-none text-xs w-full font-bold text-gray-700"
            value={vosRefFilter}
            onChange={(e) => {
              setVosRefFilter(e.target.value);
              setShowRefDropdown(true);
            }}
            onFocus={() => setShowRefDropdown(true)}
          />
        </div>

        {/* Dropdown for Vos Ref */}
        {showRefDropdown && filteredProformaInvoices.length > 0 && (
          <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 shadow-2xl rounded-xl max-h-40 overflow-auto p-1">
            {filteredProformaInvoices.map((q) => (
              <div 
                key={q.numeroProformaInvoice}
                onClick={() => handleSelectReference(q)}
                className="px-3 py-2 hover:bg-[var(--color-secondary-super-light)] cursor-pointer flex justify-between items-center rounded-lg transition-colors group"
              >
                <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-tight">{q.numeroProformaInvoice}</span>
                <span className="text-[9px] font-bold text-[var(--color-secondary-mid)] opacity-0 group-hover:opacity-100">Select</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Row 2: Financials & Payment */}
    <div className="col-span-12 md:col-span-4">
      <label className={labelStyles}>Payment Method</label>
      <div className="relative">
        <CreditCardIcon className="absolute left-3 top-2.5 text-gray-300 z-10" sx={{ fontSize: 16 }} />
        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className={`${inputStyles} pl-9 appearance-none`}>
          <option value="">Select Method</option>
          {Object.entries(UpdatedProformaInvoiceResponse.modeReglement || {}).map(([key, value]) => (
            <option key={key} value={value}>{value.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
    </div>

    <div className="col-span-12 md:col-span-3">
      <label className={labelStyles}>Global Discount (%)</label>
      <div className="relative">
        <PercentIcon className="absolute left-3 top-2.5 text-gray-400 z-10" sx={{ fontSize: 18 }} />
        <input 
          type="number" 
          name="remiseGlobalePourcentage"
          className={`${!ProformaInvoice ? inputStyles : readOnlyStyles} pl-10`} 
          onChange={handleInputChange}
          value={ProformaInvoice ? (ProformaInvoice.remiseGlobalePourcentage ?? 0) : formData.remiseGlobalePourcentage}
        />
        {((ProformaInvoice?.remiseGlobalePourcentage || formData.remiseGlobalePourcentage) > 0) && (
          <div className="absolute right-2 top-1.5 flex items-center pointer-events-none">
            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-black border border-emerald-200">
              OFF
            </span>
          </div>
        )}
      </div>
    </div>

    <div className="col-span-12 md:col-span-2">
      <label className={labelStyles}>Installments</label>
      <input 
        type="number" 
        name="nbreEcheance" 
        className={`${!ProformaInvoice ? inputStyles : readOnlyStyles}`} 
        value={ProformaInvoice ? (ProformaInvoice.nbreEcheance ?? 1) : formData.nbreEcheance} 
        onChange={handleInputChange}
        min="1"
      />
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

    {/* Row 3: Dates */}
    <div className="col-span-12 md:col-span-4">
      <label className={labelStyles}>Date of Issue</label>
      <input type="date" name="creationDate" className={inputStyles} value={formData.creationDate} onChange={handleInputChange} />
    </div>

 

    {systemDate && (
      <div className="col-span-12 md:col-span-4">
        <label className={labelStyles}>System Date </label>
        <input type="date" readOnly className={readOnlyStyles} value={systemDate} />
      </div>
    )}

    {/* Row 4: Toggles & Referrals */}
    <div className="col-span-12 grid grid-cols-12 gap-4 items-center pt-2 border-t border-gray-50">
      <div className="col-span-12 md:col-span-3">
        {selectedClient?.ntva && (
          <label className="flex items-center justify-between gap-3 cursor-pointer bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 transition-all hover:bg-emerald-50">
            <span className="text-[9px] font-black text-emerald-700 uppercase">Apply VAT (TVA)</span>
            <input type="checkbox" name="applyVat" checked={formData.applyVat} onChange={handleInputChange} className="accent-emerald-600 w-4 h-4" />
          </label>
        )}
      </div>

      <div className="col-span-12 md:col-span-3">
        <label className="flex items-center justify-between gap-3 cursor-pointer bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 transition-all hover:bg-blue-50">
          <span className="text-[9px] font-black text-blue-700 uppercase">Referral / Partner</span>
          <div className="relative inline-flex items-center">
            <input type="checkbox" name="isReferral" className="sr-only peer" checked={formData.isReferral} onChange={handleInputChange} />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>
    </div>

    {/* Referral Dropdown Section */}
    {formData.isReferral && (
      <div className="col-span-12 p-5 bg-blue-50/30 border border-blue-100 rounded-2xl animate-in slide-in-from-top-2 duration-300">
        <label className={`${labelStyles} text-blue-600`}>Select Referrer</label>
        <div className="relative">
          <GroupAddIcon className="absolute left-3 top-2.5 text-blue-300" sx={{ fontSize: 18 }} />
          <input 
            type="text" 
            className={`${inputStyles} pl-10 border-blue-200 focus:ring-blue-100`} 
            value={searchReferalTerm} 
            onChange={(e) => { setSearchReferalTerm(e.target.value); setShowReferalResults(true); }} 
            placeholder="Search referrer..."
          />
          {showReferalResults && filteredReferalResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-blue-100 rounded-xl shadow-xl max-h-40 overflow-auto">
              {filteredReferalResults.map(c => (
                <div key={c.idClient} onClick={() => handleSelectReferal(c)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-blue-50 last:border-0 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">{c.raisonSociale}</span>
                  <span className="text-[10px] text-blue-400 font-mono">{c.idClient}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>
)}

export default ClientHeader;