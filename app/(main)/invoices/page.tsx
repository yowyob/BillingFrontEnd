'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DropDown from "@mui/icons-material/ArrowDropDown"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import { Pencil, Trash2, MoreVertical, Printer, FileText, ReceiptText, Eye, Share2, Banknote } from "lucide-react";
import CreateInvoiceModal from './CreateInvoiceModal'
import CreateInvoicePrintModal from './InvoicePrintPreviewModal'
import RegisterPaymentModal from './RegisterPaymentModal'
import { ClientsService } from '@/src/src2/api'
// Updated Imports

import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse'
import { FactureResponse, UpdatedFactureResponse } from '@/src/api/models/UpdatedFactureResponse'
import { MOCK_FACTURE } from '@/src/api/models/UpdatedFactureResponse'
import { mapBackendFactureArrayToUpdatedArray } from '@/src/Mappers/FactureMapper'
import { FactureService } from '@/src/src2/api/services/FactureService'
import { getVisibleFactures } from '@/src/api/scopedDocs'
import { toast } from 'sonner'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import { useLoading } from '@/components/LoadingContext'
import ActionButton from '@/components/ActionButton'
import PermissionBadge from '@/components/PermissionBadge'
import ShareDocModal from '@/components/ShareDocModal'
import SyncStatusIndicator from '@/components/SyncStatusIndicator'
import { useCanEditDocuments } from '@/src/hooks/useCanEditDocuments'
// Adjusting Table Columns for Invoices
const columns = {
  "Invoice #": "numeroFacture",
  "Client": "nomClient",
  "Date": "dateFacturation",
  "Due Date": "dateEcheance",
  "Status": "etat",
  "Total (TTC)": "montantTTC",
  "Resting": "montantRestant",
  "Permission": "docPermission"
}

