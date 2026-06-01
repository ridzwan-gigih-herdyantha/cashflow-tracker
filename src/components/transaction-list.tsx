"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCategory } from "@/lib/categories";
import { getIcon } from "@/lib/icon-map";
import { formatIDR, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
  emptyHint?: string;
}

export function TransactionList({
  transactions,
  onDelete,
  onEdit,
  emptyHint,
}: Props) {
  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {emptyHint ??
            "Belum ada transaksi bulan ini.\nTekan tombol + untuk menambah."}
        </p>
      </Card>
    );
  }

  const grouped = groupByDate(transactions);

  return (
    <div className="flex flex-col gap-4">
      {grouped.map(([date, items]) => (
        <div key={date} className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-muted-foreground px-1">
            {formatDate(date, "EEEE, d MMMM")}
          </h3>
          <Card className="overflow-hidden p-0 divide-y">
            {items.map((tx) => {
              const category = getCategory(tx.categoryId);
              const Icon = getIcon(category?.icon ?? "Coins");
              const isIncome = tx.type === "income";
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/40 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => onEdit(tx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onEdit(tx);
                    }
                  }}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-muted ${category?.color ?? ""}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {category?.label ?? "Lainnya"}
                    </p>
                    {tx.note && (
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        isIncome ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatIDR(tx.amount)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(tx.id);
                    }}
                    aria-label="Hapus transaksi"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
          </Card>
        </div>
      ))}
    </div>
  );
}

function groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
  const map = new Map<string, Transaction[]>();
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  for (const tx of sorted) {
    const key = tx.date;
    const list = map.get(key) ?? [];
    list.push(tx);
    map.set(key, list);
  }
  return Array.from(map.entries());
}
