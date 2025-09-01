"use client";

import { useState } from "react";
import axios from "axios";
import type { IReport as IReportData, IDoneItem } from "@/models/Report"; // type-only
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Copy,
  Loader2,
  Link as LinkIcon,
  Save as SaveIcon,
} from "lucide-react";
import { toast } from "sonner";

// Tambahkan field opsional di sisi UI (kalau backend belum ada)
type DoneItemUI = IDoneItem & { documentationUrl?: string };

// Tipe UI untuk tabel
export type IReportUI = Omit<IReportData, "createdAt"> & {
  _id: string;
  createdAt: string | Date;
};

interface HistoryTableProps {
  title: string;
  reports: IReportUI[];
  isLoading: boolean;
  onEdit: (report: IReportUI) => void;
  onDelete: (id: string) => void;
  onCopy: (
    report: Partial<Pick<IReportUI, "name" | "status" | "doneItems" | "todoItems">>
  ) => string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IReportUI | null>(null);
  const [editedDoneItems, setEditedDoneItems] = useState<DoneItemUI[]>([]);
  const [saving, setSaving] = useState(false);

  const handleCopyFromHistory = (report: IReportUI) => {
    const textToCopy = onCopy(report);
    navigator.clipboard.writeText(textToCopy);
    toast.success("Report copied to clipboard!");
  };

  const openDocsDialog = (report: IReportUI) => {
    setSelectedReport(report);
    const cloned = (report.doneItems || []).map((d) => ({
      ...(d as DoneItemUI),
      documentationUrl: (d as DoneItemUI).documentationUrl ?? "",
    }));
    setEditedDoneItems(cloned);
    setIsDialogOpen(true);
  };

  const setDocUrlAt = (idx: number, value: string) => {
    setEditedDoneItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], documentationUrl: value };
      return next;
    });
  };

  const saveDocs = async () => {
    if (!selectedReport) return;
    setSaving(true);
    try {
      await axios.put(`/api/reports/${selectedReport._id}`, {
        doneItems: editedDoneItems,
      });
      toast.success("Documentation URLs saved!");
      setIsDialogOpen(false);
      onUpdate();
    } catch {
      toast.error("Failed to save documentation URLs.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

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
              reports.map((report) => {
                const doneItems = (report.doneItems || []) as DoneItemUI[];
                const docLinks =
                  report.status === "Complete"
                    ? doneItems
                        .map((i, idx) => ({
                          url: (i.documentationUrl ?? "").trim(),
                          label: i.description?.trim() || `Doc ${idx + 1}`,
                        }))
                        .filter((d) => d.url.length > 0)
                    : [];

                return (
                  <TableRow key={report._id}>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>{report.name}</TableCell>
                    <TableCell className="align-top">
                      <div className="max-w-xs truncate">
                        {report.status === "Complete"
                          ? `${report.doneItems.length} task(s) done${
                              docLinks.length ? ` • ${docLinks.length} docs` : ""
                            }`
                          : `${report.todoItems.length} task(s) to do`}
                      </div>

                      {report.status === "Complete" && docLinks.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {docLinks.map((d, i) => (
                            <a
                              key={`${report._id}-doc-${i}`}
                              href={d.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs hover:bg-accent"
                              title={d.label}
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[140px]">{d.label}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(report)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyFromHistory(report)}>
                            <Copy className="mr-2 h-4 w-4" /> Copy
                          </DropdownMenuItem>
                          {report.status === "Complete" && (
                            <DropdownMenuItem onClick={() => openDocsDialog(report)}>
                              <LinkIcon className="mr-2 h-4 w-4" /> Add/Edit Docs
                            </DropdownMenuItem>
                          )}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Dialog Add/Edit Docs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add / Edit Documentation Links</DialogTitle>
          </DialogHeader>

          {selectedReport ? (
            <div className="space-y-4 max-h-[60vh] overflow-auto pr-1">
              {editedDoneItems.length === 0 && (
                <p className="text-sm text-muted-foreground">No done items.</p>
              )}
              {editedDoneItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Task</Label>
                    <div className="text-sm truncate" title={item.description}>
                      {item.description || `Item ${idx + 1}`}
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor={`doc-${idx}`} className="text-xs">
                      Documentation URL
                    </Label>
                    <Input
                      id={`doc-${idx}`}
                      type="url"
                      value={item.documentationUrl ?? ""}
                      onChange={(e) => setDocUrlAt(idx, e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveDocs} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SaveIcon className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
