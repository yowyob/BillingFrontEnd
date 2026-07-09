'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import { Hash, Calendar, Package, FileSearch } from 'lucide-react';

import { UpdatedBackOrderResponse, BackOrderStatus } from '@/src/api/models/UpdatedBackOrderResponse';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { DeliveryNoteResponse } from '@/src/api/models/DeliveryNoteResponse';
import { BonDeLivraisonService } from '@/src/src2/api';
import { mapBackendArrayToDeliveryNoteList } from '@/src/Mappers/DeliveryNoteMapper';
import { mapDeliveryNoteToBackOrder } from '@/src/api/transformation/backOrderTransformation';
import { toast } from 'sonner';

interface Props {
  clients: UpdatedClientResponse[];
  setSelectedClient: (data: UpdatedClientResponse) => void;
  selectedClient?: UpdatedClientResponse;
  backOrder?: UpdatedBackOrderResponse;
  setBackOrder: (data: UpdatedBackOrderResponse | ((prev: any) => any)) => void;
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const readOnlyStyles = "w-full border border-gray-100 bg-gray-50 rounded-lg py-2 px-3 text-sm text-gray-600 cursor-not-allowed font-medium";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const ClientHeader = ({ clients, setSelectedClient, selectedClient, backOrder, setBackOrder }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<UpdatedClientResponse[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("");
  const [systemDate, setSystemDate] = useState<string>("");
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNoteResponse[]>([]);
  const [dnSearch, setDnSearch] = useState("");
  const [filteredDNs, setFilteredDNs] = useState<DeliveryNoteResponse[]>([]);
  const [showDNDropdown, setShowDNDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    createdAt: new Date().toISOString().split('T')[0],
    statut: BackOrderStatus.statut.EN_ATTENTE,
    remarques: "",
  });

  // Initial load
  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) setSeller(JSON.parse(stored));
    setSystemDate(new Date().toISOString().split('T')[0]);

