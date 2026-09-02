import { z } from "zod";

/** Regex nomor HP Indonesia: 08xx, +628xx, 628xx */
const phoneRegex = /^(?:\+?62|0)8\d{7,12}$/;

/** 16 digit numerik (NIK / Nomor KK) */
const sixteenDigits = /^\d{16}$/;

export const formSchema = z.object({
  // === Identitas Anak (dari KK) ===
  namaAnak: z.string().min(1, "Nama anak wajib diisi"),
  nikAnak: z.string().min(1, "NIK anak wajib diisi"),
  jkAnak: z.string().min(1, "Jenis kelamin wajib dipilih"),
  ttlAnak: z.string().min(1, "Tempat/tanggal lahir wajib diisi"),
  namaAyah: z.string().min(1, "Nama ayah wajib diisi"),
  namaIbu: z.string().min(1, "Nama ibu wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  nomorKK: z.string().min(1, "Nomor KK wajib diisi"),

  // === Identitas Ayah (dari KK) ===
  nikAyah: z.string().min(1, "NIK ayah wajib diisi"),
  ttlAyah: z.string().min(1, "Tempat/tanggal lahir ayah wajib diisi"),
  pekerjaanAyah: z.string().optional().default(""),

  // === Identitas Ibu (dari KK) ===
  nikIbu: z.string().min(1, "NIK ibu wajib diisi"),
  ttlIbu: z.string().min(1, "Tempat/tanggal lahir ibu wajib diisi"),
  pekerjaanIbu: z.string().optional().default(""),

  // === Field Manual (section 6.3) ===
  nomorHPAyah: z.string().optional().default(""),
  nomorHPIbu: z.string().optional().default(""),
  alamatDomisili: z.string().optional().default(""),
  nis: z.string().optional().default(""),
  nisn: z.string().optional().default(""),
  asalSekolah: z.string().min(1, "Asal sekolah wajib diisi"),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  agama: z.string().min(1, "Agama wajib dipilih"),
  penghasilanAyah: z.string().optional().default(""),
  penghasilanIbu: z.string().optional().default(""),
  hobi: z.string().optional().default(""),
  citaCita: z.string().optional().default(""),
  catatanKhusus: z.string().optional().default(""),
});

export type FormValues = z.infer<typeof formSchema>;

/**
 * Validasi NIK/nomor KK: peringatan (bukan blokir) jika bukan 16 digit.
 * Dipanggil terpisah dari schema karena sifatnya warning, bukan error.
 */
export function nikWarning(nik: string): string | undefined {
  if (!nik) return undefined;
  const digits = nik.replace(/\D/g, "");
  if (digits.length !== 16) {
    return `NIK harus 16 digit (saat ini: ${digits.length} digit)`;
  }
  return undefined;
}
