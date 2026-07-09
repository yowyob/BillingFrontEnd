"use client";

import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { ShieldCheck, Save } from "lucide-react";
import { ApiError, FournisseurResponse, ThirdPartySaleConfigService } from "@/src/src2/api";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: (updated: boolean) => void;
  fournisseur: FournisseurResponse | null;
}

const SALE_SIZES = ["DETAIL", "DEMIS_GROS", "GROS", "SUPER_GROS"] as const;

const SaleConfigModal = ({ isOpen, onClose, fournisseur }: Props) => {
  const [saleSizes, setSaleSizes] = useState<Set<string>>(new Set());
  const [vatApplicable, setVatApplicable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !fournisseur?.idFournisseur) return;
    document.body.style.overflow = "hidden";

    setIsLoading(true);
    ThirdPartySaleConfigService.get(fournisseur.idFournisseur)
      .then((res) => {
        setSaleSizes(new Set(res.allowedSaleSizes ?? []));
        setVatApplicable(res.vatApplicable ?? false);
      })
      .catch(() => {
        setSaleSizes(new Set(fournisseur.allowedSaleSizes ?? []));
        setVatApplicable(fournisseur.ntva ?? false);
      })
      .finally(() => setIsLoading(false));

    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, fournisseur]);

  const toggleSaleSize = (size: string) => {
    setSaleSizes((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  };

  const handleSave = async () => {
    if (!fournisseur?.idFournisseur) return;
    setIsSaving(true);
    try {
      await ThirdPartySaleConfigService.set(fournisseur.idFournisseur, {
        allowedSaleSizes: Array.from(saleSizes),
        vatApplicable,
      });
      toast.success("Sale configuration updated successfully.");
      onClose(true);
    } catch (error) {
      const message = error instanceof ApiError ? (error.body?.message ?? error.message) : "Failed to update sale configuration. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !fournisseur) return null;

  const checkboxRow = "flex items-center gap-2.5 py-1.5";
  const checkboxStyle = "w-4 h-4 rounded border-gray-300 text-secondary-mid focus:ring-secondary-mid cursor-pointer";
  const sectionTitle = "text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3";

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      {/* Background Overlay */}
      <div className="absolute inset-0" onClick={() => onClose(false)} />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">Sale Configuration</h2>
              <p className="text-xs text-gray-400 font-bold">{fournisseur.raisonSociale || fournisseur.username}</p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50">
          {isLoading ? (
            <p className="text-sm text-gray-400 font-medium">Loading current configuration…</p>
          ) : (
            <>
              {/* Sale Sizes */}
              <div>
                <p className={sectionTitle}>Allowed Sale Sizes</p>
                <div className="grid grid-cols-2 gap-x-4 bg-white p-4 rounded-xl border border-gray-100">
                  {SALE_SIZES.map((size) => (
                    <label key={size} className={`${checkboxRow} cursor-pointer`}>
                      <input
                        type="checkbox"
                        className={checkboxStyle}
                        checked={saleSizes.has(size)}
                        onChange={() => toggleSaleSize(size)}
                      />
                      <span className="text-sm text-gray-600 font-medium">{size.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

            </>
          )}
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
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Save size={18} />
            {isSaving ? "SAVING…" : "SAVE CONFIGURATION"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleConfigModal;
