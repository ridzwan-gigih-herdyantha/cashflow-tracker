"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearAll, exportData, importData } from "@/lib/storage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataChanged: () => void;
}

export function SettingsDialog({ open, onOpenChange, onDataChanged }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingJson, setPendingJson] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cashflow-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Backup berhasil diunduh");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        JSON.parse(text);
        setPendingJson(text);
      } catch {
        toast.error("File tidak valid");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function applyImport(mode: "merge" | "replace") {
    if (!pendingJson) return;
    try {
      const result = importData(pendingJson, mode);
      toast.success(
        `Import selesai · ${result.added} ditambah${
          result.skipped ? `, ${result.skipped} duplikat dilewati` : ""
        }`
      );
      setPendingJson(null);
      onDataChanged();
    } catch {
      toast.error("Gagal import — file rusak?");
    }
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    clearAll();
    setConfirmReset(false);
    onDataChanged();
    toast.success("Semua data dihapus");
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setPendingJson(null);
          setConfirmReset(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Data & Backup</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <ActionRow
            icon={<Download className="size-4" />}
            title="Export data"
            desc="Unduh semua transaksi & anggaran sebagai file JSON."
            actionLabel="Export"
            onAction={handleExport}
          />
          <ActionRow
            icon={<Upload className="size-4" />}
            title="Import data"
            desc="Pulihkan dari file backup."
            actionLabel="Pilih file"
            onAction={() => fileRef.current?.click()}
          />
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFile}
          />

          {pendingJson && (
            <div className="rounded-lg border border-dashed p-3 flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                File ter-baca. Pilih cara import:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyImport("merge")}
                >
                  Gabung
                </Button>
                <Button size="sm" onClick={() => applyImport("replace")}>
                  Ganti semua
                </Button>
              </div>
            </div>
          )}

          <ActionRow
            icon={<Trash2 className="size-4 text-red-500" />}
            title="Reset semua data"
            desc="Hapus seluruh transaksi & anggaran dari device ini."
            actionLabel={confirmReset ? "Yakin hapus?" : "Reset"}
            onAction={handleReset}
            destructive
          />
          {confirmReset && (
            <p className="flex items-center gap-1.5 text-xs text-amber-600">
              <AlertTriangle className="size-3" />
              Aksi ini tidak bisa dibatalkan.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionRow({
  icon,
  title,
  desc,
  actionLabel,
  onAction,
  destructive,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  actionLabel: string;
  onAction: () => void;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Button
        size="sm"
        variant={destructive ? "destructive" : "outline"}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}
