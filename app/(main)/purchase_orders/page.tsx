'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DropDown from "@mui/icons-material/ArrowDropDown"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import {
  Pencil,
  Trash2,
  MoreVertical,
  Printer,
  ReceiptText,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Globe,
  Eye,
  Share2
} from "lucide-react";

// Updated Imports for Purchase Orders
import { UpdatedClientResponse, clients } from '@/src/api/models/UpdatedClientResponse'
import { PurcaseOrderResponse, PurchaseOrderResponse } from '@/src/api/models/PurchaseOrderLine'
import { MOCK_PURCHASE_ORDERS } from '@/src/api/models/PurchaseOrderLine'

// Components
import CreatePurchaseOrderModal from './CreatePurchaseOrderModal'
import PurchaseOrderPrintPreviewModal from './PurchaseOrderPrintPreviewModal'
import { convertPurchaseOrderToGRN } from '@/src/api/transformation/purchaseOrderTranformation'
import { BonDAchatService } from '@/src/src2/api'
import { getVisibleBonAchats } from '@/src/api/scopedDocs'
import { mapBackendBAArrayToUIArray } from '@/src/Mappers/BonAchatMapper'
import { toast } from 'sonner'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import { useLoading } from '@/components/LoadingContext'
import ActionButton from '@/components/ActionButton'
import PermissionBadge from '@/components/PermissionBadge'
import ShareDocModal from '@/components/ShareDocModal'
import { useCanEditDocuments } from '@/src/hooks/useCanEditDocuments'

const columns = {
  "PO #": "poNumber",
  "Producer/Supplier": "supplierName",
  "PO Date": "poDate",
  "Expected Delivery": "expectedDeliveryDate",
  "Method": "transportMethod",
  "Status": "status",
  "Total Amount": "grandTotal",
  "Permission": "docPermission"
}