const Factures = () => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { canEdit } = useCanEditDocuments();

  // 1. State Management
  const [showStatusMenu, setShowStatusMenu] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<FactureResponse.etat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [clickedFacture, setClickedFacture] = useState<UpdatedFactureResponse | undefined>();
  const [factures, setFactures] = useState<UpdatedFactureResponse[]>(MOCK_FACTURE);
  const [client, setClient] = useState<UpdatedClientResponse | undefined>()
  const [clients, setClients] = useState<UpdatedClientResponse[]>([]);
  const [onsuccess,setOnSuccess]=useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { showLoader, hideLoader, showError } = useLoading()

  useEffect(() => {
    ClientsService.getAllClients()
      .then((data) => setClients(data as unknown as UpdatedClientResponse[]))
      .catch(() => toast.error("Failed to load clients."));
  }, []);

  //logic to load the tranformed invoice from local storage
  useEffect(()=>{
    const findFactures = async () => {
      setIsLoading(true)
      showLoader('Loading invoices...')
      try {
        const data = await getVisibleFactures();
        const transformed = mapBackendFactureArrayToUpdatedArray(data);
        setFactures(transformed);
      } catch (error) {
        console.error("Erreur lors du chargement des factures:", error);
        toast.error("Failed to load invoices. Please try again.")
        showError('Failed to load invoices')
      } finally {
        setIsLoading(false)
        hideLoader()
      }
    };
    findFactures()
  },[isModalOpen])

    useEffect(()=>{
      //read if the modal should be opend
      const modalOpen=localStorage.getItem("modalOpen")
      if(modalOpen=="open"){
        console.log("opening invoice modal")
        setIsModalOpen(true)

        localStorage.setItem("modalOpen","close")
        //load the invoice
        const invoiceString=localStorage.getItem("invoice")
        if(invoiceString){
          const invoice:UpdatedFactureResponse=JSON.parse(invoiceString)
          setClickedFacture(invoice)
        }
      }
    },[])

    // Resolve the client once both the reopened invoice and the live client list are available.
    useEffect(() => {
      if (!clickedFacture || !clients.length) return;
      const invoiceClient = clients.find(c => c.idClient === clickedFacture.idClient);
      if (invoiceClient) setClient(invoiceClient);
    }, [clients, clickedFacture])
  // 2. Filter Logic
  const filteredFactures = useMemo(() => {
    return factures.filter((item) => {
      const matchesSearch = 
        item.nomClient?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.numeroFacture?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || item.etat === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, factures]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actionOptions = [
    {
      label: "Modify",
      icon: <Pencil size={14} />,
      action: (f: UpdatedFactureResponse) => {
        const foundClient = clients.find(c => c.idClient === f.idClient);
        setClient(foundClient);
        setClickedFacture(f);
        setIsModalOpen(true);
      },
      color: "text-blue-600"
    },
    {
      label: "Share",
      icon: <Share2 size={14} />,
      action: (f: UpdatedFactureResponse) => {
        setClickedFacture(f);
        setIsShareModalOpen(true);
      },
      color: "text-secondary-mid"
    },
    { 
      label: "Register Payment", 
      icon: <Banknote size={14} />, 
      action: (f: UpdatedFactureResponse) => {
        if ((f.montantRestant ?? 0) <= 0) {
          toast.info('Cette facture est déjà entièrement payée.');
          return;
        }
        setClickedFacture(f);
        setIsPaymentModalOpen(true);
      },
      color: "text-emerald-600",
      hidden: (f: UpdatedFactureResponse) => (f.montantRestant ?? 0) <= 0,
    },
    { 
      label: "Print PDF", 
      icon: <Printer size={14} />, 
      action: (f: UpdatedFactureResponse) => {
        setClickedFacture(f);
        setIsPrintModalOpen(true);
      },
      color: "text-purple-800" 
    },
    { 
      label: "Delete", 
      icon: <Trash2 size={14} />, 
      action: (f: UpdatedFactureResponse) => {
        setFactures(prev => prev.filter(item => item.idFacture !== f.idFacture));
      },
      color: "text-red-600" 
    },
    { 
    label: "Comptabiliser", 
    icon: <ReceiptText size={14} />, // Uses the ReceiptText icon for accounting
    action: (f: UpdatedFactureResponse) => {



      const handleAccountingSync = async (f: UpdatedFactureResponse) => {
  try {
    if (!f.idFacture) return;
    
    // Call the service
    //await FactureService.syncToAccounting(f.idFacture);
    try {
      await FactureService.accountFacture(f.idFacture)
      toast.success(`Facture ${f.numeroFacture} sent to accounting!`)
    } catch (error) {
      toast.error("Error occurred when accounting bill")
    }
  } catch (error) {
    console.error("Sync error:", error);
    toast.error("Error syncing with accounting backend.");
  }


};
handleAccountingSync(f)
    },
    color: "text-orange-600" // Distinct color for accounting
  },
  ];

  const viewOnlyOption = {
    label: "View",
    icon: <Eye size={14} />,
    action: (f: UpdatedFactureResponse) => {
      setClickedFacture(f);
      setIsPrintModalOpen(true);
    },
    color: "text-purple-800"
  };

  return (
    <div className='max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 bg-secondary-super-light/20 min-h-screen'>

      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-secondary text-4xl font-black tracking-tight'>Invoices</h1>
          <p className='text-gray-500 mt-1 font-medium'>Manage billing and customer payments</p>
        </div>

        <div className='flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto'>
          <div className='flex items-center bg-white border border-secondary-light/50 px-4 py-2.5 rounded-2xl shadow-sm focus-within:border-secondary-mid transition-all w-full md:w-80'>
            <input 
              type="text" 
              className='border-none outline-none text-gray-700 w-full bg-transparent text-sm font-medium' 
              placeholder='Search client or invoice #...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className='text-secondary-mid' />
          </div>

          {canEdit && (
            <button
              onClick={() => { setClient(undefined); setClickedFacture(undefined); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-white border-2 border-secondary-mid text-secondary-mid px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-mid hover:text-white transition-all duration-300 shadow-sm"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Create Invoice
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
              {Object.values(FactureResponse.etat).map((status) => (
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
                  <th key={col} className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <TableSkeleton cols={Object.keys(columns).length} />
              ) : filteredFactures.length === 0 ? (
                <EmptyState />
              ) : filteredFactures.map((facture) => (
                <tr key={facture.idFacture} className="group hover:bg-secondary-mid/[0.02] transition-colors">
                  {Object.values(columns).map((key, index) => (
                    <td key={index} className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                      {key === 'etat' ? (
                        <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-tighter uppercase ${
                          facture.etat === FactureResponse.etat.PAYE ? 'bg-emerald-50 text-emerald-600' :
                          facture.etat === FactureResponse.etat.EN_RETARD ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {facture.etat}
                        </span>
                        <SyncStatusIndicator entityId={facture.idFacture} entityType="factures" />
                        </div>
                      ) : key === 'docPermission' ? (
                        <PermissionBadge permission={facture.docPermission?.permission} />
                      ) : (
                        (facture as any)[key] || "—"
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === facture.idFacture ? null : (facture.idFacture ?? null))}
                      className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenuId === facture.idFacture && (
                      <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1">
                        {(!canEdit || facture.docPermission?.permission === 'VIEWER' ? [viewOnlyOption]
                          : facture.docPermission?.permission === 'EDITOR' ? [actionOptions[0], viewOnlyOption]
                          : actionOptions.filter((opt) => !('hidden' in opt) || !opt.hidden?.(facture))
                        ).map((opt, i) => (
                          <ActionButton
                            key={i}
                            label={opt.label}
                            onClick={() => { opt.action(facture); setActiveMenuId(null); }}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all ${opt.color}`}
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

      {/* Modals - Ensure you update these components or pass the new props correctly */}
      {
        isModalOpen && <CreateInvoiceModal  factureData={clickedFacture} clientData={client} isOpen={isModalOpen} onClose={setIsModalOpen}></CreateInvoiceModal>
      }
      {
        isPrintModalOpen && clickedFacture && <CreateInvoicePrintModal data={clickedFacture} isOpen={isPrintModalOpen} onClose={()=>setIsPrintModalOpen(false)}  onConfirmPrint={()=>{}}></CreateInvoicePrintModal>
      }
      <ShareDocModal
        isOpen={isShareModalOpen}
        docId={clickedFacture?.idFacture}
        docType="FACTURE"
        docLabel={clickedFacture?.numeroFacture ? `Invoice ${clickedFacture.numeroFacture}` : undefined}
        onClose={() => setIsShareModalOpen(false)}
      />
      {isPaymentModalOpen && clickedFacture && (
        <RegisterPaymentModal
          isOpen={isPaymentModalOpen}
          facture={clickedFacture}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            getVisibleFactures()
              .then((data) => setFactures(mapBackendFactureArrayToUpdatedArray(data)))
              .catch(() => {});
          }}
        />
      )}
      {/* {isModalOpen && <CreateInvoiceModal factureData={clickedFacture} clientData={client} ... />} */}
    </div>
  )
}

export default Factures;