'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DropDown from "@mui/icons-material/ArrowDropDown"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import { Pencil, Trash2, MoreVertical, Printer, Eye, Share2 } from "lucide-react";

// Updated API Imports
import { UpdatedCreditNoteResponse, CreditNoteResponse, MOCK_CREDIT_NOTES } from '@/src/api/models/UpdatedCreditNoteResponse'
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse'

// Logic Components
import CreateCreditNoteModal from './CreateCreditNoteModal'
import PrintPreviewModal from './CreditNotePrintPreviewModal'
import ShareDocModal from '@/components/ShareDocModal'
import { useCanEditDocuments } from '@/src/hooks/useCanEditDocuments'
import SyncStatusIndicator from '@/components/SyncStatusIndicator'
import { NoteCreditControllerService, ClientsService } from '@/src/src2/api'
import { getVisibleNoteCredits } from '@/src/api/scopedDocs'
import { mapCreditNoteArrayToInternalArray } from '@/src/Mappers/CreditNoteMapper'
import { toast } from 'sonner'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import { useLoading } from '@/components/LoadingContext'
import ActionButton from '@/components/ActionButton'
import PermissionBadge from '@/components/PermissionBadge'

const columns = {
  "Note Number": "numeroCreditNote",
  "Origin Invoice": "numeroFactureOrigine",
  "Client Name": "nomClient",
  "Date": "dateEmission",
  "Status": "etat",
  "Total (TTC)": "montantTTC",
  "Currency": "devise",
  "Permission": "docPermission"
}

