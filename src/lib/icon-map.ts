import {
  Briefcase,
  Laptop,
  Gift,
  Coins,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Gamepad2,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Laptop,
  Gift,
  Coins,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Gamepad2,
  MoreHorizontal,
};

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Coins;
}
