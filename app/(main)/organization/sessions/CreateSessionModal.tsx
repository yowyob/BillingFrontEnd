"use client";

import React, { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { PlayCircle, Save, Clock, Store, Briefcase } from "lucide-react";
import {
  AgenciesService, ApiError, CreateSessionRequest, KernelAgencyResponse,
  SalesPointResponse, SalesPointsService,
  SellerAdminService, SellerListItemResponse,
  SessionsService
} from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { SellerRole } from "@/src/api/models/UpdatedSellerResponse";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: (created: boolean) => void;
}

const emptyForm = {
  type: CreateSessionRequest.type.POS,
  agencyId: "",
  sellerId: "",
  salesPointId: "",
  openingAmount: "",
  startTime: "",
  endTime: "",
};

const CreateSessionModal = ({ isOpen, onClose }: Props) => {
  const [form, setForm] = useState(emptyForm);
  const [agencies, setAgencies] = useState<KernelAgencyResponse[]>([]);
  const [sellers, setSellers] = useState<SellerListItemResponse[]>([]);
  const [salesPoints, setSalesPoints] = useState<SalesPointResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleForLater, setScheduleForLater] = useState(false);

  const currentSeller = getStoredSeller();
  // Owners can open a session for any agency; agency managers are locked to their own.
  const isAgencyLocked = currentSeller?.role === SellerRole.AGENCY_MANAGER;

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "unset";
      return;
    }
    document.body.style.overflow = "hidden";
    setScheduleForLater(false);

    const orgId = getStoredSeller()?.organizationId;
    if (!orgId) return;

    setForm({ ...emptyForm, agencyId: isAgencyLocked ? (currentSeller?.agencyId ?? "") : "" });

    setIsLoading(true);
    Promise.all([
      AgenciesService.getAll3(orgId),
      SellerAdminService.getAll1(orgId),
      SalesPointsService.getAll2(orgId),
    ])
      .then(([agenciesRes, sellersRes, salesPointsRes]) => {
        setAgencies(isAgencyLocked ? agenciesRes.filter((a) => a.id === currentSeller?.agencyId) : agenciesRes);
        setSellers(sellersRes);
        setSalesPoints(salesPointsRes);
      })
      .catch(() => toast.error("Failed to load agencies, sellers or sale points."))
      .finally(() => setIsLoading(false));

    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const sellersInAgency = useMemo(
    () => sellers.filter((s) => s.agencyId === form.agencyId),
    [sellers, form.agencyId]
  );

  const salesPointsInAgency = useMemo(
    () => salesPoints.filter((sp) => sp.agencyId === form.agencyId),
    [salesPoints, form.agencyId]
  );

  const handleAgencyChange = (agencyId: string) => {
    setForm({ ...form, agencyId, sellerId: "", salesPointId: "" });
  };

  const handleTypeChange = (type: CreateSessionRequest.type) => {
    setForm({ ...form, type, salesPointId: "" });
  };

  const isPos = form.type === CreateSessionRequest.type.POS;

  const canSave = !!form.sellerId && !!form.agencyId && !!form.openingAmount && (!isPos || !!form.salesPointId);

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const payload: CreateSessionRequest = {
        type: form.type,
        salesPointId: isPos ? form.salesPointId : undefined,
        organizationId: isPos ? undefined : getStoredSeller()?.organizationId,
        agencyId: isPos ? undefined : form.agencyId,
        sellerId: form.sellerId,
        openingAmount: Number(form.openingAmount),
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
      };
      if (scheduleForLater) {
        await SessionsService.schedule(payload);
        toast.success("Session scheduled. The seller will start it themselves from the POS terminal.");
      } else {
        await SessionsService.open(payload);
        toast.success("Session opened successfully.");
      }
      onClose(true);
    } catch (error) {
      const message = error instanceof ApiError ? (error.body?.message ?? error.message) : "Failed to save session. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputWrapper = "flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus-within:border-secondary-mid focus-within:bg-white focus-within:ring-4 focus-within:ring-secondary-mid/5 transition-all duration-200";
  const inputStyle = "bg-transparent border-none outline-none text-gray-700 w-full text-sm placeholder:text-gray-400 disabled:text-gray-300";
  const label = "text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      {/* Background Overlay */}
      <div className="absolute inset-0" onClick={() => onClose(false)} />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <PlayCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">
                {scheduleForLater ? "Schedule Session" : "Open Session"}
              </h2>
              <p className="text-xs text-gray-400 font-bold">
                {scheduleForLater
                  ? "The seller starts this themselves from the POS terminal"
                  : isPos
                    ? "Start a seller's session on a sale point"
                    : "Start a seller's regular back-office/web sales session"}
              </p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-5 bg-gray-50/50">
          {isLoading ? (
            <p className="text-sm text-gray-400 font-medium">Loading agencies, sellers and sale points…</p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setScheduleForLater(!scheduleForLater)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  scheduleForLater ? "border-secondary-mid bg-secondary-super-light/50" : "border-gray-100 bg-white"
                }`}
              >
                <Clock size={18} className={scheduleForLater ? "text-secondary-mid" : "text-gray-300"} />
                <div className="text-left flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-700">Schedule for later</p>
                  <p className="text-[11px] text-gray-400 font-medium">Seller starts it themselves on the POS terminal, instead of opening it now</p>
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${scheduleForLater ? "bg-secondary-mid justify-end" : "bg-gray-200 justify-start"}`}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </button>

              <div className="space-y-2">
                <label className={label}>Session Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTypeChange(CreateSessionRequest.type.POS)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      isPos ? "border-secondary-mid bg-secondary-super-light/50" : "border-gray-100 bg-white"
                    }`}
                  >
                    <Store size={16} className={isPos ? "text-secondary-mid" : "text-gray-300"} />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-700">POS Session</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange(CreateSessionRequest.type.SALES)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      !isPos ? "border-secondary-mid bg-secondary-super-light/50" : "border-gray-100 bg-white"
                    }`}
                  >
                    <Briefcase size={16} className={!isPos ? "text-secondary-mid" : "text-gray-300"} />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-700">Sales Session</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 font-medium ml-1">
                  {isPos ? "Tied to a physical sale point/register." : "A regular back-office/web sales shift — no sale point needed."}
                </p>
              </div>

              <div className="space-y-2">
                <label className={label}>Agency</label>
                <div className={inputWrapper}>
                  <select
                    className={`${inputStyle} ${isAgencyLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                    value={form.agencyId}
                    disabled={isAgencyLocked}
                    onChange={(e) => handleAgencyChange(e.target.value)}
                  >
                    <option value="">Select an agency</option>
                    {agencies.map((agency) => (
                      <option key={agency.id} value={agency.id}>{agency.name} ({agency.code})</option>
                    ))}
                  </select>
                </div>
                {isAgencyLocked && (
                  <p className="text-[11px] text-gray-400 font-medium ml-1">Locked to your agency.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className={label}>Seller</label>
                <div className={inputWrapper}>
                  <select
                    className={`${inputStyle} cursor-pointer`}
                    value={form.sellerId}
                    disabled={!form.agencyId}
                    onChange={(e) => setForm({ ...form, sellerId: e.target.value })}
                  >
                    <option value="">{form.agencyId ? "Select a seller" : "Select an agency first"}</option>
                    {sellersInAgency.map((seller) => (
                      <option key={seller.id} value={seller.id}>{seller.username}</option>
                    ))}
                  </select>
                </div>
                {form.agencyId && sellersInAgency.length === 0 && (
                  <p className="text-xs text-amber-600 font-medium ml-1">No sellers assigned to this agency yet.</p>
                )}
              </div>

              {isPos && (
                <div className="space-y-2">
                  <label className={label}>Sale Point</label>
                  <div className={inputWrapper}>
                    <select
                      className={`${inputStyle} cursor-pointer`}
                      value={form.salesPointId}
                      disabled={!form.agencyId}
                      onChange={(e) => setForm({ ...form, salesPointId: e.target.value })}
                    >
                      <option value="">{form.agencyId ? "Select a sale point" : "Select an agency first"}</option>
                      {salesPointsInAgency.map((sp) => (
                        <option key={sp.id} value={sp.id}>{sp.salesPointName}</option>
                      ))}
                    </select>
                  </div>
                  {form.agencyId && salesPointsInAgency.length === 0 && (
                    <p className="text-xs text-amber-600 font-medium ml-1">No sale points assigned to this agency yet.</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className={label}>Opening Amount</label>
                <div className={inputWrapper}>
                  <input
                    type="number"
                    placeholder="0"
                    className={inputStyle}
                    required
                    min="0"
                    value={form.openingAmount}
                    onChange={(e) => setForm({ ...form, openingAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={label}>Start Time <span className="text-gray-300 normal-case font-medium">(defaults to now)</span></label>
                  <div className={inputWrapper}>
                    <input
                      type="datetime-local"
                      className={inputStyle}
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={label}>End Time <span className="text-gray-300 normal-case font-medium">(optional)</span></label>
                  <div className={inputWrapper}>
                    <input
                      type="datetime-local"
                      className={inputStyle}
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    />
                  </div>
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
            disabled={isSaving || isLoading || !canSave}
            className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Save size={18} />
            {isSaving ? (scheduleForLater ? "SCHEDULING…" : "OPENING…") : (scheduleForLater ? "SCHEDULE SESSION" : "OPEN SESSION")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionModal;
