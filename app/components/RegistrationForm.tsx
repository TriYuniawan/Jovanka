"use client";

import { useMemo, useState } from "react";
import type { ScanKKResult, AnggotaKeluarga, HeaderKK } from "../types/kk";
import type { FamilySelection } from "./FamilyMemberSelector";
import { formSchema, nikWarning } from "../lib/validation";
import type { FormValues } from "../lib/validation";

interface Props {
  data: ScanKKResult;
  selection: FamilySelection;
  onSubmit?: (values: FormValues) => void;
}

function parseDate(str: string): Date | null {
  if (!str) return null;
  const parts = str.split("-");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return isNaN(d.getTime()) ? null : d;
}

function calcAge(birthDateStr: string): string {
  const birth = parseDate(birthDateStr);
  if (!birth) return "";
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} tahun`);
  if (months > 0) parts.push(`${months} bulan`);
  return parts.length > 0 ? parts.join(" ") : "0 bulan";
}

function buildAlamat(h: HeaderKK): string {
  return [
    h.alamat,
    h.rt && h.rw ? `RT ${h.rt}/RW ${h.rw}` : "",
    h.desaKelurahan, h.kecamatan, h.kabupatenKota, h.provinsi, h.kodePos,
  ].filter(Boolean).join(", ");
}

function calcChildStats(anggota: AnggotaKeluarga[], childIndex: number) {
  const anakList = anggota
    .map((a, i) => ({ ...a, idx: i }))
    .filter((a) => a.statusHubungan.toLowerCase().includes("anak"))
    .sort((a, b) => {
      const da = parseDate(a.tanggalLahir);
      const db = parseDate(b.tanggalLahir);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.getTime() - db.getTime();
    });
  const pos = anakList.findIndex((a) => a.idx === childIndex);
  return { anakKe: pos >= 0 ? pos + 1 : 0, jumlahSaudara: Math.max(0, anakList.length - 1) };
}

function FieldInput({ label, value, onChange, required, warn, readOnly, placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; warn?: string; readOnly?: boolean; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          readOnly ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-white border-slate-300 text-slate-800"
        } ${error ? "border-red-400 bg-red-50" : warn ? "border-amber-400 bg-amber-50" : ""}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {!error && warn && <p className="text-xs text-amber-600 mt-1">⚠ {warn}</p>}
    </div>
  );
}

export default function RegistrationForm({ data, selection, onSubmit }: Props) {
  const { anggota, header } = data;
  const child = anggota[selection.childIndex];
  const father = selection.fatherIndex !== null ? anggota[selection.fatherIndex] : null;
  const mother = selection.motherIndex !== null ? anggota[selection.motherIndex] : null;

  const alamatLengkap = useMemo(() => buildAlamat(header), [header]);
  const { anakKe, jumlahSaudara } = useMemo(
    () => calcChildStats(anggota, selection.childIndex),
    [anggota, selection.childIndex]
  );
  const umur = useMemo(() => calcAge(child.tanggalLahir), [child.tanggalLahir]);

  // Identitas Anak
  const [namaAnak, setNamaAnak] = useState(child.nama);
  const [nikAnak, setNikAnak] = useState(child.nik);
  const [jkAnak, setJkAnak] = useState(child.jenisKelamin);
  const [ttlAnak, setTtlAnak] = useState([child.tempatLahir, child.tanggalLahir].filter(Boolean).join(", "));
  const [namaAyah, setNamaAyah] = useState(father?.nama ?? "");
  const [namaIbu, setNamaIbu] = useState(mother?.nama ?? "");
  const [alamat, setAlamat] = useState(alamatLengkap);
  const [nomorKK, setNomorKK] = useState(header.nomorKK);

  // Identitas Ayah
  const [nikAyah, setNikAyah] = useState(father?.nik ?? "");
  const [ttlAyah, setTtlAyah] = useState(father ? [father.tempatLahir, father.tanggalLahir].filter(Boolean).join(", ") : "");
  const [pekerjaanAyah, setPekerjaanAyah] = useState(father?.pekerjaan ?? "");

  // Identitas Ibu
  const [nikIbu, setNikIbu] = useState(mother?.nik ?? "");
  const [ttlIbu, setTtlIbu] = useState(mother ? [mother.tempatLahir, mother.tanggalLahir].filter(Boolean).join(", ") : "");
  const [pekerjaanIbu, setPekerjaanIbu] = useState(mother?.pekerjaan ?? "");

  // Field Manual (section 6.3)
  const [nomorHPAyah, setNomorHPAyah] = useState("");
  const [nomorHPIbu, setNomorHPIbu] = useState("");
  const [alamatDomisili, setAlamatDomisili] = useState("");
  const [nis, setNis] = useState("");
  const [nisn, setNisn] = useState("");
  const [asalSekolah, setAsalSekolah] = useState("");
  const [kelas, setKelas] = useState("");
  const [agama, setAgama] = useState("");
  const [penghasilanAyah, setPenghasilanAyah] = useState("");
  const [penghasilanIbu, setPenghasilanIbu] = useState("");
  const [hobi, setHobi] = useState("");
  const [citaCita, setCitaCita] = useState("");
  const [catatanKhusus, setCatatanKhusus] = useState("");

  // Validasi
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const values = {
      namaAnak, nikAnak, jkAnak, ttlAnak, namaAyah, namaIbu, alamat, nomorKK,
      nikAyah, ttlAyah, pekerjaanAyah,
      nikIbu, ttlIbu, pekerjaanIbu,
      nomorHPAyah, nomorHPIbu, alamatDomisili, nis, nisn, asalSekolah, kelas, agama,
      penghasilanAyah, penghasilanIbu, hobi, citaCita, catatanKhusus,
    };
    const result = formSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      const firstErrorEl = document.querySelector('[data-error="true"]');
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result.data,
          anakKe: anakKe > 0 ? anakKe : null,
          jumlahSaudara,
          umur: umur || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }
      setSubmitted(true);
      onSubmit?.(result.data);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Identitas Anak */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Identitas Anak</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2" data-error={!!errors.namaAnak || undefined}>
            <FieldInput label="Nama Anak" value={namaAnak} onChange={setNamaAnak} required error={errors.namaAnak} />
          </div>
          <div data-error={!!errors.nikAnak || undefined}>
            <FieldInput label="NIK Anak" value={nikAnak} onChange={setNikAnak} required warn={nikWarning(nikAnak)} error={errors.nikAnak} />
          </div>
          <div data-error={!!errors.jkAnak || undefined}>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <select value={jkAnak} onChange={(e) => setJkAnak(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.jkAnak ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}>
              <option value="">— Pilih —</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            {errors.jkAnak && <p className="text-xs text-red-600 mt-1">{errors.jkAnak}</p>}
          </div>
          <div data-error={!!errors.ttlAnak || undefined}>
            <FieldInput label="Tempat, Tanggal Lahir" value={ttlAnak} onChange={setTtlAnak} required placeholder="Contoh: Jakarta, 15-08-2015" error={errors.ttlAnak} />
          </div>
          <div data-error={!!errors.namaAyah || undefined}>
            <FieldInput label="Nama Ayah" value={namaAyah} onChange={setNamaAyah} required error={errors.namaAyah} />
          </div>
          <div data-error={!!errors.namaIbu || undefined}>
            <FieldInput label="Nama Ibu" value={namaIbu} onChange={setNamaIbu} required error={errors.namaIbu} />
          </div>
          <div className="sm:col-span-2" data-error={!!errors.alamat || undefined}>
            <FieldInput label="Alamat Lengkap" value={alamat} onChange={setAlamat} required error={errors.alamat} />
          </div>
          <div data-error={!!errors.nomorKK || undefined}>
            <FieldInput label="Nomor KK" value={nomorKK} onChange={setNomorKK} required warn={nikWarning(nomorKK)} error={errors.nomorKK} />
          </div>
          <FieldInput label="Anak Ke-" value={anakKe > 0 ? String(anakKe) : ""} onChange={() => {}} readOnly placeholder="Otomatis" />
          <FieldInput label="Jumlah Saudara Kandung" value={String(jumlahSaudara)} onChange={() => {}} readOnly />
          <FieldInput label="Umur" value={umur} onChange={() => {}} readOnly />
        </div>
      </section>

      {/* Identitas Ayah */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Identitas Ayah
          {!father && <span className="text-sm font-normal text-slate-400 ml-2">(tidak dipilih)</span>}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div data-error={!!errors.namaAyah || undefined}>
            <FieldInput label="Nama" value={namaAyah} onChange={setNamaAyah} required error={errors.namaAyah} />
          </div>
          <div data-error={!!errors.nikAyah || undefined}>
            <FieldInput label="NIK" value={nikAyah} onChange={setNikAyah} required warn={nikWarning(nikAyah)} error={errors.nikAyah} />
          </div>
          <div data-error={!!errors.ttlAyah || undefined}>
            <FieldInput label="Tempat, Tanggal Lahir" value={ttlAyah} onChange={setTtlAyah} required error={errors.ttlAyah} />
          </div>
          <FieldInput label="Pekerjaan" value={pekerjaanAyah} onChange={setPekerjaanAyah} />
        </div>
      </section>

      {/* Identitas Ibu */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Identitas Ibu
          {!mother && <span className="text-sm font-normal text-slate-400 ml-2">(tidak dipilih)</span>}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div data-error={!!errors.namaIbu || undefined}>
            <FieldInput label="Nama" value={namaIbu} onChange={setNamaIbu} required error={errors.namaIbu} />
          </div>
          <div data-error={!!errors.nikIbu || undefined}>
            <FieldInput label="NIK" value={nikIbu} onChange={setNikIbu} required warn={nikWarning(nikIbu)} error={errors.nikIbu} />
          </div>
          <div data-error={!!errors.ttlIbu || undefined}>
            <FieldInput label="Tempat, Tanggal Lahir" value={ttlIbu} onChange={setTtlIbu} required error={errors.ttlIbu} />
          </div>
          <FieldInput label="Pekerjaan" value={pekerjaanIbu} onChange={setPekerjaanIbu} />
        </div>
      </section>

      {/* Data Tambahan (Manual) */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Data Tambahan</h3>
        <p className="text-sm text-slate-500">Field berikut tidak ada di KK dan harus diisi manual.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput label="Nomor HP Ayah" value={nomorHPAyah} onChange={setNomorHPAyah} placeholder="Contoh: 08123456789 (opsional)" />
          <FieldInput label="Nomor HP Ibu" value={nomorHPIbu} onChange={setNomorHPIbu} placeholder="Contoh: 08123456789 (opsional)" />
          <div data-error={!!errors.agama || undefined}>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Agama <span className="text-red-500">*</span>
            </label>
            <select value={agama} onChange={(e) => setAgama(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.agama ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}`}>
              <option value="">— Pilih —</option>
              {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.agama && <p className="text-xs text-red-600 mt-1">{errors.agama}</p>}
          </div>
          <div data-error={!!errors.nis || undefined}>
            <FieldInput label="NIS" value={nis} onChange={setNis} placeholder="Nomor Induk Siswa (opsional)" error={errors.nis} />
          </div>
          <div data-error={!!errors.nisn || undefined}>
            <FieldInput label="NISN" value={nisn} onChange={setNisn} placeholder="Nomor Induk Siswa Nasional (opsional)" error={errors.nisn} />
          </div>
          <div data-error={!!errors.asalSekolah || undefined}>
            <FieldInput label="Asal Sekolah" value={asalSekolah} onChange={setAsalSekolah} required error={errors.asalSekolah} />
          </div>
          <div data-error={!!errors.kelas || undefined}>
            <FieldInput label="Kelas yang Didaftar" value={kelas} onChange={setKelas} required placeholder="Contoh: Kelas 1" error={errors.kelas} />
          </div>
          <div className="sm:col-span-2">
            <FieldInput label="Alamat Domisili" value={alamatDomisili} onChange={setAlamatDomisili} placeholder="Isi hanya jika berbeda dari alamat KK" />
          </div>
          <FieldInput label="Penghasilan Ayah" value={penghasilanAyah} onChange={setPenghasilanAyah} placeholder="Opsional" />
          <FieldInput label="Penghasilan Ibu" value={penghasilanIbu} onChange={setPenghasilanIbu} placeholder="Opsional" />
          <FieldInput label="Hobi Anak" value={hobi} onChange={setHobi} placeholder="Opsional" />
          <FieldInput label="Cita-cita Anak" value={citaCita} onChange={setCitaCita} placeholder="Opsional" />
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Catatan Khusus</label>
            <textarea value={catatanKhusus} onChange={(e) => setCatatanKhusus(e.target.value)} rows={3}
              placeholder="Kebutuhan khusus, alergi, dll (opsional)"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="space-y-3">
        {Object.keys(errors).length > 0 && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            <p className="font-medium">Terdapat {Object.keys(errors).length} field yang belum valid. Silakan periksa kembali.</p>
          </div>
        )}
        {submitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            <p className="font-medium mb-1">Gagal menyimpan:</p>
            <p>{submitError}</p>
          </div>
        )}
        {submitted ? (
          <div className="p-6 rounded-xl bg-green-50 border border-green-200 text-center space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold text-green-800">Formulir Berhasil Disimpan!</p>
            <p className="text-sm text-green-700">Data pendaftaran telah tersimpan. Terima kasih.</p>
          </div>
        ) : (
          <>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Formulir
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center">
              Pastikan semua data sudah benar sebelum menyimpan.
            </p>
          </>
        )}
      </div>
    </form>
  );
}
