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
  CheckCircle2
} from "lucide-react";
import { DeliveryNoteResponse } from '@/src/api/models/DeliveryNoteResponse';
import { MOCK_AGENCIES } from '@/src/api/models/UpdatedSalesOrder';
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';

interface Props {
  deliveryNote: DeliveryNoteResponse | undefined;
  setDeliveryNote: (data: DeliveryNoteResponse) => void;
  client: UpdatedClientResponse | undefined;
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const DeliveryNoteLogistics = ({ deliveryNote, setDeliveryNote, client }: Props) => {
  if (!deliveryNote) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryNote({ ...deliveryNote, [name]: value });
  };

  return (
    <div className="grid grid-cols-12 gap-6 pb-10">
      
      {/* LEFT COLUMN: SHIPMENT DESTINATION */}
      <div className="col-span-12 lg:col-span-7 space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <User className="text-blue-600" size={18} />
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Shipping Destination</h3>
            </div>
            {deliveryNote.recipientName && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <CheckCircle2 size={12} /> Ready for Dispatch
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className={labelStyles}>Recipient / Agency Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="text" name="recipientName" 
                  className={`${inputStyles} pl-10`} 
                  value={deliveryNote.recipientName || ""} 
                  onChange={handleInputChange}
                  placeholder="e.g. Agency Mifi - Bafoussam"
                />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className={labelStyles}>Recipient Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="text" name="recipientPhone" 
                  className={`${inputStyles} pl-10`} 
                  value={deliveryNote.recipientPhone || ""} 
                  onChange={handleInputChange}
                  placeholder="+237..."
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className={labelStyles}>Full Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="text" name="recipientAddress" 
                  className={`${inputStyles} pl-10`} 
                  value={deliveryNote.recipientAddress || ""} 
                  onChange={handleInputChange}
                  placeholder="Street, Quarter, Agency Branch..."
                />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className={labelStyles}>City / Region</label>
              <input 
                type="text" name="recipientCity" 
                className={inputStyles} 
                value={deliveryNote.recipientCity || ""} 
                onChange={handleInputChange}
                placeholder="Yaoundé"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className={labelStyles}>Planned Delivery Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="date" name="deliveryDate" 
                  className={`${inputStyles} pl-10`} 
                  value={deliveryNote.deliveryDate?.split('T')[0] || ""} 
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SHIPMENT LABEL PREVIEW (Dynamic Summary Card) */}
        {(deliveryNote.recipientName || deliveryNote.recipientAddress) && (
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <Info size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Digital Shipping Label</span>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black truncate">{deliveryNote.recipientName || '---'}</p>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <MapPin size={14} />
                <p>{deliveryNote.recipientAddress || 'No address set'}</p>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Phone size={14} />
                <p>{deliveryNote.recipientPhone || 'No contact set'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: CARRIER & LOGISTICS */}
      <div className="col-span-12 lg:col-span-5 space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <Truck className="text-blue-600" size={18} />
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Logistics Provider</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelStyles}>Assigned Carrier / Truck</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <select 
                  name="deliveryAgency"
                  value={deliveryNote.deliveryAgency || ""}
                  onChange={handleInputChange}
                  className={`${inputStyles} pl-10 appearance-none bg-white font-medium`}
                >
                  <option value="">Self-Pickup (Client)</option>
                  {MOCK_AGENCIES.map(agency => (
                    <option key={agency.idAgency} value={agency.name}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelStyles}>Terms & Conditions / BL Footer</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <textarea 
                  name="termsAndConditions"
                  className={`${inputStyles} pl-10 min-h-[150px] resize-none text-[12px] leading-relaxed`}
                  placeholder="e.g. Goods remain property of the company until full payment..."
                  value={deliveryNote.termsAndConditions || ""}
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

export default DeliveryNoteLogistics;