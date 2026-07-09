import React from 'react'

const SummaryCard = ({ title, value, icon, variant = "default" }: any) => {
  const styles = {
    default: "bg-white border-gray-100 text-gray-700 shadow-sm",
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-700 shadow-sm",
    dark: "bg-secondary text-white shadow-md border-secondary",
    accent: "bg-amber-50/50 border-amber-100 text-amber-700 shadow-sm"
  };

  const iconStyles = {
    default: "bg-gray-100 text-gray-400",
    emerald: "bg-emerald-100 text-emerald-600",
    dark: "bg-white/10 text-white",
    accent: "bg-amber-100 text-amber-600"
  };

  const currentStyle = styles[variant as keyof typeof styles] || styles.default;
  const currentIconStyle = iconStyles[variant as keyof typeof iconStyles] || iconStyles.default;

  return (
    <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${currentStyle}`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${currentIconStyle}`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${variant === 'dark' ? 'text-white/50' : 'text-gray-400'}`}>
          {title}
        </span>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black leading-none">
          {Math.round(value || 0).toLocaleString()}
        </span>
        <span className={`text-[10px] font-bold ${variant === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
          CFA
        </span>
      </div>
    </div>
  );
};

export default SummaryCard