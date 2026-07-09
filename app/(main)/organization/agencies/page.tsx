"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Search, Building2, MapPin, Phone, Mail, Star,
  CheckCircle2, XCircle, ChevronRight, Globe
} from "lucide-react";
import { AgenciesService, KernelAgencyResponse } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import CreateAgencyModal from "./CreateAgencyModal";

const COLUMNS = ["Agency", "Location", "Contact", "Type", "Status"];

const OrganizationAdminPage = () => {
  const [agencies, setAgencies] = useState<KernelAgencyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const organizationName = getStoredSeller()?.organizationName;

  const fetchAgencies = useCallback(async () => {
    const seller = getStoredSeller();
    if (!seller?.organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await AgenciesService.getAll3(seller.organizationId);
      setAgencies(res);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      toast.error("Failed to load agencies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  const handleModalClose = (created: boolean) => {
    setIsModalOpen(false);
    if (created) fetchAgencies();
  };

  const filteredAgencies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return agencies;
    return agencies.filter((a) =>
      [a.name, a.code, a.city, a.country].some((v) => v?.toLowerCase().includes(term))
    );
  }, [agencies, search]);

  const activeCount = useMemo(() => agencies.filter((a) => a.active).length, [agencies]);
  const headquarterCount = useMemo(() => agencies.filter((a) => a.isHeadquarter).length, [agencies]);

  return (
    <div className="p-8 bg-secondary-background min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-secondary-gray mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest">Administration</span>
            <ChevronRight size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-mid">Organization</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Organization</h1>
          <p className="text-secondary-gray text-sm font-medium">
            Agencies registered under {organizationName || "your organization"}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <Building2 size={16} className="text-secondary-mid" />
            <span className="text-xs font-black text-primary">{agencies.length}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Agencies</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs font-black text-primary">{activeCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <Star size={16} className="text-amber-500" />
            <span className="text-xs font-black text-primary">{headquarterCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">HQ</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-secondary-light mb-6 flex items-center justify-between gap-4">
        <div className="relative group max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray group-focus-within:text-secondary-mid transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by name, code or city..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-white border-2 border-secondary-mid text-secondary-mid px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-mid hover:text-white transition-all duration-300 shadow-sm shrink-0"
        >
          <AddIcon sx={{ fontSize: 18 }} /> Add Agency
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-secondary-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-super-light/30 border-b border-secondary-light">
                {COLUMNS.map((col) => (
                  <th key={col} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gray whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <TableSkeleton cols={COLUMNS.length} />
              ) : filteredAgencies.length === 0 ? (
                <EmptyState title="No agencies found" message="Try adjusting your search, or add a new agency for this organization." />
              ) : (
                filteredAgencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-secondary-super-light/40 transition-all group border-l-4 border-l-transparent hover:border-l-secondary-mid">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {agency.isHeadquarter && <Star size={14} className="text-amber-500 shrink-0" />}
                        <div className="flex flex-col">
                          <span className="font-black text-primary group-hover:text-secondary-mid transition-colors">{agency.name}</span>
                          <span className="text-[11px] font-bold text-secondary-gray">{agency.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <MapPin size={14} className="text-secondary-mid shrink-0" />
                        <span>{[agency.city, agency.country].filter(Boolean).join(", ") || "-"}</span>
                      </div>
                      {agency.location && (
                        <span className="text-[11px] font-medium text-secondary-gray ml-6">{agency.location}</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1 text-[11px] font-bold text-secondary-gray">
                        {agency.phone && (
                          <span className="flex items-center gap-1.5"><Phone size={11} className="text-secondary-mid" /> {agency.phone}</span>
                        )}
                        {agency.email && (
                          <span className="flex items-center gap-1.5"><Mail size={11} className="text-secondary-mid" /> {agency.email}</span>
                        )}
                        {!agency.phone && !agency.email && "-"}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-secondary-super-light text-secondary-mid rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Globe size={11} /> {agency.agencyType || "-"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {agency.active ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={11} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-red-50 text-red-500 border border-red-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <XCircle size={11} /> Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateAgencyModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
};

export default OrganizationAdminPage;
