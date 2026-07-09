"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, Filter, FileSpreadsheet, FileText,
  MoreHorizontal, Eye, Building2, User, X, Calendar,
  ChevronRight, ArrowUpDown, Download
} from "lucide-react";
import { BonAchatResponse, BonDAchatService, AgenciesService, SellerAdminService, KernelAgencyResponse, SellerListItemResponse } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';
import { toast } from 'sonner';
import StackableMultiSelect from '@/components/StackableMultiSelect';
import { exportRowsToCsv } from '@/src/api/Utils/exportCsv';

const PurchaseOrderJournalPage = () => {
  const [data, setData] = useState<BonAchatResponse[]>([]);
  const [agencies, setAgencies] = useState<KernelAgencyResponse[]>([]);
  const [sellers, setSellers] = useState<SellerListItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    agencies: [] as string[],
    supplier: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  useEffect(() => {
    const seller = getStoredSeller();
    if (!seller?.organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      BonDAchatService.getByOrganizationId5(seller.organizationId),
      AgenciesService.getAll3(seller.organizationId),
      SellerAdminService.getAll1(seller.organizationId),
    ])
      .then(([res, agenciesRes, sellersRes]) => {
        setData(res);
        setAgencies(agenciesRes);
        setSellers(sellersRes);
      })
      .catch(() => toast.error("Failed to load purchase order journal data."))
      .finally(() => setLoading(false));
  }, []);

  const agencyById = useMemo(() => {
    const map = new Map<string, KernelAgencyResponse>();
    agencies.forEach((a) => { if (a.id) map.set(a.id, a); });
    return map;
  }, [agencies]);

  const sellerById = useMemo(() => {
    const map = new Map<string, SellerListItemResponse>();
    sellers.forEach((s) => { if (s.id) map.set(s.id, s); });
    return map;
  }, [sellers]);

  const agencyOptions = useMemo(
    () => agencies.filter((a) => a.id && a.name).map((a) => ({ id: a.id!, label: a.name! })),
    [agencies]
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = !filters.search || (item.numeroBonAchat ?? '').toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === "ALL" || item.status === filters.status;
      const matchesAgency = filters.agencies.length === 0 || (!!item.agencyId && filters.agencies.includes(item.agencyId));
      const matchesSupplier = !filters.supplier || (item.supplierName ?? '').toLowerCase().includes(filters.supplier.toLowerCase());
      const itemDate = new Date(item.dateBonAchat ?? 0);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);
      const matchesDate = (!start || itemDate >= start) && (!end || itemDate <= end);
      const amount = item.grandTotal ?? 0;
      const min = filters.minAmount ? parseFloat(filters.minAmount) : null;
      const max = filters.maxAmount ? parseFloat(filters.maxAmount) : null;
      const matchesAmount = (min === null || amount >= min) && (max === null || amount <= max);

      return matchesSearch && matchesStatus && matchesAgency && matchesSupplier && matchesDate && matchesAmount;
    });
  }, [filters, data]);

  const totalFilteredAmount = useMemo(
    () => filteredData.reduce((sum, item) => sum + (item.grandTotal ?? 0), 0),
    [filteredData]
  );

  const clearAllFilters = () => setFilters({
    search: "", status: "ALL", agencies: [], supplier: "", startDate: "", endDate: "", minAmount: "", maxAmount: "",
  });

  const handleExportCsv = () => {
    exportRowsToCsv(
      `purchase-order-journal-${new Date().toISOString().slice(0, 10)}`,
      [
        { header: "PO Number", accessor: (r: BonAchatResponse) => r.numeroBonAchat },
        { header: "Supplier", accessor: (r: BonAchatResponse) => r.supplierName },
        { header: "Agency", accessor: (r: BonAchatResponse) => (r.agencyId ? agencyById.get(r.agencyId)?.name : undefined) },
        { header: "Date", accessor: (r: BonAchatResponse) => r.dateBonAchat },
        { header: "Status", accessor: (r: BonAchatResponse) => r.status },
        { header: "Total", accessor: (r: BonAchatResponse) => r.grandTotal },
      ],
      filteredData
    );
  };

  const hasActiveFilters = filters.agencies.length > 0 || filters.search !== "" || filters.supplier !== ""
    || filters.startDate !== "" || filters.endDate !== "" || filters.minAmount !== "" || filters.maxAmount !== "" || filters.status !== "ALL";

  const getStatusColor = (status?: BonAchatResponse.status) => {
    switch (status) {
      case BonAchatResponse.status.RECU: return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case BonAchatResponse.status.BROUILLON: return "bg-secondary-super-light text-secondary-mid border-secondary-light";
      case BonAchatResponse.status.REJETE:
      case BonAchatResponse.status.ANNULE: return "bg-red-50 text-red-600 border-red-200";
      case BonAchatResponse.status.RECU_PARTIEL: return "bg-amber-50 text-amber-600 border-amber-200";
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
          <h1 className="text-3xl font-black text-primary tracking-tight">Purchase Order Journal</h1>
          <p className="text-secondary-gray text-sm font-medium">Monitoring organizational procurement across agencies.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray group-focus-within:text-secondary-mid transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search PO #..."
              className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <StackableMultiSelect
            label="Agency"
            icon={Building2}
            placeholder="All Agencies"
            options={agencyOptions}
            selected={filters.agencies}
            onChange={(agencies) => setFilters({ ...filters, agencies })}
          />

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray" size={16} />
            <input type="text" placeholder="Supplier Name..." className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 outline-none transition-all" value={filters.supplier} onChange={(e) => setFilters({ ...filters, supplier: e.target.value })} />
          </div>

          <div className="relative">
            <select className="w-full px-4 py-2.5 bg-secondary-super-light border border-secondary-light/50 rounded-xl text-sm font-black text-secondary-mid appearance-none text-center cursor-pointer hover:bg-secondary-mid hover:text-white transition-all outline-none" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="ALL">Status: All</option>
              {Object.values(BonAchatResponse.status).map((s) => <option key={s} value={s}>{s}</option>)}
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
              <input type="date" className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 p-2 cursor-pointer" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
              <div className="h-4 w-[1px] bg-secondary-light"></div>
              <input type="date" className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 p-2 cursor-pointer" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
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
                <input type="number" placeholder="0" className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 w-20 outline-none" value={filters.minAmount} onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 bg-secondary-background px-3 py-1.5 rounded-xl border border-secondary-light/30">
                <span className="text-[9px] font-black text-secondary-gray uppercase">Max</span>
                <input type="number" placeholder="&infin;" className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 w-20 outline-none" value={filters.maxAmount} onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTERS (CHIPS) */}
        <div className="flex flex-wrap items-center gap-2 mt-6 min-h-[28px]">
          {filters.agencies.map((id) => (
            <div key={`ag-${id}`} className="flex items-center gap-2 px-3 py-1 bg-white border border-secondary-mid/30 rounded-full text-[10px] font-bold text-secondary-mid shadow-sm">
              <span className="opacity-50 uppercase text-[8px] tracking-widest">Ag</span>
              <span>{agencyById.get(id)?.name || id}</span>
              <button onClick={() => setFilters({ ...filters, agencies: filters.agencies.filter((a) => a !== id) })} className="p-0.5 hover:bg-secondary-super-light rounded-full transition-colors text-red-400 hover:text-red-600"><X size={10} /></button>
            </div>
          ))}
          {(() => {
            const labels: any = { search: "Doc", status: "Stat", supplier: "Sup", startDate: "From", endDate: "To", minAmount: ">", maxAmount: "<" };
            return Object.entries(filters).map(([key, value]) => {
              if (Array.isArray(value) || !value || value === "ALL") return null;
              return (
                <div key={key} className="flex items-center gap-2 px-3 py-1 bg-white border border-secondary-mid/30 rounded-full text-[10px] font-bold text-secondary-mid shadow-sm">
                  <span className="opacity-50 uppercase text-[8px] tracking-widest">{labels[key] || key}</span>
                  <span>{value as string}</span>
                  <button onClick={() => setFilters((prev) => ({ ...prev, [key]: key === "status" ? "ALL" : "" }))} className="p-0.5 hover:bg-secondary-super-light rounded-full transition-colors text-red-400 hover:text-red-600"><X size={10} /></button>
                </div>
              );
            });
          })()}
          {hasActiveFilters && (
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
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gray">Identity &amp; Origin</th>
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
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} className="p-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <FileText size={40} className="text-secondary-mid" />
                    <span className="text-sm font-black text-secondary-gray uppercase tracking-widest">No purchase orders found</span>
                  </div>
                </td></tr>
              ) : filteredData.map((item) => {
                const agency = item.agencyId ? agencyById.get(item.agencyId) : undefined;
                const creator = item.createdBy ? sellerById.get(item.createdBy) : undefined;
                return (
                  <tr key={item.idBonAchat} className="hover:bg-secondary-super-light/40 transition-all group relative border-l-4 border-l-transparent hover:border-l-secondary-mid">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-primary group-hover:text-secondary-mid transition-colors">{item.numeroBonAchat}</span>
                        <span className="text-[11px] font-bold text-secondary-gray flex items-center gap-1 mt-0.5"><Calendar size={10} /> {new Date(item.dateBonAchat ?? 0).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-tight"><User size={14} className="text-secondary-mid" /> {item.supplierName}</div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-secondary-gray bg-slate-100 px-2 py-0.5 rounded-md"><Building2 size={10} /> {agency?.name || "-"}</span>
                          {creator?.username && (
                            <span className="text-[10px] font-bold text-secondary-gray">by {creator.username}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-lg font-black text-primary">
                        {item.grandTotal?.toLocaleString()} <span className="text-xs text-secondary-mid ml-1">XAF</span>
                      </span>
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ANALYTICS FOOTER */}
        {!loading && (
          <div className="bg-secondary-super-light/20 border-t border-secondary-light p-6 px-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xs font-bold text-secondary-gray uppercase tracking-widest">
              Filtered Results: <span className="text-primary font-black">{filteredData.length}</span> / {data.length}
            </div>

            <div className="flex items-center gap-6">
              <div className="h-10 w-[1px] bg-secondary-light hidden md:block"></div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-secondary-gray uppercase tracking-[0.2em] mb-1">Total Journal Value</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-secondary">
                    {totalFilteredAmount.toLocaleString()}
                  </span>
                  <span className="text-sm font-black text-secondary-mid">XAF</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderJournalPage;
