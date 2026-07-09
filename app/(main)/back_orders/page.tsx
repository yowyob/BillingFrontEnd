'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DropDown from "@mui/icons-material/ArrowDropDown"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import { Pencil, RefreshCw, XCircle, MoreVertical, Eye, Share2 } from "lucide-react"

import { UpdatedBackOrderResponse, BackOrderStatus, MOCK_BACK_ORDERS } from '@/src/api/models/UpdatedBackOrderResponse'
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse'
import CreateBackOrderModal from './CreateBackOrderModal'
import BackOrderPrintPreviewModal from './BackOrderPrintPreviewModal'
import ShareDocModal from '@/components/ShareDocModal'
import { useCanEditDocuments } from '@/src/hooks/useCanEditDocuments'
import { BackOrderService } from '@/src/src2/api/services/BackOrderService'
import { mapBackOrderArrayToUI } from '@/src/Mappers/BackOrderMapper'
import { getVisibleClients } from '@/src/api/scopedTiers'
import { getVisibleBackOrders } from '@/src/api/scopedDocs'
import { mapBackOrderToDeliveryNote } from '@/src/api/transformation/backOrderTransformation'
import { toast } from 'sonner'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import { useLoading } from '@/components/LoadingContext'
import ActionButton from '@/components/ActionButton'
import PermissionBadge from '@/components/PermissionBadge'

const columns = {
  "BO Reference": "numeroBackOrder",
  "Delivery Order": "numeroBonLivraison",
  "Client": "nomClient",
  "Status": "statut",
  "Lines": "lignes",
  "Created At": "createdAt",
  "Permission": "docPermission",
}

const statusColors: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-50 text-amber-600',
  PARTIELLEMENT_LIVRE: 'bg-blue-50 text-blue-600',
  LIVRE: 'bg-emerald-50 text-emerald-600',
  ANNULE: 'bg-red-50 text-red-600',
}

