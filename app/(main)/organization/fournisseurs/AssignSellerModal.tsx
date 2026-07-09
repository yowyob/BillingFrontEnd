"use client";

import React, { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { UserCheck, CheckCircle2, Save } from "lucide-react";
import { FournisseurResponse, ProducerAssignmentsService, SellerAdminService, SellerListItemResponse } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  fournisseur: FournisseurResponse | null;
  onClose: (updated: boolean) => void;
}

const ROLE_LABELS: Record<string, string> = {
  POS_SELLER: "POS Seller",
  SELLER: "Seller",
  AGENCY_MANAGER: "Agency Manager",
  OWNER: "Owner",
};

const AssignSellerModal = ({ isOpen, fournisseur, onClose }: Props) => {
  const [sellers, setSellers] = useState<SellerListItemResponse[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSellerId, setSelectedSellerId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !fournisseur) return;
    document.body.style.overflow = "hidden";
    setSearch("");

    const org = getStoredSeller();
    if (!org?.organizationId || !fournisseur.idFournisseur) return;

    setIsLoading(true);
    Promise.all([
      SellerAdminService.getAll1(org.organizationId),
      ProducerAssignmentsService.getForFournisseur(fournisseur.idFournisseur, org.organizationId).catch(() => null),
    ])
      .then(([sellersRes, currentAssignment]) => {
        setSellers(sellersRes);
        setSelectedSellerId(currentAssignment?.sellerId || undefined);
      })
      .catch(() => toast.error("Failed to load sellers."))
      .finally(() => setIsLoading(false));

    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, fournisseur]);

  const filteredSellers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sellers;
    return sellers.filter((s) =>
      [s.username, s.role].some((v) => v?.toLowerCase().includes(term))
    );
  }, [sellers, search]);

  const handleSave = async () => {
    const org = getStoredSeller();
    if (!org?.organizationId || !fournisseur?.idFournisseur || !selectedSellerId) return;
    const seller = sellers.find((s) => s.id === selectedSellerId);

    setIsSaving(true);
    try {
      await ProducerAssignmentsService.assign({
        fournisseurId: fournisseur.idFournisseur,
        sellerId: selectedSellerId,
        sellerName: seller?.username,
        organizationId: org.organizationId,
      });
      toast.success(`${fournisseur.raisonSociale || fournisseur.username} assigned to ${seller?.username}.`);
      onClose(true);
    } catch (error) {
      toast.error("Failed to assign seller. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !fournisseur) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      {/* Background Overlay */}
      <div className="absolute inset-0" onClick={() => onClose(false)} />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <UserCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">Assign Seller</h2>
              <p className="text-xs text-gray-400 font-bold">{fournisseur.raisonSociale || fournisseur.username}</p>
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
              placeholder="Search by name or role..."
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
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
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
                        {seller.role && (
                          <span className="text-[11px] text-gray-400 font-medium">
                            {ROLE_LABELS[seller.role] || seller.role.replace(/_/g, " ")}
                          </span>
                        )}
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
            disabled={isSaving || !selectedSellerId}
            className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Save size={18} />
            {isSaving ? "ASSIGNING…" : "ASSIGN SELLER"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignSellerModal;
