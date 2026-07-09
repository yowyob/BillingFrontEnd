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
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronRight,
  Eye,
  Share2
} from "lucide-react";

// API & Types
import { UpdatedClientResponse } from '@/src/api/models/UpdatedClientResponse'

import { UpdatedFactureResponse } from '@/src/api/models/UpdatedFactureResponse'
import { mapDevisToFacture } from '@/src/api/transformation/DevisTransformation'
import { UpdatedProformaInvoiceResponse,MOCK_PROFORMA_INVOICE } from '@/src/api/models/UpdatedProformaInvoiceResponse'
// Components
import CreateProformaInvoiceModal from './CreateProformaInvoiceModal'
import PrintPreviewModal from './PrintPreviewModal'
import { mapProformaToFacture, mapProformaToSalesOrder } from '@/src/api/transformation/ProformaTransformation'
import { UpdatedSalesOrderResponse } from '@/src/api/models/UpdatedSalesOrder'
import { FacturesProformaService, ClientsService } from '@/src/src2/api'
import { getVisibleProformas } from '@/src/api/scopedDocs'
import { mapProformaArrayToUI } from '@/src/Mappers/ProformaMapper'
import { toast } from 'sonner'
import TableSkeleton from '@/components/TableSkeleton'
import EmptyState from '@/components/EmptyState'
import { useLoading } from '@/components/LoadingContext'
import ActionButton from '@/components/ActionButton'
import PermissionBadge from '@/components/PermissionBadge'
import ShareDocModal from '@/components/ShareDocModal'
import { useCanEditDocuments } from '@/src/hooks/useCanEditDocuments'

const columns = {
  "Devis Number": "numeroProformaInvoice",
  "Client Name": "nomClient",
  "Creation Date": "dateCreation",
  "Status": "statut",
  "Total Amount": "montantTTC",
  "Permission": "docPermission",
}

