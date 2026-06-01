"use client";

import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { formatDateInput } from "@/lib/format";
import type { Transaction, TransactionType } from "@/lib/types";

interface AddProps {
  mode?: "add";
  onSubmit: (tx: Transaction) => void;
}

interface EditProps {
  mode: "edit";
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tx: Transaction) => void;
}

type Props = AddProps | EditProps;

export function AddTransactionDialog(props: Props) {
  const isEdit = props.mode === "edit";
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isEdit ? props.open : internalOpen;
  const setOpen = isEdit ? props.onOpenChange : setInternalOpen;

  const initial = isEdit ? props.transaction : null;

  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [amount, setAmount] = useState(
    initial ? Number(initial.amount).toLocaleString("id-ID") : ""
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [date, setDate] = useState(initial?.date ?? formatDateInput(new Date()));
  const [touchedType, setTouchedType] = useState(false);

  useEffect(() => {
    if (touchedType) setCategoryId("");
  }, [type, touchedType]);

  useEffect(() => {
    if (isEdit && open && initial) {
      setType(initial.type);
      setCategoryId(initial.categoryId);
      setAmount(Number(initial.amount).toLocaleString("id-ID"));
      setNote(initial.note);
      setDate(initial.date);
      setTouchedType(false);
    }
  }, [isEdit, open, initial]);

  const categories = categoriesByType(type);

  function reset() {
    setType("expense");
    setCategoryId("");
    setAmount("");
    setNote("");
    setDate(formatDateInput(new Date()));
    setTouchedType(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount.replace(/[^\d]/g, ""));
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Jumlah tidak valid");
      return;
    }
    if (!categoryId) {
      toast.error("Pilih kategori dulu");
      return;
    }
    const tx: Transaction = isEdit
      ? {
          ...props.transaction,
          type,
          categoryId,
          amount: numericAmount,
          note: note.trim(),
          date,
        }
      : {
          id: uuid(),
          type,
          categoryId,
          amount: numericAmount,
          note: note.trim(),
          date,
          createdAt: new Date().toISOString(),
        };
    props.onSubmit(tx);
    toast.success(
      isEdit
        ? "Perubahan tersimpan"
        : type === "income"
          ? "Pemasukan disimpan"
          : "Pengeluaran disimpan"
    );
    if (!isEdit) reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o && !isEdit) reset();
      }}
    >
      {!isEdit && (
        <DialogTrigger
          render={
            <Button
              size="icon"
              className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg z-10"
              aria-label="Tambah transaksi"
            />
          }
        >
          <Plus className="size-6" />
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaksi" : "Tambah Transaksi"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => {
                setType("expense");
                setTouchedType(true);
              }}
            >
              Pengeluaran
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => {
                setType("income");
                setTouchedType(true);
              }}
            >
              Pemasukan
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              modal={false}
              value={categoryId || null}
              onValueChange={(v) => setCategoryId((v as string) ?? "")}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Keterangan (opsional)</Label>
            <Input
              id="note"
              type="text"
              placeholder="Contoh: makan siang"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={80}
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
