"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getCategory } from "@/lib/categories";
import { formatIDR, formatIDRCompact } from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
}

interface Slice {
  categoryId: string;
  label: string;
  swatch: string;
  amount: number;
  percent: number;
}

export function ExpenseDonut({ transactions }: Props) {
  const { slices, total } = useMemo(() => computeSlices(transactions), [
    transactions,
  ]);

  if (total === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-sm text-muted-foreground">
            Belum ada pengeluaran bulan ini.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Breakdown Pengeluaran</h2>
          <span className="text-xs text-muted-foreground">
            {slices.length} kategori
          </span>
        </div>
        <div className="flex items-center justify-center">
          <Donut slices={slices} total={total} />
        </div>
        <ul className="flex flex-col gap-1.5">
          {slices.map((s) => (
            <li key={s.categoryId} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: s.swatch }}
              />
              <span className="flex-1 truncate">{s.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {s.percent.toFixed(0)}%
              </span>
              <span className="w-24 text-right font-medium tabular-nums">
                {formatIDR(s.amount)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function Donut({ slices, total }: { slices: Slice[]; total: number }) {
  const size = 160;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        {slices.map((s) => {
          const length = (s.percent / 100) * circumference;
          const dashArray = `${length} ${circumference - length}`;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={s.categoryId}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.swatch}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Total
        </span>
        <span className="text-lg font-bold">{formatIDRCompact(total)}</span>
      </div>
    </div>
  );
}

function computeSlices(transactions: Transaction[]): {
  slices: Slice[];
  total: number;
} {
  const expense = transactions.filter((t) => t.type === "expense");
  const total = expense.reduce((sum, t) => sum + t.amount, 0);
  if (total === 0) return { slices: [], total: 0 };

  const byCategory = new Map<string, number>();
  for (const tx of expense) {
    byCategory.set(tx.categoryId, (byCategory.get(tx.categoryId) ?? 0) + tx.amount);
  }

  const slices: Slice[] = Array.from(byCategory.entries())
    .map(([categoryId, amount]) => {
      const c = getCategory(categoryId);
      return {
        categoryId,
        label: c?.label ?? "Lainnya",
        swatch: c?.swatch ?? "#71717a",
        amount,
        percent: (amount / total) * 100,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return { slices, total };
}
