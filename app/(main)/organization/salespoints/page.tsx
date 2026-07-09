"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Search, Store, Building2, CheckCircle2, XCircle, ChevronRight, Coins, MoreVertical, Power, PowerOff
} from "lucide-react";
import { AgenciesService, ApiError, KernelAgencyResponse, SalesPointsService, SalesPointResponse } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import ActionButton from "@/components/ActionButton";
import CreateSalesPointModal from "./CreateSalesPointModal";

const COLUMNS = ["Sale Point", "Agency", "Currency", "Status", ""];

const SalesPointsAdminPage = () => {
  const [salesPoints, setSalesPoints] = useState<SalesPointResponse[]>([]);
  const [agencies, setAgencies] = useState<KernelAgencyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const organizationName = getStoredSeller()?.organizationName;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = useCallback(async () => {
    const seller = getStoredSeller();
    if (!seller?.organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [pointsRes, agenciesRes] = await Promise.all([
        SalesPointsService.getAll2(seller.organizationId),
        AgenciesService.getAll3(seller.organizationId),
      ]);
      setSalesPoints(pointsRes);
      setAgencies(agenciesRes);
    } catch (error) {
      console.error("Error fetching sale points:", error);
      toast.error("Failed to load sale points. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModalClose = (created: boolean) => {
    setIsModalOpen(false);
    if (created) fetchData();
  };

  const agencyById = useMemo(() => {
    const map = new Map<string, KernelAgencyResponse>();
    agencies.forEach((a) => { if (a.id) map.set(a.id, a); });
    return map;
  }, [agencies]);

  const filteredSalesPoints = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return salesPoints;
    return salesPoints.filter((sp) => {
      const agencyName = sp.agencyId ? agencyById.get(sp.agencyId)?.name : undefined;
      return [sp.salesPointName, agencyName, sp.currency].some((v) => v?.toLowerCase().includes(term));
    });
  }, [salesPoints, search, agencyById]);

  const activeCount = useMemo(() => salesPoints.filter((sp) => sp.status === SalesPointResponse.status.ACTIVE).length, [salesPoints]);
  const inactiveCount = useMemo(() => salesPoints.filter((sp) => sp.status === SalesPointResponse.status.INACTIVE).length, [salesPoints]);

  const handleToggleStatus = async (salesPoint: SalesPointResponse) => {
    if (!salesPoint.id) return;
    const nextStatus = salesPoint.status === SalesPointResponse.status.ACTIVE
      ? SalesPointResponse.status.INACTIVE
      : SalesPointResponse.status.ACTIVE;

    setTogglingId(salesPoint.id);
    setActiveMenuId(null);
    try {
      await SalesPointsService.update2(salesPoint.id, {
        agencyId: salesPoint.agencyId,
        salesPointName: salesPoint.salesPointName ?? "",
        currency: salesPoint.currency,
        status: nextStatus,
      });
      toast.success(nextStatus === SalesPointResponse.status.ACTIVE ? "Sale point activated." : "Sale point deactivated.");
      fetchData();
    } catch (error) {
      const message = error instanceof ApiError ? (error.body?.message ?? error.message) : "Failed to update sale point status. Please try again.";
      toast.error(message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-8 bg-secondary-background min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-secondary-gray mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest">Organization</span>
            <ChevronRight size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-mid">Sale Points</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Sale Points</h1>
          <p className="text-secondary-gray text-sm font-medium">
            Registers and counters registered under {organizationName || "your organization"}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <Store size={16} className="text-secondary-mid" />
            <span className="text-xs font-black text-primary">{salesPoints.length}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Sale Points</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs font-black text-primary">{activeCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <XCircle size={16} className="text-secondary-gray" />
            <span className="text-xs font-black text-primary">{inactiveCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Inactive</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-secondary-light mb-6 flex items-center justify-between gap-4">
        <div className="relative group max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray group-focus-within:text-secondary-mid transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by name, agency or currency..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-white border-2 border-secondary-mid text-secondary-mid px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-mid hover:text-white transition-all duration-300 shadow-sm shrink-0"
        >
          <AddIcon sx={{ fontSize: 18 }} /> Add Sale Point
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
              ) : filteredSalesPoints.length === 0 ? (
                <EmptyState title="No sale points found" message="Try adjusting your search, or add a new sale point for this organization." />
              ) : (
                filteredSalesPoints.map((salesPoint) => {
                  const agency = salesPoint.agencyId ? agencyById.get(salesPoint.agencyId) : undefined;
                  return (
                    <tr key={salesPoint.id} className="hover:bg-secondary-super-light/40 transition-all group border-l-4 border-l-transparent hover:border-l-secondary-mid">
                      <td className="px-8 py-5">
                        <span className="font-black text-primary group-hover:text-secondary-mid transition-colors">{salesPoint.salesPointName}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Building2 size={14} className="text-secondary-mid shrink-0" />
                          <span>{agency?.name || "-"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-secondary-super-light text-secondary-mid rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <Coins size={11} /> {salesPoint.currency || "-"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {salesPoint.status === SalesPointResponse.status.ACTIVE ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={11} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-red-50 text-red-500 border border-red-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            <XCircle size={11} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === salesPoint.id ? null : (salesPoint.id ?? null))}
                          className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {activeMenuId === salesPoint.id && (
                          <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                            {salesPoint.status === SalesPointResponse.status.ACTIVE ? (
                              <ActionButton
                                label="Deactivate"
                                onClick={() => handleToggleStatus(salesPoint)}
                                disabled={togglingId === salesPoint.id}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-red-500 disabled:opacity-50"
                              >
                                <PowerOff size={14} />
                              </ActionButton>
                            ) : (
                              <ActionButton
                                label="Activate"
                                onClick={() => handleToggleStatus(salesPoint)}
                                disabled={togglingId === salesPoint.id}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-emerald-600 disabled:opacity-50"
                              >
                                <Power size={14} />
                              </ActionButton>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateSalesPointModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
};

export default SalesPointsAdminPage;
