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
  ClipboardCheck,
  Clock,
  XCircle,
  CheckCircle2,
  ReceiptText,
  ChevronRight,
  Eye,
  Share2
} from "lucide-react";

// API & Models
import { GoodReceiptResponse, GoodsReceiptNoteResponse } from '@/src/api/models/GoodsReceiptNote'
import { MOCK_GOODS_RN } from '@/src/api/models/GoodsReceiptNote'
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse'
import { MOCK_PURCHASE_ORDERS, PurchaseOrderResponse } from '@/src/api/models/PurchaseOrderLine'

// Logic Components
import CreateGRNModal from './CreateGRNModal'
import GRNPrintPreviewModal from './GRNPrintPreviewModal'
import { generateFactureFromPOandGRN } from '@/src/api/transformation/supplierInvoice'
import { BonDAchatService, BondeReceptionControllerService, FournisseursService } from '@/src/src2/api'
import { getVisibleBonReceptions } from '@/src/api/scopedDocs'
import { mapGRNArrayToInternalArray } from '@/src/Mappers/GRNMapper'
import { mapBackendBAArrayToUIArray } from '@/src/Mappers/BonAchatMapper'
import { toast } from 'sonner'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import { useLoading } from '@/components/LoadingContext'
import ActionButton from '@/components/ActionButton'
import PermissionBadge from '@/components/PermissionBadge'
import ShareDocModal from '@/components/ShareDocModal'
import { useCanEditDocuments } from '@/src/hooks/useCanEditDocuments'

// Mapping Table Columns for GRN
const columns = {
  "GRN #": "grnNumber",
  "Supplier": "supplierName",
  "PO Reference": "purchaseOrderNumber",
  "Receipt Date": "receiptDate",
  "Status": "status",
  "Permission": "docPermission",
}

