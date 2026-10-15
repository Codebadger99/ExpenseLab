// All months are "YYYY-MM" strings, handled in UTC.

export function currentMonth(now = new Date()): string {
  return now.toISOString().slice(0, 7);
}

export function resolveMonth(month?: string): string {
  return month ?? currentMonth();
}

function parts(month: string) {
  const [y, m] = month.split('-').map(Number);
  return { y, m };
}

// First moment of the month (start) and first moment of the next month (end).
export function monthRange(month: string) {
  const { y, m } = parts(month);
  return {
    start: new Date(Date.UTC(y, m - 1, 1)),
    end: new Date(Date.UTC(y, m, 1)),
  };
}

export function daysInMonth(month: string): number {
  const { y, m } = parts(month);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// Days that have passed in that month, so a half-finished month is averaged fairly.
export function daysElapsed(month: string, now = new Date()): number {
  const current = currentMonth(now);
  if (month < current) return daysInMonth(month);
  if (month === current) return now.getUTCDate();
  return 1;
}

export function previousMonth(month: string): string {
  const { y, m } = parts(month);
  return new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
}

export function countWeekendDays(month: string, upToDay: number) {
  const { y, m } = parts(month);
  let weekend = 0;
  let weekday = 0;
  for (let d = 1; d <= upToDay; d++) {
    const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    if (day === 0 || day === 6) weekend++;
    else weekday++;
  }
  return { weekend, weekday };
}

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}