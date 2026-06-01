"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, subMonths, isSameMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { formatMonth } from "@/lib/format";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ value, onChange }: Props) {
  const isCurrentMonth = isSameMonth(value, new Date());

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(subMonths(value, 1))}
        aria-label="Bulan sebelumnya"
      >
        <ChevronLeft className="size-5" />
      </Button>
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium capitalize">{formatMonth(value)}</span>
        {!isCurrentMonth && (
          <button
            onClick={() => onChange(new Date())}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Kembali ke bulan ini
          </button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(addMonths(value, 1))}
        aria-label="Bulan berikutnya"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
