"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Package, Tag, Barcode, Ruler,
  CheckCircle2, XCircle, ChevronRight, MoreVertical, ImagePlus, SlidersHorizontal
} from "lucide-react";
import { MediaService, ProductsService, ProductResponse } from "@/src/src2/api";
import { getStoredSeller } from "@/src/api/session";
import { toast } from "sonner";
import TableSkeleton from "@/components/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import ActionButton from "@/components/ActionButton";
import UploadProductPhotoModal from "./UploadProductPhotoModal";
import SaleSizeConfigModal from "./SaleSizeConfigModal";

const COLUMNS = ["Product", "Category", "Reference", "Unit Price", "Stock", "Status", ""];
const MEDIA_FILE_URL = (fileId: string) => `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/media/files/${fileId}`;

const ProductsAdminPage = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [photoByProductId, setPhotoByProductId] = useState<Record<string, string>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [photoProduct, setPhotoProduct] = useState<ProductResponse | null>(null);
  const [saleSizeProduct, setSaleSizeProduct] = useState<ProductResponse | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProductPhotos = useCallback(async (productList: ProductResponse[]) => {
    const entries = await Promise.all(
      productList.map(async (p) => {
        if (!p.idProduit) return null;
        try {
          const assets = await MediaService.getMediaAssets("PRODUCT", p.idProduit);
          const latest = assets[assets.length - 1];
          return latest?.fileId ? [p.idProduit, latest.fileId] as const : null;
        } catch {
          return null;
        }
      })
    );
    setPhotoByProductId(Object.fromEntries(entries.filter((e): e is readonly [string, string] => e !== null)));
  }, []);

  const fetchProducts = useCallback(async () => {
    const seller = getStoredSeller();
    if (!seller?.organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await ProductsService.getProductsByOrganization(seller.organizationId);
      setProducts(res);
      fetchProductPhotos(res);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchProductPhotos]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePhotoModalClose = (uploaded: boolean, fileId?: string, photoUrl?: string) => {
    const productId = photoProduct?.idProduit;
    setPhotoProduct(null);
    if (uploaded && productId && fileId) {
      setPhotoByProductId((prev) => ({ ...prev, [productId]: fileId }));
      setProducts((prev) => prev.map((p) => (p.idProduit === productId ? { ...p, photo: photoUrl ?? p.photo } : p)));
    }
  };

  const handleSaleSizeModalClose = (updated: boolean, saleSizes?: ProductResponse["allowedSaleSizes"]) => {
    const productId = saleSizeProduct?.idProduit;
    setSaleSizeProduct(null);
    if (updated && productId && saleSizes) {
      setProducts((prev) => prev.map((p) => (p.idProduit === productId ? { ...p, allowedSaleSizes: saleSizes } : p)));
    }
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      [p.nomProduit, p.reference, p.categorie, p.codeBarre].some((v) => v?.toLowerCase().includes(term))
    );
  }, [products, search]);

  const activeCount = useMemo(() => products.filter((p) => p.active).length, [products]);
  const outOfStockCount = useMemo(() => products.filter((p) => (p.stockQuantity ?? 0) <= 0).length, [products]);

  return (
    <div className="p-8 bg-secondary-background min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-secondary-gray mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest">Organization</span>
            <ChevronRight size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-mid">Products</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Products</h1>
          <p className="text-secondary-gray text-sm font-medium">
            Product catalog for your organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <Package size={16} className="text-secondary-mid" />
            <span className="text-xs font-black text-primary">{products.length}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Products</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs font-black text-primary">{activeCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-light rounded-xl shadow-sm">
            <XCircle size={16} className="text-red-400" />
            <span className="text-xs font-black text-primary">{outOfStockCount}</span>
            <span className="text-[10px] font-bold text-secondary-gray uppercase tracking-widest">Out of Stock</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-secondary-light mb-6">
        <div className="relative group max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-gray group-focus-within:text-secondary-mid transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by name, reference or barcode..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary-background border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-secondary-mid/20 focus:border-secondary-mid transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-secondary-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-super-light/30 border-b border-secondary-light">
                {COLUMNS.map((col) => (
                  <th key={col} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-gray whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <TableSkeleton cols={COLUMNS.length} />
              ) : filteredProducts.length === 0 ? (
                <EmptyState title="No products found" message="Try adjusting your search." />
              ) : (
                filteredProducts.map((product) => {
                  const photoFileId = product.idProduit ? photoByProductId[product.idProduit] : undefined;
                  const photoUrl = photoFileId ? MEDIA_FILE_URL(photoFileId) : product.photo;
                  return (
                  <tr key={product.idProduit} className="hover:bg-secondary-super-light/40 transition-all group border-l-4 border-l-transparent hover:border-l-secondary-mid">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        {photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photoUrl} alt={product.nomProduit ?? ""} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-secondary-light" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-secondary-super-light flex items-center justify-center shrink-0">
                            <Package size={16} className="text-secondary-mid" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-black text-primary group-hover:text-secondary-mid transition-colors">{product.nomProduit}</span>
                          {product.uom && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-secondary-gray">
                              <Ruler size={10} /> {product.uom}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-secondary-super-light text-secondary-mid rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Tag size={11} /> {product.categorie || "-"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1 text-[11px] font-bold text-secondary-gray">
                        {product.reference && <span>{product.reference}</span>}
                        {product.codeBarre && (
                          <span className="flex items-center gap-1"><Barcode size={10} /> {product.codeBarre}</span>
                        )}
                        {!product.reference && !product.codeBarre && "-"}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-black text-primary">
                        {product.prixVente?.toLocaleString() ?? "0"} <span className="text-[10px] text-secondary-gray uppercase">XAF</span>
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-bold ${(product.stockQuantity ?? 0) <= 0 ? "text-red-500" : "text-primary"}`}>
                        {product.stockQuantity ?? "-"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {product.active ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={11} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 w-fit bg-red-50 text-red-500 border border-red-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <XCircle size={11} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === product.idProduit ? null : (product.idProduit ?? null))}
                        className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === product.idProduit && (
                        <div ref={menuRef} className="absolute right-16 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-100 rounded-2xl shadow-2xl p-1.5 flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                          <ActionButton
                            label="Add Photo"
                            onClick={() => {
                              setPhotoProduct(product);
                              setActiveMenuId(null);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-secondary-mid"
                          >
                            <ImagePlus size={14} />
                          </ActionButton>
                          <ActionButton
                            label="Sale Sizes"
                            onClick={() => {
                              setSaleSizeProduct(product);
                              setActiveMenuId(null);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-secondary-mid"
                          >
                            <SlidersHorizontal size={14} />
                          </ActionButton>
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UploadProductPhotoModal isOpen={!!photoProduct} product={photoProduct} onClose={handlePhotoModalClose} />
      <SaleSizeConfigModal isOpen={!!saleSizeProduct} product={saleSizeProduct} onClose={handleSaleSizeModalClose} />
    </div>
  );
};

export default ProductsAdminPage;
