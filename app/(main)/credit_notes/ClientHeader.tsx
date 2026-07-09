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
import { AlertCircle, FileText } from 'lucide-react';
import { UpdatedCreditNoteResponse, CreditNoteResponse, MOCK_CREDIT_NOTES } from '@/src/api/models/UpdatedCreditNoteResponse';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { UpdatedFactureResponse } from '@/src/api/models/UpdatedFactureResponse';

import { MOCK_FACTURE } from '@/src/api/models/UpdatedFactureResponse';
import { FactureService } from '@/src/src2/api/services/FactureService';
import { mapBackendFactureArrayToUpdatedArray } from '@/src/Mappers/FactureMapper';
import { toast } from 'sonner';

interface Props {
    clients: UpdatedClientResponse[];
    setMainSelectedClient: (data: UpdatedClientResponse) => void;
    selectClient?: UpdatedClientResponse;
    credit_note?: UpdatedCreditNoteResponse;
    setCreditNote: (data: UpdatedCreditNoteResponse) => void;
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const readOnlyStyles = "w-full border border-gray-100 bg-gray-50 rounded-lg py-2 px-3 text-sm text-gray-600 cursor-not-allowed font-medium";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const ClientHeader = ({ clients, setMainSelectedClient, selectClient, credit_note, setCreditNote }: Props) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredResults, setFilteredResults] = useState<UpdatedClientResponse[]>([]);
    const [selectedClient, setSelectedClient] = useState<UpdatedClientResponse | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [generatedId, setGeneratedId] = useState<string>("");
    const [invoices,setInvoices]=useState<UpdatedFactureResponse[]>()






    const [invoiceSearch, setInvoiceSearch] = useState("");
    const [filteredInvoices, setFilteredInvoices] = useState<UpdatedFactureResponse[]>([]);
    const [showInvoiceResults, setShowInvoiceResults] = useState(false);

    const [systemDate, setSystemDate] = useState<string | null>(null);
    const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);



    /**
 * Converts an Invoice into a Credit Note template.
 * Financial values are negated to represent a credit to the client.
 */
