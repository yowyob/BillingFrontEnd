"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Filter, FileSpreadsheet, FileText,
  MoreHorizontal, Eye, Building2, User, X, Calendar,
  ChevronRight, ArrowUpDown, Download, ChevronDown, GripVertical
} from "lucide-react";
import { EnrichedDevisResponse } from '@/src/src2/api/models/EnrichedDevisResponse';
import { DevisService } from '@/src/src2/api';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { toast } from 'sonner';
import { exportRowsToCsv } from '@/src/api/Utils/exportCsv';

const SalesJournalPage = () => {
  const [data, setData] = useState<EnrichedDevisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    agencies: [] as string[],
    client: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: ""
  });

  const [isAgencyPickerOpen, setIsAgencyPickerOpen] = useState(false);
  const agencyPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agencyPickerRef.current && !agencyPickerRef.current.contains(event.target as Node)) {
        setIsAgencyPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("seller");
    if (stored) setSeller(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (seller?.organizationId) {
        setLoading(true);
        try {
          const res = await DevisService.getEnrichedDevis(seller.organizationId);
          setData(res);
        } catch (error) {
          console.error("Error fetching journal:", error);
          toast.error("Failed to load journal data. Please try again.")
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [seller]);

  const agencyOptions = useMemo(() => Array.from(new Set(data.map(i => i.agencyName).filter((a): a is string => !!a))).sort(), [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = !filters.search || (item.numeroDevis ?? '').toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === "ALL" || item.statut === filters.status;
      const matchesAgency = filters.agencies.length === 0 || (item.agencyName != null && filters.agencies.includes(item.agencyName));
      const matchesClient = !filters.client || (item.nomClient && item.nomClient.toLowerCase().includes(filters.client.toLowerCase()));
      const itemDate = new Date(item.dateCreation ?? 0);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);
      const matchesDate = (!start || itemDate >= start) && (!end || itemDate <= end);
      const amount = item.montantTTC || 0;
      const min = filters.minAmount ? parseFloat(filters.minAmount) : null;
      const max = filters.maxAmount ? parseFloat(filters.maxAmount) : null;
      const matchesAmount = (min === null || amount >= min) && (max === null || amount <= max);

      return matchesSearch && matchesStatus && matchesAgency && matchesClient && matchesDate && matchesAmount;
    });
  }, [filters, data]);

  const totalFilteredAmount = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.montantTTC || 0), 0);
  }, [filteredData]);

  const removeFilter = (key: keyof typeof filters) => {
    if (key === "agencies") {
      setFilters(prev => ({ ...prev, agencies: [] }));
      return;
    }
    const resetValue = key === "status" ? "ALL" : "";
    setFilters(prev => ({ ...prev, [key]: resetValue }));
  };

  const addAgencyToStack = (agency: string) => {
    setFilters(prev => prev.agencies.includes(agency) ? prev : { ...prev, agencies: [...prev.agencies, agency] });
  };

  const removeAgencyFromStack = (agency: string) => {
    setFilters(prev => ({ ...prev, agencies: prev.agencies.filter(a => a !== agency) }));
  };

  const handleAgencyDragStart = (e: React.DragEvent, agency: string) => {
    e.dataTransfer.setData("text/plain", agency);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleAgencyDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const agency = e.dataTransfer.getData("text/plain");
    if (agency) addAgencyToStack(agency);
  };

  const handleAgencyDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const clearAllFilters = () => setFilters({
    search: "", status: "ALL", agencies: [], client: "",
    startDate: "", endDate: "", minAmount: "", maxAmount: ""
  });

  const handleExportCsv = () => {
    exportRowsToCsv(
      `quotation-journal-${new Date().toISOString().slice(0, 10)}`,
      [
        { header: "Devis Number", accessor: (r: EnrichedDevisResponse) => r.numeroDevis },
        { header: "Client", accessor: (r: EnrichedDevisResponse) => r.nomClient },
        { header: "Agency", accessor: (r: EnrichedDevisResponse) => r.agencyName },
        { header: "Sale Point", accessor: (r: EnrichedDevisResponse) => r.salesPointName },
        { header: "Date", accessor: (r: EnrichedDevisResponse) => r.dateCreation },
        { header: "Status", accessor: (r: EnrichedDevisResponse) => r.statut },
        { header: "Total (TTC)", accessor: (r: EnrichedDevisResponse) => r.montantTTC },
        { header: "Currency", accessor: (r: EnrichedDevisResponse) => r.devise },
      ],
      filteredData
    );
  };

  const getStatusColor = (statut?: EnrichedDevisResponse.statut) => {
    switch (statut) {
      case EnrichedDevisResponse.statut.ACCEPTE: return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case EnrichedDevisResponse.statut.BROUILLON: return "bg-secondary-super-light text-secondary-mid border-secondary-light";
      case EnrichedDevisResponse.statut.REFUSE: return "bg-red-50 text-red-600 border-red-200";
      case EnrichedDevisResponse.statut.EXPIRE: return "bg-amber-50 text-amber-600 border-amber-200";
      default: return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  return (
    <div className="p-8 bg-secondary-background min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-secondary-gray mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest">Finance</span>
            <ChevronRight size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-mid">Journals</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Sales Journal</h1>
          <p className="text-secondary-gray text-sm font-medium">Monitoring organizational revenue stream & quote lifecycle.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={handleExportCsv} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-secondary-light rounded-xl text-sm font-bold text-primary hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                <Download size={18} className="text-secondary-mid" />
                Export CSV
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-secondary/20 transition-all active:scale-95">
                <FileSpreadsheet size={18} />
                Excel Report
            </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-secondary-light mb-6">
        {/* Main Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray group-focus-within:text-secondary-mid transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search Quote #..." 
              className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none" 
              value={filters.search} 
              onChange={(e) => setFilters({...filters, search: e.target.value})} 
            />
          </div>
          
          <div className="relative" ref={agencyPickerRef}>
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray z-10" size={16} />
            <button
              type="button"
              onClick={() => setIsAgencyPickerOpen(!isAgencyPickerOpen)}
              className="w-full flex items-center justify-between gap-2 pl-10 pr-3 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm font-bold text-primary hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 transition-all outline-none text-left"
            >
              <span className="truncate">
                {filters.agencies.length === 0 ? "All Agencies" : `${filters.agencies.length} Agenc${filters.agencies.length > 1 ? "ies" : "y"} Stacked`}
              </span>
              <ChevronDown size={14} className={`shrink-0 text-secondary-gray transition-transform ${isAgencyPickerOpen ? "rotate-180" : ""}`} />
            </button>

            {isAgencyPickerOpen && (
              <div className="absolute z-30 top-full left-0 mt-2 w-96 bg-white border border-secondary-light rounded-2xl shadow-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-secondary-gray mb-2">Available Agencies</p>
                  <div className="flex flex-wrap gap-2 min-h-9">
                    {agencyOptions.filter(a => !filters.agencies.includes(a)).length === 0 ? (
                      <span className="text-[11px] text-secondary-gray italic py-1.5">
                        {agencyOptions.length === 0 ? "No agencies found." : "All agencies are already stacked."}
                      </span>
                    ) : agencyOptions.filter(a => !filters.agencies.includes(a)).map(opt => (
                      <div
                        key={opt}
                        draggable
                        onDragStart={(e) => handleAgencyDragStart(e, opt)}
                        onClick={() => addAgencyToStack(opt)}
                        title="Drag into the box below, or click to add"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-super-light text-secondary-mid rounded-lg text-[11px] font-bold cursor-grab active:cursor-grabbing hover:bg-secondary-mid hover:text-white transition-colors select-none"
                      >
                        <GripVertical size={11} className="opacity-50" />
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  onDragOver={handleAgencyDragOver}
                  onDrop={handleAgencyDrop}
                  className="border-2 border-dashed border-secondary-light rounded-xl p-3 min-h-[72px] bg-secondary-background/60 transition-colors"
                >
                  <p className="text-[9px] font-black uppercase tracking-widest text-secondary-gray mb-2">Stacked &mdash; Filtering By</p>
                  {filters.agencies.length === 0 ? (
                    <p className="text-[11px] text-secondary-gray italic">Drag agencies here to filter by more than one at once.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filters.agencies.map(a => (
                        <div key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-mid text-white rounded-lg text-[11px] font-bold">
                          {a}
                          <button onClick={() => removeAgencyFromStack(a)} className="hover:text-red-200 transition-colors"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {filters.agencies.length > 0 && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, agencies: [] }))}
                    className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest"
                  >
                    Clear Stacked Agencies
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray" size={16} />
            <input type="text" placeholder="Client Name..." className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 outline-none transition-all" value={filters.client} onChange={(e) => setFilters({...filters, client: e.target.value})} />
          </div>

          <div className="relative">
            <select className="w-full px-4 py-2.5 bg-secondary-super-light border border-secondary-light/50 rounded-xl text-sm font-black text-secondary-mid appearance-none text-center cursor-pointer hover:bg-secondary-mid hover:text-white transition-all outline-none" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
              <option value="ALL">Status: All</option>
              {Object.values(EnrichedDevisResponse.statut).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Secondary Filters (Intervals) */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-8 pt-6 border-t border-slate-100 mt-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-secondary-gray text-[10px] font-black uppercase tracking-[0.2em]">
                <Calendar size={14} className="text-secondary-mid" /> Date Range
            </div>
            <div className="flex items-center gap-2 bg-secondary-background p-1 rounded-xl border border-secondary-light/30">
              <input type="date" className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 p-2 cursor-pointer" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
              <div className="h-4 w-[1px] bg-secondary-light"></div>
              <input type="date" className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 p-2 cursor-pointer" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
            </div>
          </div>

          <div className="hidden xl:block h-8 w-[1px] bg-slate-100"></div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-secondary-gray text-[10px] font-black uppercase tracking-[0.2em]">
                <Filter size={14} className="text-secondary-mid" /> Value Range
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-secondary-background px-3 py-1.5 rounded-xl border border-secondary-light/30">
                <span className="text-[9px] font-black text-secondary-gray uppercase">Min</span>
                <input type="number" placeholder="0" className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 w-20 outline-none" value={filters.minAmount} onChange={(e) => setFilters({...filters, minAmount: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 bg-secondary-background px-3 py-1.5 rounded-xl border border-secondary-light/30">
                <span className="text-[9px] font-black text-secondary-gray uppercase">Max</span>
                <input type="number" placeholder="∞" className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 w-20 outline-none" value={filters.maxAmount} onChange={(e) => setFilters({...filters, maxAmount: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTERS (CHIPS) */}
        <div className="flex flex-wrap items-center gap-2 mt-6 min-h-[28px]">
          {filters.agencies.map(agency => (
            <div key={`agency-${agency}`} className="flex items-center gap-2 px-3 py-1 bg-white border border-secondary-mid/30 rounded-full text-[10px] font-bold text-secondary-mid shadow-sm transition-all hover:border-secondary-mid">
              <span className="opacity-50 uppercase text-[8px] tracking-widest">Ag</span>
              <span>{agency}</span>
              <button onClick={() => removeAgencyFromStack(agency)} className="p-0.5 hover:bg-secondary-super-light rounded-full transition-colors text-red-400 hover:text-red-600"><X size={10} /></button>
            </div>
          ))}
          {Object.entries(filters).map(([key, value]) => {
            if (key === "agencies" || !value || value === "ALL") return null;
            const labels: any = { search: "Doc", status: "Stat", client: "Cli", startDate: "From", endDate: "To", minAmount: ">", maxAmount: "<" };
            return (
              <div key={key} className="flex items-center gap-2 px-3 py-1 bg-white border border-secondary-mid/30 rounded-full text-[10px] font-bold text-secondary-mid shadow-sm transition-all hover:border-secondary-mid">
                <span className="opacity-50 uppercase text-[8px] tracking-widest">{labels[key] || key}</span>
                <span>{value as string}</span>
                <button onClick={() => removeFilter(key as any)} className="p-0.5 hover:bg-secondary-super-light rounded-full transition-colors text-red-400 hover:text-red-600"><X size={10} /></button>
              </div>
            );
          })}
          {(filters.agencies.length > 0 || Object.entries(filters).some(([k, v]) => k !== "agencies" && v !== "" && v !== "ALL")) && (
            <button onClick={clearAllFilters} className="text-[10px] font-black text-secondary-gray hover:text-red-500 ml-2 transition-colors flex items-center gap-1 uppercase tracking-tighter">
                <X size={12} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* DATA TABLE CONTAINER */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-secondary-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-super-light/30 border-b border-secondary-light">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gray">
                    <div className="flex items-center gap-2">Reference <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gray">Identity & Origin</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gray text-center">Lifecycle</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gray text-right">Financial Impact</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gray text-center">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr><td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-secondary-super-light border-t-secondary-mid rounded-full animate-spin"></div>
                        <span className="text-sm font-black text-secondary-gray uppercase tracking-widest">Aggregating Data...</span>
                    </div>
                 </td></tr>
              ) : filteredData.map((item) => (
                <tr key={item.idDevis} className="hover:bg-secondary-super-light/40 transition-all group relative border-l-4 border-l-transparent hover:border-l-secondary-mid">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-primary group-hover:text-secondary-mid transition-colors">{item.numeroDevis}</span>
                      <span className="text-[11px] font-bold text-secondary-gray flex items-center gap-1 mt-0.5"><Calendar size={10}/> {new Date(item.dateCreation ?? 0).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-tight"><User size={14} className="text-secondary-mid" /> {item.nomClient}</div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-secondary-gray bg-slate-100 px-2 py-0.5 rounded-md"><Building2 size={10} /> {item.agencyName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getStatusColor(item.statut)}`}>
                      {item.statut}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-primary">
                        {item.montantTTC?.toLocaleString()} <span className="text-xs text-secondary-mid ml-1">{item.devise}</span>
                      </span>
                      {item.applyVat && <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md mt-1 italic">Vat Included</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <button title="View Details" className="p-2.5 hover:bg-white hover:text-secondary-mid hover:shadow-sm rounded-xl transition-all text-secondary-gray">
                        <Eye size={20} />
                      </button>
                      <button title="More Options" className="p-2.5 hover:bg-white hover:text-primary hover:shadow-sm rounded-xl transition-all text-secondary-gray">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ANALYTICS FOOTER */}
        {!loading && (
          <div className="bg-secondary-super-light/20 border-t border-secondary-light p-6 px-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-secondary-light flex items-center justify-center text-[10px] font-bold text-white">SP</div>)}
                </div>
                <div className="text-xs font-bold text-secondary-gray uppercase tracking-widest">
                  Filtered Results: <span className="text-primary font-black">{filteredData.length}</span> / {data.length}
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="h-10 w-[1px] bg-secondary-light hidden md:block"></div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-secondary-gray uppercase tracking-[0.2em] mb-1">Total Journal Value</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-secondary">
                            {totalFilteredAmount.toLocaleString()}
                        </span>
                        <span className="text-sm font-black text-secondary-mid">{data[0]?.devise || 'XAF'}</span>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredData.length === 0 && (
          <div className="p-32 text-center bg-white flex flex-col items-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-secondary-super-light rounded-full scale-150 animate-pulse"></div>
                <div className="relative p-6 rounded-full bg-white border-2 border-secondary-light shadow-sm">
                    <FileText size={48} className="text-secondary-mid" />
                </div>
            </div>
            <h3 className="text-primary text-xl font-black uppercase tracking-tight">No Journals Found</h3>
            <p className="text-secondary-gray text-sm max-w-xs mx-auto mt-2">We couldn't find any records matching your current filter criteria. Try adjusting the dates or status.</p>
            <button
                onClick={clearAllFilters}
                className="mt-6 px-6 py-2 bg-primary text-white text-xs font-black rounded-xl hover:bg-secondary transition-all uppercase tracking-widest"
            >
                Reset Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesJournalPage;