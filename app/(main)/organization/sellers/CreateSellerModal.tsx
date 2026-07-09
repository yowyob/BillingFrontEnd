"use client";

import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { UserPlus, Save } from "lucide-react";
import { SellerAdminService, ApiError } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: (created: boolean) => void;
}

type SalesPersonnelRole = 'POS_SELLER' | 'SELLER' | 'AGENCY_MANAGER' | 'OWNER';

const ROLE_OPTIONS: { value: SalesPersonnelRole; label: string; description: string }[] = [
  { value: "POS_SELLER", label: "POS Seller", description: "Point-of-sale checkout only" },
  { value: "SELLER", label: "Seller", description: "Standard sales personnel" },
  { value: "AGENCY_MANAGER", label: "Agency Manager", description: "Manages an agency's sellers and sessions" },
  { value: "OWNER", label: "Owner", description: "Full organization access" },
];

const emptyForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  role: "SELLER" as SalesPersonnelRole,
};

// Strips accents/punctuation and joins as firstname.lastname, e.g. "Jean" "Dûpont" -> "jean.dupont"
const generateUsername = (firstName: string, lastName: string) => {
  const COMBINING_MARKS = /[̀-ͯ]/g;
  const slugify = (value: string) =>
    value
      .normalize("NFD").replace(COMBINING_MARKS, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  const first = slugify(firstName);
  const last = slugify(lastName);
  if (!first && !last) return "";
  return [first, last].filter(Boolean).join(".");
};

const CreateSellerModal = ({ isOpen, onClose }: Props) => {
  const [form, setForm] = useState(emptyForm);
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setForm(emptyForm);
      setUsernameEdited(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (!usernameEdited) {
        next.username = generateUsername(next.firstName, next.lastName);
      }
      return next;
    });
  };

  const handleSave = async () => {
    const seller = getStoredSeller();
    if (!seller?.organizationId) return;

    setIsSaving(true);
    try {
      const res = await SellerAdminService.create1({
        username: form.username,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        organizationId: seller.organizationId,
        organizationName: seller.organizationName || undefined,
      });
      toast.success(`Sales personnel created. Temporary password: ${res.temporaryPassword} — POS PIN: ${res.pin}`, { duration: 15000 });
      onClose(true);
    } catch (error) {
      const message = error instanceof ApiError ? (error.body?.message ?? error.message) : "Failed to create seller. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputWrapper = "flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus-within:border-secondary-mid focus-within:bg-white focus-within:ring-4 focus-within:ring-secondary-mid/5 transition-all duration-200";
  const inputStyle = "bg-transparent border-none outline-none text-gray-700 w-full text-sm placeholder:text-gray-400";
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
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">New Sales Personnel</h2>
              <p className="text-xs text-gray-400 font-bold">Invite sales personnel to this organization</p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-5 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={label}>First Name</label>
              <div className={inputWrapper}>
                <input
                  type="text"
                  placeholder="John"
                  className={inputStyle}
                  required
                  value={form.firstName}
                  onChange={(e) => handleNameChange("firstName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={label}>Last Name</label>
              <div className={inputWrapper}>
                <input
                  type="text"
                  placeholder="Doe"
                  className={inputStyle}
                  required
                  value={form.lastName}
                  onChange={(e) => handleNameChange("lastName", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={label}>Role</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: option.value })}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    form.role === option.value
                      ? "border-secondary-mid bg-secondary-super-light/50"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <p className="text-sm font-black text-secondary">{option.label}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className={label}>Username <span className="text-gray-300 normal-case font-medium">(auto-generated, editable)</span></label>
            <div className={inputWrapper}>
              <input
                type="text"
                placeholder="johndoe123"
                className={inputStyle}
                required
                value={form.username}
                onChange={(e) => { setUsernameEdited(true); setForm({ ...form, username: e.target.value }); }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={label}>Email</label>
            <div className={inputWrapper}>
              <input
                type="email"
                placeholder="seller@example.com"
                className={inputStyle}
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 font-medium bg-secondary-super-light/50 rounded-xl px-4 py-3">
            A temporary password will be generated and emailed to the seller. They&apos;ll be required to set a new password on first login.
          </p>
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
            disabled={isSaving || !form.username || !form.email || !form.firstName || !form.lastName}
            className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Save size={18} />
            {isSaving ? "INVITING…" : "INVITE SALES PERSONNEL"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSellerModal;
