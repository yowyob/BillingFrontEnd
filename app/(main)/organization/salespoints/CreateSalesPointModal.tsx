"use client";

import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Store, Save } from "lucide-react";
import { AgenciesService, ApiError, CreateSalesPointRequest, KernelAgencyResponse, SalesPointsService } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: (created: boolean) => void;
}

const emptyForm = {
  salesPointName: "",
  agencyId: "",
  currency: "XAF",
  isActive: true,
};

const CreateSalesPointModal = ({ isOpen, onClose }: Props) => {
  const [form, setForm] = useState(emptyForm);
  const [agencies, setAgencies] = useState<KernelAgencyResponse[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setForm(emptyForm);

      const orgId = getStoredSeller()?.organizationId;
      if (orgId) {
        AgenciesService.getAll3(orgId)
          .then(setAgencies)
          .catch(() => toast.error("Failed to load agencies."));
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleSave = async () => {
    const seller = getStoredSeller();
    if (!seller?.organizationId) return;

    setIsSaving(true);
    try {
      await SalesPointsService.create2({
        organizationId: seller.organizationId,
        agencyId: form.agencyId || undefined,
        salesPointName: form.salesPointName,
        currency: form.currency || undefined,
        status: form.isActive ? CreateSalesPointRequest.status.ACTIVE : CreateSalesPointRequest.status.INACTIVE,
      });
      toast.success("Sale point created successfully.");
      onClose(true);
    } catch (error) {
      const message = error instanceof ApiError ? (error.body?.message ?? error.message) : "Failed to create sale point. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputWrapper = "flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus-within:border-secondary-mid focus-within:bg-white focus-within:ring-4 focus-within:ring-secondary-mid/5 transition-all duration-200";
  const inputStyle = "bg-transparent border-none outline-none text-gray-700 w-full text-sm placeholder:text-gray-400";
  const label = "text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      {/* Background Overlay */}
      <div className="absolute inset-0" onClick={() => onClose(false)} />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <Store size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">New Sale Point</h2>
              <p className="text-xs text-gray-400 font-bold">Register a new register/counter for this organization</p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-5 bg-gray-50/50">
          <div className="space-y-2">
            <label className={label}>Sale Point Name</label>
            <div className={inputWrapper}>
              <input
                type="text"
                placeholder="Comptoir Principal"
                className={inputStyle}
                required
                value={form.salesPointName}
                onChange={(e) => setForm({ ...form, salesPointName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={label}>Agency</label>
            <div className={inputWrapper}>
              <select
                className={`${inputStyle} cursor-pointer`}
                value={form.agencyId}
                onChange={(e) => setForm({ ...form, agencyId: e.target.value })}
              >
                <option value="">No agency</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>{agency.name} ({agency.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className={label}>Currency</label>
            <div className={inputWrapper}>
              <input
                type="text"
                placeholder="XAF"
                className={inputStyle}
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-1">
            <input
              type="checkbox"
              id="isActive"
              className="w-4 h-4 rounded border-gray-300 text-secondary-mid focus:ring-secondary-mid cursor-pointer"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm text-gray-500 font-medium cursor-pointer">Active</label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-end items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button
            onClick={() => onClose(false)}
            className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !form.salesPointName}
            className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Save size={18} />
            {isSaving ? "SAVING…" : "SAVE SALE POINT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSalesPointModal;
