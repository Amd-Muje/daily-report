'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'; // Kita perlu buat komponen ini
import { Loader2, Inbox } from 'lucide-react';
import type { ISummary } from '@/models/Summary';

// Tipe data untuk UI
type ISummaryUI = Omit<ISummary, '_id'> & { _id: string };

export function SavedSummaries() {
  const [summaries, setSummaries] = useState<ISummaryUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await axios.get<ISummaryUI[]>('/api/summaries');
        setSummaries(response.data);
      } catch (error) {
        console.error('Failed to fetch summaries', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('id-ID', { month: 'long' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Riwayat Ringkasan Laporan</h2>
      {summaries.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Belum ada ringkasan yang disimpan.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {summaries.map((summary) => (
            <AccordionItem value={summary._id} key={summary._id}>
              <AccordionTrigger>
                Laporan Bulan {getMonthName(summary.month)} {summary.year}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Ringkasan Aktivitas</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {summary.activitySummary}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Ringkasan Hasil Kerja</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {summary.resultSummary}
                            </p>
                        </CardContent>
                    </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}