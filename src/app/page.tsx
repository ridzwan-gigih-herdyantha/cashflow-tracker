"use client";

import { useEffect, useMemo, useState } from "react";
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthSelector } from "@/components/month-selector";
import { TransactionList } from "@/components/transaction-list";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import {
  getTransactions,
  saveTransaction,
  deleteTransaction,
} from "@/lib/storage";
import { formatIDR } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [month, setMonth] = useState(() => new Date());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTransactions(getTransactions());
    setHydrated(true);
  }, []);

  const monthTxs = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return transactions.filter((t) =>
      isWithinInterval(parseISO(t.date), { start, end })
    );
  }, [transactions, month]);

  const summary = useMemo(() => {
    const income = monthTxs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTxs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [monthTxs]);

  function handleAdd(tx: Transaction) {
    saveTransaction(tx);
    setTransactions((prev) => [...prev, tx]);
  }

  function handleDelete(id: string) {
    deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pb-28 pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">CashFlow</h1>
        <p className="text-sm text-muted-foreground">
          Catat pemasukan & pengeluaranmu
        </p>
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
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground px-1">
          Transaksi
        </h2>
        {hydrated ? (
          <TransactionList transactions={monthTxs} onDelete={handleDelete} />
        ) : (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
      </section>

      <AddTransactionDialog onAdd={handleAdd} />
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
