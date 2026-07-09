'use client';

import React from 'react';
import { 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2,
  ClipboardList,
  Info,
  CheckCircle2,
  Mail
} from "lucide-react";
import { PurchaseOrderResponse, PurcaseOrderResponse } from '@/src/api/models/PurchaseOrderLine';
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';

interface Props {
  purchaseOrder: PurchaseOrderResponse | undefined;
  setPurchaseOrder: (data: PurchaseOrderResponse) => void;
  producer: UpdatedClientResponse | undefined;
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const PurchaseOrderLogistics = ({ purchaseOrder, setPurchaseOrder, producer }: Props) => {
  if (!purchaseOrder) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPurchaseOrder({ ...purchaseOrder, [name]: value });
  };

  return (
    <div className="grid grid-cols-12 gap-6 pb-10">
      
      {/* LEFT COLUMN: DELIVERY POINT (Internal destination for the ordered goods) */}
      <div className="col-span-12 lg:col-span-7 space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="text-secondary-mid" size={18} />
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Delivery Point (Internal)</h3>
            </div>
            {purchaseOrder.deliveryName && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <CheckCircle2 size={12} /> Receiving Info Set
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className={labelStyles}>Point of Delivery Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="text" name="deliveryName" 
                  className={`${inputStyles} pl-10`} 
                  value={purchaseOrder.deliveryName || ""} 
                  onChange={handleInputChange}
                  placeholder="e.g. Central Warehouse / Branch A"
                />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className={labelStyles}>Delivery Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="email" name="deliveryEmail" 
                  className={`${inputStyles} pl-10`} 
                  value={purchaseOrder.deliveryEmail || ""} 
                  onChange={handleInputChange}
                  placeholder="logistics@company.com"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className={labelStyles}>Full Receiving Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="text" name="deliveryAddress" 
                  className={`${inputStyles} pl-10`} 
                  value={purchaseOrder.deliveryAddress || ""} 
                  onChange={handleInputChange}
                  placeholder="Street, City, Specific Gate or Dock number..."
                />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className={labelStyles}>Receiving Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="text" name="deliveryContact" 
                  className={`${inputStyles} pl-10`} 
                  value={purchaseOrder.deliveryContact || ""} 
                  onChange={handleInputChange}
                  placeholder="+237..."
                />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className={labelStyles}>Expected Delivery Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="date" name="expectedDeliveryDate" 
                  className={`${inputStyles} pl-10 font-bold text-secondary-mid`} 
                  value={purchaseOrder.expectedDeliveryDate?.split('T')[0] || ""} 
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCER/SUPPLIER SUMMARY CARD */}
        {producer && (
          <div className="bg-secondary-mid rounded-2xl p-6 text-white shadow-lg shadow-secondary-mid/20 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <User size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Supplier / Producer Details</span>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black truncate">{producer.raisonSociale}</p>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <MapPin size={14} />
                <p>{producer.adresse || 'No address set'}</p>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Phone size={14} />
                <p>{producer.telephone || 'No contact set'}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-[9px] font-bold uppercase">Supplier Code</span>
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">{producer.idClient}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: TRANSPORT & INSTRUCTIONS */}
      <div className="col-span-12 lg:col-span-5 space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <Truck className="text-secondary-mid" size={18} />
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Procurement Logistics</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelStyles}>Transport Method</label>
              <div className="relative">
                <Truck className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <select 
                  name="transportMethod"
                  value={purchaseOrder.transportMethod || ""}
                  onChange={handleInputChange}
                  className={`${inputStyles} pl-10 appearance-none bg-white font-medium`}
                >
                  <option value="">Select Method</option>
                  {Object.entries(PurcaseOrderResponse.transportMethod || {}).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelStyles}>PO Remarks / Delivery Instructions</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <textarea 
                  name="deliveryInstructions"
                  className={`${inputStyles} pl-10 min-h-[150px] resize-none text-[12px] leading-relaxed`}
                  placeholder="e.g. Ensure items are shrink-wrapped and delivered before 4PM..."
                  value={purchaseOrder.deliveryInstructions || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

        
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderLogistics;