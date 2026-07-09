'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import SearchIcon from "@mui/icons-material/Search"
import DropDown from "@mui/icons-material/ArrowDropDown"
import { Trash2, MoreVertical, CheckCircle2, XCircle, Clock, Wallet } from "lucide-react"
import { ClientStoreCredit } from '@/src/api/models/UpdatedStoreCreditResponse'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import { useLoading } from '@/components/LoadingContext'
import ActionButton from '@/components/ActionButton'

const MOCK_STORE_CREDITS: ClientStoreCredit[] = [
  {
    idStoreCredit: "SC-001",
    storeCreditNumber: "SC/2026/001",
    idCreditNote: "CN-2026-002",
    creditNoteNumber: "AV/2026/002",
    clientId: "c005",
    customerName: "Boulangerie du Centre",
    initialAmount: 29812,
    remainingAmount: 29812,
    status: ClientStoreCredit.status.AVAILABLE,
    createdAt: "2026-01-21T11:30:00Z",
    updatedAt: "2026-01-21T11:30:00Z",
  },
  {
    idStoreCredit: "SC-002",
    storeCreditNumber: "SC/2026/002",
    idCreditNote: "CN-2026-001",
    creditNoteNumber: "AV/2026/001",
    clientId: "c001",
    customerName: "Global Tech Solutions",
    initialAmount: 178875,
    remainingAmount: 0,
    status: ClientStoreCredit.status.EXHAUSTED,
    createdAt: "2026-01-22T09:00:00Z",
    updatedAt: "2026-02-05T14:20:00Z",
  },
  {
    idStoreCredit: "SC-003",
    storeCreditNumber: "SC/2026/003",
    idCreditNote: "CN-2026-003",
    creditNoteNumber: "AV/2026/003",
    clientId: "c012",
    customerName: "Supermarché Marina",
    initialAmount: 12500,
    remainingAmount: 6250,
    status: ClientStoreCredit.status.AVAILABLE,
    expiryDate: "2026-12-31",
    createdAt: "2026-01-25T10:00:00Z",
    updatedAt: "2026-03-10T08:45:00Z",
  },
]

const columns = {
  "Credit #": "storeCreditNumber",
  "Customer": "customerName",
  "Source CN": "creditNoteNumber",
  "Initial Amount": "initialAmount",
  "Remaining": "remainingAmount",
  "Expiry": "expiryDate",
  "Status": "status",
}

const statusConfig = {
  [ClientStoreCredit.status.AVAILABLE]: {
    label: "Available",
    icon: <CheckCircle2 size={12} />,
    className: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  [ClientStoreCredit.status.EXHAUSTED]: {
    label: "Exhausted",
    icon: <XCircle size={12} />,
    className: "bg-gray-50 text-gray-400 border-gray-100",
  },
  [ClientStoreCredit.status.EXPIRED]: {
    label: "Expired",
    icon: <Clock size={12} />,
    className: "bg-red-50 text-red-500 border-red-100",
  },
}

const StoreCredit = () => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ClientStoreCredit.status | null>(null)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [credits, setCredits] = useState<ClientStoreCredit[]>(MOCK_STORE_CREDITS)
  const [isLoading, setIsLoading] = useState(true)
  const { showLoader, hideLoader, showError } = useLoading()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      showLoader('Loading store credits...')
      try {
        await new Promise((r) => setTimeout(r, 600))
        setCredits(MOCK_STORE_CREDITS)
      } finally {
        setIsLoading(false)
        hideLoader()
      }
    }
    load()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    return credits.filter((item) => {
      const matchesSearch =
        item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storeCreditNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.creditNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !selectedStatus || item.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, selectedStatus, credits])

  const totalAvailable = credits
    .filter((c) => c.status === ClientStoreCredit.status.AVAILABLE)
    .reduce((sum, c) => sum + c.remainingAmount, 0)

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 bg-secondary-super-light/20 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-secondary text-4xl font-black tracking-tight">Store Credit</h1>
          <p className="text-gray-500 mt-1 font-medium">Track client credit balances issued from credit notes</p>
        </div>

        <div className="flex items-center bg-white border border-secondary-light/50 px-4 py-2.5 rounded-2xl shadow-sm focus-within:border-secondary-mid transition-all w-full md:w-80">
          <input
            type="text"
            className="border-none outline-none text-gray-700 w-full bg-transparent text-sm font-medium"
            placeholder="Search credit #, customer or CN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="text-secondary-mid" />
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-secondary-light/20 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Wallet size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Total Available</p>
            <p className="text-xl font-black text-gray-800 mt-0.5">{totalAvailable.toLocaleString()} <span className="text-xs text-gray-400 font-bold">XAF</span></p>
          </div>
        </div>
        <div className="bg-white border border-secondary-light/20 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-secondary-super-light rounded-xl flex items-center justify-center">
            <CheckCircle2 size={18} className="text-secondary-mid" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Active Credits</p>
            <p className="text-xl font-black text-gray-800 mt-0.5">{credits.filter(c => c.status === ClientStoreCredit.status.AVAILABLE).length}</p>
          </div>
        </div>
        <div className="bg-white border border-secondary-light/20 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
            <XCircle size={18} className="text-gray-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Exhausted / Expired</p>
            <p className="text-xl font-black text-gray-800 mt-0.5">{credits.filter(c => c.status !== ClientStoreCredit.status.AVAILABLE).length}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-secondary-light/20 flex items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-r pr-4">Status</span>
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
              selectedStatus ? "border-secondary-mid bg-secondary-super-light text-secondary-mid" : "border-gray-100 text-gray-500"
            }`}
          >
            {selectedStatus ?? "All Statuses"}
            <DropDown className={showStatusMenu ? "rotate-180" : ""} />
          </button>

          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 min-w-[200px] overflow-hidden">
              <button
                onClick={() => { setSelectedStatus(null); setShowStatusMenu(false) }}
                className="w-full text-left px-4 py-3 text-[10px] font-bold text-gray-400 border-b hover:bg-gray-50 uppercase tracking-widest"
              >
                Clear Filter
              </button>
              {Object.values(ClientStoreCredit.status).map((s) => (
                <button
                  key={s}
                  onClick={() => { setSelectedStatus(s); setShowStatusMenu(false) }}
                  className="w-full text-left px-4 py-3 text-[11px] font-bold text-gray-600 hover:bg-secondary-super-light hover:text-secondary-mid transition-colors uppercase"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {Object.keys(columns).map((col) => (
                  <th key={col} className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap">{col}</th>
                ))}
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <TableSkeleton cols={Object.keys(columns).length} />
              ) : filtered.length === 0 ? (
                <EmptyState title="No store credits found" message="Store credits are created automatically from credit notes." />
              ) : filtered.map((credit) => {
                const cfg = statusConfig[credit.status]
                const usedPct = credit.initialAmount > 0
                  ? Math.round(((credit.initialAmount - credit.remainingAmount) / credit.initialAmount) * 100)
                  : 0
                return (
                  <tr key={credit.idStoreCredit} className="group hover:bg-secondary-mid/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-700 whitespace-nowrap">{credit.storeCreditNumber}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">{credit.customerName}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap text-xs">{credit.creditNoteNumber}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                      {credit.initialAmount.toLocaleString()} <span className="text-[10px] text-gray-400">XAF</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`font-black ${credit.remainingAmount === 0 ? 'text-gray-400' : 'text-emerald-600'}`}>
                          {credit.remainingAmount.toLocaleString()} <span className="text-[10px] font-bold text-gray-400">XAF</span>
                        </span>
                        <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all"
                            style={{ width: `${100 - usedPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                      {credit.expiryDate
                        ? new Date(credit.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase ${cfg.className}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === credit.idStoreCredit ? null : credit.idStoreCredit)}
                        className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === credit.idStoreCredit && (
                        <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                          <ActionButton
                            label="Delete"
                            onClick={() => {
                              setCredits((prev) => prev.filter((c) => c.idStoreCredit !== credit.idStoreCredit))
                              setActiveMenuId(null)
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-600 transition-all"
                          >
                            <Trash2 size={14} />
                          </ActionButton>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StoreCredit
