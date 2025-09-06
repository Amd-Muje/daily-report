import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongoose';
import Report, { IReport } from '@/models/Report';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { month, year } = await request.json();
    if (!month || !year) {
      return NextResponse.json({ message: 'Month and year are required' }, { status: 400 });
    }

    await dbConnect();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const reports = await Report.find({
      userId: session.user.id,
      status: 'Complete',
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: 'asc' });

    if (reports.length === 0) {
      return NextResponse.json({
        activitySummary: 'Tidak ada laporan yang ditemukan untuk periode yang dipilih.',
        resultSummary: 'Silakan pilih periode lain atau tambahkan laporan terlebih dahulu.'
      });
    }

    const formattedReports = reports.map((report: IReport) => {
      const date = new Date(report.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
      const doneItems = report.doneItems.map(item => `- ${item.description}`).join('\n');
      return `Tanggal: ${date}\nKegiatan:\n${doneItems}`;
    }).join('\n\n---\n\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Anda adalah seorang asisten ahli yang bertugas menyusun laporan kerja bulanan. Berdasarkan data laporan harian berikut, buatlah DUA buah ringkasan terpisah dalam format naratif yang koheren.

      DATA LAPORAN HARIAN:
      ${formattedReports}
      ---
      
      TUGAS ANDA:

      1.  **Ringkasan Aktivitas**:
          - Tulis dalam bentuk narasi yang mengalir dan tematik. Jelaskan proses kerja, fokus utama, dan berbagai kegiatan yang dilakukan.
          - **PENTING: Jangan menyebutkan tanggal spesifik (contoh: Senin, 1 September).** Rangkai semua aktivitas menjadi satu cerita utuh tentang apa yang dikerjakan selama sebulan.
          - Gunakan gaya penulisan seperti ini sebagai contoh: "Pada bulan September, aktivitas berpusat pada pengembangan beberapa proyek... Kegiatan ini mencakup berbagai tugas mulai dari pengembangan front-end, back-end, hingga manajemen fitur..."
          - Panjang ringkasan harus lebih dari 150 kata.

      2.  **Ringkasan Hasil Kerja**:
          - Jelaskan output atau hasil kerja yang konkret dan nyata dari semua aktivitas tersebut. Fokus pada "apa yang telah dihasilkan".
          - Panjang ringkasan harus lebih dari 150 kata.

      Gunakan format berikut sebagai jawaban AKHIR Anda, tanpa tambahan apapun. Gunakan penanda '---PEMISAH---' tepat di antara dua ringkasan:

      [RINGKASAN_AKTIVITAS]
      (Tulis Ringkasan Aktivitas di sini)
      ---PEMISAH---
      [RINGKASAN_HASIL_KERJA]
      (Tulis Ringkasan Hasil Kerja di sini)
    `;

    let fullSummary = "";
    const retries = 3;

    for (let i = 0; i < retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        fullSummary = response.text();
        break;
      } catch (error: unknown) { // <-- PERBAIKAN DI SINI
        let isServiceUnavailable = false;
        // Cek tipe error sebelum mengakses propertinya
        if (error instanceof Error) {
            isServiceUnavailable = error.message.includes("503");
        }
        
        if (isServiceUnavailable && i < retries - 1) {
          console.warn(`Attempt ${i + 1} failed. Retrying in ${i + 1} second(s)...`);
          await delay((i + 1) * 1000);
        } else {
          throw error;
        }
      }
    }

    const parts = fullSummary.split('---PEMISAH---');
    const activitySummary = parts[0]?.replace('[RINGKASAN_AKTIVITAS]', '').trim() || 'Gagal menghasilkan ringkasan aktivitas.';
    const resultSummary = parts[1]?.replace('[RINGKASAN_HASIL_KERJA]', '').trim() || 'Gagal menghasilkan ringkasan hasil kerja.';

    return NextResponse.json({ activitySummary, resultSummary });

  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { message: 'Gagal membuat ringkasan laporan.', error },
      { status: 500 }
    );
  }
}