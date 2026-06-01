import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  { id: "salary", label: "Gaji", type: "income", icon: "Briefcase", color: "text-emerald-500", swatch: "#10b981" },
  { id: "freelance", label: "Freelance", type: "income", icon: "Laptop", color: "text-teal-500", swatch: "#14b8a6" },
  { id: "gift", label: "Hadiah", type: "income", icon: "Gift", color: "text-green-500", swatch: "#22c55e" },
  { id: "other-income", label: "Lainnya", type: "income", icon: "Coins", color: "text-lime-500", swatch: "#84cc16" },
  { id: "food", label: "Makanan", type: "expense", icon: "UtensilsCrossed", color: "text-orange-500", swatch: "#f97316" },
  { id: "transport", label: "Transport", type: "expense", icon: "Car", color: "text-blue-500", swatch: "#3b82f6" },
  { id: "shopping", label: "Belanja", type: "expense", icon: "ShoppingBag", color: "text-pink-500", swatch: "#ec4899" },
  { id: "bills", label: "Tagihan", type: "expense", icon: "Receipt", color: "text-yellow-500", swatch: "#eab308" },
  { id: "health", label: "Kesehatan", type: "expense", icon: "HeartPulse", color: "text-red-500", swatch: "#ef4444" },
  { id: "entertainment", label: "Hiburan", type: "expense", icon: "Gamepad2", color: "text-purple-500", swatch: "#a855f7" },
  { id: "other-expense", label: "Lainnya", type: "expense", icon: "MoreHorizontal", color: "text-zinc-500", swatch: "#71717a" },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function categoriesByType(type: "income" | "expense"): Category[] {
  return CATEGORIES.filter((c) => c.type === type);
}
