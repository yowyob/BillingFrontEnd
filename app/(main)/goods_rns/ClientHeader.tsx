'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';
import SearchIcon from "@mui/icons-material/Search";
import ReceiptIcon from "@mui/icons-material/Receipt"; 
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; 
import AssignmentIcon from '@mui/icons-material/Assignment';
import { GoodsReceiptNoteResponse } from '@/src/api/models/GoodsReceiptNote';
import { PurchaseOrderResponse } from '@/src/api/models/PurchaseOrderLine';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { convertPurchaseOrderToGRN } from '@/src/api/transformation/purchaseOrderTranformation';
import { BonDAchatService } from '@/src/src2/api/services/BonDAchatService';
import { mapBackendBAArrayToUIArray } from '@/src/Mappers/BonAchatMapper';
import { toast } from 'sonner';

interface Props {
  producers: UpdatedClientResponse[];
  setMainSelectedProducer: (data: UpdatedClientResponse) => void;
  selectedProducer?: UpdatedClientResponse;
  grn?: GoodsReceiptNoteResponse;
  setGrn: (data: GoodsReceiptNoteResponse) => void;
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const readOnlyStyles = "w-full border border-gray-100 bg-gray-50 rounded-lg py-2 px-3 text-sm text-gray-600 cursor-not-allowed font-medium";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const ClientHeader = ({ producers, setMainSelectedProducer, selectedProducer, grn, setGrn }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState<UpdatedClientResponse[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [poRefFilter, setPoRefFilter] = useState<string>("");
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrderResponse[]>([]);
  const [showPoDropdown, setShowPoDropdown] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([]);
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  const [generatedId, setGeneratedId] = useState<string>("");

  const [formData, setFormData] = useState({
    receiptDate: new Date().toISOString().split('T')[0],
    vehicleNumber: "",
    transporterCompanyName: "",
    preparedBy: "",
    remarks: "",
  });

  // 1. Initial Setup: Load user and purchase orders
  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) {
      const user = JSON.parse(stored);
      setSeller(user);
      setFormData(prev => ({ ...prev, preparedBy: user.nom || "" }));
    }

    const loadPurchaseOrders = async () => {
      try {
        const data = await BonDAchatService.getAllBonsAchat();
        const transformed = mapBackendBAArrayToUIArray(data);
        setPurchaseOrders(transformed);
      } catch (error) {
        console.error("Error loading purchase orders:", error);
        toast.error("Failed to load purchase orders.")
      }
    };
    loadPurchaseOrders();
  }, []);

  // 2. Generate GRN ID logic
  useEffect(() => {
    if (!grn?.idGRN && seller) {
      const agency = seller.agency || "HQ";
      const type = "GRN";
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      setGeneratedId(`${agency}-${type}-${dateStr}-${suffix}`);
    }
  }, [seller, grn?.idGRN]);

  // 3. Search logic for Suppliers
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term || (selectedProducer && term === selectedProducer.raisonSociale?.toLowerCase())) {
      setFilteredResults([]);
      return;
    }
    const matches = producers.filter(p =>
      p.idClient?.toLowerCase().includes(term) ||
      p.raisonSociale?.toLowerCase().includes(term)
    );
    setFilteredResults(matches);
  }, [searchTerm, producers, selectedProducer]);

  // 4. Search logic for POs
  useEffect(() => {
    if (poRefFilter.trim() === "") {
      setFilteredPOs([]);
      return;
    }
    const filtered = purchaseOrders?.filter((po) =>
      po.poNumber?.toLowerCase().includes(poRefFilter.toLowerCase())
    );
    setFilteredPOs(filtered || []);
  }, [poRefFilter, purchaseOrders]);

  const handleSelectPO = (po: PurchaseOrderResponse) => {
    setPoRefFilter(po.poNumber || "");
    setShowPoDropdown(false);
    
    const convertedGrn = convertPurchaseOrderToGRN(po);
    setGrn({ ...convertedGrn });

    const supplier = producers.find(p => p.idClient === po.supplierId);
    if (supplier) {
      setMainSelectedProducer(supplier);
      setSearchTerm(supplier.raisonSociale || "");
    }
  };

  // 5. Sync Data to Parent state
  useEffect(() => {
    if (grn) {
      const now = new Date().toISOString();
      setGrn({
        ...grn,
        grnNumber: grn.grnNumber || generatedId,
        supplierId: selectedProducer?.idClient,
        supplierName: selectedProducer?.raisonSociale,
        receiptDate: formData.receiptDate, // Parent mapper will handle LocalDateTime conversion
        vehicleNumber: formData.vehicleNumber,
        transporterCompanyName: formData.transporterCompanyName,
        preparedBy: formData.preparedBy,
        remarks: formData.remarks,
        systemDate: now
      });
    }
  }, [selectedProducer, formData, generatedId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* SECTION 1: SUPPLIER & GRN IDENTITY */}
      <div className="p-6 border-b border-gray-50 bg-gray-50/10">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4">
            <label className={labelStyles}>Supplier Search</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input 
                type="text" 
                className={`${inputStyles} pl-10 font-bold`} 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }} 
                placeholder="Search Supplier..." 
              />
              {showResults && filteredResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border rounded-xl shadow-xl max-h-48 overflow-auto">
                  {filteredResults.map(p => (
                    <div 
                      key={p.idClient} 
                      onClick={() => { setMainSelectedProducer(p); setSearchTerm(p.raisonSociale || ""); setShowResults(false); }} 
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                    >
                      <p className="text-sm font-bold">{p.raisonSociale}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className={labelStyles}>Supplier Name</label>
            <input readOnly value={selectedProducer?.raisonSociale || "No Supplier Selected"} className={readOnlyStyles} />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className={labelStyles}>Supplier Address</label>
            <input readOnly value={selectedProducer?.adresse || "N/A"} className={readOnlyStyles} />
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className={labelStyles}>Current GRN #</label>
            <div className="relative">
              <ReceiptIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
              <input readOnly value={grn?.grnNumber || generatedId} className={`${readOnlyStyles} pl-10 font-mono text-blue-600`} />
            </div>
          </div>

          <div className="col-span-12 md:col-span-6">
            <label className={labelStyles}>System Date</label>
            <input type="text" readOnly className={readOnlyStyles} value={new Date().toLocaleDateString()} />
          </div>
        </div>
      </div>

      {/* SECTION 2: LOGISTICS & REFERENCE */}
      <div className="p-6 grid grid-cols-12 gap-x-5 gap-y-6">
        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Link Purchase Order (PO)</label>
          <div className="relative">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg">
              <AssignmentIcon className="ml-3 text-gray-300" sx={{ fontSize: 18 }} />
              <input 
                type="text" 
                className="w-full bg-transparent outline-none py-2 px-2 text-sm text-gray-700 font-mono" 
                placeholder="Search PO Number..." 
                value={poRefFilter} 
                onChange={(e) => { setPoRefFilter(e.target.value); setShowPoDropdown(true); }} 
              />
            </div>
            {showPoDropdown && filteredPOs.length > 0 && (
              <div className="absolute z-[110] w-full mt-2 bg-white border shadow-2xl rounded-xl max-h-48 overflow-auto p-1">
                {filteredPOs.map((po) => (
                  <div key={po.idPO} onClick={() => handleSelectPO(po)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex flex-col rounded-lg">
                    <span className="text-[11px] font-black font-mono uppercase">{po.poNumber}</span>
                    <span className="text-[10px] text-gray-400">{po.supplierName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Transporter Company</label>
          <div className="relative">
            <LocalShippingIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
            <input type="text" name="transporterCompanyName" value={formData.transporterCompanyName} onChange={handleInputChange} className={`${inputStyles} pl-10`} placeholder="DHL, Internal Fleet" />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Vehicle / Truck Number</label>
          <div className="relative">
            <LocalShippingIcon className="absolute left-3 top-2.5 text-gray-300" sx={{ fontSize: 18 }} />
            <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} className={`${inputStyles} pl-10`} placeholder="Plate Number" />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className={labelStyles}>Actual Receipt Date</label>
          <input type="date" name="receiptDate" className={inputStyles} value={formData.receiptDate} onChange={handleInputChange} />
        </div>

        <div className="col-span-12">
          <label className={labelStyles}>Reception Remarks</label>
          <textarea 
            name="remarks" 
            rows={2} 
            className={inputStyles} 
            value={formData.remarks} 
            onChange={handleInputChange}
            placeholder="Condition of goods, temperature, seal status..."
          />
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;