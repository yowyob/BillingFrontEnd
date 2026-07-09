"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Image as ImageIcon, Hash, Save, ChevronRight, ChevronDown } from "lucide-react";
import { MediaService, SettingsService, SettingResponse } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";

const MEDIA_FILE_URL = (fileId: string) => `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/media/files/${fileId}`;

type EditableRow = {
  includeOrgCode: boolean;
  orgCode: string;
  includeBranchCode: boolean;
  branchCode: string;
  includeTva: boolean;
  includeDate: boolean;
  randomSeq4: boolean;
};

const toEditable = (s: SettingResponse): EditableRow => ({
  includeOrgCode: s.includeOrgCode ?? false,
  orgCode: s.orgCode ?? "",
  includeBranchCode: s.includeBranchCode ?? false,
  branchCode: s.branchCode ?? "",
  includeTva: s.includeTva ?? false,
  includeDate: s.includeDate ?? true,
  randomSeq4: s.randomSeq4 ?? true,
});

const previewFor = (typeCode: string, row: EditableRow) => {
  const segments: string[] = [];
  if (row.includeOrgCode && row.orgCode) segments.push(row.orgCode.toUpperCase());
  segments.push(typeCode);
  if (row.includeBranchCode && row.branchCode) segments.push(row.branchCode.toUpperCase());
  if (row.includeTva) segments.push("NT");
  if (row.includeDate) segments.push(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
  if (row.randomSeq4) segments.push(String(Math.floor(Math.random() * 10000)).padStart(4, "0"));
  return segments.join("-");
};

// Matches the sidebar's "Sales Management" and "Purchasing & Logistics" document list exactly.
const DOC_TYPE_CODES: Record<string, string> = {
  DEVIS: "QUO",
  PROFORMA: "PRO",
  SALES_ORDER: "SOR",
  FACTURE: "INV",
  BON_LIVRAISON: "DLV",
  AVOIR: "CRN",
  BACK_ORDER: "BKO",
  PURCHASE_ORDER: "PUR",
  GOODS_RECEIPT: "GRN",
  SUPPLIER_INVOICE: "SIN",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  DEVIS: "Quotations",
  PROFORMA: "Proforma Invoice",
  SALES_ORDER: "Sales Orders",
  FACTURE: "Invoices",
  BON_LIVRAISON: "Delivery Note",
  AVOIR: "Credit Notes",
  BACK_ORDER: "Back Orders",
  PURCHASE_ORDER: "Purchase Order",
  GOODS_RECEIPT: "Goods Receipt Note",
  SUPPLIER_INVOICE: "Supplier Invoice",
};

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [logoUploading, setLogoUploading] = useState(false);
  const [sequences, setSequences] = useState<SettingResponse[]>([]);
  const [drafts, setDrafts] = useState<Record<string, EditableRow>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingType, setSavingType] = useState<string | null>(null);
  const organizationId = getStoredSeller()?.organizationId;
  const organizationName = getStoredSeller()?.organizationName;

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [orgSettings, seq] = await Promise.all([
        SettingsService.getOrganizationSettings(organizationId),
        SettingsService.listSequenceSettings(organizationId),
      ]);
      setLogoUrl(orgSettings.uri);
      setSequences(seq);
      const initialDrafts: Record<string, EditableRow> = {};
      seq.forEach((s) => { if (s.typeNumerotation) initialDrafts[s.typeNumerotation] = toEditable(s); });
      setDrafts(initialDrafts);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogoChange = async (file: File | null) => {
    if (!file || !organizationId) return;
    setLogoUploading(true);
    try {
      const stored = await MediaService.uploadFile(undefined, { file });
      if (!stored.id) throw new Error("Upload succeeded but no file id was returned.");
      const url = MEDIA_FILE_URL(stored.id);
      await SettingsService.updateLogo(organizationId, { uri: url });
      setLogoUrl(url);
      toast.success("Company logo updated successfully.");
    } catch (error) {
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setLogoUploading(false);
    }
  };

  const updateDraft = (type: string, patch: Partial<EditableRow>) => {
    setDrafts((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } }));
  };

  const handleSaveSequence = async (type: string) => {
    if (!organizationId) return;
    const draft = drafts[type];
    setSavingType(type);
    try {
      const updated = await SettingsService.updateSequenceSetting(
        organizationId,
        type as SettingResponse.typeNumerotation,
        draft
      );
      setSequences((prev) => prev.map((s) => (s.typeNumerotation === type ? updated : s)));
      toast.success("Numbering configuration saved successfully.");
    } catch (error) {
      toast.error("Failed to save numbering configuration. Please try again.");
    } finally {
      setSavingType(null);
    }
  };

  const checkboxStyle = "w-4 h-4 rounded border-gray-300 text-secondary-mid focus:ring-secondary-mid cursor-pointer";
  const inputStyle = "bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-sm text-gray-700 outline-none focus:border-secondary-mid focus:bg-white transition-all w-28";

  return (
    <div className="p-8 bg-secondary-background min-h-screen font-sans">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-secondary-gray mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
        </div>
        <h1 className="text-3xl font-black text-primary tracking-tight">Settings</h1>
        <p className="text-secondary-gray text-sm font-medium">
          Preferences for {organizationName || "your organization"}.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-secondary-light p-12 text-center text-secondary-gray text-sm font-medium">
          Loading settings…
        </div>
      ) : (
        <div className="space-y-8">
          {/* COMPANY LOGO */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-secondary-light p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
                <ImageIcon size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-primary">Company Logo</h2>
                <p className="text-xs text-secondary-gray font-medium">Shown on quotations, invoices and other documents.</p>
              </div>
            </div>

            <label
              htmlFor="logo-input"
              className="flex items-center gap-6 cursor-pointer w-fit"
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Company logo" className="w-24 h-24 rounded-2xl object-cover border border-secondary-light bg-white" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-secondary-super-light flex items-center justify-center border-2 border-dashed border-secondary-light">
                  <ImageIcon size={28} className="text-secondary-mid" />
                </div>
              )}
              <div className="flex items-center gap-2 bg-white border-2 border-secondary-mid text-secondary-mid px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-mid hover:text-white transition-all duration-300">
                {logoUploading ? "Uploading…" : logoUrl ? "Replace Logo" : "Upload Logo"}
              </div>
              <input
                id="logo-input"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={logoUploading}
                onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* DOCUMENT NUMBERING */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-secondary-light overflow-hidden">
            <div className="flex items-center gap-3 p-8 pb-4">
              <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
                <Hash size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-primary">Document Numbering</h2>
                <p className="text-xs text-secondary-gray font-medium">Choose which segments compose each document type&apos;s number.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {sequences.map((s) => {
                const type = s.typeNumerotation as string;
                const draft = drafts[type] ?? toEditable(s);
                const isOpen = expanded === type;
                const typeCode = DOC_TYPE_CODES[type] ?? "DOC";
                return (
                  <div key={type}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : type)}
                      className="w-full flex items-center justify-between px-8 py-4 hover:bg-secondary-super-light/40 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        {isOpen ? <ChevronDown size={16} className="text-secondary-gray" /> : <ChevronRight size={16} className="text-secondary-gray" />}
                        <span className="font-black text-sm text-primary">{DOC_TYPE_LABELS[type] ?? type.replace(/_/g, " ")}</span>
                        <span className="px-2 py-0.5 bg-secondary-super-light text-secondary-mid rounded text-[10px] font-black uppercase">{typeCode}</span>
                      </div>
                      <span className="text-xs font-bold text-secondary-gray font-mono">{s.preview}</span>
                    </button>

                    {isOpen && (
                      <div className="px-8 pb-6 pt-2 bg-secondary-super-light/20">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <label className="flex items-center gap-2.5">
                            <input type="checkbox" className={checkboxStyle} checked={draft.includeOrgCode} onChange={(e) => updateDraft(type, { includeOrgCode: e.target.checked })} />
                            <span className="text-sm text-gray-600 font-medium">Include org code</span>
                            {draft.includeOrgCode && (
                              <input
                                type="text" maxLength={5} placeholder="EDB" className={inputStyle}
                                value={draft.orgCode} onChange={(e) => updateDraft(type, { orgCode: e.target.value })}
                              />
                            )}
                          </label>

                          <label className="flex items-center gap-2.5">
                            <input type="checkbox" className={checkboxStyle} checked={draft.includeBranchCode} onChange={(e) => updateDraft(type, { includeBranchCode: e.target.checked })} />
                            <span className="text-sm text-gray-600 font-medium">Include branch code</span>
                            {draft.includeBranchCode && (
                              <input
                                type="text" maxLength={5} placeholder="NT" className={inputStyle}
                                value={draft.branchCode} onChange={(e) => updateDraft(type, { branchCode: e.target.value })}
                              />
                            )}
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input type="checkbox" className={checkboxStyle} checked={draft.includeTva} onChange={(e) => updateDraft(type, { includeTva: e.target.checked })} />
                            <span className="text-sm text-gray-600 font-medium">Include TVA status (NT / T)</span>
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input type="checkbox" className={checkboxStyle} checked={draft.includeDate} onChange={(e) => updateDraft(type, { includeDate: e.target.checked })} />
                            <span className="text-sm text-gray-600 font-medium">Include date (YYYYMMDD)</span>
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input type="checkbox" className={checkboxStyle} checked={draft.randomSeq4} onChange={(e) => updateDraft(type, { randomSeq4: e.target.checked })} />
                            <span className="text-sm text-gray-600 font-medium">Include 4-digit sequence</span>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-secondary-gray font-bold">
                            Preview: <span className="font-mono text-primary">{previewFor(typeCode, draft)}</span>
                          </div>
                          <button
                            onClick={() => handleSaveSequence(type)}
                            disabled={savingType === type}
                            className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm disabled:opacity-50 transition-all active:scale-95"
                          >
                            <Save size={13} />
                            {savingType === type ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
