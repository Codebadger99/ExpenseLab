import { ExpenseRow } from './types';
import { countWeekendDays, daysElapsed, daysInMonth, previousMonth } from './date';
import { groupSum, ranked, sum } from './stats';

const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG');
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

// Turns numbers into sentences. Every sentence is skipped when there isn't enough data.
export function buildInsights(month: string, current: ExpenseRow[], previous: ExpenseRow[]): string[] {
  const out: string[] = [];
  if (current.length < 3) return out;

  const total = sum(current.map((r) => r.amount));
  const elapsed = daysElapsed(month);
  const curDaily = total / elapsed;
  const prevMonth = previousMonth(month);

  // 1 and 2: compare with last month using DAILY averages, so a half month is fair
  if (previous.length >= 3) {
    const prevDays = daysInMonth(prevMonth);
    const prevDaily = sum(previous.map((r) => r.amount)) / prevDays;

    if (prevDaily > 0) {
      const change = Math.round(((curDaily - prevDaily) / prevDaily) * 100);
      if (change !== 0) {
        out.push(
          `Your daily spending is ${Math.abs(change)}% ${change > 0 ? 'higher' : 'lower'} than last month (${naira(curDaily)} vs ${naira(prevDaily)} a day).`,
        );
      }
    }

    const curCat = groupSum(current, (r) => r.category);
    const prevCat = groupSum(previous, (r) => r.category);
    let best: { cat: string; change: number } | null = null;
    for (const cat of Object.keys(curCat)) {
      const p = (prevCat[cat] ?? 0) / prevDays;
      const c = curCat[cat] / elapsed;
      if (p > 0) {
        const change = ((c - p) / p) * 100;
        if (Math.abs(change) >= 15 && (!best || Math.abs(change) > Math.abs(best.change))) {
          best = { cat, change };
        }
      }
    }
    if (best) {
      out.push(
        `You spend ${Math.round(Math.abs(best.change))}% ${best.change > 0 ? 'more' : 'less'} per day on ${label(best.cat)} than last month.`,
      );
    }
  }

  // 3: biggest category
  const cats = ranked(groupSum(current, (r) => r.category), total);
  if (cats.length) {
    out.push(`${label(cats[0].key)} is your biggest category at ${cats[0].percent}% of your spending.`);
  }

  // 4: weekend vs weekday, per day
  const { weekend: weekendDays, weekday: weekdayDays } = countWeekendDays(month, elapsed);
  if (weekendDays >= 2 && weekdayDays >= 2) {
    const weekendTotal = sum(
      current.filter((r) => [0, 6].includes(r.date.getUTCDay())).map((r) => r.amount),
    );
    const weekdayDaily = (total - weekendTotal) / weekdayDays;
    if (weekdayDaily > 0) {
      const change = Math.round(((weekendTotal / weekendDays) / weekdayDaily - 1) * 100);
      if (Math.abs(change) >= 10) {
        out.push(`You spend ${Math.abs(change)}% ${change > 0 ? 'more' : 'less'} per day on weekends than on weekdays.`);
      }
    }
  }

  // 5: top merchants
  const named = current.filter((r) => r.merchant);
  const merchants = ranked(groupSum(named, (r) => r.merchant!.trim().toLowerCase()), total);
  if (merchants.length >= 3) {
    const top = merchants.slice(0, 3);
    const share = Math.round(top.reduce((a, m) => a + m.percent, 0));
    out.push(`Your top 3 merchants (${top.map((m) => label(m.key)).join(', ')}) make up ${share}% of your spending.`);
  }

  // 6: wants
  const wants = sum(current.filter((r) => r.desire === 'WANT').map((r) => r.amount));
  if (wants > 0) {
    out.push(`${Math.round((wants / total) * 100)}% of your spending this month was marked as wants.`);
  }

  return out;
}