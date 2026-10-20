import {
  ArrowLeftRight,
  BookOpen,
  ChartNoAxesCombined,
  CircleDollarSign,
  CreditCard,
  Film,
  HeartPulse,
  LayoutDashboard,
  ShoppingBag,
  Target,
  Utensils,
  Wallet,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Category, Transaction } from "./types"

export const CATEGORIES: Category[] = [
  "FOOD",
  "TRANSPORT",
  "BILLS",
  "SHOPPING",
  "HEALTH",
  "ENTERTAINMENT",
  "SUBSCRIPTION",
  "OTHER",
]

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  FOOD: Utensils,
  TRANSPORT: ArrowLeftRight,
  BILLS: Wallet,
  SHOPPING: ShoppingBag,
  HEALTH: HeartPulse,
  ENTERTAINMENT: Film,
  SUBSCRIPTION: CreditCard,
  OTHER: CircleDollarSign,
}

export const NAVIGATION: { label: string; path: string; icon: LucideIcon }[] = [
  { label: "Overview", path: "/overview", icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { label: "Budgets", path: "/budgets", icon: Wallet },
  { label: "Goals", path: "/goals", icon: Target },
  { label: "Journal", path: "/journal", icon: BookOpen },
  { label: "Insights", path: "/insights", icon: ChartNoAxesCombined },
]

export const money = (value: number | string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

export const label = (value: string) => value.charAt(0) + value.slice(1).toLowerCase()

export const monthName = (value: string) =>
  new Date(`${value}-01T12:00:00`).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  })

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
  })

export const localDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

export const currentMonth = () => localDate().slice(0, 7)

export const monthTransactions = (items: Transaction[], month: string) =>
  items.filter((item) => item.date.slice(0, 7) === month)
