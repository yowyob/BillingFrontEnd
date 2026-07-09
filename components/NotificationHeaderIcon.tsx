"use client";

import React from 'react';
import Link from 'next/link';

interface NotificationProps {
  /** The MUI or Lucide icon component to render */
  Icon?: React.ElementType;
  /** Optional count to display in the red badge */
  number?: number;
  /** Optional text content (e.g., initials or a label) */
  body?: string;
  /** Destination path */
  path: string;
  /** Optional additional styling */
  className?: string;
}

const NotificationHeaderIcon = ({
  body,
  Icon,
  number,
  path,
  className = ""
}: NotificationProps) => {
  const showBadge = typeof number === 'number' && number > 0;

  return (
    <div className={`relative group shrink-0 ${className}`}>
      <Link href={path}>
        <div 
          className="min-w-[40px] h-10 px-2 rounded-xl border-2 border-transparent hover:border-[var(--color-secondary-super-light)] hover:bg-[var(--color-secondary-super-light)] transition-all duration-200 flex items-center justify-center gap-2"
          style={{ color: "var(--color-secondary-mid)" }}
        >
          {/* Prioritize Icon, fallback to Body */}
          {Icon ? (
            <Icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
          ) : body ? (
            <span className="text-sm font-bold uppercase tracking-tight group-hover:scale-105 transition-transform duration-200">
              {body}
            </span>
          ) : null}
        </div>
      </Link>

      {/* Notification Badge */}
      {showBadge && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white z-10">
          {number > 99 ? '99+' : number}
        </span>
      )}
    </div>
  );
};

export default NotificationHeaderIcon;