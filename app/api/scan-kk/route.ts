import { NextResponse } from "next/server";

const SUMOPOD_ENDPOINT = "https://ai.sumopod.com/v1/chat/completions";
const MODEL = "qwen3.7-plus";

const SYSTEM_PROMPT = `Kamu adalah sistem OCR untuk Kartu Keluarga (KK) Indonesia. Tugasmu adalah mengekstrak SELURUH data dari gambar Kartu Keluarga yang diberikan.

ATURAN PENTING:
- Kembalikan HANYA JSON valid, tanpa teks lain, tanpa markdown code block.
- Jika sebuah field TIDAK BISA DIBACA dengan jelas dari gambar, isi dengan string kosong "".
- JANGAN MENEBAK atau MENGISI field yang tidak terbaca — terutama NIK dan nomor KK.
- NIK dan nomor KK harus berupa string (bukan number), karena bisa diawali angka 0.
- Format tanggal lahir: "DD-MM-YYYY" (contoh: "15-08-1990").
- Jika tanggal lahir tidak terbaca, isi string kosong "".
- "statusHubungan" gunakan persis seperti yang tercetak di KK (contoh: "Kepala Keluarga", "Istri", "Anak", "Menantu", "Cucu", "Orang Tua", "Mertua", "Famililain", "Pembantu", "Lainnya").

SKEMA JSON yang WAJIB dikembalikan:
{
  "header": {
    "nomorKK": "",
    "alamat": "",
    "rt": "",
    "rw": "",
    "desaKelurahan": "",
    "kecamatan": "",
    "kabupatenKota": "",
    "provinsi": "",
    "kodePos": ""
  },
  "anggota": [
    {
      "nama": "",
      "nik": "",
      "jenisKelamin": "",
      "tempatLahir": "",
      "tanggalLahir": "",
      "statusHubungan": "",
      "pekerjaan": ""
    }
  ]
}

"anggota" adalah array berisi SEMUA baris anggota keluarga yang tercantum di KK. Jangan ada yang dilewati.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "imageBase64 dan mimeType wajib diisi" },
        { status: 400 },
      );
    }

    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "mimeType harus berupa image/*" },
        { status: 400 },
      );
    }

    const apiKey = process.env.SUMOPOD_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SUMOPOD_API_KEY belum dikonfigurasi di server" },
        { status: 500 },
      );
    }

    const response = await fetch(SUMOPOD_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
              {
                type: "text",
                text: "Ekstrak semua data dari Kartu Keluarga ini. Kembalikan HANYA JSON sesuai skema yang diminta.",
              },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SumoPod API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Gagal memanggil API vision: ${response.status}` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";

    if (!content) {
      return NextResponse.json(
        { error: "Response dari model kosong" },
        { status: 502 },
      );
    }

    // Parse JSON — model kadang membungkus dengan ```json ... ```
    let parsed: unknown;
    try {
      // Coba parse langsung
      parsed = JSON.parse(content);
    } catch {
      // Coba ekstrak JSON dari dalam code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        // Coba cari blok JSON pertama { ... }
        const braceMatch = content.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          parsed = JSON.parse(braceMatch[0]);
        } else {
          console.error("Cannot parse model response:", content);
          return NextResponse.json(
            { error: "Response model bukan JSON valid" },
            { status: 502 },
          );
        }
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Scan KK error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}
