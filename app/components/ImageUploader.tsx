"use client";

import { useCallback, useRef, useState } from "react";
import type { ScanKKResult } from "../types/kk";

/** Compress & resize image using canvas. Returns base64 without prefix. */
function compressImage(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl.split(",")[1]);
    };
    img.onerror = () => reject(new Error("Gagal memuat gambar"));
    img.src = URL.createObjectURL(file);
  });
}

interface ImageUploaderProps {
  onScanComplete?: (result: ScanKKResult) => void;
}

export default function ImageUploader({ onScanComplete }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanKKResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setFileName(f.name);
    setPreviewUrl(URL.createObjectURL(f));
    setScanResult(null);
    setScanError(null);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName(null);
    setFile(null);
    setScanResult(null);
    setScanError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }, [previewUrl]);

  const handleScan = useCallback(async () => {
    if (!file) return;
    setScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      // Compress gambar sebelum kirim (max 1024px, quality 80%)
      const compressedBase64 = await compressImage(file, 1024, 0.8);

      const res = await fetch("/api/scan-kk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: compressedBase64,
          mimeType: "image/jpeg",
        }),
      });

      // Handle non-JSON response (misal 413 dari Vercel)
      const text = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server mengembalikan response tidak valid (${res.status})`);
      }

      if (!res.ok) {
        const errData = data as { error?: string };
        throw new Error(errData.error || `Error ${res.status}`);
      }

      const result = data as ScanKKResult;
      setScanResult(result);
      onScanComplete?.(result);
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat scan"
      );
    } finally {
      setScanning(false);
    }
  }, [file, onScanComplete]);

  if (previewUrl) {
    return (
      <div className="space-y-4">
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview Kartu Keluarga"
            className="w-full h-auto max-h-[70vh] object-contain"
          />
          {!scanning && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-700 rounded-full p-2 shadow-md transition-colors cursor-pointer"
              aria-label="Hapus gambar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {fileName && (
          <p className="text-sm text-slate-500 text-center truncate px-4">{fileName}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {!scanResult ? (
            <button
              type="button"
              onClick={handleScan}
              disabled={scanning}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {scanning ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memindai...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Scan Kartu Keluarga
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setScanResult(null); handleScan(); }}
              disabled={scanning}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Scan Ulang
            </button>
          )}
          <button
            type="button"
            onClick={handleRemove}
            disabled={scanning}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Ganti
          </button>
        </div>

        {/* Success */}
        {scanResult && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Scan berhasil — {scanResult.anggota.length} anggota keluarga terdeteksi. Silakan lanjutkan di bawah.</span>
          </div>
        )}

        {/* Error */}
        {scanError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            <p className="font-medium mb-1">Gagal memindai:</p>
            <p>{scanError}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3
          min-h-[220px] p-8 rounded-xl border-2 border-dashed cursor-pointer
          transition-colors
          ${isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/50"
          }
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${isDragging ? "text-blue-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <div className="text-center">
          <p className="text-slate-700 font-medium">
            {isDragging ? "Lepaskan gambar di sini" : "Seret & lepaskan foto Kartu Keluarga di sini"}
          </p>
          <p className="text-sm text-slate-500 mt-1">Format: JPG, PNG</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Pilih File
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Buka Kamera
        </button>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
    </div>
  );
}

