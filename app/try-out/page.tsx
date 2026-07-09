'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PersonOutline,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  RocketLaunchOutlined,
  ArrowBackOutlined,
  ApartmentOutlined
} from "@mui/icons-material";
import { ApiError, AuthService, KernelOrganizationResponse } from '@/src/src2/api';
import { mapAuthToUpdatedSeller } from '@/src/Mappers/SellerAuthMapper';
import { getStoredSeller } from '@/src/api/session';

const TryOutForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<KernelOrganizationResponse[] | null>(null);
  const [selectingOrgId, setSelectingOrgId] = useState<string | null>(null);
  const router = useRouter()

  useEffect(() => {
    if (getStoredSeller()?.accessToken) {
      router.replace('/dashboard');
    }
  }, [router]);

  const completeLogin = async (organizationId?: string) => {
    const data = await AuthService.tryOut({
      username: formData.username,
      password: formData.password,
      ...(organizationId ? { organizationId } : {}),
    });

    if (data.requiresOrganizationSelection) {
      setOrganizations(data.availableOrganizations ?? []);
      return;
    }

    const sellerData = mapAuthToUpdatedSeller(data);
    localStorage.setItem("seller", JSON.stringify(sellerData));
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await completeLogin();
    } catch (err) {
      const message = err instanceof ApiError ? (err.body?.message ?? err.message) : 'Authentication failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectOrganization = async (org: KernelOrganizationResponse) => {
    if (!org.id) return;
    setError(null);
    setSelectingOrgId(org.id);
    try {
      await completeLogin(org.id);
    } catch (err) {
      const message = err instanceof ApiError ? (err.body?.message ?? err.message) : 'Authentication failed';
      setError(message);
    } finally {
      setSelectingOrgId(null);
    }
  };

  const inputWrapper = "flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus-within:border-secondary-mid focus-within:bg-white focus-within:ring-4 focus-within:ring-secondary-mid/5 transition-all duration-200";
  const inputStyle = "bg-transparent border-none outline-none text-gray-700 w-full text-sm placeholder:text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">

        {/* Branding Header */}
        <div className="p-8 pb-4 text-center">
          <div className="w-12 h-12 bg-secondary-mid rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary-mid/20">
            {organizations ? <ApartmentOutlined className="text-white" /> : <RocketLaunchOutlined className="text-white" />}
          </div>
          {organizations ? (
            <>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Choose an Organization</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">Several spaces are linked to this account. Pick the one to connect to.</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Try Out KSM Billing</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">Sign in with your existing KSM account to jump straight in</p>
            </>
          )}
        </div>

        {organizations ? (
          <div className="p-8 pt-4 space-y-5">
            {error && (
              <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {organizations.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium text-center py-6">No organizations found for this account.</p>
              ) : (
                organizations.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => handleSelectOrganization(org)}
                    disabled={selectingOrgId !== null}
                    className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 hover:bg-secondary-mid/5 border border-gray-100 hover:border-secondary-mid rounded-xl transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="w-9 h-9 rounded-lg bg-secondary-mid/10 text-secondary-mid flex items-center justify-center shrink-0">
                      <ApartmentOutlined fontSize="small" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 flex-1">
                      {org.displayName || org.shortName || org.legalName}
                    </span>
                    {selectingOrgId === org.id && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary-mid">Connecting…</span>
                    )}
                  </button>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => { setOrganizations(null); setError(null); }}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-secondary-mid transition-colors"
            >
              <ArrowBackOutlined style={{ fontSize: 14 }} /> Back
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">

            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
              <div className={inputWrapper}>
                <PersonOutline className="text-gray-400" fontSize="small" />
                <input
                  type="text"
                  placeholder="you@company.com"
                  className={inputStyle}
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
              <div className={inputWrapper}>
                <LockOutlined className="text-gray-400" fontSize="small" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={inputStyle}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-secondary-mid transition-colors"
                >
                  {showPassword ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-secondary-mid text-white rounded-2xl font-bold text-sm shadow-lg shadow-secondary-mid/25 hover:bg-secondary-mid/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Connecting…' : 'Try It Out'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-center">
          <p className="text-sm text-gray-500 font-medium">
            Already have a Billing seller account? <Link href="/login" className="text-secondary-mid font-bold hover:underline">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TryOutForm;
