"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesByType } from "@/lib/categories";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string | null;
  currentAmount: number;
  onSave: (categoryId: string, amount: number) => void;
  onDelete: (categoryId: string) => void;
}

export function BudgetDialog({
  open,
  onOpenChange,
  categoryId,
  currentAmount,
  onSave,
  onDelete,
}: Props) {
  const [selected, setSelected] = useState(categoryId ?? "");
  const [amount, setAmount] = useState(
    currentAmount > 0 ? currentAmount.toLocaleString("id-ID") : ""
  );

  useEffect(() => {
    if (open) {
      setSelected(categoryId ?? "");
      setAmount(currentAmount > 0 ? currentAmount.toLocaleString("id-ID") : "");
    }
  }, [open, categoryId, currentAmount]);

  const lockedCategory = !!categoryId;
  const expenseCategories = categoriesByType("expense");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount.replace(/[^\d]/g, ""));
    if (!selected) {
      toast.error("Pilih kategori dulu");
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Jumlah anggaran tidak valid");
      return;
    }
    onSave(selected, numericAmount);
    toast.success("Anggaran tersimpan");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!selected) return;
    onDelete(selected);
    toast.success("Anggaran dihapus");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentAmount > 0 ? "Edit Anggaran" : "Atur Anggaran"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="budget-category">Kategori</Label>
            <Select
              modal={false}
              value={selected || null}
              onValueChange={(v) => setSelected((v as string) ?? "")}
              disabled={lockedCategory}
            >
              <SelectTrigger id="budget-category" className="w-full">
                <SelectValue placeholder="Pilih kategori pengeluaran" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="budget-amount">Anggaran per bulan (Rp)</Label>
            <Input
              id="budget-amount"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setAmount(raw ? Number(raw).toLocaleString("id-ID") : "");
              }}
              autoComplete="off"
            />
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            {currentAmount > 0 ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Hapus
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
