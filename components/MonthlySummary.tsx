'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, FileText, Copy } from 'lucide-react';
import type { IReportUI } from './HistoryTable';

export function MonthlySummary() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post('/api/summarize', {
        month: parseInt(selectedMonth, 10),
        year: parseInt(selectedYear, 10),
      });
      const { activitySummary, resultSummary } = response.data;

      const params = new URLSearchParams();
      params.set('activity', encodeURIComponent(activitySummary));
      params.set('result', encodeURIComponent(resultSummary));
      params.set('month', selectedMonth);
      params.set('year', selectedYear);
      
      router.push(`/summary?${params.toString()}`);

    } catch { // <-- PERBAIKAN 1
      toast.error('Gagal membuat ringkasan laporan.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyAllReports = async () => {
    setIsCopying(true);
    try {
      const response = await axios.get<IReportUI[]>(`/api/reports?month=${selectedMonth}&year=${selectedYear}`);
      const reports = response.data;

      if(reports.length === 0){
        toast.info("Tidak ada laporan selesai untuk disalin pada periode ini.");
        return;
      }
      
      const formattedText = reports.reverse().map(report => {
        // <-- PERBAIKAN 2: Gunakan variabel 'date'
        const date = new Date(report.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const doneItems = (report.doneItems || []).map(item => `[done] ${item.description} (${item.startTime}-${item.endTime})`).join('\n');
        return `dailyreport\n${report.name}\nTanggal: ${date}\n\nComplete:\n${doneItems}`;
      }).join('\n\n====================\n\n');

      await navigator.clipboard.writeText(formattedText);
      toast.success(`${reports.length} laporan selesai berhasil disalin!`);

    } catch {
      toast.error('Gagal menyalin laporan.');
    } finally {
      setIsCopying(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }),
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="flex flex-col gap-4 mt-8 p-4 border rounded-lg">
        <p className="font-medium text-center sm:text-left">Laporan Bulanan:</p>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                    {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                        {month.label}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((year) => (
                    <SelectItem key={year} value={year}>
                        {year}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handleCopyAllReports} disabled={isCopying} variant="secondary">
                    {isCopying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                    Salin Laporan Selesai
                </Button>
                <Button onClick={handleGenerateSummary} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    Buat Ringkasan AI
                </Button>
            </div>
        </div>
    </div>
  );
}