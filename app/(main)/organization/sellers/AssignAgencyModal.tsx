"use client";

import React, { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { Building2, MapPin, Star, CheckCircle2, Save } from "lucide-react";
import { AgenciesService, ApiError, KernelAgencyResponse, SellerAdminService, SellerListItemResponse } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: (assigned: boolean) => void;
  seller: SellerListItemResponse | null;
}

const AssignAgencyModal = ({ isOpen, onClose, seller }: Props) => {
  const [agencies, setAgencies] = useState<KernelAgencyResponse[]>([]);
  const [search, setSearch] = useState("");
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !seller) return;
    document.body.style.overflow = "hidden";
    setSearch("");
    setSelectedAgencyId(seller.agencyId);

    const orgId = getStoredSeller()?.organizationId;
    if (!orgId) return;

    setIsLoading(true);
    AgenciesService.getAll3(orgId)
      .then(setAgencies)
      .catch(() => toast.error("Failed to load agencies."))
      .finally(() => setIsLoading(false));

    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, seller]);

  const filteredAgencies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return agencies;
    return agencies.filter((a) =>
      [a.name, a.code, a.city, a.country].some((v) => v?.toLowerCase().includes(term))
    );
  }, [agencies, search]);

  const handleSave = async () => {
    if (!seller?.id || !selectedAgencyId) return;
    setIsSaving(true);
    try {
      await SellerAdminService.assignAgency(seller.id, { agencyId: selectedAgencyId });
      toast.success("Seller assigned to agency successfully.");
      onClose(true);
    } catch (error) {
      const message = error instanceof ApiError ? (error.body?.message ?? error.message) : "Failed to assign agency. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !seller) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      {/* Background Overlay */}
      <div className="absolute inset-0" onClick={() => onClose(false)} />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">Assign Agency</h2>
              <p className="text-xs text-gray-400 font-bold">{seller.username}</p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50/50">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" sx={{ fontSize: 18 }} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none"
              placeholder="Search by name, code or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {isLoading ? (
              <p className="text-sm text-gray-400 font-medium p-6 text-center">Loading agencies…</p>
            ) : filteredAgencies.length === 0 ? (
              <p className="text-sm text-gray-400 font-medium p-6 text-center">No agencies found.</p>
            ) : (
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {filteredAgencies.map((agency) => {
                  const isSelected = selectedAgencyId === agency.id;
                  return (
                    <div
                      key={agency.id}
                      onClick={() => setSelectedAgencyId(agency.id)}
                      className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                        isSelected ? "bg-secondary-super-light" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {agency.isHeadquarter && <Star size={13} className="text-amber-500 shrink-0" />}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700 truncate">{agency.name}</span>
                            <span className="text-[10px] font-bold text-gray-400 shrink-0">{agency.code}</span>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                            <MapPin size={10} /> {[agency.city, agency.country].filter(Boolean).join(", ") || "-"}
                          </span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={18} className="text-secondary-mid shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
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
            disabled={isSaving || !selectedAgencyId}
            className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Save size={18} />
            {isSaving ? "ASSIGNING…" : "ASSIGN AGENCY"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAgencyModal;
