"use client";

import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { Settings, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthSelector } from "@/components/month-selector";
import { TransactionList } from "@/components/transaction-list";
import { TransactionFilter } from "@/components/transaction-filter";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { SettingsDialog } from "@/components/settings-dialog";
import { ExpenseDonut } from "@/components/expense-donut";
import { BudgetCard } from "@/components/budget-card";
import {
  deleteTransaction,
  getBudgets,
  getTransactions,
  saveBudget,
  saveTransaction,
  updateTransaction,
} from "@/lib/storage";
import { formatIDR, formatIDRCompact } from "@/lib/format";
import { getCategory } from "@/lib/categories";
import { getIcon } from "@/lib/icon-map";
import type { Budgets, Transaction } from "@/lib/types";

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budgets>({});
  const [month, setMonth] = useState(() => new Date());
  const [hydrated, setHydrated] = useState(false);

  const [filterQuery, setFilterQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function reloadFromStorage() {
    setTransactions(getTransactions());
    setBudgets(getBudgets());
  }

  useEffect(() => {
    reloadFromStorage();
    setHydrated(true);
  }, []);

  const monthTxs = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return transactions.filter((t) =>
      isWithinInterval(parseISO(t.date), { start, end })
    );
  }, [transactions, month]);

  const visibleTxs = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    return monthTxs.filter((t) => {
      if (filterCategory && t.categoryId !== filterCategory) return false;
      if (q) {
        const noteHit = t.note.toLowerCase().includes(q);
        const catLabel = getCategory(t.categoryId)?.label.toLowerCase() ?? "";
        const catHit = catLabel.includes(q);
        if (!noteHit && !catHit) return false;
      }
      return true;
    });
  }, [monthTxs, filterQuery, filterCategory]);

  const summary = useMemo(() => {
    const income = monthTxs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTxs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [monthTxs]);

  const topCategory = useMemo(() => {
    if (summary.expense === 0) return null;
    const map = new Map<string, number>();
    for (const tx of monthTxs) {
      if (tx.type !== "expense") continue;
      map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
    }
    let topId = "";
    let topAmount = 0;
    for (const [id, amount] of map) {
      if (amount > topAmount) {
        topAmount = amount;
        topId = id;
      }
    }
    if (!topId) return null;
    const c = getCategory(topId);
    return {
      label: c?.label ?? "Lainnya",
      icon: c?.icon ?? "Coins",
      color: c?.color ?? "",
      amount: topAmount,
      percent: (topAmount / summary.expense) * 100,
    };
  }, [monthTxs, summary.expense]);

  function handleAdd(tx: Transaction) {
    saveTransaction(tx);
    setTransactions((prev) => [...prev, tx]);
  }

  function handleUpdate(tx: Transaction) {
    updateTransaction(tx);
    setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
    setEditing(null);
  }

  function handleDelete(id: string) {
    deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function handleSaveBudget(categoryId: string, amount: number) {
    saveBudget(categoryId, amount);
    setBudgets((prev) => ({ ...prev, [categoryId]: amount }));
  }

  function handleDeleteBudget(categoryId: string) {
    saveBudget(categoryId, 0);
    setBudgets((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-28 pt-6">
      <header className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">CashFlow</h1>
          <p className="text-sm text-muted-foreground">
            Catat pemasukan & pengeluaranmu
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Pengaturan"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="size-5" />
        </Button>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <MonthSelector value={month} onChange={setMonth} />
          <div className="flex flex-col items-center gap-1 border-y py-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wallet className="size-3.5" />
              Saldo bulan ini
            </div>
            {hydrated ? (
              <p
                className={`text-3xl font-bold ${
                  summary.balance < 0 ? "text-red-500" : ""
                }`}
              >
                {formatIDR(summary.balance)}
              </p>
            ) : (
              <Skeleton className="h-9 w-40" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SummaryItem
              label="Pemasukan"
              value={summary.income}
              tone="income"
              loading={!hydrated}
            />
            <SummaryItem
              label="Pengeluaran"
              value={summary.expense}
              tone="expense"
              loading={!hydrated}
            />
          </div>
          {hydrated && topCategory && <TopCategory data={topCategory} />}
        </CardContent>
      </Card>

      {hydrated && summary.expense > 0 && (
        <ExpenseDonut transactions={monthTxs} />
      )}

      {hydrated && (
        <BudgetCard
          transactions={monthTxs}
          budgets={budgets}
          onSaveBudget={handleSaveBudget}
          onDeleteBudget={handleDeleteBudget}
        />
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Transaksi
          </h2>
          <span className="text-xs text-muted-foreground">
            {visibleTxs.length}{monthTxs.length !== visibleTxs.length ? ` dari ${monthTxs.length}` : ""}
          </span>
        </div>
        <TransactionFilter
          query={filterQuery}
          categoryId={filterCategory}
          onQueryChange={setFilterQuery}
          onCategoryChange={setFilterCategory}
        />
        {hydrated ? (
          <TransactionList
            transactions={visibleTxs}
            onDelete={handleDelete}
            onEdit={setEditing}
            emptyHint={
              monthTxs.length > 0 && visibleTxs.length === 0
                ? "Tidak ada transaksi cocok dengan filter."
                : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
      </section>

      <AddTransactionDialog onSubmit={handleAdd} />

      {editing && (
        <AddTransactionDialog
          mode="edit"
          transaction={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onDataChanged={reloadFromStorage}
      />
    </main>
  );
}

function SummaryItem({
  label,
  value,
  tone,
  loading,
}: {
  label: string;
  value: number;
  tone: "income" | "expense";
  loading: boolean;
}) {
  const Icon = tone === "income" ? TrendingUp : TrendingDown;
  const color = tone === "income" ? "text-emerald-500" : "text-red-500";
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={`size-3.5 ${color}`} />
        {label}
      </div>
      {loading ? (
        <Skeleton className="h-5 w-24" />
      ) : (
        <p className={`text-sm font-semibold ${color}`}>{formatIDR(value)}</p>
      )}
    </div>
  );
}

function TopCategory({
  data,
}: {
  data: {
    label: string;
    icon: string;
    color: string;
    amount: number;
    percent: number;
  };
}) {
  const Icon = getIcon(data.icon);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2">
      <div className={`flex size-7 items-center justify-center rounded-full bg-muted ${data.color}`}>
        <Icon className="size-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Pengeluaran terbesar
        </p>
        <p className="text-sm font-medium truncate">{data.label}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums">
          {formatIDRCompact(data.amount)}
        </p>
        <p className="text-[11px] text-muted-foreground tabular-nums">
          {data.percent.toFixed(0)}%
        </p>
      </div>
    </div>
  );
}
