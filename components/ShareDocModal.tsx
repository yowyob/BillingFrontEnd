"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { Share2, CheckCircle2, Send, ChevronDown, UserX, Users } from "lucide-react";
import { DocPermissionsService, SellerAdminService, SellerListItemResponse } from "@/src/src2/api";
import type { DocPermissionResponse } from "@/src/src2/api/models/DocPermissionResponse";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";

export type ShareableDocType =
  | "DEVIS"
  | "FACTURE"
  | "FACTURE_PROFORMA"
  | "BACK_ORDER"
  | "NOTE_CREDIT"
  | "BON_ACHAT"
  | "BON_COMMANDE"
  | "BON_LIVRAISON"
  | "BON_RECEPTION"
  | "FACTURE_FOURNISSEUR";

interface Props {
  isOpen: boolean;
  docId: string | undefined;
  docType: ShareableDocType;
  docLabel: string | undefined;
  onClose: (shared: boolean) => void;
}

const ROLE_LABELS: Record<string, string> = {
  POS_SELLER: "POS Seller",
  SELLER: "Seller",
  AGENCY_MANAGER: "Agency Manager",
  OWNER: "Owner",
};

const PERMISSION_OPTIONS: { value: "OWNER" | "EDITOR" | "VIEWER"; label: string; description: string }[] = [
  { value: "VIEWER", label: "Viewer", description: "Can only view the document" },
  { value: "EDITOR", label: "Editor", description: "Can view and edit the document" },
  { value: "OWNER", label: "Owner", description: "Full control — transfers ownership away from the current owner" },
];

const PERMISSION_RANK: Record<string, number> = { OWNER: 0, EDITOR: 1, VIEWER: 2 };

