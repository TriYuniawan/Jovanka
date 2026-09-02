/** Data satu anggota keluarga dari hasil scan KK */
export interface AnggotaKeluarga {
  nama: string;
  nik: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  statusHubungan: string;
  pekerjaan: string;
}

/** Header Kartu Keluarga */
export interface HeaderKK {
  nomorKK: string;
  alamat: string;
  rt: string;
  rw: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
}

/** Struktur response lengkap dari scan KK */
export interface ScanKKResult {
  header: HeaderKK;
  anggota: AnggotaKeluarga[];
}
