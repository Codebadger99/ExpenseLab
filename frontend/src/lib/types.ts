export type User = {
  id: number
  name: string
  email: string
  monthlyTrackAmount: number | null
}

export type Category =
  | "FOOD"
  | "TRANSPORT"
  | "BILLS"
  | "SHOPPING"
  | "HEALTH"
  | "ENTERTAINMENT"
  | "SUBSCRIPTION"
  | "OTHER"
export type TransactionType = "EXPENSE" | "INCOME"
export type Desire = "NEED" | "WANT"
export type PaymentMethod = "CARD" | "TRANSFER" | "CASH" | "USSD" | "POS"
export type Worth = "YES" | "SOMEWHAT" | "NO"

export type Transaction = {
  id: number
  type: TransactionType
  amount: string | number
  date: string
  category: Category
  merchant: string | null
  desire: Desire
  payment: PaymentMethod
  incomeSources?: string | null
}
export type Budget = { id: number; category: Category; limit: number }
export type Goal = { id: number; name: string; target: number; saved: number }
export type Journal = {
  id: number
  why: string | null
  worth: Worth | null
  reflection: string | null
  journalStatus: "NEEDS_REVIEW" | "WORTH_IT"
  transaction: Transaction
}
export type Notification = {
  id: number
  title: string
  message: string
  isRead: boolean
  createdAt: string
}
export type Overview = {
  month: string
  totalSpent: number
  income: number
  net: number
  averagePerDay: number
  daysCounted: number
  expenseCount: number
  largestExpense: { amount: number; merchant: string | null; date: string } | null
  topCategory: { category: Category; amount: number; percent: number } | null
}
export type Categories = {
  total: number
  categories: { category: Category; amount: number; percent: number }[]
}
export type Trends = { daily: { date: string; amount: number; movingAverage7: number }[] }
export type Statistics = {
  count: number
  total: number
  mean: number
  median: number
  standardDeviation: number
  highest: number
  lowest: number
}
export type NeedsWants = {
  need: { amount: number; percent: number }
  want: { amount: number; percent: number }
}
export type PaymentMethods = { methods: { method: PaymentMethod; amount: number; percent: number }[] }
export type InsightList = { insights: string[]; message?: string }
export type Merchants = { merchants: { merchant: string; amount: number; percent: number }[] }
