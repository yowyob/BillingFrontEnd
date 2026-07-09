'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  ReceiptLong,
  AccessTime,
  CheckCircle,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { getVisibleFactures, getVisibleFacturesFournisseur } from '@/src/api/scopedDocs'
import { FactureResponse, FactureFournisseurResponse } from '@/src/src2/api'
import { getStoredSeller, updateStoredSellerProfileImage } from '@/src/api/session'
import { SellerRole } from '@/src/api/models/UpdatedSellerResponse'
import { toast } from 'sonner'
import SellerAvatar from '@/components/SellerAvatar'
import UploadSellerAvatarModal from '@/components/UploadSellerAvatarModal'
import { Camera } from 'lucide-react'

const formatMoney = (amount?: number) => `${Math.round(amount ?? 0).toLocaleString()} XAF`

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString));
};

// --- Metric Card ---
const StatCard = ({ title, value, icon: Icon, tone = 'default' }: { title: string; value: string; icon: any; tone?: 'default' | 'positive' | 'negative' }) => (
  <div className="bg-white p-5 rounded-xl border border-[var(--color-secondary-light)] shadow-sm transition-all hover:border-[var(--color-secondary-mid)]/20 hover:shadow-md group">
    <div className="flex justify-between items-start">
      <div className={`p-2 rounded-lg transition-colors ${
        tone === 'positive' ? 'bg-emerald-50 group-hover:bg-emerald-500' :
        tone === 'negative' ? 'bg-rose-50 group-hover:bg-rose-500' :
        'bg-[var(--color-secondary-super-light)] group-hover:bg-[var(--color-secondary-mid)]'
      }`}>
        <Icon className={
          tone === 'positive' ? 'text-emerald-600 group-hover:text-white' :
          tone === 'negative' ? 'text-rose-600 group-hover:text-white' :
          'text-[var(--color-secondary-mid)] group-hover:text-white'
        } fontSize="small" />
      </div>
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-bold text-[var(--color-secondary-gray)] uppercase tracking-wider">{title}</p>
      <h3 className="text-xl font-black text-[var(--color-primary)] mt-0.5 tracking-tight">{value}</h3>
    </div>
  </div>
);

interface CashSummary {
  count: number;
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
}

const summarize = (
  entries: { montantTTC?: number; montantRestant?: number; cancelled: boolean }[]
): CashSummary => {
  const active = entries.filter((e) => !e.cancelled);
  return active.reduce(
    (acc, e) => {
      const total = e.montantTTC ?? 0;
      const pending = Math.min(e.montantRestant ?? 0, total);
      const paid = total - pending;
      return {
        count: acc.count + 1,
        totalInvoiced: acc.totalInvoiced + total,
        totalPaid: acc.totalPaid + paid,
        totalPending: acc.totalPending + pending,
      };
    },
    { count: 0, totalInvoiced: 0, totalPaid: 0, totalPending: 0 }
  );
};

type Transaction = {
  id: string;
  flow: 'IN' | 'OUT';
  reference?: string;
  counterparty?: string;
  date?: string;
  totalTTC?: number;
  restant?: number;
};

