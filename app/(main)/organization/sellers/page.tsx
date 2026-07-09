"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Search, Users, MapPin, Mail, Building2,
  CheckCircle2, KeyRound, ChevronRight, MoreVertical, ShieldCheck, Trash2
} from "lucide-react";
import { SellerAdminService, SellerListItemResponse } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import ActionButton from "@/components/ActionButton";
import SellerAvatar from "@/components/SellerAvatar";
import CreateSellerModal from "./CreateSellerModal";
import PermissionsModal from "./PermissionsModal";
import AssignAgencyModal from "./AssignAgencyModal";

const COLUMNS = ["Seller", "Role", "Agency / Sale Point", "Permissions", "POS PIN", "Status", ""];

const ROLE_LABELS: Record<string, string> = {
  POS_SELLER: "POS Seller",
  SELLER: "Seller",
  AGENCY_MANAGER: "Agency Manager",
  OWNER: "Owner",
};

const ROLE_STYLES: Record<string, string> = {
  POS_SELLER: "bg-blue-50 text-blue-600 border-blue-200",
  SELLER: "bg-secondary-super-light text-secondary-mid border-secondary-light",
  AGENCY_MANAGER: "bg-purple-50 text-purple-600 border-purple-200",
  OWNER: "bg-amber-50 text-amber-700 border-amber-200",
};

const SellersAdminPage = () => {
  const [sellers, setSellers] = useState<SellerListItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [permissionsSeller, setPermissionsSeller] = useState<SellerListItemResponse | null>(null);
  const [agencySeller, setAgencySeller] = useState<SellerListItemResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  const fetchSellers = useCallback(async () => {
    const seller = getStoredSeller();
    if (!seller?.organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await SellerAdminService.getAll1(seller.organizationId);
      setSellers(res);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to load sellers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleModalClose = (created: boolean) => {
    setIsModalOpen(false);
    if (created) fetchSellers();
  };

  const handlePermissionsModalClose = (updated: boolean) => {
    setPermissionsSeller(null);
    if (updated) fetchSellers();
  };

  const handleAgencyModalClose = (assigned: boolean) => {
    setAgencySeller(null);
    if (assigned) fetchSellers();
  };

  const filteredSellers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sellers;
    return sellers.filter((s) =>
      [s.username, s.email, s.agency, s.salePoint].some((v) => v?.toLowerCase().includes(term))
    );
  }, [sellers, search]);

  const activeCount = useMemo(() => sellers.filter((s) => !s.mustChangePassword).length, [sellers]);
  const pendingCount = useMemo(() => sellers.filter((s) => s.mustChangePassword).length, [sellers]);

  return (
    <div className="p-8 bg-secondary-background min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-secondary-gray mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest">Organization</span>
            <ChevronRight size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-mid">Sellers</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Sellers</h1>
          <p className="text-secondary-gray text-sm font-medium">
            Seller accounts registered under {organizationName || "your organization"}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <Users size={16} className="text-secondary-mid" />
            <span className="text-xs font-black text-primary">{sellers.length}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Sellers</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs font-black text-primary">{activeCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <KeyRound size={16} className="text-amber-500" />
            <span className="text-xs font-black text-primary">{pendingCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Pending</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-secondary-light mb-6 flex items-center justify-between gap-4">
        <div className="relative group max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray group-focus-within:text-secondary-mid transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by username, email, agency..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-white border-2 border-secondary-mid text-secondary-mid px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-mid hover:text-white transition-all duration-300 shadow-sm shrink-0"
        >
          <AddIcon sx={{ fontSize: 18 }} /> Add Seller
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
              ) : filteredSellers.length === 0 ? (
                <EmptyState title="No sellers found" message="Try adjusting your search, or add a new seller for this organization." />
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-secondary-super-light/40 transition-all group border-l-4 border-l-transparent hover:border-l-secondary-mid">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <SellerAvatar name={seller.username} imageUrl={seller.profileImageUrl} size={36} />
                        <div className="flex flex-col">
                          <span className="font-black text-primary group-hover:text-secondary-mid transition-colors">{seller.username}</span>
                          {seller.email && (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-secondary-gray">
                              <Mail size={11} className="text-secondary-mid" /> {seller.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 w-fit rounded-lg text-[10px] font-black uppercase tracking-widest border ${ROLE_STYLES[seller.role ?? ""] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {ROLE_LABELS[seller.role ?? ""] || seller.role || "-"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Building2 size={14} className="text-secondary-mid shrink-0" />
                        <span>{seller.agency || "-"}</span>
                      </div>
                      {seller.salePoint && (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-secondary-gray ml-6">
                          <MapPin size={11} /> {seller.salePoint}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {seller.permissions && seller.permissions.length > 0 ? (
                          seller.permissions.map((p) => (
                            <span key={p} className="px-2 py-0.5 bg-secondary-super-light text-secondary-mid rounded-md text-[9px] font-black uppercase tracking-widest">
                              {p.replace(/_/g, " ")}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] font-bold text-secondary-gray">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono font-black text-sm text-secondary-mid tracking-widest">
                        {seller.pin || "-"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {seller.mustChangePassword ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <KeyRound size={11} /> Pending Setup
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={11} /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === seller.id ? null : (seller.id ?? null))}
                        className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === seller.id && (
                        <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                          <ActionButton
                            label="Add Permissions"
                            onClick={() => {
                              setPermissionsSeller(seller);
                              setActiveMenuId(null);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-secondary-mid"
                          >
                            <ShieldCheck size={14} />
                          </ActionButton>

                          <ActionButton
                            label="Assign Agency"
                            onClick={() => {
                              setAgencySeller(seller);
                              setActiveMenuId(null);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-blue-600"
                          >
                            <Building2 size={14} />
                          </ActionButton>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateSellerModal isOpen={isModalOpen} onClose={handleModalClose} />
      <PermissionsModal isOpen={!!permissionsSeller} seller={permissionsSeller} onClose={handlePermissionsModalClose} />
      <AssignAgencyModal isOpen={!!agencySeller} seller={agencySeller} onClose={handleAgencyModalClose} />
    </div>
  );
};

export default SellersAdminPage;
