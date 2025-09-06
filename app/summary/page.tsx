'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react'; // Impor Suspense
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

// 1. Logika utama dipindahkan ke komponen baru ini
function SummaryView() {
  const searchParams = useSearchParams();
  
  const activitySummary = searchParams.get('activity') ? decodeURIComponent(searchParams.get('activity')!) : null;
  const resultSummary = searchParams.get('result') ? decodeURIComponent(searchParams.get('result')!) : null;
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!month || !year || !activitySummary || !resultSummary) {
      toast.error('Data tidak lengkap untuk disimpan.');
      return;
    }
    setIsSaving(true);
    try {
      await axios.post('/api/summaries', {
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        activitySummary,
        resultSummary,
      });
      toast.success('Ringkasan berhasil disimpan!');
      setIsSaved(true);
    } catch (error : unknown) {
      toast.error('Gagal menyimpan ringkasan.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatText = (text: string | null) => {
    return text ? text.replace(/\n/g, '<br />') : 'Tidak ada ringkasan tersedia.';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Ringkasan Laporan Bulanan</h1>
        <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isSaving || isSaved}>
                {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isSaved ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                {isSaved ? 'Tersimpan' : 'Simpan'}
            </Button>
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Link>
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatText(activitySummary) }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Hasil Kerja</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatText(resultSummary) }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// 2. Halaman utama sekarang hanya me-render komponen di atas dengan Suspense
export default function SummaryPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Memuat ringkasan...</div>}>
            <SummaryView />
        </Suspense>
    );
}