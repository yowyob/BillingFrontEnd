import React from "react";

const PermissionBadge = ({ permission }: { permission?: string }) => (
  <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-tighter uppercase ${
    permission === 'OWNER' ? 'bg-emerald-50 text-emerald-600' :
    permission === 'EDITOR' ? 'bg-blue-50 text-blue-600' :
    permission === 'VIEWER' ? 'bg-gray-100 text-gray-500' :
    'bg-secondary-super-light text-secondary-mid'
  }`}>
    {permission || 'Full Access'}
  </span>
);

export default PermissionBadge;
