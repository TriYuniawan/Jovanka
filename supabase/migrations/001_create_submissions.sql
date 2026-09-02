-- Jalankan SQL ini di Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- Tabel untuk menyimpan formulir pendaftaran siswa baru

CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Identitas Anak
  nama_anak TEXT NOT NULL,
  nik_anak TEXT NOT NULL,
  jk_anak TEXT NOT NULL,
  ttl_anak TEXT NOT NULL,
  nama_ayah TEXT NOT NULL,
  nama_ibu TEXT NOT NULL,
  alamat TEXT NOT NULL,
  nomor_kk TEXT NOT NULL,
  anak_ke INTEGER,
  jumlah_saudara INTEGER,
  umur TEXT,

  -- Identitas Ayah
  nik_ayah TEXT NOT NULL,
  ttl_ayah TEXT NOT NULL,
  pekerjaan_ayah TEXT,

  -- Identitas Ibu
  nik_ibu TEXT NOT NULL,
  ttl_ibu TEXT NOT NULL,
  pekerjaan_ibu TEXT,

  -- Field Manual
  nomor_hp_ayah TEXT,
  nomor_hp_ibu TEXT,
  alamat_domisili TEXT,
  nis TEXT,
  nisn TEXT,
  asal_sekolah TEXT NOT NULL,
  kelas TEXT NOT NULL,
  agama TEXT NOT NULL,
  penghasilan_ayah TEXT,
  penghasilan_ibu TEXT,
  hobi TEXT,
  cita_cita TEXT,
  catatan_khusus TEXT
);

-- Index untuk pencarian berdasarkan nama anak dan NIK
CREATE INDEX IF NOT EXISTS idx_submissions_nama_anak ON submissions(nama_anak);
CREATE INDEX IF NOT EXISTS idx_submissions_nik_anak ON submissions(nik_anak);

-- Row Level Security (RLS) — untuk saat ini izinkan insert dari anon
-- TODO: tambah auth panitia untuk select di versi berikutnya
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: siapa saja bisa insert (self-service pendaftaran)
CREATE POLICY "Allow anonymous insert" ON submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: hanya authenticated (panitia) yang bisa select
CREATE POLICY "Allow authenticated select" ON submissions
  FOR SELECT
  TO authenticated
  USING (true);