    const fetchDeliveryNotes = async () => {
      try {
        const data = await BonDeLivraisonService.getAllBonLivraisons();
        setDeliveryNotes(mapBackendArrayToDeliveryNoteList(data));
      } catch {
        toast.error("Failed to load delivery orders.");
      }
    };
    fetchDeliveryNotes();
  }, []);

  // Fallback display id, only used before the parent's own numeroBackOrder
  // (the authoritative value, set once at creation) has made it into backOrder.
  useEffect(() => {
    if (generatedId) return;
    const agency = seller?.agency || "HQ";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedId(`${agency}-BO-${dateStr}-${suffix}`);
  }, [seller]);

  // Client search
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

  // Delivery order search filter
  useEffect(() => {
    if (!dnSearch.trim()) {
      setFilteredDNs([]);
      return;
    }
    const term = dnSearch.toLowerCase();
    setFilteredDNs(deliveryNotes.filter(d =>
      d.deliveryNoteNumber?.toLowerCase().includes(term) ||
      d.nomClient?.toLowerCase().includes(term)
    ));
  }, [dnSearch, deliveryNotes]);

  // Sync with parent
  useEffect(() => {
    if (selectedClient && backOrder) {
      setBackOrder((prev: any) => ({
        ...prev,
        idClient: selectedClient.idClient,
        nomClient: selectedClient.raisonSociale,
        adresseClient: selectedClient.adresse,
        emailClient: selectedClient.email,
        telephoneClient: selectedClient.telephone,
        statut: formData.statut,
        remarques: formData.remarques,
      }));
    }
  }, [selectedClient, formData]);

  const handleSelectClient = (c: UpdatedClientResponse) => {
    setSelectedClient(c);
    setSearchTerm(c.raisonSociale || "");
    setShowResults(false);
  };

  // Transforms the selected delivery order into back order fields (client +
  // lines + remarks) and renders the result by merging it into the shared backOrder state.
  const handleSelectDN = (dn: DeliveryNoteResponse) => {
    setDnSearch(dn.deliveryNoteNumber || "");
    setShowDNDropdown(false);
    const transformed = mapDeliveryNoteToBackOrder(dn);
    setBackOrder((prev: any) => ({ ...(prev || {}), ...transformed }));
    setFormData(prev => ({ ...prev, remarques: transformed.remarques || prev.remarques }));
    const clientMatch = clients.find(c => c.idClient === dn.idClient);
    if (clientMatch) {
      handleSelectClient(clientMatch);
    } else if (dn.nomClient) {
      // Delivery note's client isn't in the loaded client list (e.g. inactive) —
      // still show the name from the transform so the form isn't left blank.
      setSearchTerm(dn.nomClient);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100" ref={containerRef}>
      {/* TOP ROW */}
      <div className="p-6 border-b border-gray-50 bg-gray-50/10">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5 relative">
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
                <div className="absolute z-[110] w-full mt-2 bg-white border rounded-xl shadow-xl max-h-48 overflow-auto">
                  {filteredResults.map(c => (
                    <div key={c.idClient} onClick={() => handleSelectClient(c)} className="px-4 py-2 hover:bg-secondary-super-light cursor-pointer border-b last:border-0">
                      <p className="text-sm font-bold">{c.raisonSociale}</p>
                      <p className="text-[10px] text-gray-400">{c.idClient}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 relative">
            <label className={labelStyles}>Link Delivery Order</label>
            <div className="relative">
              <FileSearch className="absolute left-3 top-2.5 text-gray-300" size={16} />
              <input
                className={`${inputStyles} pl-9`}
                placeholder="Search Delivery Order #..."
                value={dnSearch}
                onChange={(e) => { setDnSearch(e.target.value); setShowDNDropdown(true); }}
                onFocus={() => setShowDNDropdown(true)}
              />
              {showDNDropdown && filteredDNs.length > 0 && (
                <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-100 shadow-2xl rounded-xl max-h-40 overflow-auto p-1">
                  {filteredDNs.map(d => (
                    <div key={d.idDN} onClick={() => handleSelectDN(d)} className="px-3 py-2 hover:bg-secondary-super-light cursor-pointer rounded-lg flex justify-between items-center group">
                      <div>
                        <span className="text-xs font-black text-gray-700 block">{d.deliveryNoteNumber}</span>
                        <span className="text-[10px] text-gray-400">{d.nomClient}</span>
                      </div>
                      <span className="text-[9px] bg-secondary-light text-secondary-mid px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className={labelStyles}>Back Order ID</label>
            <input readOnly value={backOrder?.numeroBackOrder || generatedId} className={`${readOnlyStyles} font-mono text-secondary-mid`} />
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="p-6 grid grid-cols-12 gap-x-5 gap-y-6">
        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Client Name</label>
          <div className="relative">
            <HomeIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 16 }} />
            <input readOnly value={selectedClient?.raisonSociale || ""} className={`${readOnlyStyles} pl-9`} placeholder="---" />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Client Address</label>
          <div className="relative">
            <HomeIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 16 }} />
            <input readOnly value={selectedClient?.adresse || ""} className={`${readOnlyStyles} pl-9`} placeholder="---" />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Status</label>
          <div className="relative">
            <Package className="absolute left-3 top-2.5 text-gray-300" size={16} />
            <select name="statut" value={formData.statut} onChange={handleInputChange} className={`${inputStyles} pl-9 appearance-none`}>
              {Object.values(BackOrderStatus.statut).map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Creation Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-300" size={16} />
            <input type="date" name="createdAt" value={formData.createdAt} onChange={handleInputChange} className={`${inputStyles} pl-9`} />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>System Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-300" size={16} />
            <input readOnly value={systemDate} className={`${readOnlyStyles} pl-9`} />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Delivery Order Reference</label>
          <div className="relative">
            <Hash className="absolute left-3 top-2.5 text-gray-300" size={16} />
            <input readOnly value={backOrder?.numeroBonLivraison || ""} className={`${readOnlyStyles} pl-9 text-secondary-mid font-bold`} placeholder="---" />
          </div>
        </div>

        <div className="col-span-12">
          <label className={labelStyles}>Remarks</label>
          <textarea
            name="remarques"
            value={formData.remarques}
            onChange={handleInputChange}
            rows={2}
            className={`${inputStyles} resize-none`}
            placeholder="Additional notes about this back order..."
          />
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;
