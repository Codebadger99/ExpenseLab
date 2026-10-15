export const round = (n: number, dp = 2) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

export const sum = (nums: number[]) => nums.reduce((a, b) => a + b, 0);

export const mean = (nums: number[]) => (nums.length ? sum(nums) / nums.length : 0);

export function median(nums: number[]) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// Sample standard deviation (n - 1)
export function stdDev(nums: number[]) {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  return Math.sqrt(nums.reduce((a, x) => a + (x - m) ** 2, 0) / (nums.length - 1));
}

export const percent = (part: number, total: number) =>
  total > 0 ? round((part / total) * 100, 1) : 0;

// Add up amounts per key, e.g. per category or per merchant.
export function groupSum<T extends { amount: number }>(
  rows: T[],
  key: (row: T) => string | null | undefined,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const row of rows) {
    const k = key(row) ?? 'UNKNOWN';
    totals[k] = (totals[k] ?? 0) + row.amount;
  }
  return totals;
}

export function ranked(totals: Record<string, number>, grandTotal: number) {
  return Object.entries(totals)
    .map(([key, amount]) => ({ key, amount: round(amount), percent: percent(amount, grandTotal) }))
    .sort((a, b) => b.amount - a.amount);
}

export function movingAverage(values: number[], window = 7): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    return round(mean(slice));
  });
}