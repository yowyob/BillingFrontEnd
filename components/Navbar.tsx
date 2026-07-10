"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SearchIcon, MenuIcon, SettingsIcon, LogOut, User,
  ShieldCheck, MapPin, Store, Building2, Mail, ChevronDown
} from "lucide-react";
import { UpdatedSellerResponse } from "@/src/api/models/UpdatedSellerResponse";
import { clearSession, getStoredSeller } from "@/src/api/session";
import NotificationHeaderIcon from "./NotificationHeaderIcon";
import OfflineStatusBadge from "./OfflineStatusBadge";

interface Props {
  name: string;
  signedIn: boolean;
}

const Navbar = ({ name, signedIn }: Props) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setSeller(getStoredSeller());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between w-full px-4 py-2 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm sm:px-8">
      {/* Left: Branding & Context */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-100 lg:hidden">
            <MenuIcon size={20} className="text-gray-500" />
          </div>
          <div className="flex flex-col group cursor-default">
            <h1 className="text-lg font-black tracking-tight text-[var(--color-primary)] sm:text-xl">
              {name}
            </h1>
            {signedIn && seller && (
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] transition-colors group-hover:text-[var(--color-secondary)]">
                {seller.organizationName}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Location Pills */}
        {signedIn && seller && (
          <div className="hidden items-center gap-2 lg:flex">
            <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-gray-100/50 border border-gray-200/50 rounded-full shadow-inner transition-all hover:bg-gray-100">
              <MapPin size={12} className="text-[var(--color-secondary)]" />
              <span>{seller.agency}</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-white rounded-full text-gray-400 shadow-sm">
                {seller.agencyCity}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-[var(--color-primary)]/[0.03] border border-[var(--color-primary)]/[0.08] rounded-full transition-all hover:bg-[var(--color-primary)]/[0.06]">
              <Store size={12} className="text-[var(--color-primary)]" />
              <span>{seller.salePoint}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-2 sm:gap-4">
        {!signedIn ? (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-500 transition-colors hover:text-[var(--color-primary)]">
              Login
            </Link>
            <Link href="/register" className="hidden px-5 py-2 text-sm font-bold text-white transition-all rounded-full bg-[var(--color-secondary)] shadow-lg shadow-[var(--color-secondary)]/20 hover:scale-105 hover:shadow-xl active:scale-95 sm:block">
              Get Started
            </Link>
          </div>
        ) : (
          <>
            {/* Search - Collapsible on small screens */}
            <div className="hidden group relative sm:block">
              <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[var(--color-secondary)]" />
              <input 
                type="text" 
                placeholder="Find orders..." 
                className="w-48 py-2 pl-10 pr-4 text-xs font-medium transition-all bg-gray-100 border-transparent rounded-full outline-none focus:w-64 focus:bg-white focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/10" 
              />
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

            <OfflineStatusBadge />

            <NotificationHeaderIcon Icon={SettingsIcon} path="/settings" />
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2.5 p-1 rounded-full transition-all border ${
                  isProfileOpen 
                  ? "bg-white border-[var(--color-secondary)] shadow-lg ring-4 ring-[var(--color-secondary)]/5" 
                  : "bg-transparent border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="relative">
                  <div className="w-8 h-8 overflow-hidden rounded-full ring-2 ring-white shadow-sm bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)]">
                    {seller?.profileImageUrl ? (
                      <img src={seller.profileImageUrl} alt="Profile" className="object-cover w-full h-full" />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-[10px] font-black text-white">
                        {seller?.username?.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full">
                    <span className="absolute inset-0 block w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></span>
                  </span>
                </div>
                <div className="hidden pr-2 text-left md:block">
                  <p className="text-xs font-black tracking-tight text-gray-700">{seller?.username}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{seller?.agency}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 hidden md:block ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Enhanced Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-72 origin-top-right overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200">
                  <div className="relative p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Building2 size={24} className="text-[var(--color-primary)]" />
                      </div>
                      <span className="px-2 py-1 text-[8px] font-black text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 rounded-md uppercase tracking-widest">
                        Partner
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-black text-gray-800 line-clamp-1">{seller?.organizationName}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                        <Mail size={12} />
                        <span className="text-[10px] font-medium truncate">{seller?.organizationEmail}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 transition-all rounded-xl hover:bg-gray-50 hover:text-[var(--color-primary)] active:scale-[0.98]">
                      <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><User size={16} /></div>
                      Account Settings
                    </Link>
                    <div className="flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-600 transition-all rounded-xl cursor-pointer hover:bg-gray-50 active:scale-[0.98]">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600"><ShieldCheck size={16} /></div>
                        Permissions
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-black text-white bg-purple-500 rounded-full shadow-sm">
                        {seller?.Permissions.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 mt-1 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-black text-red-500 transition-all rounded-xl hover:bg-red-50 active:scale-[0.98]">
                      <div className="p-1.5 bg-red-100 rounded-lg"><LogOut size={16} /></div>
                      Logout Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;