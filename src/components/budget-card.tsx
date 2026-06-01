"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetDialog } from "@/components/budget-dialog";
import { categoriesByType, getCategory } from "@/lib/categories";
import { getIcon } from "@/lib/icon-map";
import { formatIDR, formatIDRCompact } from "@/lib/format";
import type { Budgets, Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  budgets: Budgets;
  onSaveBudget: (categoryId: string, amount: number) => void;
  onDeleteBudget: (categoryId: string) => void;
}

interface Row {
  categoryId: string;
  spent: number;
  budget: number;
}

export function BudgetCard({
  transactions,
  budgets,
  onSaveBudget,
  onDeleteBudget,
}: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const rows = useMemo(() => {
    const spentByCat = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== "expense") continue;
      spentByCat.set(
        tx.categoryId,
        (spentByCat.get(tx.categoryId) ?? 0) + tx.amount
      );
    }
    const result: Row[] = [];
    for (const c of categoriesByType("expense")) {
      const budget = budgets[c.id] ?? 0;
      const spent = spentByCat.get(c.id) ?? 0;
      if (budget > 0 || spent > 0) {
        result.push({ categoryId: c.id, spent, budget });
      }
    }
    return result.sort((a, b) => {
      if (a.budget > 0 && b.budget === 0) return -1;
      if (a.budget === 0 && b.budget > 0) return 1;
      return b.spent - a.spent;
    });
  }, [transactions, budgets]);

  if (rows.length === 0 && Object.keys(budgets).length === 0) {
    return (
      <>
        <Card>
          <CardContent className="flex flex-col gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada anggaran. Atur batas pengeluaran biar lebih terkontrol.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="self-center"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-4" />
              Atur Anggaran
            </Button>
          </CardContent>
        </Card>
        <BudgetDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          categoryId={null}
          currentAmount={0}
          onSave={onSaveBudget}
          onDelete={onDeleteBudget}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Anggaran Bulanan</h2>
            <Button
              size="xs"
              variant="ghost"
              className="text-xs"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-3" />
              Tambah
            </Button>
          </div>
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <BudgetRow
                key={row.categoryId}
                row={row}
                onClick={() => setEditing(row.categoryId)}
              />
            ))}
          </ul>
        </CardContent>
      </Card>
      <BudgetDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        categoryId={null}
        currentAmount={0}
        onSave={onSaveBudget}
        onDelete={onDeleteBudget}
      />
      <BudgetDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        categoryId={editing}
        currentAmount={editing ? budgets[editing] ?? 0 : 0}
        onSave={(catId, amount) => {
          onSaveBudget(catId, amount);
          setEditing(null);
        }}
        onDelete={(catId) => {
          onDeleteBudget(catId);
          setEditing(null);
        }}
      />
    </>
  );
}

function BudgetRow({ row, onClick }: { row: Row; onClick: () => void }) {
  const category = getCategory(row.categoryId);
  const Icon = getIcon(category?.icon ?? "Coins");
  const hasBudget = row.budget > 0;
  const pct = hasBudget ? Math.min((row.spent / row.budget) * 100, 999) : 0;
  const barColor = hasBudget
    ? pct > 100
      ? "bg-red-500"
      : pct >= 80
        ? "bg-orange-500"
        : pct >= 60
          ? "bg-yellow-500"
          : "bg-emerald-500"
    : "bg-zinc-400";
  const displayPct = hasBudget ? Math.min(pct, 100) : 0;
  const remaining = row.budget - row.spent;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full flex-col gap-1.5 rounded-md p-1.5 -m-1.5 text-left transition-colors hover:bg-muted/40"
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-muted ${category?.color ?? ""}`}
          >
            <Icon className="size-3.5" />
          </div>
          <span className="text-sm font-medium flex-1">
            {category?.label ?? "Lainnya"}
          </span>
          {hasBudget ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatIDRCompact(row.spent)} / {formatIDRCompact(row.budget)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {formatIDR(row.spent)} · belum ada batas
            </span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${barColor}`}
            style={{ width: `${displayPct}%` }}
          />
        </div>
        {hasBudget && (
          <p
            className={`text-[11px] tabular-nums ${
              remaining < 0 ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {remaining >= 0
              ? `Sisa ${formatIDR(remaining)}`
              : `Lewat ${formatIDR(Math.abs(remaining))}`}
          </p>
        )}
      </button>
    </li>
  );
}
