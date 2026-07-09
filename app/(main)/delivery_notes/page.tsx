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
  PackageCheck,
  Clock,
  XCircle,
  CheckCircle2,
  ReceiptText,
  ChevronRight,
  Eye,
  Share2
} from "lucide-react";

// Updated API Imports for Delivery Notes
import { DeliveryNoteResponse, MOCK_DELIVERY_NOTES } from '@/src/api/models/DeliveryNoteResponse'
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse'

// Logic Components
import CreateDeliveryNoteModal from './CreateDeliveryNoteModal'
import DeliveryNotePrintPreviewModal from './DeliveryNotePrintPreviewModal'
import { BonDeLivraisonService, ClientsService } from '@/src/src2/api'
import { getVisibleBonLivraisons } from '@/src/api/scopedDocs'
import { mapBackendArrayToDeliveryNoteList } from '@/src/Mappers/DeliveryNoteMapper'
import { toast } from 'sonner'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import { useLoading } from '@/components/LoadingContext'
import ActionButton from '@/components/ActionButton'
import PermissionBadge from '@/components/PermissionBadge'
import ShareDocModal from '@/components/ShareDocModal'
import { useCanEditDocuments } from '@/src/hooks/useCanEditDocuments'

const columns = {
  "DN Number": "deliveryNoteNumber",
  "Recipient": "recipientName",
  "City": "recipientCity",
  "Delivery Date": "deliveryDate",
  "Status": "etat",
  "Total Amount": "totalAmount",
  "Ref SO": "SaleOrderNumber",
  "Permission": "docPermission"
}