const BackOrdersPage = () => {
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const { canEdit } = useCanEditDocuments();

  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null)
  const [clickedOrder, setClickedOrder] = useState<UpdatedBackOrderResponse | undefined>()
  const [backOrders, setBackOrders] = useState<UpdatedBackOrderResponse[]>(MOCK_BACK_ORDERS)
  const [clients, setClients] = useState<UpdatedClientResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showLoader, hideLoader, showError } = useLoading()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      showLoader('Loading back orders...')
      try {
        const data = await getVisibleBackOrders()
        const transformed = mapBackOrderArrayToUI(data)
        setBackOrders(transformed)
      } catch {
        toast.error("Failed to load back orders. Please try again.")
        showError('Failed to load back orders')
      } finally {
        setIsLoading(false)
        hideLoader()
      }
    }
    fetchData()
  }, [isModalOpen])

  useEffect(() => {
    getVisibleClients()
      .then((data) => setClients(data as unknown as UpdatedClientResponse[]))
      .catch(() => toast.error("Failed to load clients."))
  }, [])

  const filteredOrders = useMemo(() => {
    return backOrders.filter(item => {
      const matchesSearch =
        item.nomClient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numeroBackOrder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numeroBonLivraison?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !selectedStatus || item.statut === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, selectedStatus, backOrders])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // The click that opens the menu also reaches this document listener (its
      // bubble arrives here after React's own handler already ran), so ignore
      // clicks on the trigger button itself — only a genuine outside click should close it.
      if (target?.closest('[data-kebab-trigger]')) return
      if (menuRef.current && !menuRef.current.contains(target)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const actionOptions = [
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      action: (o: UpdatedBackOrderResponse) => {
        setClickedOrder(o)
        setIsModalOpen(true)
      },
      color: "text-blue-600"
    },
    {
      label: "Share",
      icon: <Share2 size={14} />,
      action: (o: UpdatedBackOrderResponse) => {
        setClickedOrder(o)
        setIsShareModalOpen(true)
      },
      color: "text-secondary-mid"
    },
    {
      label: "Transform",
      icon: <RefreshCw size={14} />,
      action: (o: UpdatedBackOrderResponse) => {
        const deliveryNote = mapBackOrderToDeliveryNote(o)
        localStorage.setItem("deliveryNote", JSON.stringify(deliveryNote))
        localStorage.setItem("modalOpen", "open")
        router.push('/delivery_notes')
      },
      color: "text-emerald-600"
    },
    {
      label: "Cancel",
      icon: <XCircle size={14} />,
      action: async (o: UpdatedBackOrderResponse) => {
        if (!confirm("Are you sure you want to cancel this back order?")) return
        try {
          if (o.id) await BackOrderService.updateStatut(o.id, 'ANNULE')
          setBackOrders(prev => prev.map(b => b.id === o.id ? { ...b, statut: BackOrderStatus.statut.ANNULE } : b))
          toast.success("Back order cancelled.")
        } catch {
          toast.error("Failed to cancel back order.")
        }
      },
      color: "text-red-500"
    },
  ]

  const viewOnlyOption = {
    label: "View",
    icon: <Eye size={14} />,
    action: (o: UpdatedBackOrderResponse) => {
      setClickedOrder(o)
      setIsPrintModalOpen(true)
    },
    color: "text-purple-800"
  }

  const renderCell = (key: string, order: UpdatedBackOrderResponse) => {
    if (key === 'statut') {
      return (
        <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-tighter uppercase ${statusColors[order.statut || ''] || 'bg-gray-50 text-gray-500'}`}>
          {order.statut?.replace(/_/g, ' ') || '—'}
        </span>
      )
    }
    if (key === 'lignes') {
      return <span className="font-bold text-secondary">{order.lignes?.length ?? 0} item(s)</span>
    }
    if (key === 'createdAt') {
      return order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : '—'
    }
    if (key === 'numeroBackOrder') {
      return order.numeroBackOrder || order.id || '—'
    }
    if (key === 'numeroBonLivraison') {
      return order.numeroBonLivraison || order.idBonLivraison || '—'
    }
    if (key === 'docPermission') {
      return <PermissionBadge permission={order.docPermission?.permission} />
    }
    return (order as any)[key] || "—"
  }

  return (
    <div className='max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 bg-secondary-super-light/20 min-h-screen'>

      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-secondary text-4xl font-black tracking-tight'>Back Orders</h1>
          <p className='text-gray-500 mt-1 font-medium'>Track missing and partially delivered client items</p>
        </div>

        <div className='flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto'>
          <div className='flex items-center bg-white border border-secondary-light/50 px-4 py-2.5 rounded-2xl shadow-sm focus-within:border-secondary-mid transition-all w-full md:w-80'>
            <input
              type="text"
              className='border-none outline-none text-gray-700 w-full bg-transparent text-sm font-medium'
              placeholder='Search BO #, DN # or client...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className='text-secondary-mid' />
          </div>

          {canEdit && (
            <button
              onClick={() => { setClickedOrder(undefined); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-white border-2 border-secondary-mid text-secondary-mid px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-mid hover:text-white transition-all duration-300 shadow-sm"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Create Back Order
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-secondary-light/20 flex items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-r pr-4">Filters</span>
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
              selectedStatus ? "border-secondary-mid bg-secondary-super-light text-secondary-mid" : "border-gray-100 text-gray-500"
            }`}
          >
            {selectedStatus?.replace(/_/g, ' ') || "All Statuses"}
            <DropDown className={showStatusMenu ? 'rotate-180' : ''} />
          </button>

          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 min-w-[220px] overflow-hidden">
              <button onClick={() => { setSelectedStatus(null); setShowStatusMenu(false); }} className="w-full text-left px-4 py-2 text-[10px] font-bold text-gray-400 border-b hover:bg-gray-50">CLEAR FILTER</button>
              {Object.values(BackOrderStatus.statut).map(status => (
                <button key={status} onClick={() => { setSelectedStatus(status); setShowStatusMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-600 hover:bg-secondary-super-light hover:text-secondary-mid transition-colors">
                  {status.replace(/_/g, ' ')}
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
                {Object.keys(columns).map(col => (
                  <th key={col} className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap">{col}</th>
                ))}
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <TableSkeleton cols={Object.keys(columns).length} />
              ) : filteredOrders.length === 0 ? (
                <EmptyState />
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="group hover:bg-secondary-super-light/20 transition-colors">
                  {Object.values(columns).map((key, i) => (
                    <td key={i} className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                      {renderCell(key, order)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <button
                      data-kebab-trigger
                      onClick={(e) => {
                        e.stopPropagation()
                        if (activeMenuId === order.id) {
                          setActiveMenuId(null)
                          setMenuPosition(null)
                        } else {
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
                          setMenuPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
                          setActiveMenuId(order.id ?? null)
                        }
                      }}
                      className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action popup — rendered at root to avoid overflow-hidden clipping */}
      {activeMenuId && menuPosition && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPosition.top, right: menuPosition.right, zIndex: 9999 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {(() => {
            const activeOrder = filteredOrders.find(o => o.id === activeMenuId)
            if (!activeOrder) return null
            const permission = !canEdit ? 'VIEWER' : activeOrder.docPermission?.permission
            const options = permission === 'VIEWER' ? [viewOnlyOption]
              : permission === 'EDITOR' ? [actionOptions[0], viewOnlyOption]
              : actionOptions
            return options.map((opt, i) => (
              <ActionButton
                key={i}
                label={opt.label}
                onClick={(e) => {
                  e.stopPropagation()
                  opt.action(activeOrder)
                  setActiveMenuId(null)
                  setMenuPosition(null)
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all active:scale-90 ${opt.color}`}
              >
                {opt.icon}
              </ActionButton>
            ))
          })()}
        </div>
      )}

      {/* Modals */}
      {isPrintModalOpen && clickedOrder && (
        <BackOrderPrintPreviewModal
          isOpen={isPrintModalOpen}
          data={clickedOrder}
          onClose={() => setIsPrintModalOpen(false)}
          onConfirmPrint={() => {}}
        />
      )}
      <ShareDocModal
        isOpen={isShareModalOpen}
        docId={clickedOrder?.id}
        docType="BACK_ORDER"
        docLabel={clickedOrder?.numeroBackOrder ? `Back Order ${clickedOrder.numeroBackOrder}` : undefined}
        onClose={() => setIsShareModalOpen(false)}
      />
      {isModalOpen && (
        <CreateBackOrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          backOrderData={clickedOrder}
          clients={clients}
        />
      )}

    </div>
  )
}

export default BackOrdersPage
