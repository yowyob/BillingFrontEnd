"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, GripVertical, X } from "lucide-react";

export interface StackableOption {
  id: string;
  label: string;
}

interface Props {
  label: string;
  icon: React.ElementType;
  placeholder: string;
  options: StackableOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

/**
 * A dropdown of available options you can drag (or click) into a separate
 * "stacked" drop zone, letting you filter by more than one value at once
 * (e.g. several agencies, several sale points) instead of a single select.
 */
const StackableMultiSelect = ({ label, icon: Icon, placeholder, options, selected, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const add = (id: string) => {
    if (!selected.includes(id)) onChange([...selected, id]);
  };
  const remove = (id: string) => onChange(selected.filter((s) => s !== id));

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) add(id);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const available = options.filter((o) => !selected.includes(o.id));
  const selectedOptions = selected
    .map((id) => options.find((o) => o.id === id))
    .filter((o): o is StackableOption => !!o);

  return (
    <div className="relative" ref={ref}>
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray z-10" size={16} />
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 pl-10 pr-3 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm font-bold text-primary hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 transition-all outline-none text-left"
      >
        <span className="truncate">
          {selected.length === 0 ? placeholder : `${selected.length} ${label}${selected.length > 1 ? "s" : ""} Stacked`}
        </span>
        <ChevronDown size={14} className={`shrink-0 text-secondary-gray transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-30 top-full left-0 mt-2 w-96 bg-white border border-secondary-light rounded-2xl shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-secondary-gray mb-2">Available {label}s</p>
            <div className="flex flex-wrap gap-2 min-h-9">
              {available.length === 0 ? (
                <span className="text-[11px] text-secondary-gray italic py-1.5">
                  {options.length === 0 ? `No ${label.toLowerCase()}s found.` : `All ${label.toLowerCase()}s are already stacked.`}
                </span>
              ) : available.map((opt) => (
                <div
                  key={opt.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, opt.id)}
                  onClick={() => add(opt.id)}
                  title="Drag into the box below, or click to add"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-super-light text-secondary-mid rounded-lg text-[11px] font-bold cursor-grab active:cursor-grabbing hover:bg-secondary-mid hover:text-white transition-colors select-none"
                >
                  <GripVertical size={11} className="opacity-50" />
                  {opt.label}
                </div>
              ))}
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-secondary-light rounded-xl p-3 min-h-[72px] bg-secondary-background/60 transition-colors"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-secondary-gray mb-2">Stacked &mdash; Filtering By</p>
            {selectedOptions.length === 0 ? (
              <p className="text-[11px] text-secondary-gray italic">Drag {label.toLowerCase()}s here to filter by more than one at once.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedOptions.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-mid text-white rounded-lg text-[11px] font-bold">
                    {opt.label}
                    <button onClick={() => remove(opt.id)} className="hover:text-red-200 transition-colors"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest"
            >
              Clear Stacked {label}s
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StackableMultiSelect;