const DeliveryNotes = () => {
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
  const [clickedNote, setClickedNote] = useState<DeliveryNoteResponse | undefined>();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNoteResponse[]>(MOCK_DELIVERY_NOTES);
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
      showLoader('Loading delivery notes...')
      try {
        const data = await getVisibleBonLivraisons()
        const transformed = mapBackendArrayToDeliveryNoteList(data)
        setDeliveryNotes(transformed);
      } catch (error) {
        console.error("Erreur lors du chargement des devis:", error);
        toast.error("Failed to load delivery notes. Please try again.")
        showError('Failed to load delivery notes')
      } finally {
        setIsLoading(false)
        hideLoader()
      }
    };
  
    findDevis(); 
  }, [isModalOpen]);


  // 2. Transformation / LocalStorage Effect
  useEffect(() => {
    const modalOpen = localStorage.getItem("modalOpen")
    if (modalOpen === "open") {
      const dnString = localStorage.getItem("deliveryNote")
      
      if (dnString) {
        setIsModalOpen(true)
        localStorage.setItem("modalOpen", "close")

        const dnData: DeliveryNoteResponse = JSON.parse(dnString)
        setClickedNote(dnData)

        localStorage.removeItem("deliveryNote")
      }
    }
  }, []);

  // Resolve the client once both the reopened delivery note and the live client list are available.
  useEffect(() => {
    if (!clickedNote || !clients.length) return;
    const dnClient = clients.find(c => c.idClient === clickedNote.idClient);
    if (dnClient) setClient(dnClient);
  }, [clients, clickedNote]);

  // 3. Filter Logic
  const filteredNotes = useMemo(() => {
    return deliveryNotes.filter((item) => {
      const matchesSearch = 
        item.nomClient?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deliveryNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.SaleOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || item.etat === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, deliveryNotes]);

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

  // Navigation handlers for transformation
  const handleTransformToInvoice = (note: DeliveryNoteResponse) => {

    
    localStorage.setItem("GRN", JSON.stringify(note));
    localStorage.setItem("modalOpen", "open");
    router.push('/dashboard/finance/factures'); 
  };

  return (
    <div className='max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 bg-secondary-super-light/20 min-h-screen'>

      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-secondary text-4xl font-black tracking-tight'>Delivery Notes</h1>
          <p className='text-gray-500 mt-1 font-medium'>Track shipments and final proof of delivery</p>
        </div>

        <div className='flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto'>
          <div className='flex items-center bg-white border border-secondary-light/50 px-4 py-2.5 rounded-2xl shadow-sm focus-within:border-secondary-mid transition-all w-full md:w-80'>
            <input 
              type="text" 
              className='border-none outline-none text-gray-700 w-full bg-transparent text-sm font-medium' 
              placeholder='Search Recipient, DN # or Order Ref...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className='text-secondary-mid' />
          </div>

          {canEdit && (
            <button
              onClick={() => { setClient(undefined); setClickedNote(undefined); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-secondary-mid text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:shadow-lg transition-all"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Create Delivery Note
            </button>
          )}
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
            {selectedStatus || "Filter by Status"}
            <DropDown className={showStatusMenu ? 'rotate-180' : ''} />
          </button>

          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 min-w-[200px] ">
              <button onClick={() => {setSelectedStatus(null); setShowStatusMenu(false)}} className="w-full text-left px-4 py-3 text-[10px] font-black text-gray-400 border-b hover:bg-gray-50 tracking-widest uppercase">Show All</button>
              {Object.values(DeliveryNoteResponse.etat).map((status) => (
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
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 ">
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
              ) : filteredNotes.length === 0 ? (
                <EmptyState />
              ) : filteredNotes.map((note) => (
                <tr key={note.idDN} className="group hover:bg-secondary-mid/[0.01] transition-colors">
                  {Object.values(columns).map((value, index) => (
                    <td key={index} className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                      {value === 'etat' ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black tracking-tighter uppercase ${
                          note.etat === DeliveryNoteResponse.etat.ENVOYE ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          note.etat === DeliveryNoteResponse.etat.ANNULE ? 'bg-red-50 text-red-600 border-red-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {note.etat === DeliveryNoteResponse.etat.ENVOYE ? <CheckCircle2 size={12}/> : note.etat === DeliveryNoteResponse.etat.ANNULE ? <XCircle size={12}/> : <Clock size={12}/>}
                          {note.etat}
                        </div>
                      ) : value === 'totalAmount' ? (
                        <span className="font-black text-gray-900">
                          {note.totalAmount?.toLocaleString()} <span className="text-[10px] text-gray-400">XAF</span>
                        </span>
                      ) : value === 'docPermission' ? (
                        <PermissionBadge permission={note.docPermission?.permission} />
                      ) : (note as any)[value] || "—"}
                    </td>
                  ))}
                  
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => {
                        setActiveMenuId(activeMenuId === note.idDN ? null : (note.idDN ?? null));
                        setShowTransformSub(false);
                      }}
                      className="p-2 text-gray-300 hover:text-secondary-mid hover:bg-secondary-super-light rounded-xl transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenuId === note.idDN && (
                      <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                        {(() => {
                          const permission = !canEdit ? 'VIEWER' : note.docPermission?.permission;
                          const viewButton = (
                            <ActionButton
                              key="view"
                              label="View"
                              onClick={() => { setClickedNote(note); setIsPrintModalOpen(true); setActiveMenuId(null); }}
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
                                 const foundClient = clients.find(c => c.idClient === note.idClient);
                                 setClient(foundClient);
                                 setClickedNote(note);
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
                          onClick={() => { setClickedNote(note); setIsShareModalOpen(true); setActiveMenuId(null); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-secondary-mid transition-all"
                        >
                          <Share2 size={14} />
                        </ActionButton>

                        {/* Transform */}
                        <div className="relative">
                          <ActionButton
                            label="Transform"
                            onClick={() => setShowTransformSub(!showTransformSub)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showTransformSub ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-emerald-600'}`}
                          >
                            <ReceiptText size={14} />
                          </ActionButton>

                          {showTransformSub && (
                            <div className="absolute bottom-full right-0 mb-3 bg-white border border-secondary-light rounded-2xl shadow-2xl p-2 min-w-[220px] animate-in fade-in zoom-in-95 duration-150 z-50">
                               <p className="text-[9px] font-black text-gray-400 uppercase px-3 py-2 border-b border-gray-50 mb-1 tracking-widest text-left">Generate Document</p>
                               <button 
                                 onClick={() => handleTransformToInvoice(note)}
                                 className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors group"
                               >
                                  <div className="flex items-center gap-2">
                                    <ReceiptText size={14} />
                                    <span className="text-[11px] font-bold">Tax Invoice</span>
                                  </div>
                                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                               </button>
                            </div>
                          )}
                        </div>

                        {/* Print */}
                        <ActionButton
                          label="Print"
                          onClick={() => { setClickedNote(note); setIsPrintModalOpen(true); setActiveMenuId(null); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-purple-800 transition-all"
                        >
                          <Printer size={14} />
                        </ActionButton>

                        {/* Delete */}
                        <ActionButton
                          label="Delete"
                          onClick={() => {
                            setDeliveryNotes(prev => prev.filter(dn => dn.idDN !== note.idDN));
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

      {isModalOpen && <CreateDeliveryNoteModal deliveryNoteData={clickedNote} clientData={client} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      {isPrintModalOpen && clickedNote && <DeliveryNotePrintPreviewModal isOpen={isPrintModalOpen} data={clickedNote} onClose={() => setIsPrintModalOpen(false)} onConfirmPrint={()=>{}} />}
      <ShareDocModal
        isOpen={isShareModalOpen}
        docId={clickedNote?.idDN}
        docType="BON_LIVRAISON"
        docLabel={clickedNote?.deliveryNoteNumber ? `Delivery Note ${clickedNote.deliveryNoteNumber}` : undefined}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}

export default DeliveryNotes;