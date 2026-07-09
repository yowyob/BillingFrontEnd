'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import {
  EmailOutlined,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  LoginOutlined
} from "@mui/icons-material";
import { PortalApi } from '@/src/api/portalApi';
import { getPortalSession, setPortalSession } from '@/src/api/portalSession';

const PortalLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (getPortalSession()?.accessToken) {
      router.replace('/portal/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data = await PortalApi.login(formData.email, formData.password);
      setPortalSession(data);
      // Hard navigation — see PortalSidebar's handleLogout for why.
      window.location.href = data.mustChangePassword ? '/portal/change-password' : '/portal/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputWrapper = "flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus-within:border-secondary-mid focus-within:bg-white focus-within:ring-4 focus-within:ring-secondary-mid/5 transition-all duration-200";
  const inputStyle = "bg-transparent border-none outline-none text-gray-700 w-full text-sm placeholder:text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">

        <div className="p-8 pb-4 text-center">
          <div className="w-12 h-12 bg-secondary-mid rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary-mid/20">
            <LoginOutlined className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Partner Portal</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Sign in to view your documents</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
            <div className={inputWrapper}>
              <EmailOutlined className="text-gray-400" fontSize="small" />
              <input
                type="email"
                placeholder="you@example.com"
                className={inputStyle}
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

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

          {error && (
            <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-secondary-mid text-white rounded-2xl font-bold text-sm shadow-lg shadow-secondary-mid/25 hover:bg-secondary-mid/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400 font-medium">
            You were invited to this portal by your business partner.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortalLoginPage;
