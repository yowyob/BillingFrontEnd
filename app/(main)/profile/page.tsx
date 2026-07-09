"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  MapPin,
  ShieldCheck,
  Package,
  LogOut,
  BadgeCheck,
  Building2,
  ChevronRight,
  Lock,
  Globe,
  Camera
} from "lucide-react";
import { UpdatedSellerResponse, Permission, SaleSize } from "@/src/api/models/UpdatedSellerResponse";
import { updateStoredSellerProfileImage } from "@/src/api/session";
import SellerAvatar from "@/components/SellerAvatar";
import UploadSellerAvatarModal from "@/components/UploadSellerAvatarModal";

const ProfilePage = () => {
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Ensuring code runs only on client
    const stored = localStorage.getItem("seller");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSeller(parsed);
      setProfileImageUrl(parsed.profileImageUrl);
    }
  }, []);

  if (!seller) return (
    <div className="flex h-screen items-center justify-center bg-[var(--color-secondary-background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--color-secondary-mid)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--color-primary)] font-black uppercase tracking-widest text-xs">Authenticating Identity...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-secondary-background)] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-[var(--color-secondary-light)] overflow-hidden shadow-sm">
          <div className="h-40 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] relative">
            <div className="absolute -bottom-14 left-10 p-1.5 bg-white rounded-3xl shadow-xl">
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative group/avatar w-28 h-28 rounded-2xl overflow-hidden border border-[var(--color-secondary-light)] block"
                title="Change profile photo"
              >
                <SellerAvatar name={seller.username} imageUrl={profileImageUrl} size={112} className="!rounded-2xl w-full h-full" />
                <span className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera size={28} className="text-white" />
                </span>
              </button>
            </div>
          </div>
          
          <div className="pt-20 pb-10 px-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-[var(--color-primary)] tracking-tighter uppercase italic">
                  {seller.username}
                </h1>
                <div className="bg-[var(--color-secondary-super-light)] p-1 rounded-full border border-[var(--color-secondary-mid)]/20">
                  <BadgeCheck className="text-[var(--color-secondary-mid)]" size={24} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <span className="flex items-center gap-1.5 text-[var(--color-secondary-gray)] font-bold uppercase text-[10px] tracking-widest">
                  <Building2 size={14} className="text-[var(--color-secondary-mid)]" /> {seller.agency}
                </span>
                <div className="w-1 h-1 bg-[var(--color-secondary-light)] rounded-full hidden md:block" />
                <span className="flex items-center gap-1.5 text-[var(--color-secondary-gray)] font-bold uppercase text-[10px] tracking-widest">
                  <Globe size={14} className="text-[var(--color-secondary-mid)]" /> Official Seller ID: {seller.username.substring(0,3).toUpperCase()}-2026
                </span>
              </div>
            </div>
            
            <button className="group flex items-center gap-2 px-8 py-3 bg-white border-2 border-rose-100 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Metadata & Context */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-[var(--color-secondary-light)] shadow-sm space-y-8">
              <div>
                <h3 className="text-[var(--color-secondary-gray)] text-[9px] font-black uppercase tracking-[0.25em] mb-4">Current Deployment</h3>
                <div className="space-y-6">
                  <div className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary-super-light)] flex items-center justify-center text-[var(--color-secondary-mid)] shrink-0 group-hover:bg-[var(--color-secondary-mid)] group-hover:text-white transition-colors">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[var(--color-secondary-gray)] uppercase tracking-tighter">Agency Base</p>
                      <p className="text-md font-black text-[var(--color-primary)]">{seller.agency}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary-super-light)] flex items-center justify-center text-[var(--color-secondary-mid)] shrink-0 group-hover:bg-[var(--color-secondary-mid)] group-hover:text-white transition-colors">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[var(--color-secondary-gray)] uppercase tracking-tighter">Sale Terminal</p>
                      <p className="text-md font-black text-[var(--color-primary)]">{seller.salePoint}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-primary)] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em] mb-4">Compliance Status</h3>
                <p className="text-sm font-medium leading-relaxed mb-6 italic opacity-90">Account active under corporate protocols for 2026. All transactions are logged per sale point.</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)] animate-pulse shadow-[0_0_8px_var(--color-secondary)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-secondary-super-light)]">Real-time Sync Active</span>
                </div>
              </div>
              <ShieldCheck className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
          </div>

          {/* Right: Authorizations */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Permissions Grid */}
            <div className="bg-white p-8 rounded-3xl border border-[var(--color-secondary-light)] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--color-secondary-super-light)] rounded-lg text-[var(--color-secondary-mid)]">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)]">System Clearances</h3>
                </div>
                <span className="text-[10px] font-black text-[var(--color-secondary-gray)] bg-[var(--color-secondary-background)] px-3 py-1 rounded-full border border-[var(--color-secondary-light)]">
                  {seller.Permissions.length} Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(Permission).map((perm) => {
                  const isActive = seller.Permissions.includes(perm);
                  return (
                    <div key={perm} 
                      className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                        isActive 
                        ? 'border-[var(--color-secondary-mid)]/20 bg-[var(--color-secondary-super-light)] shadow-sm' 
                        : 'border-[var(--color-secondary-light)] bg-[var(--color-secondary-background)] opacity-40'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-white' : 'bg-gray-200'}`}>
                           {isActive ? <BadgeCheck size={16} className="text-[var(--color-secondary-mid)]" /> : <Lock size={14} className="text-gray-400" />}
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-tight ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-secondary-gray)]'}`}>
                          {perm.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scale/Size Access */}
            <div className="bg-white p-8 rounded-3xl border border-[var(--color-secondary-light)] shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-[var(--color-secondary-super-light)] rounded-lg text-[var(--color-secondary-mid)]">
                  <Package size={20} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)]">Authorized Sales Volume</h3>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {Object.values(SaleSize).map((size) => {
                  const isPermitted = seller.permittedSaleSizes.includes(size);
                  return (
                    <div key={size} 
                      className={`relative overflow-hidden px-6 py-4 rounded-2xl border-2 transition-all duration-500 flex items-center gap-4 ${
                        isPermitted 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg' 
                        : 'border-[var(--color-secondary-light)] bg-white text-[var(--color-secondary-gray)]'
                      }`}>
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">{size.replace(/_/g, " ")}</span>
                      {isPermitted ? (
                        <div className="bg-[var(--color-secondary-mid)] p-1 rounded-lg">
                          <ChevronRight size={14} className="text-white" />
                        </div>
                      ) : (
                        <Lock size={14} className="opacity-30" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      <UploadSellerAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        sellerId={seller.Id}
        username={seller.username}
        profileImageUrl={profileImageUrl}
        onUploaded={(photoUrl) => {
          setProfileImageUrl(photoUrl);
          updateStoredSellerProfileImage(photoUrl);
        }}
      />
    </div>
  );
};

export default ProfilePage;