const ShareDocModal = ({ isOpen, docId, docType, docLabel, onClose }: Props) => {
  const [allSellers, setAllSellers] = useState<SellerListItemResponse[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSellerId, setSelectedSellerId] = useState<string | undefined>(undefined);
  const [permission, setPermission] = useState<"OWNER" | "EDITOR" | "VIEWER">("VIEWER");
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [accessList, setAccessList] = useState<DocPermissionResponse[]>([]);
  const [isLoadingAccess, setIsLoadingAccess] = useState(false);
  const [openMenuForSellerId, setOpenMenuForSellerId] = useState<string | null>(null);
  const [mutatingSellerId, setMutatingSellerId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadAccessList = () => {
    if (!docId) return;
    setIsLoadingAccess(true);
    DocPermissionsService.listByDoc(docId, docType)
      .then((res) => setAccessList(res))
      .catch(() => toast.error("Failed to load who has access."))
      .finally(() => setIsLoadingAccess(false));
  };

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    setSearch("");
    setSelectedSellerId(undefined);
    setPermission("VIEWER");
    setOpenMenuForSellerId(null);

    const org = getStoredSeller();
    if (!org?.organizationId) return;

    setIsLoading(true);
    SellerAdminService.getAll1(org.organizationId)
      .then((res) => setAllSellers(res))
      .catch(() => toast.error("Failed to load sellers."))
      .finally(() => setIsLoading(false));

    loadAccessList();

    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, docId, docType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuForSellerId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const org = getStoredSeller();

  const getSellerInfo = (sellerId?: string) => {
    if (sellerId && org?.Id === sellerId) {
      return { username: org.username, email: undefined, role: org.role };
    }
    return allSellers.find((s) => s.id === sellerId);
  };

  const sortedAccessList = useMemo(() => {
    return [...accessList].sort((a, b) =>
      (PERMISSION_RANK[a.permission ?? "VIEWER"] ?? 3) - (PERMISSION_RANK[b.permission ?? "VIEWER"] ?? 3)
    );
  }, [accessList]);

  const shareCandidates = useMemo(() => {
    return allSellers.filter((s) => s.id !== org?.Id);
  }, [allSellers, org?.Id]);

  const filteredSellers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return shareCandidates;
    return shareCandidates.filter((s) =>
      [s.username, s.role, s.email].some((v) => v?.toLowerCase().includes(term))
    );
  }, [shareCandidates, search]);

  const handleChangePermission = async (sellerId: string, newPermission: "EDITOR" | "VIEWER") => {
    if (!docId) return;
    const seller = getSellerInfo(sellerId);
    setMutatingSellerId(sellerId);
    setOpenMenuForSellerId(null);
    try {
      await DocPermissionsService.grant({
        sellerId,
        docId,
        docType,
        permission: newPermission,
        recipientEmail: seller?.email,
        recipientName: seller?.username,
      });
      toast.success(`Updated ${seller?.username || "seller"} to ${newPermission.toLowerCase()}.`);
      loadAccessList();
    } catch {
      toast.error("Failed to update permission. Please try again.");
    } finally {
      setMutatingSellerId(null);
    }
  };

  const handleRemoveAccess = async (sellerId: string) => {
    if (!docId) return;
    const seller = getSellerInfo(sellerId);
    setMutatingSellerId(sellerId);
    setOpenMenuForSellerId(null);
    try {
      await DocPermissionsService.revoke(sellerId, docId, docType);
      toast.success(`Removed ${seller?.username || "seller"}'s access.`);
      setAccessList((prev) => prev.filter((p) => p.sellerId !== sellerId));
    } catch {
      toast.error("Failed to remove access. Please try again.");
    } finally {
      setMutatingSellerId(null);
    }
  };

  const handleShare = async () => {
    const currentSeller = getStoredSeller();
    if (!docId || !selectedSellerId) return;
    const seller = shareCandidates.find((s) => s.id === selectedSellerId);

    setIsSharing(true);
    try {
      await DocPermissionsService.share({
        sellerId: selectedSellerId,
        docId,
        docType,
        permission,
        recipientEmail: seller?.email,
        recipientName: seller?.username,
        sharedByName: currentSeller?.username,
        docLabel,
      });
      toast.success(`${docLabel || "Document"} shared with ${seller?.username} as ${permission.toLowerCase()}.`);
      setSelectedSellerId(undefined);
      setSearch("");
      loadAccessList();
    } catch (error) {
      toast.error("Failed to share document. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen || !docId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      <div className="absolute inset-0" onClick={() => onClose(false)} />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <Share2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">Share Document</h2>
              <p className="text-xs text-gray-400 font-bold">{docLabel}</p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
          {/* People with access */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 flex items-center gap-1.5">
              <Users size={13} /> People With Access
            </label>
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              {isLoadingAccess ? (
                <p className="text-sm text-gray-400 font-medium p-6 text-center">Loading access list…</p>
              ) : sortedAccessList.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium p-6 text-center">Not shared with anyone yet.</p>
              ) : (
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {sortedAccessList.map((entry) => {
                    const seller = getSellerInfo(entry.sellerId);
                    const isOwner = entry.permission === "OWNER";
                    const isMutating = mutatingSellerId === entry.sellerId;
                    const isMenuOpen = openMenuForSellerId === entry.sellerId;
                    return (
                      <div key={entry.sellerId} className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-secondary-super-light text-secondary-mid flex items-center justify-center text-xs font-black shrink-0">
                            {(seller?.username || seller?.email || "?").charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-gray-700 truncate block">{seller?.username || seller?.email || entry.sellerId}</span>
                            {seller?.username && seller?.email && (
                              <span className="text-[11px] text-gray-400 font-medium truncate block">{seller.email}</span>
                            )}
                          </div>
                        </div>

                        {isOwner ? (
                          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 shrink-0">Owner</span>
                        ) : (
                          <div className="relative shrink-0" ref={isMenuOpen ? menuRef : undefined}>
                            <button
                              disabled={isMutating}
                              onClick={() => setOpenMenuForSellerId(isMenuOpen ? null : entry.sellerId!)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all disabled:opacity-50"
                            >
                              {isMutating ? "…" : entry.permission?.toLowerCase()}
                              <ChevronDown size={14} className={isMenuOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-gray-100 rounded-xl shadow-xl min-w-[160px] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                {(["EDITOR", "VIEWER"] as const)
                                  .filter((p) => p !== entry.permission)
                                  .map((p) => (
                                    <button
                                      key={p}
                                      onClick={() => handleChangePermission(entry.sellerId!, p)}
                                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-secondary-super-light hover:text-secondary-mid transition-colors"
                                    >
                                      Make {p.charAt(0) + p.slice(1).toLowerCase()}
                                    </button>
                                  ))}
                                <button
                                  onClick={() => handleRemoveAccess(entry.sellerId!)}
                                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-50"
                                >
                                  <UserX size={13} /> Remove Access
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Permission level picker */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Permission Level</label>
            <div className="grid grid-cols-3 gap-2">
              {PERMISSION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPermission(opt.value)}
                  title={opt.description}
                  className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all border ${
                    permission === opt.value
                      ? "bg-secondary-mid text-white border-secondary-mid"
                      : "bg-white text-gray-500 border-gray-100 hover:border-secondary-light"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-2 ml-1">
              {PERMISSION_OPTIONS.find((o) => o.value === permission)?.description}
            </p>
          </div>

          {/* Seller search + picker */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Share With</label>
            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" sx={{ fontSize: 18 }} />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none"
                placeholder="Search by name, role or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              {isLoading ? (
                <p className="text-sm text-gray-400 font-medium p-6 text-center">Loading sellers…</p>
              ) : filteredSellers.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium p-6 text-center">No sellers found.</p>
              ) : (
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                  {filteredSellers.map((seller) => {
                    const isSelected = selectedSellerId === seller.id;
                    return (
                      <div
                        key={seller.id}
                        onClick={() => setSelectedSellerId(seller.id)}
                        className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                          isSelected ? "bg-secondary-super-light" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-gray-700 truncate block">{seller.username}</span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {seller.role ? (ROLE_LABELS[seller.role] || seller.role.replace(/_/g, " ")) : ""}
                            {seller.email ? ` · ${seller.email}` : ""}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 size={18} className="text-secondary-mid shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
            onClick={handleShare}
            disabled={isSharing || !selectedSellerId}
            className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Send size={18} />
            {isSharing ? "SHARING…" : "SHARE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDocModal;