const CreditNote = () => {
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
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [clickedNote, setClickedNote] = useState<UpdatedCreditNoteResponse | undefined>();
  const [creditNotes, setCreditNotes] = useState<UpdatedCreditNoteResponse[]>(MOCK_CREDIT_NOTES);
  const [client, setClient] = useState<UpdatedClientResponse | undefined>()
  const [clients, setClients] = useState<UpdatedClientResponse[]>([]);
  const [showMenu,setShowMenu]=useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { showLoader, hideLoader, showError } = useLoading()

  useEffect(() => {
    ClientsService.getAllClients()
      .then((data) => setClients(data as unknown as UpdatedClientResponse[]))
      .catch(() => toast.error("Failed to load clients."));
  }, []);

  // Load Data from API
  useEffect(() => {
    const findFactures = async () => {
      setIsLoading(true)
      showLoader('Loading credit notes...')
      try {
        const data = await getVisibleNoteCredits()
        const transformed = mapCreditNoteArrayToInternalArray(data)
        setCreditNotes(transformed);
      } catch (error) {
        console.error("Erreur lors du chargement des factures:", error);
        toast.error("Failed to load credit notes. Please try again.")
        showError('Failed to load credit notes')
      } finally {
        setIsLoading(false)
        hideLoader()
      }
    };
    findFactures()
  }, [isModalOpen])

  // Filter Logic
  const filteredNotes = useMemo(() => {
    return creditNotes.filter((item) => {
      const matchesSearch = 
        item.nomClient?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.numeroCreditNote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numeroFactureOrigine?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || item.etat === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, creditNotes]);

  // Handle Click Outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Action Menu Options
  const actionOptions = [
    { 
      label: "Modify", 
      icon: <Pencil size={14} />, 
      action: (n: UpdatedCreditNoteResponse) => {
        const foundClient = clients.find(c => c.idClient === n.idClient);
        setClient(foundClient || ({ id: n.idClient, nom: n.nomClient, email: n.emailClient } as any));
        setClickedNote(n);
        setIsModalOpen(true);
      },
      color: "text-blue-600"
    },
    {
      label: "Share",
      icon: <Share2 size={14} />,
      action: (n: UpdatedCreditNoteResponse) => {
        setClickedNote(n);
        setIsShareModalOpen(true);
      },
      color: "text-secondary-mid"
    },
    { 
      label: "Print PDF", 
      icon: <Printer size={14} />, 
      action: (n: UpdatedCreditNoteResponse) => {
        setClickedNote(n);
        setIsPrintModalOpen(true);
      },
      color: "text-purple-800" 
    },
    { 
      label: "Delete", 
      icon: <Trash2 size={14} />, 
      action: (n: UpdatedCreditNoteResponse) => {
        if(confirm("Are you sure you want to delete this note?")) {
            setCreditNotes(prev => prev.filter(item => item.idCreditNote !== n.idCreditNote));
        }
      },
      color: "text-red-600"
    },
  ];

  const viewOnlyOption = {
    label: "View",
    icon: <Eye size={14} />,
    action: (n: UpdatedCreditNoteResponse) => {
      setClickedNote(n);
      setIsPrintModalOpen(true);
    },
    color: "text-purple-800"
  };

  return (
    <div className='max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 bg-secondary-super-light/20 min-h-screen'>

      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-secondary text-4xl font-black tracking-tight'>Credit Notes</h1>
          <p className='text-gray-500 mt-1 font-medium'>Manage client refunds and inventory returns</p>
        </div>

        <div className='flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto'>
          <div className='flex items-center bg-white border border-secondary-light/50 px-4 py-2.5 rounded-2xl shadow-sm focus-within:border-secondary-mid transition-all w-full md:w-80'>
            <input 
              type="text" 
              className='border-none outline-none text-gray-700 w-full bg-transparent text-sm font-medium' 
              placeholder='Search note #, invoice # or client...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className='text-secondary-mid' />
          </div>

          {canEdit && (
            <button
              onClick={() => { setClient(undefined); setClickedNote(undefined); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-white border-2 border-secondary-mid text-secondary-mid px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-mid hover:text-white transition-all duration-300 shadow-sm"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Create Credit Note
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
            {selectedStatus || "All Statuses"}
            <DropDown className={showStatusMenu ? 'rotate-180' : ''} />
          </button>

          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 min-w-[200px] overflow-hidden">
              <button onClick={() => {setSelectedStatus(null); setShowStatusMenu(false)}} className="w-full text-left px-4 py-2 text-[10px] font-bold text-gray-400 border-b hover:bg-gray-50">CLEAR FILTER</button>
              {Object.values(CreditNoteResponse.etat).map((status) => (
                <button key={status} onClick={() => {setSelectedStatus(status); setShowStatusMenu(false)}} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-600 hover:bg-secondary-super-light hover:text-secondary-mid transition-colors">{status}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {Object.keys(columns).map((col) => (
                  <th key={col} className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap">{col}</th>
                ))}
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <TableSkeleton cols={Object.keys(columns).length} />
              ) : filteredNotes.length === 0 ? (
                <EmptyState />
              ) : filteredNotes.map((note) => (
                <tr key={note.idCreditNote} className="group hover:bg-secondary-mid/[0.02] transition-colors">
                  {Object.values(columns).map((value, index) => (
                    <td key={index} className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                      {value === 'etat' ? (
                        <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-tighter uppercase ${
                          note.etat === 'APPLIQUÉ' ? 'bg-blue-50 text-blue-600' : 
                          note.etat === 'REMBOURSÉ' ? 'bg-emerald-50 text-emerald-600' : 
                          note.etat === 'ANNULÉ' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>{note.etat}</span>
                        <SyncStatusIndicator entityId={note.idCreditNote} entityType="note_credits" />
                        </div>
                      ) : value === 'montantTTC' ? (
                        <span className="font-bold text-secondary">{note.montantTTC?.toLocaleString()}</span>
                      ) : value === 'docPermission' ? (
                        <PermissionBadge permission={note.docPermission?.permission} />
                      ) : (
                        (note as any)[value] || "—"
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === note.idCreditNote ? null : (note.idCreditNote ?? null));
                        setShowMenu(!showMenu)
                      }}
                      className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenuId === note.idCreditNote  && showMenu && (
                      <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                        {(!canEdit || note.docPermission?.permission === 'VIEWER' ? [viewOnlyOption]
                          : note.docPermission?.permission === 'EDITOR' ? [actionOptions[0], viewOnlyOption]
                          : actionOptions).map((opt, i) => (
                          <ActionButton
                            key={i}
                            label={opt.label}
                            onClick={(e) => {
                                e.stopPropagation();
                                opt.action(note);
                                setActiveMenuId(null);
                            }}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all active:scale-90 ${opt.color}`}
                          >
                            {opt.icon}
                          </ActionButton>
                        ))}
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
      {isModalOpen && (
        <CreateCreditNoteModal 
          creditNoteData={clickedNote}  
          clientData={client} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isPrintModalOpen && clickedNote && (
        <PrintPreviewModal
          isOpen={isPrintModalOpen}
          data={clickedNote}
          onClose={() => setIsPrintModalOpen(false)}
          onConfirmPrint={()=>{}}
        />
      )}
      <ShareDocModal
        isOpen={isShareModalOpen}
        docId={clickedNote?.idCreditNote}
        docType="NOTE_CREDIT"
        docLabel={clickedNote?.numeroCreditNote ? `Credit Note ${clickedNote.numeroCreditNote}` : undefined}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}

export default CreditNote;