const Invoice_To_CreditNote = (invoice: UpdatedFactureResponse): UpdatedCreditNoteResponse => {
    return {
        // Link to the original invoice
        idFactureOrigine: invoice.idFacture,
        numeroFactureOrigine: invoice.numeroFacture,
        
        // Metadata
        dateEmission: new Date().toISOString().split('T')[0],
        dateSysteme: new Date().toISOString(),
        etat: CreditNoteResponse.etat.BROUILLON,
        reason: CreditNoteResponse.reason.RETOUR_MARCHANDISE, // Default reason
        
        // Client Info mapping
        idClient: invoice.idClient,
        nomClient: invoice.nomClient,
        adresseClient: invoice.adresseClient,
        emailClient: invoice.emailClient,
        telephoneClient: invoice.telephoneClient,
        
        // Financials (Negated values)
        // We negate these so the accounting system recognizes this as a decrease in receivables
        montantHT: invoice.montantHT ? -invoice.montantHT : 0,
        montantTVA: invoice.montantTVA ? -invoice.montantTVA : 0,
        montantTTC: invoice.montantTTC ? -invoice.montantTTC : 0,
        finalAmount: invoice.finalAmount ? -invoice.finalAmount : 0,
        
        applyVat: invoice.applyVat,
        devise: invoice.devise || 'XAF',
        
        // Payment Logic
        // Credit notes default to CREDIT_CLIENT (Store Credit) or the original mode
        modeReglement: CreditNoteResponse.modeReglement.CREDIT_CLIENT,
        
        // Map Item Lines
        // We iterate through lines and ensure the 'montantTotal' is negated
        lignesCreditNote: invoice.lignesFacture?.map(line => ({
            ...line,
            // Ensure the credit note line represents a negative value
            montantTotal: line.montantTotal ? -Math.abs(line.montantTotal) : 0,
            // Add custom description to indicate it's a return
            description: line.description ? `Retour: ${line.description}` : `Retour produit`
        })),
        
        notes: `Note de crédit générée à partir de la facture ${invoice.numeroFacture}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
};




    
    // Initial load
    useEffect(() => {
        const stored = localStorage.getItem("seller");
        if (stored) setSeller(JSON.parse(stored));
        setSystemDate(new Date().toISOString().split('T')[0]);


          const findFactures = async () => {
      try {
        // 1. Appel au service API généré
        const data = await FactureService.getAllFactures();
        
        // 2. Transformation des données Backend -> UI via le mapper
        // Nous utilisons la version 'Array' pour traiter toute la liste d'un coup
        const transformed = mapBackendFactureArrayToUpdatedArray(data);
        
        console.log("Factures chargées et mappées:", transformed);
        
        // 3. Mise à jour de l'état local (ex: setInvoices ou setFactures)
        setInvoices(transformed);
        
      } catch (error) {
        console.error("Erreur lors du chargement des factures:", error);
        toast.error("Failed to load invoice data for credit note.")
      }
    };
    findFactures()
    }, []);

    const [formData, setFormData] = useState({
        creationDate: new Date().toISOString().split('T')[0],
        applyVat: true,
        reason: credit_note?.reason || CreditNoteResponse.reason.RETOUR_MARCHANDISE,
        modeReglement: credit_note?.modeReglement || CreditNoteResponse.modeReglement.CREDIT_CLIENT,
        isReferral: false,
        systemDate:new Date().toISOString().split('T')[0],
    });
useEffect(() => {
  if (!invoices) return; // Exit early if data hasn't arrived

  const term = invoiceSearch.toLowerCase().trim();
  if (!term) {
    setFilteredInvoices([]);
    return;
  }

  const matches = invoices.filter(inv => 
    inv.numeroFacture?.toLowerCase().includes(term) ||
    inv.idFacture?.toLowerCase().includes(term)
  );
  
  setFilteredInvoices(matches);
}, [invoiceSearch, invoices]);



    const handleInvoiceSelect = (invoice: UpdatedFactureResponse) => {
    setInvoiceSearch(invoice.numeroFacture || "");
    setShowInvoiceResults(false);
    
    // Auto-select the client linked to this invoice
    const clientMatch = clients.find(c => c.idClient === invoice.idClient);
    if (clientMatch) {
        handleSelect(clientMatch);
    }

    // Update parent state
    setCreditNote(Invoice_To_CreditNote(invoice));
};


    // 1. ID GENERATION (Type: CREN for Credit Note)
    useEffect(() => {
    // 1. If we are creating a new Credit Note (no ID exists yet)
    if (!credit_note?.idCreditNote && seller) {
        const agency = seller.agency || "HQ";
        const type = "CRN";
        const taxFlag = formData.applyVat ? "T" : "NT";
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        const newId = `${agency}-${type}-${taxFlag}-${date}-${suffix}`;
        
        setGeneratedId(newId);
        
        // Use a functional update to avoid the '!' operator and handle null safely
        setCreditNote({ ...credit_note, idCreditNote: newId });
    } 
    // 2. If an ID already exists, sync the display state
    else {
        // Use ?? "" to provide a fallback string if the value is undefined
        setGeneratedId(credit_note?.numeroCreditNote ?? "");
    }
}, [formData.applyVat, seller, credit_note?.idCreditNote]); 
// Added credit_note?.idCreditNote to dependency array to ensure sync

    // 2. EXTERNAL SYNC
    useEffect(() => {
        if (selectClient) {
            setSelectedClient(selectClient);
            setSearchTerm(selectClient.raisonSociale || "");
        }
    }, [selectClient]);

    // 3. BROADCAST TO PARENT
    useEffect(() => {
        if (selectedClient && credit_note) {
            setCreditNote({
                ...credit_note,
                numeroCreditNote:credit_note.idCreditNote??generatedId,
                idClient: selectedClient.idClient,
                nomClient: selectedClient.raisonSociale,
                adresseClient: selectedClient.adresse,
                emailClient: selectedClient.email,
                telephoneClient: selectedClient.telephone,
                dateEmission: formData.creationDate,
                applyVat: formData.applyVat,
                reason: formData.reason,
                modeReglement: formData.modeReglement,
                dateSysteme:formData.systemDate
            });
        }
    }, [selectedClient, formData]);

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
    }, [searchTerm, clients]);

    const handleSelect = (client: UpdatedClientResponse) => {
        setSelectedClient(client);
        setMainSelectedClient(client);
        setSearchTerm(client.raisonSociale || "");
        setShowResults(false);
        setFormData(prev => ({ ...prev, applyVat: !!client.ntva }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" ref={containerRef}>
            {/* SECTION 1: SEARCH & PRIMARY IDENTIFIERS */}
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
                                        <div key={c.idClient} onClick={() => handleSelect(c)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b last:border-0 transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-secondary">{c.raisonSociale}</p>
                                                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">{c.idClient}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-4">
                        <label className={labelStyles}>Generated Credit Note ID</label>
                        <div className="relative">
                            <ReceiptIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
                            <input readOnly value={credit_note?.numeroCreditNote??generatedId} className={`${readOnlyStyles} pl-10 font-mono text-amber-600 border-amber-100 bg-amber-50/30`} />
                        </div>
                    </div>

                   <div className="col-span-12 md:col-span-3 relative">
    <label className={labelStyles}>Search Original Invoice</label>
    <div className="relative">
        <FileText className="absolute left-3 top-2.5 text-blue-500" size={18} />
        <input 
            type="text"
            value={invoiceSearch}
            onChange={(e) => { setInvoiceSearch(e.target.value); setShowInvoiceResults(true); }}
            placeholder="INV/2026/..."
            className={`${inputStyles} pl-10 border-blue-100 focus:border-blue-400`}
        />
        {showInvoiceResults && filteredInvoices.length > 0 && (
            <div className="absolute z-[60] w-full mt-2 bg-white border border-blue-100 rounded-xl shadow-2xl max-h-48 overflow-auto">
                {filteredInvoices.map(inv => (
                    <div 
                        key={inv.idFacture} 
                        onClick={() => handleInvoiceSelect(inv)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                    >
                        <p className="text-sm font-black text-secondary">{inv.numeroFacture}</p>
                        <p className="text-[10px] text-gray-400">{inv.nomClient}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
</div>
                </div>
            </div>

            {/* SECTION 2: FORM BODY */}
            <div className="p-6 grid grid-cols-12 gap-x-5 gap-y-6">
                
                {/* Client Profile */}
                <div className="col-span-12 md:col-span-4">
                    <label className={labelStyles}>Client / Company</label>
                    <div className="relative">
                        <PersonIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 16 }} />
                        <input readOnly value={selectedClient?.raisonSociale || "Choose a client..."} className={`${readOnlyStyles} pl-9`} />
                    </div>
                </div>

                <div className="col-span-12 md:col-span-4">
                    <label className={labelStyles}>Location / Address</label>
                    <div className="relative">
                        <HomeIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 16 }} />
                        <input readOnly value={selectedClient?.adresse || "N/A"} className={`${readOnlyStyles} pl-9`} />
                    </div>
                </div>

                <div className="col-span-12 md:col-span-4">
                    <label className={labelStyles}>Available Sales Scales</label>
                    <div className="flex flex-wrap gap-2 min-h-[38px] p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        {selectedClient?.allowedSaleSizes?.map((size) => (
                            <span key={size} className="flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded shadow-sm text-[9px] font-black text-gray-600 uppercase">
                                <ScaleIcon className="text-secondary-mid" sx={{ fontSize: 10 }} /> {size}
                            </span>
                        )) || <span className="text-[10px] text-gray-300 italic px-2 py-1">Standard Scale only</span>}
                    </div>
                </div>

                {/* Credit Logic */}
                <div className="col-span-12 md:col-span-4">
                    <label className={labelStyles}>Reason for Credit Note</label>
                    <div className="relative">
                        <AlertCircle className="absolute left-3 top-2.5 text-gray-300 z-10" size={16} />
                        <select 
                            name="reason" 
                            value={formData.reason} 
                            onChange={handleInputChange} 
                            className={`${inputStyles} pl-9 appearance-none bg-white`}
                        >
                            {Object.values(CreditNoteResponse.reason).map((r) => (
                                <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-4">
                    <label className={labelStyles}>Settlement Mode</label>
                    <div className="relative">
                        <CreditCardIcon className="absolute left-3 top-2.5 text-gray-300 z-10" sx={{ fontSize: 16 }} />
                        <select 
                            name="modeReglement" 
                            value={formData.modeReglement} 
                            onChange={handleInputChange} 
                            className={`${inputStyles} pl-9 appearance-none bg-white`}
                        >
                            {Object.values(CreditNoteResponse.modeReglement).map((m) => (
                                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='flex  gap-3 '>
                    <div className="col-span-12 md:col-span-4">
                    <label className={labelStyles}>Date of Issue</label>
                    <input type="date" name="creationDate" className={inputStyles} value={formData.creationDate} onChange={handleInputChange} />
                </div>

                <div className="col-span-12 md:col-span-4">
                    <label className={labelStyles}>System Date</label>
                    <input type="date" name="creationDate" className={inputStyles} value={formData.systemDate} onChange={handleInputChange} />
                </div>

                </div>
                {/* Toggles */}
                
            </div>
        </div>
    );
}

export default ClientHeader;