'use client';

import React from 'react';
import { 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Store, 
  Navigation,
  Building2
} from "lucide-react";
import { 
    UpdatedSalesOrderResponse, 
    SalesOrderResponse, 
    MOCK_AGENCIES 
} from '@/src/api/models/UpdatedSalesOrder';
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse';

interface Props {
  salesOrder: UpdatedSalesOrderResponse | undefined;
  setSalesOrder: (data: UpdatedSalesOrderResponse) => void;
  client:UpdatedClientResponse|undefined
}

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

const SalesOrderLogistics = ({ salesOrder, setSalesOrder,client }: Props) => {
  if (!salesOrder) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for Agency selection to sync agencyInfo object
    if (name === "idAgency") {
        const selectedAgency = MOCK_AGENCIES.find(a => a.idAgency === value);
        setSalesOrder({
            ...salesOrder,
            idAgency: value,
            agencyInfo: selectedAgency
        });
        return;
    }

    setSalesOrder({ ...salesOrder, [name]: value });
  };

  return (
    <div className="grid grid-cols-12 gap-6 pb-10">
      
      {/* LEFT COLUMN: RECIPIENT DETAILS */}
      <div className="col-span-12 lg:col-span-7 space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <User className="text-secondary-mid" size={18} />
            <h3 className="text-sm font-black text-secondary uppercase tracking-tight">Recipient Information</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className={labelStyles}>Recipient Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="text" name="recipientName" 
                  className={`${inputStyles} pl-10`} 
                  value={salesOrder.recipientName || ""} 
                  onChange={handleInputChange}
                  placeholder="e.g. Moussa Ibrahim"
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
                  value={salesOrder.recipientPhone || ""} 
                  onChange={handleInputChange}
                  placeholder="+237..."
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className={labelStyles}>Delivery Address / Drop-off Point</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="text" name="recipientAddress" 
                  className={`${inputStyles} pl-10`} 
                  value={salesOrder.recipientAddress || ""} 
                  onChange={handleInputChange}
                  placeholder="Street, Quarter, specific landmarks..."
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className={labelStyles}>City</label>
              <input 
                type="text" name="recipientCity" 
                className={inputStyles} 
                value={salesOrder.recipientCity || ""} 
                onChange={handleInputChange}
                placeholder="Yaoundé"
              />
            </div>

            <div className="col-span-1">
              <label className={labelStyles}>Expected Delivery Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-300" size={16} />
                <input 
                  type="date" name="expectedDeliveryDate" 
                  className={`${inputStyles} pl-10`} 
                  value={salesOrder.expectedDeliveryDate || ""} 
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: TRANSPORT & LOGISTICS */}
      <div className="col-span-12 lg:col-span-5 space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
            <Truck className="text-secondary-mid" size={18} />
            <h3 className="text-sm font-black text-secondary uppercase tracking-tight">Logistics Method</h3>
          </div>

          <div className="space-y-6">
            {/* Method Selection */}
            <div>
              <label className={labelStyles}>Shipping Method</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SalesOrderResponse.transportMethod).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSalesOrder({...salesOrder, transportMethod: method})}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all ${
                        salesOrder.transportMethod === method 
                        ? "bg-secondary-mid text-white border-secondary-mid shadow-md" 
                        : "bg-white text-gray-400 border-gray-100 hover:border-secondary-mid/20"
                    }`}
                  >
                    {method === 'RETRAIT_MAGASIN' ? <Store size={14}/> : <Navigation size={14}/>}
                    {method.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Agency Selection */}
            {salesOrder.transportMethod === SalesOrderResponse.transportMethod.AGENCE && (
              <div className="p-4 bg-secondary-super-light/30 border border-secondary-mid/10 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <label className={labelStyles}>Select Travel Agency</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 text-secondary-mid/40" size={16} />
                    <select 
                        name="idAgency"
                        value={salesOrder.idAgency || ""}
                        onChange={handleInputChange}
                        className={`${inputStyles} pl-10 appearance-none bg-white font-bold`}
                    >
                        <option value="">Choose an agency...</option>
                        {MOCK_AGENCIES.map(agency => (
                            <option key={agency.idAgency} value={agency.idAgency}>
                                {agency.name} {agency.shortName ? `(${agency.shortName})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
                {salesOrder.agencyInfo && (
                    <div className="mt-3 text-[10px] text-secondary-mid/70 flex items-center gap-2 italic">
                        <Phone size={10} /> Agency Contact: {salesOrder.agencyInfo.telephone || 'N/A'}
                    </div>
                )}
              </div>
            )}

            {/* Custom Notes */}
            <div>
              <label className={labelStyles}>Logistics Notes / Instructions</label>
              <textarea 
                name="notes"
                className={`${inputStyles} min-h-[100px] resize-none`}
                placeholder="Specific delivery instructions, gate codes, etc."
                value={salesOrder.notes || ""}
                onChange={(e: any) => handleInputChange(e)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderLogistics;