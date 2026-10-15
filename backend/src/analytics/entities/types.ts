// A plain row used by every calculator. No Prisma types, so the maths stays testable.
export interface ExpenseRow {
  amount: number;
  date: Date;
  category: string | null;
  merchant: string | null;
  desire: string;
  payment: string;
}