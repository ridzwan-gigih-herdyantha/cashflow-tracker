import type { Transaction } from "./types";

const KEY = "cashflow:transactions:v1";

function read(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(transactions));
}

export function getTransactions(): Transaction[] {
  return read();
}

export function saveTransaction(tx: Transaction): void {
  const list = read();
  list.push(tx);
  write(list);
}

export function deleteTransaction(id: string): void {
  const list = read().filter((t) => t.id !== id);
  write(list);
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
