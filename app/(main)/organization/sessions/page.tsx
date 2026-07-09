"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Search, PlayCircle, Building2, User, Store, Coins, Clock,
  CheckCircle2, XCircle, ChevronRight, MoreVertical, Briefcase,
  PauseCircle, PlayCircle as ResumeIcon, Ban, RotateCcw, HelpCircle
} from "lucide-react";
import {
  AgenciesService, ApiError, KernelAgencyResponse,
  SalesPointResponse, SalesPointsService,
  SellerAdminService, SellerListItemResponse,
  SessionsService, SessionResponse
} from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import ActionButton from "@/components/ActionButton";
import CreateSessionModal from "./CreateSessionModal";

const COLUMNS = ["Seller", "Agency", "Type", "Sale Point", "Opening / Closing", "Start / End Time", "Status", ""];

const TYPE_BADGES: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  POS: { label: "POS", icon: Store, className: "bg-blue-50 text-blue-600 border-blue-200" },
  SALES: { label: "Sales", icon: Briefcase, className: "bg-purple-50 text-purple-600 border-purple-200" },
};

const formatDateTime = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

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

const STATUS_BADGES: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  PENDING: { label: "Pending", icon: HelpCircle, className: "bg-gray-50 text-gray-500 border-gray-200" },
  OPEN: { label: "Open", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  SUSPENDED: { label: "Suspended", icon: PauseCircle, className: "bg-amber-50 text-amber-600 border-amber-200" },
  CLOSED: { label: "Closed", icon: XCircle, className: "bg-red-50 text-red-500 border-red-200" },
  CANCELLED: { label: "Cancelled", icon: Ban, className: "bg-gray-100 text-gray-500 border-gray-200" },
  REOPENED: { label: "Reopened", icon: RotateCcw, className: "bg-blue-50 text-blue-600 border-blue-200" },
};

