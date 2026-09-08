import { NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { appendToSheet } from "@/app/lib/google-sheets";
import { formSchema } from "@/app/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi server-side dengan Zod
    const result = formSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = issue.message;
      }
      return NextResponse.json(
        { error: "Validasi gagal", fields: errors },
        { status: 400 },
      );
    }

    const d = result.data;
    const { anakKe, jumlahSaudara, umur: umurVal, tahunAjaran } = body;

    // 1. Simpan ke Supabase
    const { error: dbError } = await getSupabase()
      .from("submissions")
      .insert({
        nama_anak: d.namaAnak,
        nik_anak: d.nikAnak,
        jk_anak: d.jkAnak,
        ttl_anak: d.ttlAnak,
        nama_ayah: d.namaAyah,
        nama_ibu: d.namaIbu,
        alamat: d.alamat,
        nomor_kk: d.nomorKK,
        anak_ke: anakKe ?? null,
        jumlah_saudara: jumlahSaudara ?? null,
        umur: umurVal ?? null,
        tahun_ajaran: tahunAjaran ?? null,
        nik_ayah: d.nikAyah,
        ttl_ayah: d.ttlAyah,
        pekerjaan_ayah: d.pekerjaanAyah || null,
        pendidikan_ayah: d.pendidikanAyah || null,
        nik_ibu: d.nikIbu,
        ttl_ibu: d.ttlIbu,
        pekerjaan_ibu: d.pekerjaanIbu || null,
        pendidikan_ibu: d.pendidikanIbu || null,
        nomor_hp_ayah: d.nomorHPAyah || null,
        nomor_hp_ibu: d.nomorHPIbu || null,
        alamat_domisili: d.alamatDomisili || null,
        nis: d.nis || null,
        nisn: d.nisn || null,
        asal_sekolah: d.asalSekolah,
        kelas: d.kelas,
        agama: d.agama,
        penghasilan_ayah: d.penghasilanAyah || null,
        penghasilan_ibu: d.penghasilanIbu || null,
        hobi: d.hobi || null,
        cita_cita: d.citaCita || null,
        catatan_khusus: d.catatanKhusus || null,
      });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { error: "Gagal menyimpan ke database" },
        { status: 500 },
      );
    }

    // 2. Sinkronisasi ke Google Sheets (opsional, tidak blokir submit jika gagal..)
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (spreadsheetId) {
      try {
        const now = new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        });
        await appendToSheet(spreadsheetId, "'Sheet1'!A:A", [
          now,                    // Waktu
          d.namaAnak,             // Nama Anak
          d.kelas,                // Kelas
          d.jkAnak,               // JK
          d.nis || "",            // NIS
          d.nisn || "",           // NISN
          d.ttlAnak,              // TTL
          umurVal ?? "",          // Umur
          d.nomorKK,              // Nomor KK
          d.nikAnak,              // NIK
          d.agama,                // Agama
          d.alamat,               // Alamat
          anakKe ?? "",           // Anak Ke
          jumlahSaudara ?? "",    // Jumlah Saudara
          d.namaAyah,             // Nama Ayah
          d.nikAyah,              // NIK Ayah
          d.ttlAyah,              // TTL Ayah
          d.pendidikanAyah || "", // Pendidikan Ayah
          d.pekerjaanAyah || "",  // Pekerjaan Ayah
          d.penghasilanAyah || "",// Penghasilan Ayah
          d.nomorHPAyah || "",    // HP Ayah
          d.namaIbu,              // Nama Ibu
          d.nikIbu,               // NIK Ibu
          d.ttlIbu,               // TTL Ibu
          d.pendidikanIbu || "",  // Pendidikan Ibu
          d.pekerjaanIbu || "",   // Pekerjaan Ibu
          d.penghasilanIbu || "", // Penghasilan Ibu
          d.nomorHPIbu || "",     // HP Ibu
          d.alamatDomisili || "", // Domisili
          d.asalSekolah,          // Asal Sekolah
          d.hobi || "",           // Hobi
          d.citaCita || "",       // Cita-cita
          d.catatanKhusus || "",  // Catatan
        ]);
      } catch (sheetErr) {
        // Gagal sinkron ke Sheets tidak memblokir submit
        console.error("Google Sheets sync error:", sheetErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}