const GoodsReceiptNotes = () => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { canEdit } = useCanEditDocuments();

  // 1. State Management
  const [showStatusMenu, setShowStatusMenu] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [showTransformSub, setShowTransformSub] = useState<boolean>(false);
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [clickedGRN, setClickedGRN] = useState<GoodsReceiptNoteResponse | undefined>();
  const [grnList, setGrnList] = useState<GoodsReceiptNoteResponse[]>(MOCK_GOODS_RN);
  const [client, setClient] = useState<UpdatedClientResponse | undefined>()
  const [clients, setClients] = useState<UpdatedClientResponse[]>([]);
  const [purchaseOrders,setPurchaseOrders]=useState<PurchaseOrderResponse[]>(MOCK_PURCHASE_ORDERS)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { showLoader, hideLoader, showError } = useLoading()

  useEffect(() => {
    FournisseursService.getAllFournisseurs()
      .then((data) => setClients(data.map((f) => ({
        ...f,
        idClient: f.idFournisseur,
        typeClient: f.typeFournisseur as unknown as UpdatedClientResponse["typeClient"],
        codeClient: f.codeFournisseur,
      })) as unknown as UpdatedClientResponse[]))
      .catch(() => toast.error("Failed to load suppliers."));
  }, []);

  // Load Data from API
   useEffect(() => {
     const findFactures = async () => {
       setIsLoading(true)
       showLoader('Loading goods receipt notes...')
       try {
         const data = await getVisibleBonReceptions()
         const transformed = mapGRNArrayToInternalArray(data)
         const purchase_order=await BonDAchatService.getAllBonsAchat()
         const trans=mapBackendBAArrayToUIArray(purchase_order)
         setPurchaseOrders(trans)
         setGrnList(transformed)
       } catch (error) {
         console.error("Erreur lors du chargement des factures:", error);
         toast.error("Failed to load goods receipt notes. Please try again.")
         showError('Failed to load goods receipt notes')
       } finally {
         setIsLoading(false)
         hideLoader()
       }
     };
     findFactures()
   }, [isModalOpen])

  // 2. Transformation Logic (Listen for incoming transformed data)
  useEffect(() => {
    const modalOpen = localStorage.getItem("modalOpen")
    if (modalOpen === "open") {
      const grnString = localStorage.getItem("GRN")
      
      if (grnString) {
        setIsModalOpen(true)
        localStorage.setItem("modalOpen", "close")

        const grnData: GoodsReceiptNoteResponse = JSON.parse(grnString)
        setClickedGRN(grnData)

        // Cleanup the actual data key
        localStorage.removeItem("GRN")
      }
    }
  }, []);

  // Resolve the supplier once both the reopened GRN and the live supplier list are available.
  useEffect(() => {
    if (!clickedGRN || !clients.length) return;
    const supplierInfo = clients.find(c => c.idClient === clickedGRN.supplierId);
    if (supplierInfo) setClient(supplierInfo);
  }, [clients, clickedGRN]);

  // 3. Filter Logic
  const filteredGRNs = useMemo(() => {
    return grnList.filter((item) => {
      const matchesSearch = 
        item.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.purchaseOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, grnList]);

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

  // Transform handler (To Invoice)
  const handleTransformToInvoice = (grn: GoodsReceiptNoteResponse) => {
      //first find the associated purchase order
      const pO=purchaseOrders.find(po=>po.poNumber===grn.purchaseOrderNumber)
      if(pO){

        //transform to supplier invoice
        const invoice=generateFactureFromPOandGRN(pO,grn);

        localStorage.setItem("supplier_invoice", JSON.stringify(invoice));
    localStorage.setItem("modalOpen", "open");
    router.push('/supplier_invoice'); // Adjust route as needed
      }
   
  };

  return (
    <div className='max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 bg-secondary-super-light/20 min-h-screen'>

      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-secondary text-4xl font-black tracking-tight'>Goods Receipt Notes</h1>
          <p className='text-gray-500 mt-1 font-medium'>Manage incoming inventory and supplier intake</p>
        </div>

        <div className='flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto'>
          <div className='flex items-center bg-white border border-secondary-light/50 px-4 py-2.5 rounded-2xl shadow-sm focus-within:border-secondary-mid transition-all w-full md:w-80'>
            <input 
              type="text" 
              className='border-none outline-none text-gray-700 w-full bg-transparent text-sm font-medium' 
              placeholder='Search Supplier, GRN # or PO Ref...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className='text-secondary-mid' />
          </div>

          {canEdit && (
            <button
              onClick={() => { setClient(undefined); setClickedGRN(undefined); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-secondary-mid text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:shadow-lg transition-all"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Create Goods Receipt
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-secondary-light/20 flex items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-r pr-4">Status Filters</span>
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
              selectedStatus ? "border-secondary-mid bg-secondary-super-light text-secondary-mid" : "border-gray-100 text-gray-500"
            }`}
          >
            {selectedStatus || "Filter by Status"}
            <DropDown className={showStatusMenu ? 'rotate-180' : ''} />
          </button>

          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-30 min-w-[200px] overflow-hidden">
              <button onClick={() => {setSelectedStatus(null); setShowStatusMenu(false)}} className="w-full text-left px-4 py-3 text-[10px] font-black text-gray-400 border-b hover:bg-gray-50 uppercase tracking-widest">Show All</button>
              {Object.values(GoodReceiptResponse.statut).map((status) => (
                <button 
                  key={status} 
                  onClick={() => {setSelectedStatus(status); setShowStatusMenu(false)}} 
                  className="w-full text-left px-4 py-3 text-[11px] font-bold text-gray-600 hover:bg-secondary-super-light hover:text-secondary-mid transition-colors uppercase"
                >
                  {status}
                </button>
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
              ) : filteredGRNs.length === 0 ? (
                <EmptyState />
              ) : filteredGRNs.map((grn) => (
                <tr key={grn.idGRN} className="group hover:bg-secondary-mid/[0.01] transition-colors">
                  {Object.values(columns).map((value, index) => (
                    <td key={index} className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                      {value === 'status' ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black tracking-tighter uppercase ${
                        grn.status === GoodReceiptResponse.statut.RECEIVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        grn.status === GoodReceiptResponse.statut.PARTIALLY_RECEIVED ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        grn.status === GoodReceiptResponse.statut.REJECTED || grn.status === GoodReceiptResponse.statut.ANNULE ? 'bg-red-50 text-red-600 border-red-100' : 
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {/* Icon Logic */}
                        {grn.status === GoodReceiptResponse.statut.RECEIVED ? (
                          <CheckCircle2 size={12}/>
                        ) : grn.status === GoodReceiptResponse.statut.PARTIALLY_RECEIVED ? (
                          <Clock size={12}/> 
                        ) : (grn.status === GoodReceiptResponse.statut.REJECTED || grn.status === GoodReceiptResponse.statut.ANNULE) ? (
                          <XCircle size={12}/>
                        ) : (
                          <Pencil size={12}/> /* For DRAFT / Brouillon */
                        )}

                        {grn.status}
</div>
                      ) : value === 'receiptDate' ? (
                        <span className="text-xs font-bold text-gray-500">
                           {grn.receiptDate ? new Date(grn.receiptDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                        </span>
                      ) : value === 'docPermission' ? (
                        <PermissionBadge permission={grn.docPermission?.permission} />
                      ) : (grn as any)[value] || "—"}
                    </td>
                  ))}
                  
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => {
                        setActiveMenuId(activeMenuId === grn.idGRN ? null : (grn.idGRN ?? null));
                        setShowTransformSub(false);
                      }}
                      className="p-2 text-gray-300 hover:text-secondary-mid hover:bg-secondary-super-light rounded-xl transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenuId === grn.idGRN && (
                      <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                        {(() => {
                          const permission = !canEdit ? 'VIEWER' : grn.docPermission?.permission;
                          const viewButton = (
                            <ActionButton
                              key="view"
                              label="View"
                              onClick={() => { setClickedGRN(grn); setIsPrintModalOpen(true); setActiveMenuId(null); }}
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-purple-800 transition-all"
                            ><Eye size={14} /></ActionButton>
                          );
                          if (permission === 'VIEWER') return viewButton;
                          const editButton = (
                            <ActionButton
                               key="edit"
                               label="Edit"
                               onClick={() => {
                                 const foundClient = clients.find(c => c.idClient === grn.supplierId);
                                 setClient(foundClient);
                                 setClickedGRN(grn);
                                 setIsModalOpen(true);
                                 setActiveMenuId(null);
                               }}
                               className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-blue-600"
                            ><Pencil size={14} /></ActionButton>
                          );
                          if (permission === 'EDITOR') return <>{editButton}{viewButton}</>;
                          return (
                          <>
                        {editButton}

                        {/* Share */}
                        <ActionButton
                          label="Share"
                          onClick={() => { setClickedGRN(grn); setIsShareModalOpen(true); setActiveMenuId(null); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-secondary-mid transition-all"
                        ><Share2 size={14} /></ActionButton>

                        {/* Transform */}
                        <div className="relative">
                          <ActionButton
                            label="Transform"
                            onClick={() => setShowTransformSub(!showTransformSub)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showTransformSub ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-emerald-600'}`}
                          ><ReceiptText size={14} /></ActionButton>

                          {showTransformSub && (
                            <div className="absolute bottom-full right-0 mb-3 bg-white border border-secondary-light rounded-2xl shadow-2xl p-2 min-w-[220px] animate-in fade-in zoom-in-95 duration-150 z-50">
                               <p className="text-[9px] font-black text-gray-400 uppercase px-3 py-2 border-b border-gray-50 mb-1 tracking-widest text-left">Generate Document</p>
                               <button 
                                 onClick={() => handleTransformToInvoice(grn)}
                                 className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors group"
                               >
                                  <div className="flex items-center gap-2">
                                    <ReceiptText size={14} />
                                    <span className="text-[11px] font-bold">Supplier Invoice</span>
                                  </div>
                                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                               </button>
                            </div>
                          )}
                        </div>

                        {/* Print */}
                        <ActionButton
                          label="Print"
                          onClick={() => { setClickedGRN(grn); setIsPrintModalOpen(true); setActiveMenuId(null); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-purple-800 transition-all"
                        ><Printer size={14} /></ActionButton>

                        {/* Delete */}
                        <ActionButton
                          label="Delete"
                          onClick={() => {
                            setGrnList(prev => prev.filter(g => g.idGRN !== grn.idGRN));
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

      {/* Modals */}
      {isModalOpen && <CreateGRNModal grnData={clickedGRN} clientData={client} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      {isPrintModalOpen && clickedGRN && <GRNPrintPreviewModal isOpen={isPrintModalOpen} data={clickedGRN} onClose={() => setIsPrintModalOpen(false)} onConfirmPrint={()=>{}} />}
      <ShareDocModal
        isOpen={isShareModalOpen}
        docId={clickedGRN?.idGRN}
        docType="BON_RECEPTION"
        docLabel={clickedGRN?.grnNumber ? `Goods Receipt Note ${clickedGRN.grnNumber}` : undefined}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}

export default GoodsReceiptNotes;