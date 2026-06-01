import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatIDR(value: number): string {
  return idr.format(value);
}

export function formatIDRCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return formatIDR(value);
}

export function formatDate(date: Date | string, pattern = "d MMM yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: idLocale });
}

export function formatMonth(date: Date): string {
  return format(date, "MMMM yyyy", { locale: idLocale });
}

export function formatDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
