import type { Budgets, Transaction } from "./types";

const TX_KEY = "cashflow:transactions:v1";
const BUDGETS_KEY = "cashflow:budgets:v1";

function readTx(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTx(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TX_KEY, JSON.stringify(transactions));
}

function readBudgets(): Budgets {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BUDGETS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Budgets;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeBudgets(budgets: Budgets): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
}

export function getTransactions(): Transaction[] {
  return readTx();
}

export function saveTransaction(tx: Transaction): void {
  const list = readTx();
  list.push(tx);
  writeTx(list);
}

export function updateTransaction(tx: Transaction): void {
  const list = readTx().map((t) => (t.id === tx.id ? tx : t));
  writeTx(list);
}

export function deleteTransaction(id: string): void {
  const list = readTx().filter((t) => t.id !== id);
  writeTx(list);
}

export function getBudgets(): Budgets {
  return readBudgets();
}

export function saveBudget(categoryId: string, amount: number): void {
  const current = readBudgets();
  if (amount > 0) {
    current[categoryId] = amount;
  } else {
    delete current[categoryId];
  }
  writeBudgets(current);
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TX_KEY);
  window.localStorage.removeItem(BUDGETS_KEY);
}

interface BackupPayload {
  version: 1;
  exportedAt: string;
  transactions: Transaction[];
  budgets: Budgets;
}

export function exportData(): string {
  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions: readTx(),
    budgets: readBudgets(),
  };
  return JSON.stringify(payload, null, 2);
}

function isValidTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    (v.type === "income" || v.type === "expense") &&
    typeof v.categoryId === "string" &&
    typeof v.amount === "number" &&
    typeof v.date === "string"
  );
}

export function importData(
  json: string,
  mode: "merge" | "replace"
): { added: number; skipped: number; budgets: number } {
  const data = JSON.parse(json) as Partial<BackupPayload> | Transaction[];
  const incomingTxs = Array.isArray(data) ? data : data.transactions ?? [];
  const incomingBudgets =
    !Array.isArray(data) && data.budgets && typeof data.budgets === "object"
      ? data.budgets
      : {};

  const validIncoming: Transaction[] = incomingTxs
    .filter(isValidTransaction)
    .map((t) => ({
      ...t,
      note: t.note ?? "",
      createdAt: t.createdAt ?? new Date().toISOString(),
    }));

  let added = 0;
  let skipped = 0;

  if (mode === "replace") {
    writeTx(validIncoming);
    added = validIncoming.length;
    writeBudgets(incomingBudgets);
  } else {
    const existing = readTx();
    const seen = new Set(existing.map((t) => t.id));
    const merged = [...existing];
    for (const t of validIncoming) {
      if (seen.has(t.id)) {
        skipped++;
      } else {
        merged.push(t);
        added++;
      }
    }
    writeTx(merged);
    writeBudgets({ ...readBudgets(), ...incomingBudgets });
  }

  return { added, skipped, budgets: Object.keys(incomingBudgets).length };
}
