"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";

interface Props {
  query: string;
  categoryId: string;
  onQueryChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
}

const ALL = "__all__";

export function TransactionFilter({
  query,
  categoryId,
  onQueryChange,
  onCategoryChange,
}: Props) {
  const active = query.trim().length > 0 || categoryId.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari catatan…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-8 h-9"
            autoComplete="off"
          />
        </div>
        <Select
          value={categoryId || ALL}
          onValueChange={(v) => onCategoryChange(v === ALL ? "" : (v as string))}
        >
          <SelectTrigger size="sm" className="w-[140px] shrink-0">
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua kategori</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {active && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start h-7 px-2 text-xs text-muted-foreground"
          onClick={() => {
            onQueryChange("");
            onCategoryChange("");
          }}
        >
          <X className="size-3" />
          Bersihkan filter
        </Button>
      )}
    </div>
  );
}
