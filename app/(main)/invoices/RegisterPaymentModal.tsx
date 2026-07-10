'use client';

import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Banknote, Save } from 'lucide-react';
import { PaiementCreateRequest } from '@/src/src2/api';
import { UpdatedFactureResponse } from '@/src/api/models/UpdatedFactureResponse';
import { UpdatedSellerResponse } from '@/src/api/models/UpdatedSellerResponse';
import { getStoredSeller } from '@/src/api/session';
import { createPaiementOffline } from '@/src/offline/services/paiementService';
import { isFullyOnline } from '@/src/offline/network/connectivity';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  facture: UpdatedFactureResponse;
  onSuccess?: () => void;
}

const PAYMENT_MODES = Object.values(PaiementCreateRequest.modePaiement);

const RegisterPaymentModal = ({ isOpen, onClose, facture, onSuccess }: Props) => {
  const [seller, setSeller] = useState<UpdatedSellerResponse | null>(null);
  const [montant, setMontant] = useState('');
  const [modePaiement, setModePaiement] = useState<PaiementCreateRequest.modePaiement>(
    PaiementCreateRequest.modePaiement.ESPECES
  );
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const montantRestant = facture.montantRestant ?? facture.montantTTC ?? 0;

  useEffect(() => {
    setSeller(getStoredSeller());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMontant(String(montantRestant));
      setMemo('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, montantRestant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(montant);
    if (!amount || amount <= 0) {
      toast.error('Montant invalide.');
      return;
    }
    if (amount > montantRestant) {
      toast.error('Le montant dépasse le solde restant.');
      return;
    }
    if (!facture.idClient || !facture.idFacture) {
      toast.error('Facture incomplète.');
      return;
    }

    setIsSaving(true);
    try {
      const request: PaiementCreateRequest = {
        idClient: facture.idClient,
        idFacture: facture.idFacture,
        montant: amount,
        date: new Date().toISOString(),
        journal: 'VENTES',
        modePaiement,
        memo: memo || undefined,
        organizationId: seller?.organizationId,
        agencyId: seller?.agencyId,
      };

      await createPaiementOffline(request);

      const online = await isFullyOnline();
      const offlineMsg = !online ? ' (synchronisation en attente)' : '';
      toast.success(`Paiement enregistré${offlineMsg}`);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Échec de l\'enregistrement du paiement.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Banknote size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-secondary uppercase">Enregistrer un paiement</h2>
              <p className="text-xs text-gray-400">{facture.numeroFacture} · {facture.nomClient}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Solde restant</p>
            <p className="text-2xl font-black text-secondary-mid">
              {montantRestant.toLocaleString()} <span className="text-xs text-gray-400">XAF</span>
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Montant</label>
            <input
              type="number"
              min="0"
              step="0.01"
              max={montantRestant}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mode de paiement</label>
            <select
              value={modePaiement}
              onChange={(e) => setModePaiement(e.target.value as PaiementCreateRequest.modePaiement)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid outline-none"
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>{mode.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mémo (optionnel)</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Référence chèque, virement..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving || montantRestant <= 0}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-sm disabled:opacity-50 transition-all"
          >
            <Save size={16} />
            {isSaving ? 'Enregistrement...' : 'CONFIRMER LE PAIEMENT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPaymentModal;
