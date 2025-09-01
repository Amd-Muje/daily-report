"use client";

import { useState } from "react";
import { IReport as IReportData } from "@/models/Report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import {
    MoreHorizontal,
    Edit,
    Trash,
    Copy,
    Link as LinkIcon,
    Loader2,
} from "lucide-react";
// FIX: Hapus import Dialog yang tidak terpakai
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
import axios from "axios";
import { toast } from "sonner";

type IReport = IReportData & { _id: string };

interface HistoryTableProps {
    title: string;
    reports: IReport[];
    isLoading: boolean;
    onEdit: (report: IReport) => void;
    onDelete: (id: string) => void;
    onCopy: (report: Partial<IReport>) => string;
    onUpdate: () => void;
}

export function HistoryTable({
    title,
    reports,
    isLoading,
    onEdit,
    onDelete,
    onCopy,
    onUpdate,
}: HistoryTableProps) {
    // FIX: Hapus semua state dan fungsi yang berkaitan dengan dialog
    // const [isDialogOpen, setIsDialogOpen] = useState(false);
    // const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
    // const [docUrl, setDocUrl] = useState("");
    // const [isSavingUrl, setIsSavingUrl] = useState(false);

    const handleCopyFromHistory = (report: IReport) => {
        const textToCopy = onCopy(report);
        navigator.clipboard.writeText(textToCopy);
        toast.success("Report copied to clipboard!");
    };

    // const openUrlDialog = (report: IReport) => {
    //     setSelectedReport(report);
    //     setDocUrl(report.documentationUrl || "");
    //     setIsDialogOpen(true);
    // };

    // const handleSaveUrl = async () => {
    //     if (!selectedReport) return;
    //     setIsSavingUrl(true);
    //     try {
    //         await axios.put(`/api/reports/${selectedReport._id}`, {
    //             documentationUrl: docUrl,
    //         });
    //         toast.success("Documentation URL saved!");
    //         setIsDialogOpen(false);
    //         onUpdate();
    //     } catch (error) {
    //         toast.error("Failed to save URL.");
    //     } finally {
    //         setIsSavingUrl(false);
    //     }
    // };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableCaption>
                        {isLoading
                            ? "Loading..."
                            : reports.length === 0
                            ? "No reports found in this category."
                            : `A list of your ${title.toLowerCase()} reports.`}
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report._id}>
                                    <TableCell>
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{report.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {report.status === "Complete"
                                            ? `${report.doneItems.length} task(s) done`
                                            : `${report.todoItems.length} task(s) to do`}
                                        {/* Logika untuk URL dokumentasi masih bisa ada di sini jika Anda mau */}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(report)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleCopyFromHistory(report)}
                                                >
                                                    <Copy className="mr-2 h-4 w-4" /> Copy
                                                </DropdownMenuItem>
                                                {/* <DropdownMenuItem onClick={() => openUrlDialog(report)}>
                                                    <LinkIcon className="mr-2 h-4 w-4" /> Add/Edit Docs
                                                </DropdownMenuItem> */}
                                                <DropdownMenuItem
                                                    className="text-red-500"
                                                    onClick={() => onDelete(report._id)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            {/* FIX: Hapus JSX Dialog yang tidak terpakai */}
            {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                ...
            </Dialog> */}
        </Card>
    );
}