const SessionsAdminPage = () => {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [agencies, setAgencies] = useState<KernelAgencyResponse[]>([]);
  const [sellers, setSellers] = useState<SellerListItemResponse[]>([]);
  const [salesPoints, setSalesPoints] = useState<SalesPointResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
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
      const [sessionsRes, agenciesRes, sellersRes, salesPointsRes] = await Promise.all([
        SessionsService.getAll(undefined, undefined, seller.organizationId),
        AgenciesService.getAll3(seller.organizationId),
        SellerAdminService.getAll1(seller.organizationId),
        SalesPointsService.getAll2(seller.organizationId),
      ]);
      setSessions(sessionsRes);
      setAgencies(agenciesRes);
      setSellers(sellersRes);
      setSalesPoints(salesPointsRes);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions. Please try again.");
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

  const sellerById = useMemo(() => {
    const map = new Map<string, SellerListItemResponse>();
    sellers.forEach((s) => { if (s.id) map.set(s.id, s); });
    return map;
  }, [sellers]);

  const salesPointById = useMemo(() => {
    const map = new Map<string, SalesPointResponse>();
    salesPoints.forEach((sp) => { if (sp.id) map.set(sp.id, sp); });
    return map;
  }, [salesPoints]);

  const filteredSessions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sessions;
    return sessions.filter((s) => {
      const sellerName = s.sellerId ? sellerById.get(s.sellerId)?.username : undefined;
      const agencyName = s.agencyId ? agencyById.get(s.agencyId)?.name : undefined;
      const salesPointName = s.salesPointId ? salesPointById.get(s.salesPointId)?.salesPointName : undefined;
      return [sellerName, agencyName, salesPointName].some((v) => v?.toLowerCase().includes(term));
    });
  }, [sessions, search, sellerById, agencyById, salesPointById]);

  const openCount = useMemo(() => sessions.filter((s) => s.status === SessionResponse.status.OPEN).length, [sessions]);
  const closedCount = useMemo(() => sessions.filter((s) => s.status === SessionResponse.status.CLOSED).length, [sessions]);

  const runAction = async (session: SessionResponse, action: () => Promise<unknown>, successMessage: string) => {
    if (!session.id) return;
    setActingId(session.id);
    setActiveMenuId(null);
    try {
      await action();
      toast.success(successMessage);
      fetchData();
    } catch (error) {
      const message = error instanceof ApiError ? (error.body?.message ?? error.message) : "Action failed. Please try again.";
      toast.error(message);
    } finally {
      setActingId(null);
    }
  };

  const handleSuspendSession = (session: SessionResponse) =>
    runAction(session, () => SessionsService.suspend(session.id!), "Session suspended successfully.");

  const handleResumeSession = (session: SessionResponse) =>
    runAction(session, () => SessionsService.resume(session.id!), "Session resumed successfully.");

  const handleCancelSession = (session: SessionResponse) =>
    runAction(session, () => SessionsService.cancel(session.id!), "Session cancelled successfully.");

  const handleReopenSession = (session: SessionResponse) =>
    runAction(session, () => SessionsService.reopen(session.id!), "Session reopened successfully.");

  return (
    <div className="p-8 bg-secondary-background min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-secondary-gray mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest">Organization</span>
            <ChevronRight size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-mid">Sessions</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Sessions</h1>
          <p className="text-secondary-gray text-sm font-medium">
            Seller sessions across sale points for {organizationName || "your organization"}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <PlayCircle size={16} className="text-secondary-mid" />
            <span className="text-xs font-black text-primary">{sessions.length}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Sessions</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs font-black text-primary">{openCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Open</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <XCircle size={16} className="text-secondary-gray" />
            <span className="text-xs font-black text-primary">{closedCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Closed</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-secondary-light mb-6 flex items-center justify-between gap-4">
        <div className="relative group max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray group-focus-within:text-secondary-mid transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by seller, agency or sale point..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-white border-2 border-secondary-mid text-secondary-mid px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-mid hover:text-white transition-all duration-300 shadow-sm shrink-0"
        >
          <AddIcon sx={{ fontSize: 18 }} /> Open Session
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
              ) : filteredSessions.length === 0 ? (
                <EmptyState title="No sessions found" message="Try adjusting your search, or open a new session." />
              ) : (
                filteredSessions.map((session) => {
                  const seller = session.sellerId ? sellerById.get(session.sellerId) : undefined;
                  const agency = session.agencyId ? agencyById.get(session.agencyId) : undefined;
                  const salesPoint = session.salesPointId ? salesPointById.get(session.salesPointId) : undefined;
                  return (
                    <tr key={session.id} className="hover:bg-secondary-super-light/40 transition-all group border-l-4 border-l-transparent hover:border-l-secondary-mid">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-sm text-primary font-black">
                          <User size={14} className="text-secondary-mid shrink-0" />
                          <span>{seller?.username || "-"}</span>
                        </div>
                        {seller?.role && (
                          <span className={`mt-1 ml-6 inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${ROLE_STYLES[seller.role] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                            {ROLE_LABELS[seller.role] || seller.role}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Building2 size={14} className="text-secondary-mid shrink-0" />
                          <span>{agency?.name || "-"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {(() => {
                          const badge = TYPE_BADGES[session.type ?? ""] ?? TYPE_BADGES.POS;
                          const Icon = badge.icon;
                          return (
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 w-fit border rounded-lg text-[10px] font-black uppercase tracking-widest ${badge.className}`}>
                              <Icon size={11} /> {badge.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Store size={14} className="text-secondary-mid shrink-0" />
                          <span>{salesPoint?.salesPointName || (session.type === SessionResponse.type.SALES ? "N/A" : "-")}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-secondary-gray">
                          <Coins size={11} className="text-secondary-mid" />
                          {session.openingAmount?.toLocaleString() ?? "0"}
                          {session.closingAmount != null && (
                            <> &rarr; {session.closingAmount.toLocaleString()}</>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-secondary-gray">
                          <Clock size={11} className="text-secondary-mid shrink-0" />
                          <span>{formatDateTime(session.startTime) ?? "-"}</span>
                          <span>&rarr;</span>
                          <span>{formatDateTime(session.endTime) ?? "Ongoing"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {(() => {
                          const badge = STATUS_BADGES[session.status ?? ""] ?? STATUS_BADGES.PENDING;
                          const Icon = badge.icon;
                          return (
                            <span className={`flex items-center gap-1.5 px-3 py-1 w-fit border rounded-lg text-[10px] font-black uppercase tracking-widest ${badge.className}`}>
                              <Icon size={11} /> {badge.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        {(session.status === SessionResponse.status.OPEN
                          || session.status === SessionResponse.status.SUSPENDED
                          || session.status === SessionResponse.status.CLOSED) && (
                          <>
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === session.id ? null : (session.id ?? null))}
                              className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {activeMenuId === session.id && (
                              <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                                {session.status === SessionResponse.status.OPEN && (
                                  <>
                                    <ActionButton
                                      label="Suspend"
                                      onClick={() => handleSuspendSession(session)}
                                      disabled={actingId === session.id}
                                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-amber-600 disabled:opacity-50"
                                    >
                                      <PauseCircle size={14} />
                                    </ActionButton>
                                    <ActionButton
                                      label="Cancel"
                                      onClick={() => handleCancelSession(session)}
                                      disabled={actingId === session.id}
                                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-gray-500 disabled:opacity-50"
                                    >
                                      <Ban size={14} />
                                    </ActionButton>
                                  </>
                                )}
                                {session.status === SessionResponse.status.SUSPENDED && (
                                  <>
                                    <ActionButton
                                      label="Resume"
                                      onClick={() => handleResumeSession(session)}
                                      disabled={actingId === session.id}
                                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-emerald-600 disabled:opacity-50"
                                    >
                                      <ResumeIcon size={14} />
                                    </ActionButton>
                                    <ActionButton
                                      label="Cancel"
                                      onClick={() => handleCancelSession(session)}
                                      disabled={actingId === session.id}
                                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-gray-500 disabled:opacity-50"
                                    >
                                      <Ban size={14} />
                                    </ActionButton>
                                  </>
                                )}
                                {session.status === SessionResponse.status.CLOSED && (
                                  <ActionButton
                                    label="Reopen"
                                    onClick={() => handleReopenSession(session)}
                                    disabled={actingId === session.id}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-blue-600 disabled:opacity-50"
                                  >
                                    <RotateCcw size={14} />
                                  </ActionButton>
                                )}
                              </div>
                            )}
                          </>
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

      <CreateSessionModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
};

export default SessionsAdminPage;
