"use client";

import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Ruler, Save } from "lucide-react";
import { ApiError, ProductResponse, ProductsService, SaleSize } from "@/src/src2/api";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: (updated: boolean, saleSizes?: SaleSize[]) => void;
  product: ProductResponse | null;
}

const SALE_SIZES = [SaleSize.size.DETAIL, SaleSize.size.DEMIS_GROS, SaleSize.size.GROS, SaleSize.size.SUPER_GROS];

type SizeConfig = {
  enabled: boolean;
  unitPrice: string;
  unitPriceWithTax: string;
  minQuantity: string;
  isNegotiable: boolean;
  minNegotiationPercentage: string;
};

const emptyConfig = (): SizeConfig => ({
  enabled: false,
  unitPrice: "",
  unitPriceWithTax: "",
  minQuantity: "1",
  isNegotiable: false,
  minNegotiationPercentage: "0",
});

const SaleSizeConfigModal = ({ isOpen, onClose, product }: Props) => {
  const [config, setConfig] = useState<Record<string, SizeConfig>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !product) return;
    document.body.style.overflow = "hidden";

    const initial: Record<string, SizeConfig> = {};
    SALE_SIZES.forEach((size) => { initial[size] = emptyConfig(); });
    (product.allowedSaleSizes ?? []).forEach((s) => {
      if (!s.size) return;
      initial[s.size] = {
        enabled: s.active ?? true,
        unitPrice: s.unitPrice?.toString() ?? "",
        unitPriceWithTax: s.unitPriceWithTax?.toString() ?? "",
        minQuantity: s.minQuantity?.toString() ?? "1",
        isNegotiable: s.isNegotiable ?? false,
        minNegotiationPercentage: s.minNegotiationPercentage?.toString() ?? "0",
      };
    });
    setConfig(initial);

    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, product]);

  const updateSize = (size: string, patch: Partial<SizeConfig>) => {
    setConfig((prev) => ({ ...prev, [size]: { ...prev[size], ...patch } }));
  };

  const handleSave = async () => {
    if (!product?.idProduit) return;
    const allowedSaleSizes: SaleSize[] = SALE_SIZES
      .filter((size) => config[size]?.enabled && config[size]?.unitPrice)
      .map((size) => ({
        size: size as SaleSize.size,
        unitPrice: Number(config[size].unitPrice),
        unitPriceWithTax: config[size].unitPriceWithTax ? Number(config[size].unitPriceWithTax) : Number(config[size].unitPrice),
        minQuantity: Number(config[size].minQuantity || 1),
        active: true,
        isNegotiable: config[size].isNegotiable,
        minNegotiationPercentage: Number(config[size].minNegotiationPercentage || 0),
      }));

    setIsSaving(true);
    try {
      const result = await ProductsService.updateSaleSizes(product.idProduit, { allowedSaleSizes });
      toast.success("Sale sizes updated successfully.");
      onClose(true, result);
    } catch (error) {
      const message = error instanceof ApiError ? (error.body?.message ?? error.message) : "Failed to update sale sizes. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !product) return null;

  const inputStyle = "bg-transparent border-none outline-none text-gray-700 w-full text-sm placeholder:text-gray-400 disabled:text-gray-300";
  const inputWrapper = "flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg focus-within:border-secondary-mid focus-within:bg-white transition-all duration-200";
  const fieldLabel = "text-[9px] font-black uppercase tracking-widest text-gray-400";

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      {/* Background Overlay */}
      <div className="absolute inset-0" onClick={() => onClose(false)} />

      <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <Ruler size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">Sale Sizes</h2>
              <p className="text-xs text-gray-400 font-bold">{product.nomProduit}</p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50/50">
          {SALE_SIZES.map((size) => {
            const c = config[size] ?? emptyConfig();
            return (
              <div key={size} className={`rounded-2xl border p-4 transition-all ${c.enabled ? "bg-white border-secondary-mid/30 shadow-sm" : "bg-gray-50 border-gray-100"}`}>
                <label className="flex items-center gap-2.5 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-secondary-mid focus:ring-secondary-mid cursor-pointer"
                    checked={c.enabled}
                    onChange={(e) => updateSize(size, { enabled: e.target.checked })}
                  />
                  <span className="text-sm font-black text-primary">{size.replace(/_/g, " ")}</span>
                </label>

                {c.enabled && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <div className="space-y-1">
                      <p className={fieldLabel}>Unit Price</p>
                      <div className={inputWrapper}>
                        <input type="number" min="0" className={inputStyle} placeholder="0" value={c.unitPrice} onChange={(e) => updateSize(size, { unitPrice: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className={fieldLabel}>Unit Price (with tax)</p>
                      <div className={inputWrapper}>
                        <input type="number" min="0" className={inputStyle} placeholder="0" value={c.unitPriceWithTax} onChange={(e) => updateSize(size, { unitPriceWithTax: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className={fieldLabel}>Min Quantity</p>
                      <div className={inputWrapper}>
                        <input type="number" min="1" className={inputStyle} placeholder="1" value={c.minQuantity} onChange={(e) => updateSize(size, { minQuantity: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className={fieldLabel}>Min Negotiation %</p>
                      <div className={inputWrapper}>
                        <input
                          type="number" min="0" max="100"
                          className={inputStyle}
                          placeholder="0"
                          value={c.minNegotiationPercentage}
                          disabled={!c.isNegotiable}
                          onChange={(e) => updateSize(size, { minNegotiationPercentage: e.target.value })}
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer col-span-2 pt-1">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-secondary-mid focus:ring-secondary-mid cursor-pointer"
                        checked={c.isNegotiable}
                        onChange={(e) => updateSize(size, { isNegotiable: e.target.checked })}
                      />
                      <span className="text-xs text-gray-500 font-bold">Negotiable price</span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
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
            disabled={isSaving}
            className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Save size={18} />
            {isSaving ? "SAVING…" : "SAVE SALE SIZES"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleSizeConfigModal;
