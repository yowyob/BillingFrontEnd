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
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ReceiptText,
  ChevronRight,
  FileText,
  Eye,
  Share2
} from "lucide-react";

// Updated Imports for Sales Orders
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse'
import { UpdatedSalesOrderResponse, SalesOrderResponse } from '@/src/api/models/UpdatedSalesOrder';
import { MOCK_SALES_ORDERS } from '@/src/api/models/UpdatedSalesOrder'
import CreateSalesOrderModal from './CreateSalesOrderModal'
import SalesOrderPrintPreviewModal from './SalesOrderPrintPreviewModal'
import { mapSalesOrderToDeliveryNote, mapSalesOrderToFacture } from '@/src/api/transformation/saleorderTranformation'
import { BonCommandeService, ClientsService } from '@/src/src2/api'
import { getVisibleBonCommandes } from '@/src/api/scopedDocs'
import { mapBonCommandeListToSalesOrderList } from '@/src/Mappers/BonCommandeMapper'
import { toast } from 'sonner'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import { useLoading } from '@/components/LoadingContext'
import ActionButton from '@/components/ActionButton'
import PermissionBadge from '@/components/PermissionBadge'
import ShareDocModal from '@/components/ShareDocModal'
import { useCanEditDocuments } from '@/src/hooks/useCanEditDocuments'
import SyncStatusIndicator from '@/components/SyncStatusIndicator'

const columns = {
  "Order #": "numeroSalesOrder",
  "Client": "nomClient",
  "Recipient": "recipientName",
  "Order Date": "dateCreation",
  "Transport": "transportMethod",
  "Status": "statut",
  "Total (TTC)": "montantTTC",
  "Permission": "docPermission"
}

