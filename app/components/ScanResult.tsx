"use client";

import type { ScanKKResult, AnggotaKeluarga, HeaderKK } from "../types/kk";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</dt>
      <dd className={`mt-0.5 text-sm ${value ? "text-slate-900" : "text-slate-400 italic"}`}>
        {value || "— tidak terbaca —"}
      </dd>
    </div>
  );
}

function HeaderSection({ header }: { header: HeaderKK }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Header Kartu Keluarga
      </h4>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="col-span-2">
          <Field label="Nomor KK" value={header.nomorKK} />
        </div>
        <div className="col-span-2">
          <Field label="Alamat" value={header.alamat} />
        </div>
        <Field label="RT" value={header.rt} />
        <Field label="RW" value={header.rw} />
        <Field label="Desa/Kelurahan" value={header.desaKelurahan} />
        <Field label="Kecamatan" value={header.kecamatan} />
        <Field label="Kabupaten/Kota" value={header.kabupatenKota} />
        <Field label="Provinsi" value={header.provinsi} />
        <Field label="Kode Pos" value={header.kodePos} />
      </dl>
    </div>
  );
}

function AnggotaTable({ anggota }: { anggota: AnggotaKeluarga[] }) {
  if (!anggota || anggota.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic">Tidak ada anggota keluarga yang terdeteksi.</p>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Anggota Keluarga ({anggota.length})
      </h4>
      <div className="space-y-3">
        {anggota.map((a, i) => (
          <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-800">{a.nama || "— nama tidak terbaca —"}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                {a.statusHubungan || "?"}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <Field label="NIK" value={a.nik} />
              <Field label="Jenis Kelamin" value={a.jenisKelamin} />
              <Field label="Tempat Lahir" value={a.tempatLahir} />
              <Field label="Tanggal Lahir" value={a.tanggalLahir} />
              <Field label="Pekerjaan" value={a.pekerjaan} />
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScanResult({ data }: { data: ScanKKResult }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
      <div className="flex items-center gap-2 text-green-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-semibold">Hasil Scan Berhasil</span>
      </div>

      <HeaderSection header={data.header} />
      <AnggotaTable anggota={data.anggota} />

      <p className="text-xs text-slate-500 leading-relaxed">
        ⚠️ Hasil scan mungkin tidak 100% akurat. Silakan periksa kembali setiap field, terutama <strong>NIK</strong> dan <strong>Nomor KK</strong>.
      </p>
    </div>
  );
}
