export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  label: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  categoryId: string;
  amount: number;
  note: string;
  date: string;
  createdAt: string;
}

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}