const PurchaseOrders = () => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { canEdit } = useCanEditDocuments();

  // State Management
  const [showStatusMenu, setShowStatusMenu] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [showTransformSub, setShowTransformSub] = useState<boolean>(false);
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [clickedOrder, setClickedOrder] = useState<PurchaseOrderResponse | undefined>();
  const [orders, setOrders] = useState<PurchaseOrderResponse[]>(MOCK_PURCHASE_ORDERS); 
  const [producer, setProducer] = useState<UpdatedClientResponse | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { showLoader, hideLoader, showError } = useLoading()

  useEffect(()=>{
    const findFactures = async () => {
      setIsLoading(true)
      showLoader('Loading purchase orders...')
      try {
        const data = await getVisibleBonAchats()
        const transformed = mapBackendBAArrayToUIArray(data);
        setOrders(transformed);
      } catch (error) {
        console.error("Erreur lors du chargement des factures:", error);
        toast.error("Failed to load purchase orders. Please try again.")
        showError('Failed to load purchase orders')
      } finally {
        setIsLoading(false)
        hideLoader()
      }
    };
    findFactures()
  },[isModalOpen])

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const matchesSearch = 
        item.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.poNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, orders]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
        setShowTransformSub(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Transformation Handler
  const handleTransformToGRN = (order: PurchaseOrderResponse) => {

    const grn=convertPurchaseOrderToGRN(order)
    localStorage.setItem("GRN", JSON.stringify(grn));
    localStorage.setItem("modalOpen", "open");
    // Redirect to the Goods Receipt Note page
    router.push('goods_rns'); 
  };

  const handleSendToPortal = async (order: PurchaseOrderResponse) => {
    if (!order.idPO) return;
    setActiveMenuId(null);
    try {
      await BonDAchatService.sendToPortal(order.idPO);
      setOrders(prev => prev.map(o => o.idPO === order.idPO ? { ...o, statut: 'ENVOYE' as any } : o));
      toast.success(`${order.poNumber} sent — supplier can now view it in their portal.`);
    } catch (error: any) {
      toast.error(error?.body?.message || "Failed to send purchase order to the supplier's portal.");
    }
  };

  const statusOptions = Object.values(PurcaseOrderResponse.statut);

  return (
    <div className='max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 bg-secondary-super-light/20 min-h-screen'>

      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-secondary text-4xl font-black tracking-tight'>Purchase Orders</h1>
          <p className='text-gray-500 mt-1 font-medium'>Manage stock procurement and producers</p>
        </div>

        <div className='flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto'>
          <div className='flex items-center bg-white border border-secondary-light/50 px-4 py-2.5 rounded-2xl shadow-sm focus-within:border-secondary-mid transition-all w-full md:w-80'>
            <input 
              type="text" 
              className='border-none outline-none text-gray-700 w-full bg-transparent text-sm font-medium' 
              placeholder='Search PO #, producer name...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className='text-secondary-mid' />
          </div>

         {canEdit && (
           <button
              onClick={() => { setProducer(undefined); setClickedOrder(undefined); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-secondary-mid text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-lg"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Create Purchase Order
            </button>
         )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-secondary-light/20 flex items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-r pr-4">PO Status</span>
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
              selectedStatus ? "border-secondary-mid bg-secondary-super-light text-secondary-mid" : "border-gray-100 text-gray-500"
            }`}
          >
            {selectedStatus || "All Statuses"}
            <DropDown className={showStatusMenu ? 'rotate-180' : ''} />
          </button>

          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 min-w-[200px] overflow-hidden">
              <button onClick={() => {setSelectedStatus(null); setShowStatusMenu(false)}} className="w-full text-left px-4 py-3 text-[10px] font-bold text-gray-400 border-b hover:bg-gray-50 uppercase tracking-widest">Clear Filter</button>
              {statusOptions.map((status) => (
                <button key={status} onClick={() => {setSelectedStatus(status); setShowStatusMenu(false)}} className="w-full text-left px-4 py-3 text-[11px] font-bold text-gray-600 hover:bg-secondary-super-light hover:text-secondary-mid transition-colors uppercase">{status}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {Object.keys(columns).map((col) => (
                  <th key={col} className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap">{col}</th>
                ))}
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <TableSkeleton cols={Object.keys(columns).length} />
              ) : filteredOrders.length === 0 ? (
                <EmptyState />
              ) : filteredOrders.map((order) => (
                <tr key={order.idPO} className="group hover:bg-secondary-mid/[0.01] transition-colors">
                  {Object.values(columns).map((key, index) => (
                    <td key={index} className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                      {key === 'status' ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                          order.status === PurcaseOrderResponse.statut.VALIDE || order.status === PurcaseOrderResponse.statut.LIVRE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          order.status === PurcaseOrderResponse.statut.ANNULE ? 'bg-red-50 text-red-600 border-red-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {order.status}
                        </span>
                      ) : key === 'poDate' || key === 'expectedDeliveryDate' ? (
                        <span className="text-xs font-bold text-gray-500">
                          {order[key as keyof PurchaseOrderResponse] 
                            ? new Date(order[key as keyof PurchaseOrderResponse] as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : "—"}
                        </span>
                      ) : key === 'grandTotal' ? (
                        <span className="font-black text-gray-900">
                          {order.grandTotal?.toLocaleString()} <span className="text-[10px] text-gray-400">XAF</span>
                        </span>
                      ) : key === 'docPermission' ? (
                        <PermissionBadge permission={order.docPermission?.permission} />
                      ) : (order as any)[key] || "—"}
                    </td>
                  ))}
                  
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => {
                        setActiveMenuId(activeMenuId === order.idPO ? null : (order.idPO ?? null));
                        setShowTransformSub(false);
                      }}
                      className="p-2 text-gray-300 hover:text-secondary-mid hover:bg-secondary-super-light rounded-xl transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenuId === order.idPO && (
                      <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                        {(() => {
                          const permission = !canEdit ? 'VIEWER' : order.docPermission?.permission;
                          const viewButton = (
                            <ActionButton
                              key="view"
                              label="View"
                              onClick={() => { setClickedOrder(order); setIsPrintModalOpen(true); setActiveMenuId(null); }}
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-purple-800 transition-all"
                            ><Eye size={14} /></ActionButton>
                          );
                          if (permission === 'VIEWER') return viewButton;
                          const editButton = (
                            <ActionButton
                               key="edit"
                               label="Edit"
                               onClick={() => {
                                 const foundProducer = clients.find(c => c.idClient === order.supplierId);
                                 setProducer(foundProducer);
                                 setClickedOrder(order);
                                 setIsModalOpen(true);
                                 setActiveMenuId(null);
                               }}
                               className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-blue-600 transition-all"
                            ><Pencil size={14} /></ActionButton>
                          );
                          if (permission === 'EDITOR') return <>{editButton}{viewButton}</>;
                          return (
                          <>
                        {editButton}

                        {/* Share */}
                        <ActionButton
                          label="Share"
                          onClick={() => { setClickedOrder(order); setIsShareModalOpen(true); setActiveMenuId(null); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-secondary-mid transition-all"
                        ><Share2 size={14} /></ActionButton>

                        {/* Transform to GRN */}
                        <div className="relative">
                          <ActionButton
                            label="Transform"
                            onClick={() => setShowTransformSub(!showTransformSub)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showTransformSub ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-emerald-600'}`}
                          ><ReceiptText size={14} /></ActionButton>

                          {showTransformSub && (
                            <div className="absolute bottom-full right-0 mb-3 bg-white border border-secondary-light rounded-2xl shadow-2xl p-2 min-w-[220px] animate-in fade-in zoom-in-95 duration-150 z-50">
                               <p className="text-[9px] font-black text-gray-400 uppercase px-3 py-2 border-b border-gray-50 mb-1 tracking-widest text-left">Logistics Actions</p>
                               <button 
                                 onClick={() => handleTransformToGRN(order)}
                                 className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors group"
                               >
                                  <div className="flex items-center gap-2">
                                    <Package size={14} />
                                    <span className="text-[11px] font-bold">Goods Receipt Note</span>
                                  </div>
                                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                               </button>
                            </div>
                          )}
                        </div>

                        {/* Print */}
                        <ActionButton
                          label="Print"
                          onClick={() => { setClickedOrder(order); setIsPrintModalOpen(true); setActiveMenuId(null); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-purple-800 transition-all"
                        ><Printer size={14} /></ActionButton>

                        {/* Send to Portal */}
                        <ActionButton
                          label="Send to Portal"
                          onClick={() => handleSendToPortal(order)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-blue-700 transition-all"
                        ><Globe size={14} /></ActionButton>

                        {/* Delete */}
                        <ActionButton
                          label="Delete"
                          onClick={() => {
                            setOrders(prev => prev.filter(o => o.idPO !== order.idPO));
                            setActiveMenuId(null);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-600 transition-all"
                        ><Trash2 size={14} /></ActionButton>
                          </>
                          );
                        })()}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <CreatePurchaseOrderModal orderData={clickedOrder} producerData={producer} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>} 
      {isPrintModalOpen && clickedOrder && <PurchaseOrderPrintPreviewModal isOpen={isPrintModalOpen} data={clickedOrder} onClose={() => setIsPrintModalOpen(false) } onConfirmPrint={()=>{}}/>}
      <ShareDocModal
        isOpen={isShareModalOpen}
        docId={clickedOrder?.idPO}
        docType="BON_ACHAT"
        docLabel={clickedOrder?.poNumber ? `Purchase Order ${clickedOrder.poNumber}` : undefined}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}

export default PurchaseOrders;