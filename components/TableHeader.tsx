"use client";

import React from "react";

interface Props {
  columns: string[];
}

const TableHeader = ({ columns }: Props) => {
  return (
    <thead className="bg-[var(--color-secondary-background)] border-b border-[var(--color-secondary-light)] w-full">
      <tr className="flex justify-between">
        {columns.map((col) => (
          <th
            key={col}
            className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-[var(--color-secondary-gray)]"
          >
            <div className="flex items-center gap-1 group cursor-default">
              {col}
              {/* Optional: Add a subtle sort icon that appears on hover */}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-secondary-mid)]">
                ↓
              </span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;