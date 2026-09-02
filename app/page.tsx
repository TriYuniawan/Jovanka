"use client";

import { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import FamilyMemberSelector from "./components/FamilyMemberSelector";
import type { FamilySelection } from "./components/FamilyMemberSelector";
import RegistrationForm from "./components/RegistrationForm";
import type { ScanKKResult } from "./types/kk";

export default function Home() {
  const [scanResult, setScanResult] = useState<ScanKKResult | null>(null);
  const [selection, setSelection] = useState<FamilySelection | null>(null);

  return (
    <div className="flex flex-col flex-1 items-center bg-slate-50">
      <main className="flex flex-1 w-full max-w-lg flex-col px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Formulir Pendaftaran Siswa Baru
          </h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Unggah foto Kartu Keluarga (KK) untuk mengisi data secara otomatis
          </p>
        </div>

        {/* Step 1: Upload & Scan */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            1. Upload Kartu Keluarga
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Pilih foto KK dari galeri atau ambil foto langsung dari kamera
          </p>
          <ImageUploader onScanComplete={setScanResult} />
        </section>

        {/* Step 2: Pilih Anggota Keluarga */}
        {scanResult && (
          <section className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              2. Pilih Anak & Orang Tua
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Pilih anak yang didaftarkan dan konfirmasi ayah/ibu dari hasil scan.
            </p>
            <FamilyMemberSelector
              data={scanResult}
              onConfirm={setSelection}
            />
          </section>
        )}

        {/* Step 3: Formulir Auto-fill */}
        {scanResult && selection && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 text-center">
              3. Formulir Pendaftaran
            </h2>
            <RegistrationForm data={scanResult} selection={selection} />
          </section>
        )}

        {/* Info */}
        {!scanResult && (
          <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800 leading-relaxed">
                <p className="font-medium mb-1">Tips foto KK yang baik:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                  <li>Pastikan seluruh KK terlihat jelas dan tidak terpotong</li>
                  <li>Hindari bayangan atau pantulan cahaya</li>
                  <li>Gunakan pencahayaan yang cukup</li>
                  <li>Teks harus terbaca dengan jelas</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