const SalesOrders = () => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { canEdit } = useCanEditDocuments();

  // 1. State Management
  const [showStatusMenu, setShowStatusMenu] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<SalesOrderResponse.statut | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showTransformSub, setShowTransformSub] = useState<boolean>(false); // Added missing state
  const [clickedOrder, setClickedOrder] = useState<UpdatedSalesOrderResponse | undefined>();
  
  const [orders, setOrders] = useState<UpdatedSalesOrderResponse[]>(MOCK_SALES_ORDERS);
  const [client, setClient] = useState<UpdatedClientResponse | undefined>()
  const [clients, setClients] = useState<UpdatedClientResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { showLoader, hideLoader, showError } = useLoading()

  useEffect(() => {
    ClientsService.getAllClients()
      .then((data) => setClients(data as unknown as UpdatedClientResponse[]))
      .catch(() => toast.error("Failed to load clients."));
  }, []);

   useEffect(() => {
    const findDevis = async () => {
      setIsLoading(true)
      showLoader('Loading sales orders...')
      try {
        const data = await getVisibleBonCommandes()
        const transformed = mapBonCommandeListToSalesOrderList(data)
        setOrders(transformed)
      } catch (error) {
        console.error("Erreur lors du chargement des devis:", error);
        toast.error("Failed to load sales orders. Please try again.")
        showError('Failed to load sales orders')
      } finally {
        setIsLoading(false)
        hideLoader()
      }
    };

    findDevis();
  }, [isModalOpen]);

  // 2. Transformation Handlers
  const handleTransformToInvoice = (order: UpdatedSalesOrderResponse) => {
    const invoice=mapSalesOrderToFacture(order)
    localStorage.setItem("invoice", JSON.stringify(invoice));
    localStorage.setItem("modalOpen", "open");
    router.push('/invoices'); // Adjust path to your actual invoices route
  };

  const handleTransformToDeliveryNote = (order: UpdatedSalesOrderResponse) => {
      const invoice=mapSalesOrderToDeliveryNote(order)
    localStorage.setItem("deliveryNote", JSON.stringify(invoice));
    localStorage.setItem("modalOpen", "open");
    router.push('/delivery_notes'); // Adjust path to your actual invoices route
  };

  // 3. Logic to load transformed data from localStorage
  useEffect(() => {
    const modalOpen = localStorage.getItem("modalOpen")
    if (modalOpen === "open") {
      setIsModalOpen(true)
      localStorage.setItem("modalOpen", "close")
      
      const orderString = localStorage.getItem("salesOrder")
      localStorage.setItem("salesOrder", "")
      
      if (orderString) {
        const order: UpdatedSalesOrderResponse = JSON.parse(orderString)
        setClickedOrder(order)
      }
    }
  }, [])

  // Resolve the client once both the reopened sales order and the live client list are available.
  useEffect(() => {
    if (!clickedOrder || !clients.length) return;
    const orderClient = clients.find(c => c.idClient === clickedOrder.idClient);
    if (orderClient) setClient(orderClient);
  }, [clients, clickedOrder]);

  // 4. Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const matchesSearch = 
        item.nomClient?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.numeroSalesOrder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || item.statut === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, orders]);

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

  return (
    <div className='max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 bg-secondary-super-light/20 min-h-screen'>

      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-secondary text-4xl font-black tracking-tight'>Sales Orders</h1>
          <p className='text-gray-500 mt-1 font-medium'>Manage shipping and order fulfillment</p>
        </div>

        <div className='flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto'>
          <div className='flex items-center bg-white border border-secondary-light/50 px-4 py-2.5 rounded-2xl shadow-sm focus-within:border-secondary-mid transition-all w-full md:w-80'>
            <input 
              type="text" 
              className='border-none outline-none text-gray-700 w-full bg-transparent text-sm font-medium' 
              placeholder='Search order #, client...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className='text-secondary-mid' />
          </div>

          {canEdit && (
            <button
              onClick={() => { setClient(undefined); setClickedOrder(undefined); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-secondary-mid text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-lg shadow-secondary-mid/20"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Create Sales Order
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-secondary-light/20 flex items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-r pr-4">Order Status</span>
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
              {Object.values(SalesOrderResponse.statut).map((status) => (
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
                <tr key={order.idSalesOrder} className="group hover:bg-secondary-mid/[0.01] transition-colors">
                  {Object.values(columns).map((key, index) => (
                    <td key={index} className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                      {key === 'statut' ? (
                        <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black tracking-tighter uppercase ${
                          order.statut === SalesOrderResponse.statut.LIVRE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          order.statut === SalesOrderResponse.statut.ANNULE ? 'bg-red-50 text-red-600 border-red-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {order.statut === SalesOrderResponse.statut.LIVRE ? <CheckCircle2 size={12}/> : order.statut === SalesOrderResponse.statut.ANNULE ? <XCircle size={12}/> : <Clock size={12}/>}
                          {order.statut}
                        </span>
                        <SyncStatusIndicator entityId={order.idSalesOrder} entityType="bon_commandes" />
                        </div>
                      ) : key === 'dateCreation' ? (
                        <span className="text-xs font-bold text-gray-500">
                          {order.dateCreation 
                            ? new Date(order.dateCreation).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                            : '—'}
                        </span>
                      ) : key === 'docPermission' ? (
                        <PermissionBadge permission={order.docPermission?.permission} />
                      ) : (order as any)[key] || "—"}
                    </td>
                  ))}

                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => {
                        setActiveMenuId(activeMenuId === order.idSalesOrder ? null : (order.idSalesOrder ?? null));
                        setShowTransformSub(false);
                      }}
                      className="p-2 text-gray-300 hover:text-secondary-mid hover:bg-secondary-super-light rounded-xl transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenuId === order.idSalesOrder && (
                      <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                        {(() => {
                          const permission = !canEdit ? 'VIEWER' : order.docPermission?.permission;
                          const viewButton = (
                            <ActionButton
                              key="view"
                              label="View"
                              onClick={() => { setClickedOrder(order); setIsPrintModalOpen(true); setActiveMenuId(null); }}
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-purple-800 transition-all"
                            >
                              <Eye size={14} />
                            </ActionButton>
                          );
                          if (permission === 'VIEWER') return viewButton;
                          const editButton = (
                            <ActionButton
                               key="edit"
                               label="Edit"
                               onClick={() => {
                                 const foundClient = clients.find(c => c.idClient === order.idClient);
                                 setClient(foundClient);
                                 setClickedOrder(order);
                                 setIsModalOpen(true);
                                 setActiveMenuId(null);
                               }}
                               className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-blue-600"
                            >
                              <Pencil size={14} />
                            </ActionButton>
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
                        >
                          <Share2 size={14} />
                        </ActionButton>

                        {/* Transform Sub-menu Logic */}
                        <div className="relative">
                          <ActionButton
                            label="Transform"
                            onClick={() => setShowTransformSub(!showTransformSub)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showTransformSub ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'hover:bg-emerald-50 text-emerald-600'}`}
                          >
                            <ReceiptText size={14} />
                          </ActionButton>

                          {showTransformSub && (
                            <div className="absolute bottom-full right-0 mb-3 bg-white border border-secondary-light rounded-2xl shadow-2xl p-2 min-w-[220px] animate-in fade-in zoom-in-95 duration-150 z-50">
                               <p className="text-[9px] font-black text-gray-400 uppercase px-3 py-2 border-b border-gray-50 mb-1 tracking-widest text-left">Transform to</p>
                               
                               <button 
                                 onClick={() => handleTransformToInvoice(order)}
                                 className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors group"
                               >
                                  <div className="flex items-center gap-2">
                                    <ReceiptText size={14} />
                                    <span className="text-[11px] font-bold">Client Invoice</span>
                                  </div>
                                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                               </button>

                               <button 
                                 onClick={() => handleTransformToDeliveryNote(order)}
                                 className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors group"
                               >
                                  <div className="flex items-center gap-2">
                                    <Truck size={14} />
                                    <span className="text-[11px] font-bold">Delivery Note</span>
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
                        >
                          <Printer size={14} />
                        </ActionButton>

                        {/* Delete */}
                        <ActionButton
                          label="Delete"
                          onClick={() => {
                            setOrders(prev => prev.filter(o => o.idSalesOrder !== order.idSalesOrder));
                            setActiveMenuId(null);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-600 transition-all"
                        >
                          <Trash2 size={14} />
                        </ActionButton>
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

      {isModalOpen && <CreateSalesOrderModal orderData={clickedOrder} clientData={client} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>} 
      {isPrintModalOpen && clickedOrder && <SalesOrderPrintPreviewModal isOpen={isPrintModalOpen} data={clickedOrder} onClose={() => setIsPrintModalOpen(false)} onConfirmPrint={()=>{}}/>}
      <ShareDocModal
        isOpen={isShareModalOpen}
        docId={clickedOrder?.idSalesOrder}
        docType="BON_COMMANDE"
        docLabel={clickedOrder?.numeroSalesOrder ? `Sales Order ${clickedOrder.numeroSalesOrder}` : undefined}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}

export default SalesOrders;