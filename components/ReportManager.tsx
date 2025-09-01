'use client';

// Impor hook dari React, termasuk useMemo untuk optimasi
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2, PlusCircle, Copy, Save, Loader2, FileX2 } from 'lucide-react';
import { IReport as IReportData, IDoneItem, ITodoItem } from '@/models/Report';
import { HistoryTable } from './HistoryTable';

// Tipe data untuk frontend yang memastikan _id adalah string
type ReportWithId = IReportData & { _id: string };
type Status = 'Complete' | 'Incomplete';

export function ReportManager() {
    const [name, setName] = useState('');
    const [status, setStatus] = useState<Status>('Complete');
    const [doneItems, setDoneItems] = useState<IDoneItem[]>([{ description: '', startTime: '', endTime: '' }]);
    const [todoItems, setTodoItems] = useState<ITodoItem[]>([{ description: '' }]);
    const [history, setHistory] = useState<ReportWithId[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const [editingReportId, setEditingReportId] = useState<string | null>(null);

    // Efek untuk memuat nama dari localStorage dan data histori awal
    useEffect(() => {
        const savedName = localStorage.getItem('report_user_name');
        if (savedName) setName(savedName);
        fetchHistory();
    }, []);

    // Efek untuk menyimpan nama ke localStorage setiap kali berubah
    useEffect(() => {
        if (name) localStorage.setItem('report_user_name', name);
    }, [name]);

    const fetchHistory = async () => {
        setIsFetchingHistory(true);
        try {
            const response = await axios.get('/api/reports');
            setHistory(response.data);
        } catch (_error) { // <-- FIX
            toast.error('Gagal mengambil riwayat laporan.');
        } finally {
            setIsFetchingHistory(false);
        }
    };

    // Handler untuk item yang sudah selesai (Done)
    const handleDoneChange = (index: number, field: keyof IDoneItem, value: string) => {
        const newItems = [...doneItems];
        newItems[index][field] = value;
        setDoneItems(newItems);
    };
    const addDoneItem = () => setDoneItems([...doneItems, { description: '', startTime: '', endTime: '' }]);
    const removeDoneItem = (index: number) => setDoneItems(doneItems.filter((_, i) => i !== index));

    // Handler untuk item yang akan dikerjakan (Todo)
    const handleTodoChange = (index: number, value: string) => {
        const newItems = [...todoItems];
        newItems[index].description = value;
        setTodoItems(newItems);
    };
    const addTodoItem = () => setTodoItems([...todoItems, { description: '' }]);
    const removeTodoItem = (index: number) => setTodoItems(todoItems.filter((_, i) => i !== index));

    // Fungsi untuk mereset form ke keadaan awal
    const resetForm = () => {
        setStatus('Complete');
        setDoneItems([{ description: '', startTime: '', endTime: '' }]);
        setTodoItems([{ description: '' }]);
        setEditingReportId(null);
    };

    // Fungsi untuk menyimpan atau memperbarui laporan
    const handleSave = async () => {
        if (!name) {
            toast.error('Nama wajib diisi.');
            return;
        }
        setIsLoading(true);

        const reportData = {
            name,
            status,
            doneItems: status === 'Complete' ? doneItems.filter(item => item.description.trim()) : [],
            todoItems: status === 'Incomplete' ? todoItems.filter(item => item.description.trim()) : [],
        };

        try {
            if (editingReportId) {
                await axios.put(`/api/reports/${editingReportId}`, reportData);
                toast.success('Laporan berhasil diperbarui!');
            } else {
                await axios.post('/api/reports', reportData);
                toast.success('Laporan berhasil disimpan!');
            }
            resetForm();
            fetchHistory();
        } catch (_error) { // <-- FIX
            toast.error('Gagal menyimpan laporan.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk menghasilkan teks laporan untuk disalin
    const generateReportText = (report: Partial<ReportWithId>) => {
        let output = `dailyreport\n${report.name || name}\n\n`;
        const itemsToProcess = report.doneItems || (status === 'Complete' ? doneItems : []);
        const todoItemsToProcess = report.todoItems || (status === 'Incomplete' ? todoItems : []);

        if (report.status === 'Complete' && itemsToProcess.length > 0) {
            output += 'Complete:\n';
            itemsToProcess.forEach(item => {
                if (item.description.trim()) {
                    const timeRange = (item.startTime && item.endTime) ? `(${item.startTime}-${item.endTime})` : '';
                    output += `[done] ${item.description} ${timeRange}\n`;
                }
            });
        }
        if (report.status === 'Incomplete' && todoItemsToProcess.length > 0) {
            output += 'Incomplete:\n';
            todoItemsToProcess.forEach(item => {
                if (item.description.trim()) {
                    output += `[todo] ${item.description}\n`;
                }
            });
        }
        return output.trim();
    };

    const handleCopyToClipboard = () => {
        const reportData = { name, status, doneItems, todoItems };
        const textToCopy = generateReportText(reportData);
        navigator.clipboard.writeText(textToCopy);
        toast.success('Laporan disalin ke clipboard!');
    };

    // Fungsi untuk mengisi form dengan data laporan yang akan diedit
    const handleEdit = (report: ReportWithId) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setEditingReportId(report._id);
        setName(report.name);
        setStatus(report.status);
        setDoneItems(report.doneItems.length > 0 ? report.doneItems : [{ description: '', startTime: '', endTime: '' }]);
        setTodoItems(report.todoItems.length > 0 ? report.todoItems : [{ description: '' }]);
    };

    // Fungsi untuk menghapus laporan
    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
            try {
                await axios.delete(`/api/reports/${id}`);
                toast.success('Laporan berhasil dihapus!');
                if (editingReportId === id) {
                    resetForm();
                }
                fetchHistory();
            } catch (_error) {
                toast.error('Gagal menghapus laporan.');
            }
        }
    };

    // Memfilter histori menjadi dua bagian menggunakan useMemo
    const completeReports = useMemo(
        () => history.filter((report) => report.status === 'Complete'),
        [history]
    );
    const incompleteReports = useMemo(
        () => history.filter((report) => report.status === 'Incomplete'),
        [history]
    );

    return (
        <div className="space-y-8">
            <Card className="bg-slate-50 dark:bg-slate-900/50 border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-primary">
                        {editingReportId ? 'Edit Laporan' : 'Buat Laporan Harian'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Nama</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama Anda" />
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(value: Status) => setStatus(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Complete">Complete</SelectItem>
                                    <SelectItem value="Incomplete">Incomplete</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {status === 'Complete' && (
                        <div className="space-y-4 rounded-md border p-4 bg-background">
                            <Label className="font-semibold text-green-600 dark:text-green-500">Tugas Selesai</Label>
                            {doneItems.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row w-full items-stretch md:items-center gap-2">
                                    <Input value={item.description} onChange={(e) => handleDoneChange(index, 'description', e.target.value)} placeholder="Deskripsi tugas" className="flex-grow" />
                                    <div className="flex items-center gap-2 justify-end">
                                        <Input type="time" value={item.startTime} onChange={(e) => handleDoneChange(index, 'startTime', e.target.value)} className="flex-shrink-0 w-[110px]" />
                                        <span className="text-muted-foreground">-</span>
                                        <Input type="time" value={item.endTime} onChange={(e) => handleDoneChange(index, 'endTime', e.target.value)} className="flex-shrink-0 w-[110px]" />
                                        <Button variant="ghost" size="icon" onClick={() => removeDoneItem(index)} disabled={doneItems.length === 1}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addDoneItem}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Item
                            </Button>
                        </div>
                    )}

                    {status === 'Incomplete' && (
                        <div className="space-y-4 rounded-md border p-4 bg-background">
                            <Label className="font-semibold text-orange-600 dark:text-orange-500">Tugas Belum Selesai</Label>
                            {todoItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input value={item.description} onChange={(e) => handleTodoChange(index, e.target.value)} placeholder="Deskripsi tugas" />
                                    <Button variant="ghost" size="icon" onClick={() => removeTodoItem(index)} disabled={todoItems.length === 1}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addTodoItem}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Item
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 justify-end pt-4 border-t">
                        {editingReportId && (
                            <Button variant="outline" onClick={resetForm}>
                                <FileX2 className="mr-2 h-4 w-4" /> Batal Edit
                            </Button>
                        )}
                        <Button variant="secondary" onClick={handleCopyToClipboard}>
                            <Copy className="mr-2 h-4 w-4" /> Salin
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {editingReportId ? 'Perbarui Laporan' : 'Simpan Laporan'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Riwayat Laporan</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <HistoryTable
                        title="✅ Laporan Selesai"
                        reports={completeReports}
                        isLoading={isFetchingHistory}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCopy={generateReportText}
                        onUpdate={fetchHistory}
                    />
                    <HistoryTable
                        title="📝 Laporan Belum Selesai"
                        reports={incompleteReports}
                        isLoading={isFetchingHistory}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCopy={generateReportText}
                        onUpdate={fetchHistory}
                    />
                </div>
            </div>
        </div>
    );
}