"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Truck, Mail, Phone, Building2, Tag,
  CheckCircle2, XCircle, ChevronRight, MoreVertical, ShieldCheck, UserCheck
} from "lucide-react";
import { FournisseursService, FournisseurResponse, ProducerAssignmentsService, ProducerAssignmentResponse } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import ActionButton from "@/components/ActionButton";
import SaleConfigModal from "./SaleConfigModal";
import AssignSellerModal from "./AssignSellerModal";

const COLUMNS = ["Supplier", "Contact", "Type", "Sale Sizes", "Assigned Seller", "Status", ""];

const TYPE_LABELS: Record<string, string> = {
  PARTICULIER: "Individual",
  ENTREPRISE: "Company",
  ADMINISTRATION: "Administration",
};

const FournisseursAdminPage = () => {
  const [fournisseurs, setFournisseurs] = useState<FournisseurResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [configFournisseur, setConfigFournisseur] = useState<FournisseurResponse | null>(null);
  const [assignFournisseur, setAssignFournisseur] = useState<FournisseurResponse | null>(null);
  const [assignments, setAssignments] = useState<Record<string, ProducerAssignmentResponse>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchFournisseurs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await FournisseursService.getAllFournisseurs();
      setFournisseurs(res);
    } catch (error) {
      console.error("Error fetching fournisseurs:", error);
      toast.error("Failed to load suppliers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    const org = getStoredSeller();
    if (!org?.organizationId) return;
    try {
      const res = await ProducerAssignmentsService.listByOrganization(org.organizationId);
      const byFournisseurId: Record<string, ProducerAssignmentResponse> = {};
      res.forEach((a) => { if (a.fournisseurId) byFournisseurId[a.fournisseurId] = a; });
      setAssignments(byFournisseurId);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  }, []);

  useEffect(() => {
    fetchFournisseurs();
    fetchAssignments();
  }, [fetchFournisseurs, fetchAssignments]);

  const handleConfigModalClose = (updated: boolean) => {
    setConfigFournisseur(null);
    if (updated) fetchFournisseurs();
  };

  const handleAssignModalClose = (updated: boolean) => {
    setAssignFournisseur(null);
    if (updated) fetchAssignments();
  };

  const filteredFournisseurs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return fournisseurs;
    return fournisseurs.filter((f) =>
      [f.username, f.raisonSociale, f.codeFournisseur, f.email, f.telephone].some((v) => v?.toLowerCase().includes(term))
    );
  }, [fournisseurs, search]);

  const activeCount = useMemo(() => fournisseurs.filter((f) => f.actif).length, [fournisseurs]);
  const companyCount = useMemo(() => fournisseurs.filter((f) => f.typeFournisseur === FournisseurResponse.typeFournisseur.ENTREPRISE).length, [fournisseurs]);

  return (
    <div className="p-8 bg-secondary-background min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-secondary-gray mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest">Organization</span>
            <ChevronRight size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-mid">Suppliers</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Suppliers</h1>
          <p className="text-secondary-gray text-sm font-medium">
            Supplier accounts registered for your organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <Truck size={16} className="text-secondary-mid" />
            <span className="text-xs font-black text-primary">{fournisseurs.length}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Suppliers</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs font-black text-primary">{activeCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <Building2 size={16} className="text-blue-500" />
            <span className="text-xs font-black text-primary">{companyCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Companies</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-secondary-light mb-6">
        <div className="relative group max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray group-focus-within:text-secondary-mid transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by name, code, email or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
              ) : filteredFournisseurs.length === 0 ? (
                <EmptyState title="No suppliers found" message="Try adjusting your search." />
              ) : (
                filteredFournisseurs.map((fournisseur) => (
                  <tr key={fournisseur.idFournisseur} className="hover:bg-secondary-super-light/40 transition-all group border-l-4 border-l-transparent hover:border-l-secondary-mid">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-primary group-hover:text-secondary-mid transition-colors">
                          {fournisseur.raisonSociale || fournisseur.username}
                        </span>
                        {fournisseur.codeFournisseur && (
                          <span className="text-[11px] font-bold text-secondary-gray">{fournisseur.codeFournisseur}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1 text-[11px] font-bold text-secondary-gray">
                        {fournisseur.email && (
                          <span className="flex items-center gap-1.5"><Mail size={11} className="text-secondary-mid" /> {fournisseur.email}</span>
                        )}
                        {fournisseur.telephone && (
                          <span className="flex items-center gap-1.5"><Phone size={11} className="text-secondary-mid" /> {fournisseur.telephone}</span>
                        )}
                        {!fournisseur.email && !fournisseur.telephone && "-"}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-secondary-super-light text-secondary-mid rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Tag size={11} /> {TYPE_LABELS[fournisseur.typeFournisseur ?? ""] || fournisseur.typeFournisseur || "-"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {fournisseur.allowedSaleSizes && fournisseur.allowedSaleSizes.length > 0 ? (
                          fournisseur.allowedSaleSizes.map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-secondary-super-light text-secondary-mid rounded-md text-[9px] font-black uppercase tracking-widest">
                              {s.replace(/_/g, " ")}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] font-bold text-secondary-gray">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {fournisseur.idFournisseur && assignments[fournisseur.idFournisseur] ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-secondary-super-light text-secondary-mid rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <UserCheck size={11} /> {assignments[fournisseur.idFournisseur].sellerName || "Assigned"}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-secondary-gray">Unassigned</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {fournisseur.actif ? (
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
                        onClick={() => setActiveMenuId(activeMenuId === fournisseur.idFournisseur ? null : (fournisseur.idFournisseur ?? null))}
                        className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === fournisseur.idFournisseur && (
                        <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                          <ActionButton
                            label="Sale Config"
                            onClick={() => {
                              setConfigFournisseur(fournisseur);
                              setActiveMenuId(null);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-secondary-mid"
                          >
                            <ShieldCheck size={14} />
                          </ActionButton>
                          <ActionButton
                            label="Assign Seller"
                            onClick={() => {
                              setAssignFournisseur(fournisseur);
                              setActiveMenuId(null);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-secondary-mid"
                          >
                            <UserCheck size={14} />
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

      <SaleConfigModal isOpen={!!configFournisseur} fournisseur={configFournisseur} onClose={handleConfigModalClose} />
      <AssignSellerModal isOpen={!!assignFournisseur} fournisseur={assignFournisseur} onClose={handleAssignModalClose} />
    </div>
  );
};

export default FournisseursAdminPage;