const ProformaInvoice = () => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { canEdit } = useCanEditDocuments();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showTransformSub, setShowTransformSub] = useState<boolean>(false);
  const [clickedProformaInvoice, setClickedProformaInvoice] = useState<UpdatedProformaInvoiceResponse | undefined>();
  const [ProformaInvoices, setProformaInvoices] = useState<UpdatedProformaInvoiceResponse[]>(MOCK_PROFORMA_INVOICE);
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
      showLoader('Loading proforma invoices...')
      try {
        const data = await getVisibleProformas()
        const transformed = mapProformaArrayToUI(data);
        setProformaInvoices(transformed);
      } catch (error) {
        console.error("Erreur lors du chargement des devis:", error);
        toast.error("Failed to load proforma invoices. Please try again.")
        showError('Failed to load proforma invoices')
      } finally {
        setIsLoading(false)
        hideLoader()
      }
    };

    findDevis();
  }, [isModalOpen]);


  //load the proforma from local storage 
  useEffect(()=>{
        //read if the modal should be opend
        const modalOpen=localStorage.getItem("modalOpen")
        if(modalOpen=="open"){
          console.log("opening proforma modal")
          setIsModalOpen(true)
  
          localStorage.setItem("modalOpen","close")
          //load the invoice 
          const invoiceString=localStorage.getItem("proforma_invoice")
          localStorage.setItem("proforma_invoice","")
          if(invoiceString){

            const invoice:UpdatedProformaInvoiceResponse=JSON.parse(invoiceString)

            console.log(invoice)
            setClickedProformaInvoice(invoice)

          }
        }
      },[])

  // Resolve the client once both the reopened proforma invoice and the live client list are available.
  useEffect(() => {
    if (!clickedProformaInvoice || !clients.length) return;
    const invoiceClient = clients.find(c => c.idClient === clickedProformaInvoice.idClient);
    if (invoiceClient) setClient(invoiceClient);
  }, [clients, clickedProformaInvoice]);


  
  const filteredProformaInvoices = useMemo(() => {
    return ProformaInvoices.filter((item) => {
      const matchesSearch = 
        item.nomClient?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.numeroProformaInvoice?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || item.statut === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, ProformaInvoices]);

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

  const handleTransform = (q: UpdatedProformaInvoiceResponse) => {
    const invoice: UpdatedFactureResponse = mapDevisToFacture(q);
    localStorage.setItem("invoice", JSON.stringify(invoice));
    localStorage.setItem("modalOpen", "open");
    router.push("/invoices");
  };

  const statusOptions = Array.from(new Set(MOCK_PROFORMA_INVOICE.map(q => q.statut)));

 

  function handleTransformToProformaInvoice(ProformaInvoice: UpdatedProformaInvoiceResponse): void {
    const invoice: UpdatedFactureResponse = mapProformaToFacture(ProformaInvoice);
    localStorage.setItem("invoice", JSON.stringify(invoice));
    localStorage.setItem("modalOpen", "open");
    router.push("/invoices");
  }
  
   function handleTransformToProformaSalesOrder(ProformaInvoice: UpdatedProformaInvoiceResponse): void {
    const invoice: UpdatedSalesOrderResponse = mapProformaToSalesOrder(ProformaInvoice);
    localStorage.setItem("salesOrder", JSON.stringify(invoice));
    localStorage.setItem("modalOpen", "open");
    router.push("/sales_orders");
  }
  return (
    <div className='max-w-7xl mx-auto p-6 lg:p-10 flex flex-col gap-8 bg-secondary-super-light/20 min-h-screen'>
      
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-secondary text-4xl font-black tracking-tight'>Proforma Invoices</h1>
          <p className='text-gray-500 mt-1 font-medium'>Manage and transform estimates for clients</p>
        </div>

        <div className='flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto'>
          <div className='flex items-center bg-white border border-secondary-light/50 px-4 py-2.5 rounded-2xl shadow-sm focus-within:border-secondary-mid transition-all w-full md:w-80'>
            <input 
              type="text" 
              className='border-none outline-none text-gray-700 w-full bg-transparent text-sm font-medium' 
              placeholder='Search Devis #, client name...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className='text-secondary-mid' />
          </div>

          {canEdit && (
            <button
              onClick={() => { setClient(undefined); setClickedProformaInvoice(undefined); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-white border-2 border-secondary-mid text-secondary-mid px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-mid hover:text-white transition-all duration-300 shadow-sm"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Create Proforma Invoice
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
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 min-w-[200px] ">
              <button onClick={() => {setSelectedStatus(null); setShowStatusMenu(false)}} className="w-full text-left px-4 py-2 text-[10px] font-bold text-gray-400 border-b hover:bg-gray-50 uppercase tracking-widest">Clear Filter</button>
              {statusOptions.map((status) => (
                <button key={status} onClick={() => {setSelectedStatus(status??""); setShowStatusMenu(false)}} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-600 hover:bg-secondary-super-light hover:text-secondary-mid transition-colors uppercase">{status}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="">
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
              ) : filteredProformaInvoices.length === 0 ? (
                <EmptyState />
              ) : filteredProformaInvoices.map((ProformaInvoice) => (
                <tr key={ProformaInvoice.idProformaInvoice} className="group hover:bg-secondary-mid/[0.02] transition-colors">
                  {Object.values(columns).map((key, index) => (
                    <td key={index} className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                      {key === 'statut' ? (
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-tighter uppercase inline-flex items-center gap-1 ${
                          ProformaInvoice.statut === 'ACCEPTE' ? 'bg-emerald-50 text-emerald-600' : 
                          ProformaInvoice.statut === 'REFUSE' ? 'bg-red-50 text-red-600' : 
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {ProformaInvoice.statut === 'ACCEPTE' ? <CheckCircle2 size={10}/> : ProformaInvoice.statut === 'REFUSE' ? <XCircle size={10}/> : <Clock size={10}/>}
                          {ProformaInvoice.statut?.replace('_', ' ')}
                        </span>
                      ) : key === 'montantTTC' ? (
                        <span className="font-black text-gray-900">
                          {ProformaInvoice.montantTTC?.toLocaleString()} <span className='text-[10px] text-gray-400 uppercase'>{ProformaInvoice.devise || 'XAF'}</span>
                        </span>
                      ) : key === 'dateCreation' ? (
                        <span className="text-xs font-bold text-gray-500">
                           {ProformaInvoice.dateCreation ? new Date(ProformaInvoice.dateCreation).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      ) : key === 'docPermission' ? (
                        <PermissionBadge permission={ProformaInvoice.docPermission?.permission} />
                      ) : (
                        (ProformaInvoice as any)[key] || "—"
                      )}
                    </td>
                  ))}
                  
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === ProformaInvoice.idProformaInvoice ? null : (ProformaInvoice.idProformaInvoice ?? null))}
                      className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenuId === ProformaInvoice.idProformaInvoice && (
                      <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                        {(() => {
                          const permission = !canEdit ? 'VIEWER' : ProformaInvoice.docPermission?.permission;
                          const viewButton = (
                            <ActionButton
                              key="view"
                              label="View"
                              onClick={() => { setClickedProformaInvoice(ProformaInvoice); setIsPrintModalOpen(true); setActiveMenuId(null); }}
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-purple-800 transition-all"
                            >
                              <Eye size={14} />
                            </ActionButton>
                          );
                          if (permission === 'VIEWER') return viewButton;
                          const editButton = (
                            <button
                               key="edit"
                               onClick={() => {
                                 const foundClient = clients.find(c => c.idClient === ProformaInvoice.idClient);
                                 setClient(foundClient);
                                 setClickedProformaInvoice(ProformaInvoice);
                                 setIsModalOpen(true);
                                 setActiveMenuId(null);
                               }}
                               className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-blue-600"
                            >
                              <Pencil size={14} />
                            </button>
                          );
                          if (permission === 'EDITOR') return <>{editButton}{viewButton}</>;
                          return (
                          <>
                        {editButton}

                        {/* Share */}
                        <ActionButton
                          label="Share"
                          onClick={() => { setClickedProformaInvoice(ProformaInvoice); setIsShareModalOpen(true); setActiveMenuId(null); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-secondary-mid transition-all"
                        >
                          <Share2 size={14} />
                        </ActionButton>

                        {/* Transform */}
                        <div
                          className="relative"
                          onClick={() => setShowTransformSub(!showTransformSub)}
                        >
                          <ActionButton
                            label="Transform"
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showTransformSub ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-emerald-600'}`}
                          >
                            <ReceiptText size={14} />
                          </ActionButton>

                          {showTransformSub && (
                            <div className="  absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-secondary-light rounded-2xl shadow-2xl p-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-150">
                               <p className="text-[9px] font-black text-gray-400 uppercase px-3 py-2 border-b border-gray-50 mb-1 tracking-widest">Transform To:</p>
                               
                               <button 
                                 onClick={() => handleTransformToProformaInvoice(ProformaInvoice)}
                                 className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors group"
                               >
                                  <div className="flex items-center gap-2">
                                    <ReceiptText size={14} />
                                    <span className="text-[11px] font-bold">Client Invoice</span>
                                  </div>
                                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                               </button>

                               <button 
                                 onClick={() => handleTransformToProformaSalesOrder(ProformaInvoice)}
                                 className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors group"
                               >
                                  <div className="flex items-center gap-2">
                                    <ReceiptText size={14} />
                                    <span className="text-[11px] font-bold">Sales Order</span>
                                  </div>
                                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                               </button>


                            </div>
                          )}
                        </div>

                        {/* Print */}
                        <ActionButton
                          label="Print"
                          onClick={() => { setClickedProformaInvoice(ProformaInvoice); setIsPrintModalOpen(true); setActiveMenuId(null); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-purple-800 transition-all"
                        >
                          <Printer size={14} />
                        </ActionButton>

                        {/* Delete */}
                        <ActionButton
                          label="Delete"
                          onClick={() => {
                            setProformaInvoices(prev => prev.filter(q => q.idProformaInvoice !== ProformaInvoice.idProformaInvoice));
                            setActiveMenuId(null);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-red-600 transition-all"
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

      {isModalOpen && <CreateProformaInvoiceModal ProformaInvoiceData={clickedProformaInvoice} clientData={client} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>} 
      {isPrintModalOpen && clickedProformaInvoice && <PrintPreviewModal onConfirmPrint={()=>{}} isOpen={isPrintModalOpen} data={clickedProformaInvoice} onClose={() => setIsPrintModalOpen(false)} />}
      <ShareDocModal
        isOpen={isShareModalOpen}
        docId={clickedProformaInvoice?.idProformaInvoice}
        docType="FACTURE_PROFORMA"
        docLabel={clickedProformaInvoice?.numeroProformaInvoice ? `Proforma Invoice ${clickedProformaInvoice.numeroProformaInvoice}` : undefined}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}

export default ProformaInvoice;