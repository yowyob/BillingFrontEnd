import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeroProps {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHero({ icon: Icon, eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#102a45] to-[#0a1829] text-white py-16 sm:py-24">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "24px 24px"
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {Icon && (
          <div className="mx-auto w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-xl shadow-black/10">
            <Icon className="h-7 w-7 text-white" />
          </div>
        )}
        {eyebrow && (
          <span className="text-xs font-black uppercase tracking-widest text-blue-300 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 font-sans text-4xl sm:text-5xl font-black tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-white/70 leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
