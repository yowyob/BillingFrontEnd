"use client";

import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { ImagePlus, Save } from "lucide-react";
import { ApiError, MediaService, ProductResponse, ProductsService } from "@/src/src2/api";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: (uploaded: boolean, fileId?: string, photoUrl?: string) => void;
  product: ProductResponse | null;
}

const MEDIA_FILE_URL = (fileId: string) => `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/media/files/${fileId}`;

const UploadProductPhotoModal = ({ isOpen, onClose, product }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFile(null);
      setPreviewUrl(null);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleFileChange = (selected: File | null) => {
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  };

  const handleSave = async () => {
    if (!file || !product?.idProduit) return;
    setIsSaving(true);
    try {
      const stored = await MediaService.uploadFile(undefined, { file });
      if (!stored.id) throw new Error("Upload succeeded but no file id was returned.");
      const photoUrl = MEDIA_FILE_URL(stored.id);
      await Promise.all([
        MediaService.createMediaAsset({
          targetType: "PRODUCT",
          targetId: product.idProduit,
          fileId: stored.id,
          mimeType: stored.contentType,
          position: 0,
          altText: product.nomProduit,
        }),
        ProductsService.updatePhoto(product.idProduit, { photo: photoUrl }),
      ]);
      toast.success("Product photo uploaded successfully.");
      onClose(true, stored.id, photoUrl);
    } catch (error) {
      const message = error instanceof ApiError ? (error.body?.message ?? error.message) : "Failed to upload photo. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end items-stretch">
      {/* Background Overlay */}
      <div className="absolute inset-0" onClick={() => onClose(false)} />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* HEADER */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-super-light rounded-lg text-secondary-mid">
              <ImagePlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary uppercase tracking-tight">Product Photo</h2>
              <p className="text-xs text-gray-400 font-bold">{product.nomProduit}</p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon className="text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-5 bg-gray-50/50">
          <label
            htmlFor="product-photo-input"
            className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-dashed border-gray-200 hover:border-secondary-mid rounded-2xl p-8 cursor-pointer transition-colors"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-xl object-cover border border-secondary-light" />
            ) : (
              <div className="w-32 h-32 rounded-xl bg-secondary-super-light flex items-center justify-center">
                <ImagePlus size={32} className="text-secondary-mid" />
              </div>
            )}
            <span className="text-sm font-bold text-secondary-mid">{file ? file.name : "Click to select an image"}</span>
            <span className="text-xs text-gray-400 font-medium">PNG, JPG up to 10MB</span>
            <input
              id="product-photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-end items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button
            onClick={() => onClose(false)}
            className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 uppercase transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !file}
            className="flex items-center gap-2 bg-secondary-mid hover:bg-secondary text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            <Save size={18} />
            {isSaving ? "UPLOADING…" : "UPLOAD PHOTO"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadProductPhotoModal;
