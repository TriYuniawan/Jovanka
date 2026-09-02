"use client";

import { useState, useMemo } from "react";
import type { ScanKKResult, AnggotaKeluarga } from "../types/kk";

export interface FamilySelection {
  childIndex: number;
  fatherIndex: number | null;
  motherIndex: number | null;
}

interface Props {
  data: ScanKKResult;
  onConfirm: (selection: FamilySelection) => void;
}

function findSuggestion(
  anggota: AnggotaKeluarga[],
  keywords: string[]
): number | null {
  const idx = anggota.findIndex((a) =>
    keywords.some((kw) => a.statusHubungan.toLowerCase().includes(kw.toLowerCase()))
  );
  return idx >= 0 ? idx : null;
}

export default function FamilyMemberSelector({ data, onConfirm }: Props) {
  const { anggota } = data;

  const suggestedFather = useMemo(
    () => findSuggestion(anggota, ["kepala keluarga", "ayah", "bapak"]),
    [anggota]
  );
  const suggestedMother = useMemo(
    () => findSuggestion(anggota, ["istri", "ibu"]),
    [anggota]
  );

  const [childIndex, setChildIndex] = useState<number | null>(null);
  const [fatherIndex, setFatherIndex] = useState<number | null>(suggestedFather);
  const [motherIndex, setMotherIndex] = useState<number | null>(suggestedMother);

  const canConfirm = childIndex !== null;

  return (
    <div className="space-y-6">
      {/* Pilih Anak */}
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Pilih Anak yang Didaftarkan
        </h3>
        <p className="text-sm text-slate-500 mb-3">
          Pilih satu anggota keluarga sebagai siswa yang akan didaftarkan.
        </p>
        <div className="space-y-2">
          {anggota.map((a, i) => (
            <label
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                childIndex === i
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="child"
                checked={childIndex === i}
                onChange={() => setChildIndex(i)}
                className="mt-1 accent-blue-600"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {a.nama || "— nama tidak terbaca —"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    {a.statusHubungan}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  NIK: {a.nik || "—"} &middot; {a.tempatLahir || "?"}, {a.tanggalLahir || "?"}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Pilih Ayah */}
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Pilih Ayah
        </h3>
        <p className="text-sm text-slate-500 mb-3">
          {suggestedFather !== null
            ? `Disarankan: ${anggota[suggestedFather].nama} (${anggota[suggestedFather].statusHubungan}). Bisa diganti jika perlu.`
            : "Tidak ditemukan anggota berstatus 'Kepala Keluarga'. Pilih secara manual atau kosongkan."}
        </p>
        <select
          value={fatherIndex ?? ""}
          onChange={(e) =>
            setFatherIndex(e.target.value === "" ? null : Number(e.target.value))
          }
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">— Tidak ada ayah (opsional) —</option>
          {anggota.map((a, i) => (
            <option key={i} value={i}>
              {a.nama || "— nama tidak terbaca —"} ({a.statusHubungan})
            </option>
          ))}
        </select>
      </div>

      {/* Pilih Ibu */}
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Pilih Ibu
        </h3>
        <p className="text-sm text-slate-500 mb-3">
          {suggestedMother !== null
            ? `Disarankan: ${anggota[suggestedMother].nama} (${anggota[suggestedMother].statusHubungan}). Bisa diganti jika perlu.`
            : "Tidak ditemukan anggota berstatus 'Istri/Ibu'. Pilih secara manual atau kosongkan."}
        </p>
        <select
          value={motherIndex ?? ""}
          onChange={(e) =>
            setMotherIndex(e.target.value === "" ? null : Number(e.target.value))
          }
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">— Tidak ada ibu (opsional) —</option>
          {anggota.map((a, i) => (
            <option key={i} value={i}>
              {a.nama || "— nama tidak terbaca —"} ({a.statusHubungan})
            </option>
          ))}
        </select>
      </div>

      {/* Confirm */}
      <button
        type="button"
        disabled={!canConfirm}
        onClick={() =>
          onConfirm({
            childIndex: childIndex!,
            fatherIndex,
            motherIndex,
          })
        }
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Konfirmasi & Lanjutkan ke Formulir
      </button>
    </div>
  );
}
