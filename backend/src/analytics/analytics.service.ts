import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '../generated/client/enums';
import { ExpenseRow } from './entities/types';
import {
  dayKey, daysElapsed, daysInMonth, monthRange, previousMonth, resolveMonth,
} from './entities/date';
import {
  groupSum, mean, median, movingAverage, percent, ranked, round, stdDev, sum,
} from './entities/stats';
import { buildInsights } from './entities/insights';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // One query: this user's expenses for one month. Every endpoint starts here.
  private async expenses(userId: number, month: string): Promise<ExpenseRow[]> {
    const { start, end } = monthRange(month);
    const rows = await this.prisma.transaction.findMany({
      where: { userId, type: TransactionType.EXPENSE, date: { gte: start, lt: end } },
      select: { amount: true, date: true, category: true, merchant: true, desire: true, payment: true },
      orderBy: { date: 'asc' },
    });
    return rows.map((r) => ({ ...r, amount: r.amount.toNumber() }));
  }

  private async income(userId: number, month: string): Promise<number> {
    const { start, end } = monthRange(month);
    const result = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: TransactionType.INCOME, date: { gte: start, lt: end } },
    });
    return result._sum.amount?.toNumber() ?? 0;
  }

  // ---------- DASHBOARD ----------

  async overview(userId: number, monthInput?: string) {
    const month = resolveMonth(monthInput);
    const rows = await this.expenses(userId, month);
    const income = await this.income(userId, month);

    const totalSpent = sum(rows.map((r) => r.amount));
    const days = daysElapsed(month);
    const largest = rows.reduce<ExpenseRow | null>((a, r) => (!a || r.amount > a.amount ? r : a), null);
    const topCategory = ranked(groupSum(rows, (r) => r.category), totalSpent)[0] ?? null;

    return {
      month,
      totalSpent: round(totalSpent),
      income: round(income),
      net: round(income - totalSpent),
      averagePerDay: round(totalSpent / days),
      daysCounted: days,
      expenseCount: rows.length,
      largestExpense: largest
        ? { amount: largest.amount, merchant: largest.merchant, category: largest.category, date: dayKey(largest.date) }
        : null,
      topCategory: topCategory
        ? { category: topCategory.key, amount: topCategory.amount, percent: topCategory.percent }
        : null,
    };
  }

  async categories(userId: number, monthInput?: string) {
    const month = resolveMonth(monthInput);
    const rows = await this.expenses(userId, month);
    const total = sum(rows.map((r) => r.amount));
    return {
      month,
      total: round(total),
      categories: ranked(groupSum(rows, (r) => r.category), total).map((c) => ({
        category: c.key,
        amount: c.amount,
        percent: c.percent,
      })),
    };
  }

  // Spending for every day of the month (zeros included) for the chart
  async trends(userId: number, monthInput?: string) {
    const month = resolveMonth(monthInput);
    const rows = await this.expenses(userId, month);

    const perDay: Record<string, number> = {};
    for (const r of rows) perDay[dayKey(r.date)] = (perDay[dayKey(r.date)] ?? 0) + r.amount;

    const total = daysInMonth(month);
    const dates = Array.from({ length: total }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);
    const amounts = dates.map((d) => round(perDay[d] ?? 0));
    const average = movingAverage(amounts, 7);

    return {
      month,
      daily: dates.map((date, i) => ({ date, amount: amounts[i], movingAverage7: average[i] })),
    };
  }

  // ---------- INSIGHTS ----------

  async statistics(userId: number, monthInput?: string) {
    const month = resolveMonth(monthInput);
    const amounts = (await this.expenses(userId, month)).map((r) => r.amount);
    return {
      month,
      count: amounts.length,
      total: round(sum(amounts)),
      mean: round(mean(amounts)),
      median: round(median(amounts)),
      standardDeviation: round(stdDev(amounts)),
      highest: amounts.length ? Math.max(...amounts) : 0,
      lowest: amounts.length ? Math.min(...amounts) : 0,
    };
  }

  async needsWants(userId: number, monthInput?: string) {
    const month = resolveMonth(monthInput);
    const rows = await this.expenses(userId, month);
    const total = sum(rows.map((r) => r.amount));
    const need = sum(rows.filter((r) => r.desire === 'NEED').map((r) => r.amount));
    const want = sum(rows.filter((r) => r.desire === 'WANT').map((r) => r.amount));
    return {
      month,
      need: { amount: round(need), percent: percent(need, total) },
      want: { amount: round(want), percent: percent(want, total) },
    };
  }

  async paymentMethods(userId: number, monthInput?: string) {
    const month = resolveMonth(monthInput);
    const rows = await this.expenses(userId, month);
    const total = sum(rows.map((r) => r.amount));
    return {
      month,
      methods: ranked(groupSum(rows, (r) => r.payment), total).map((m) => ({
        method: m.key,
        amount: m.amount,
        percent: m.percent,
      })),
    };
  }

  async topMerchants(userId: number, monthInput?: string, limit = 5) {
    const month = resolveMonth(monthInput);
    const rows = await this.expenses(userId, month);
    const total = sum(rows.map((r) => r.amount));
    const named = rows.filter((r) => r.merchant);
    return {
      month,
      merchants: ranked(groupSum(named, (r) => r.merchant!.trim().toLowerCase()), total)
        .slice(0, limit)
        .map((m) => ({ merchant: m.key, amount: m.amount, percent: m.percent })),
    };
  }

  async insights(userId: number, monthInput?: string) {
    const month = resolveMonth(monthInput);
    const [current, previous] = await Promise.all([
      this.expenses(userId, month),
      this.expenses(userId, previousMonth(month)),
    ]);
    const insights = buildInsights(month, current, previous);
    return {
      month,
      insights,
      message: current.length < 3 ? 'Add at least 3 expenses this month to see insights.' : undefined,
    };
  }
}