const ProfessionalDashboard = () => {
  const [invoices, setInvoices] = useState<FactureResponse[]>([]);
  const [supplierInvoices, setSupplierInvoices] = useState<FactureFournisseurResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const seller = getStoredSeller();
  const [profileImageUrl, setProfileImageUrl] = useState(seller?.profileImageUrl);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [factures, facturesFournisseur] = await Promise.all([
          getVisibleFactures(),
          getVisibleFacturesFournisseur(),
        ]);
        setInvoices(factures);
        setSupplierInvoices(facturesFournisseur);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
        toast.error("Failed to load dashboard stats.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const scopeLabel = useMemo(() => {
    if (seller?.role === SellerRole.OWNER) return "Organization";
    if (seller?.role === SellerRole.AGENCY_MANAGER) return "Agency";
    return "Your";
  }, [seller?.role]);

  const cashIn = useMemo(
    () =>
      summarize(
        invoices.map((f) => ({
          montantTTC: f.montantTTC,
          montantRestant: f.montantRestant,
          cancelled: f.etat === FactureResponse.etat.ANNULE,
        }))
      ),
    [invoices]
  );

  const cashOut = useMemo(
    () =>
      summarize(
        supplierInvoices.map((f) => ({
          montantTTC: f.montantTTC,
          montantRestant: f.montantRestant,
          cancelled: f.statut === FactureFournisseurResponse.statut.ANNULE,
        }))
      ),
    [supplierInvoices]
  );

  const netCollected = cashIn.totalPaid - cashOut.totalPaid;
  const netExposure = cashIn.totalPending - cashOut.totalPending;

  const recentTransactions: Transaction[] = useMemo(() => {
    const inTx: Transaction[] = invoices
      .filter((f) => f.etat !== FactureResponse.etat.ANNULE)
      .map((f) => ({
        id: `in-${f.idFacture}`,
        flow: 'IN',
        reference: f.numeroFacture,
        counterparty: f.nomClient,
        date: f.dateFacturation,
        totalTTC: f.montantTTC,
        restant: f.montantRestant,
      }));
    const outTx: Transaction[] = supplierInvoices
      .filter((f) => f.statut !== FactureFournisseurResponse.statut.ANNULE)
      .map((f) => ({
        id: `out-${f.idFactureFournisseur}`,
        flow: 'OUT',
        reference: f.numeroFacture,
        counterparty: f.nomFournisseur,
        date: f.dateFacture,
        totalTTC: f.montantTTC,
        restant: f.montantRestant,
      }));
    return [...inTx, ...outTx]
      .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
      .slice(0, 8);
  }, [invoices, supplierInvoices]);

  return (
    <div className="w-full p-8 min-h-screen bg-[var(--color-secondary-background)] text-[var(--color-primary)] font-sans overflow-y-auto">

      {/* Header Section */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--color-secondary-light)] pb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative group/avatar shrink-0"
            title="Change profile photo"
          >
            <SellerAvatar name={seller?.username} imageUrl={profileImageUrl} size={56} />
            <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={18} className="text-white" />
            </span>
          </button>
          <div>
            <h1 className="text-2xl font-black text-[var(--color-primary)] tracking-tight uppercase">{scopeLabel} Cash Flow</h1>
            <p className="text-[var(--color-secondary-gray)] text-sm mt-0.5 font-medium italic">Cash in from client invoices vs. cash out to supplier invoices</p>
          </div>
        </div>
      </header>

      {/* Net Position */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <StatCard title="Net Cash Collected" value={isLoading ? "…" : formatMoney(netCollected)} icon={AccountBalanceWallet} tone={netCollected >= 0 ? 'positive' : 'negative'} />
        <StatCard title="Net Pending Exposure" value={isLoading ? "…" : formatMoney(netExposure)} icon={AccessTime} tone={netExposure >= 0 ? 'default' : 'negative'} />
      </div>

      {/* Cash In */}
      <section className="mb-8">
        <h2 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
          <TrendingUp fontSize="small" /> Cash In — Client Invoices
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Invoices Issued" value={isLoading ? "…" : `${cashIn.count}`} icon={ReceiptLong} />
          <StatCard title="Total Invoiced" value={isLoading ? "…" : formatMoney(cashIn.totalInvoiced)} icon={TrendingUp} />
          <StatCard title="Paid" value={isLoading ? "…" : formatMoney(cashIn.totalPaid)} icon={CheckCircle} tone="positive" />
          <StatCard title="Pending / Hanging" value={isLoading ? "…" : formatMoney(cashIn.totalPending)} icon={AccessTime} tone={cashIn.totalPending > 0 ? 'negative' : 'default'} />
        </div>
      </section>

      {/* Cash Out */}
      <section className="mb-8">
        <h2 className="text-xs font-black text-rose-700 uppercase tracking-widest mb-3 flex items-center gap-2">
          <TrendingDown fontSize="small" /> Cash Out — Supplier Invoices
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Invoices Received" value={isLoading ? "…" : `${cashOut.count}`} icon={ReceiptLong} />
          <StatCard title="Total Billed" value={isLoading ? "…" : formatMoney(cashOut.totalInvoiced)} icon={TrendingDown} />
          <StatCard title="Paid" value={isLoading ? "…" : formatMoney(cashOut.totalPaid)} icon={CheckCircle} tone="positive" />
          <StatCard title="Pending / Hanging" value={isLoading ? "…" : formatMoney(cashOut.totalPending)} icon={AccessTime} tone={cashOut.totalPending > 0 ? 'negative' : 'default'} />
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="border border-[var(--color-secondary-light)] bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--color-secondary-super-light)]">
          <h3 className="text-xs font-black text-[var(--color-primary)] uppercase tracking-widest">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-secondary-background)]">
              <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--color-secondary-gray)] border-b border-[var(--color-secondary-light)]">
                <th className="px-6 py-4">Flow</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Counterparty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-secondary-super-light)] text-sm font-medium">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400 font-medium">Loading…</td></tr>
              ) : recentTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400 font-medium">No transactions yet.</td></tr>
              ) : recentTransactions.map((tx) => {
                const restant = tx.restant ?? 0;
                const total = tx.totalTTC ?? 0;
                const status = restant <= 0 ? 'Paid' : restant < total ? 'Partial' : 'Pending';
                const statusColor =
                  status === 'Paid' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                  status === 'Partial' ? 'text-amber-700 bg-amber-50 border-amber-100' :
                  'text-rose-700 bg-rose-50 border-rose-100';
                return (
                  <tr key={tx.id} className="hover:bg-[var(--color-secondary-super-light)]/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                        tx.flow === 'IN' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-rose-700 bg-rose-50 border-rose-100'
                      }`}>
                        {tx.flow === 'IN' ? 'Cash In' : 'Cash Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--color-secondary-gray)]">{tx.reference || '—'}</td>
                    <td className="px-6 py-4 font-bold text-[var(--color-primary)]">{tx.counterparty || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${statusColor}`}>{status}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-[var(--color-primary)]">{formatMoney(tx.totalTTC)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <UploadSellerAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        sellerId={seller?.Id}
        username={seller?.username}
        profileImageUrl={profileImageUrl}
        onUploaded={(photoUrl) => {
          setProfileImageUrl(photoUrl);
          updateStoredSellerProfileImage(photoUrl);
        }}
      />
    </div>
  )
}

export default ProfessionalDashboard;
