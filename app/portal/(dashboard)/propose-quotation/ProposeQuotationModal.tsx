'use client';

import React, { useEffect, useState } from 'react';
import { X, Search, Trash2, Plus, ShoppingCart, Calculator, Tag, Receipt, Save, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { PortalApi } from '@/src/api/portalApi';
import { getPortalSession } from '@/src/api/portalSession';

const inputStyles = "w-full border border-gray-200 rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-secondary-mid/10 focus:border-secondary-mid transition-all text-sm text-gray-700 bg-white shadow-sm placeholder:text-gray-300";
const labelStyles = "text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block ml-0.5";

interface ProposalLine {
  idProduit: string;
  nomProduit: string;
  saleSize: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  photo?: string;
}

interface ProposeQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const ProposeQuotationModal: React.FC<ProposeQuotationModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [myClient, setMyClient] = useState<any | null>(null);

  const [productSearch, setProductSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const [lines, setLines] = useState<ProposalLine[]>([]);
  const [commentary, setCommentary] = useState("");
  const [applyVat, setApplyVat] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const session = getPortalSession();
    if (!session) return;

    PortalApi.getProducts(session.organizationId)
      .then(setProducts)
      .catch(() => toast.error("Failed to load products."));

    PortalApi.getMyClientInfo()
      .then(setMyClient)
      .catch(() => toast.error("Failed to load your account details."));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setLines([]);
      setCommentary("");
      setSelectedProduct(null);
      setProductSearch("");
      setSelectedSize("");
      setQuantity(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = productSearch.trim()
    ? products.filter((p) =>
        p.nomProduit?.toLowerCase().includes(productSearch.toLowerCase()) &&
        p.nomProduit?.toLowerCase() !== selectedProduct?.nomProduit?.toLowerCase()
      )
    : [];

  // Only the client's own allowed sale sizes matter here — no seller
  // permission/negotiation gating, this is a client-authored draft.
  const availableTiers = selectedProduct?.allowedSaleSizes?.filter((s: any) =>
    myClient?.allowedSaleSizes?.includes(s.size)
  ) ?? [];

  const currentTier = selectedProduct?.allowedSaleSizes?.find((s: any) => s.size === selectedSize);

  const now = new Date();
  const activePromo = selectedProduct?.activePromotions?.find((promo: any) => {
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    return promo.saleSize === selectedSize && promo.active && now >= start && now <= end;
  });

  let unitPrice = currentTier?.unitPrice ?? 0;
  if (activePromo) {
    if (activePromo.promotionalPrice) unitPrice = activePromo.promotionalPrice;
    else if (activePromo.discountPercentage) unitPrice = unitPrice * (1 - activePromo.discountPercentage / 100);
  }

  const addLine = () => {
    if (!selectedProduct || !selectedSize) return;
    const line: ProposalLine = {
      idProduit: selectedProduct.idProduit,
      nomProduit: selectedProduct.nomProduit,
      saleSize: selectedSize,
      quantite: quantity,
      prixUnitaire: unitPrice,
      montantTotal: Math.round(unitPrice * quantity),
      photo: selectedProduct.photo,
    };
    setLines((prev) => [...prev, line]);
    setSelectedProduct(null);
    setProductSearch("");
    setSelectedSize("");
    setQuantity(1);
  };

  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const montantHT = lines.reduce((acc, l) => acc + l.montantTotal, 0);
  const montantTVA = applyVat ? Math.round(montantHT * 0.1925) : 0;
  const montantTTC = montantHT + montantTVA;

  const handleSubmit = async () => {
    if (lines.length === 0) return;
    setIsSubmitting(true);
    try {
      await PortalApi.createQuotationProposal({
        nomClient: myClient?.raisonSociale || myClient?.username,
        commentary: commentary || undefined,
        applyVat,
        devise: 'XAF',
        montantHT,
        montantTVA,
        montantTTC,
        lignesProposal: lines.map((l) => ({
          idProduit: l.idProduit,
          nomProduit: l.nomProduit,
          saleSize: l.saleSize,
          quantite: l.quantite,
          prixUnitaire: l.prixUnitaire,
          montantTotal: l.montantTotal,
        })),
      });
      toast.success("Your proposal has been submitted for review.");
      onCreated();
      onClose();
    } catch (err) {
      toast.error("Failed to submit your proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex justify-end items-stretch">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">Propose a Quotation</h2>
              <p className="text-xs text-gray-400 font-bold">Draft your own request — a seller will review and respond</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
              <ShoppingCart className="text-secondary-mid" size={18} />
              <h3 className="text-sm font-black text-secondary uppercase tracking-tight">Add a Product</h3>
            </div>

            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-12 md:col-span-6 relative">
                <label className={labelStyles}>Product</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-300" />
                  <input
                    type="text" className={`${inputStyles} pl-9`}
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setShowResults(true); }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search product..."
                  />
                </div>
                {showResults && filteredProducts.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-56 overflow-auto">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.idProduit}
                        onClick={() => { setSelectedProduct(p); setProductSearch(p.nomProduit || ""); setShowResults(false); setSelectedSize(""); }}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-none flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                          {p.photo ? <img src={p.photo} alt={p.nomProduit} className="w-full h-full object-cover" /> : <ImageOff size={14} className="text-gray-300" />}
                        </div>
                        <span className="text-sm font-bold text-gray-700 truncate">{p.nomProduit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-span-6 md:col-span-2">
                <label className={labelStyles}>Qty</label>
                <input type="number" min={1} className={inputStyles} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              </div>

              <div className="col-span-6 md:col-span-2">
                <label className={labelStyles}>Unit Price</label>
                <div className={`${inputStyles} bg-gray-50 text-gray-500 font-black flex items-center h-[38px]`}>
                  {selectedProduct && selectedSize ? unitPrice.toLocaleString() : '--'}
                </div>
              </div>

              <div className="col-span-12 md:col-span-2 flex items-end">
                <button
                  type="button" onClick={addLine} disabled={!selectedProduct || !selectedSize}
                  className="w-full bg-secondary-mid hover:bg-secondary text-white rounded-xl h-[38px] shadow-lg disabled:opacity-30 flex items-center justify-center transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mt-6 pt-6 border-t border-gray-50">
              <div className="col-span-12 md:col-span-8">
                <label className={labelStyles}>Available Tier (based on your account)</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 min-h-[58px]">
                  {selectedProduct ? (
                    availableTiers.length > 0 ? availableTiers.map((s: any) => (
                      <button
                        key={s.size} type="button" onClick={() => setSelectedSize(s.size)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedSize === s.size ? "bg-secondary-mid text-white shadow-md scale-105" : "bg-white text-gray-400 border border-gray-100 shadow-sm"
                        }`}
                      >
                        {s.size.replace('_', ' ')}
                      </button>
                    )) : (
                      <span className="text-[10px] text-gray-400 italic font-medium">No tiers available for your account on this product.</span>
                    )
                  ) : (
                    <span className="text-[10px] text-gray-400 italic font-medium">Select a product...</span>
                  )}
                </div>
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className={labelStyles}>Selected Product</label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-100 p-2 h-[58px]">
                  {selectedProduct ? (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 border border-gray-100">
                        {selectedProduct.photo ? <img src={selectedProduct.photo} alt="" className="w-full h-full object-cover" /> : <ImageOff size={16} className="text-gray-300" />}
                      </div>
                      <span className="text-xs font-bold text-gray-600 truncate">{selectedProduct.nomProduit}</span>
                    </>
                  ) : (
                    <span className="text-[10px] text-gray-300 italic ml-2">No product selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Tier</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-center">Qty</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 text-right">Subtotal</th>
                  <th className="px-6 py-4 text-right w-16">-</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                          {line.photo ? <img src={line.photo} alt="" className="w-full h-full object-cover" /> : <ImageOff size={12} className="text-gray-300" />}
                        </div>
                        <p className="text-sm font-bold text-gray-700">{line.nomProduit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase">{line.saleSize}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-600">{line.quantite}</td>
                    <td className="px-6 py-4 text-right font-black text-secondary">{line.montantTotal.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => removeLine(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
                {lines.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-300 italic">No products added yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
              <Calculator size={18} className="text-gray-400" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase">Total HT</p>
                <p className="text-base font-black text-secondary">{montantHT.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
              <Tag size={18} className="text-emerald-500" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase">VAT</p>
                <p className="text-base font-black text-secondary">{montantTVA.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-secondary-mid/10 rounded-xl p-4 flex items-center gap-3">
              <Receipt size={18} className="text-secondary-mid" />
              <div>
                <p className="text-[9px] font-black text-secondary-mid uppercase">Total TTC</p>
                <p className="text-base font-black text-secondary-mid">{montantTTC.toLocaleString()} XAF</p>
              </div>
            </div>
          </div>

          <div>
            <label className={labelStyles}>Note for the seller (optional)</label>
            <textarea
              className={`${inputStyles} min-h-[80px]`}
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              placeholder="Anything you'd like the seller to know about this request..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</span>
            <span className="text-2xl font-black text-secondary-mid">
              {montantTTC.toLocaleString()} <small className="text-xs">XAF</small>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase transition-colors">
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={lines.length === 0 || isSubmitting}
              className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 transition-all active:scale-95"
            >
              <Save size={18} />
              {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposeQuotationModal;
