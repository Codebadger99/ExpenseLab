import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart";

const currency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
const compact = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
const displayDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });

export type DailySpendingPoint = {
  date: string;
  amount: number;
  movingAverage7: number;
};

export function DailySpendingChart({ data }: { data: DailySpendingPoint[] }) {
  const config = {
    amount: { label: "Daily spending", color: "#128260" },
    movingAverage7: { label: "7-day average", color: "#d9bc84" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="mt-4 h-[240px] w-full">
      <ComposedChart
        accessibilityLayer
        data={data}
        margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) => value.slice(-2)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={42}
          tickFormatter={(value: number) => compact(value)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => displayDate(String(value))}
              formatter={(value, name) => (
                <div className="daily-spending-tooltip-row">
                  <span>
                    {name === "amount" ? "Daily spending" : "7-day average"}
                  </span>
                  <strong>{currency(Number(value))}</strong>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="amount"
          fill="var(--color-amount)"
          radius={[3, 3, 0, 0]}
          maxBarSize={18}
          isAnimationActive
          animationDuration={650}
        />
        <Line
          dataKey="movingAverage7"
          type="monotone"
          stroke="var(--color-movingAverage7)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive
          animationDuration={750}
        />
      </ComposedChart>
    </ChartContainer>
  );
}

export function GoalProgressChart({
  data,
}: {
  data: { name: string; saved: number; target: number }[];
}) {
  return (
    <div className="goal-progress-chart" aria-label="Savings goal progress">
      {data.map((goal, index) => {
        const percentage =
          goal.target > 0
            ? Math.round((goal.saved / goal.target) * 100)
            : 0;
        const progress = Math.min(Math.max(percentage, 0), 100);
        return (
          <div className="goal-progress-item" key={`${goal.name}-${index}`}>
            <div className="goal-progress-heading">
              <strong>{goal.name}</strong>
              <span>{percentage}%</span>
            </div>
            <p>
              {currency(goal.saved)} saved of {currency(goal.target)}
            </p>
            <div
              className="goal-progress-track"
              role="progressbar"
              aria-label={`${goal.name} savings progress`}
              aria-valuemin={0}
              aria-valuemax={goal.target}
              aria-valuenow={Math.min(Math.max(goal.saved, 0), goal.target)}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CategoryDonutChart({
  data,
}: {
  data: { category: string; amount: number; percent: number }[];
}) {
  const palette = [
    "#128260",
    "#80b39c",
    "#b8cba7",
    "#dabd84",
    "#7c9291",
    "#b4a5bd",
    "#e2a38c",
    "#9ca99e",
  ];
  const config = Object.fromEntries(
    data.map((item, index) => [
      item.category,
      {
        label: item.category.charAt(0) + item.category.slice(1).toLowerCase(),
        color: palette[index % palette.length],
      },
    ]),
  ) satisfies ChartConfig;
  const totalSpent = data.reduce((total, item) => total + item.amount, 0);

  return (
    <div className="category-pie-layout">
      <div className="category-pie-visual">
        <ChartContainer config={config} className="category-pie-chart">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="category"
                  formatter={(value) => currency(Number(value))}
                />
              }
            />
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="var(--paper)"
              strokeWidth={2}
              isAnimationActive
              animationDuration={700}
            >
              {data.map((item, index) => (
                <Cell
                  key={item.category}
                  fill={palette[index % palette.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="category-pie-total">
          <span>Total spent</span>
          <strong>{currency(totalSpent)}</strong>
        </div>
      </div>
      <ul className="category-breakdown-list" aria-label="Spending by category">
        {data.map((item, index) => (
          <li className="category-breakdown-item" key={item.category}>
            <span
              className="category-breakdown-dot"
              style={{ backgroundColor: palette[index % palette.length] }}
              aria-hidden="true"
            />
            <span className="category-breakdown-name">
              {item.category.charAt(0) + item.category.slice(1).toLowerCase()}
            </span>
            <strong>{currency(item.amount)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NeedsWantsChart({
  need,
  want,
}: {
  need: { amount: number; percent: number };
  want: { amount: number; percent: number };
}) {
  const data = [
    { name: "need", amount: need.amount },
    { name: "want", amount: want.amount },
  ];
  const config = {
    need: { label: "Needs", color: "#128260" },
    want: { label: "Wants", color: "#d9bc84" },
  } satisfies ChartConfig;
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[160px_1fr]">
      <ChartContainer
        config={config}
        className="mx-auto h-[170px] w-full max-w-[170px]"
      >
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="name"
                formatter={(value) => currency(Number(value))}
              />
            }
          />
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={3}
            isAnimationActive
            animationDuration={700}
          >
            <Cell fill="var(--color-need)" />
            <Cell fill="var(--color-want)" />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[#738078]">Needs</span>
          <strong className="text-lg">{need.percent}%</strong>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#edf0eb]">
          <span
            className="block h-full rounded-full bg-[#128260] transition-[width] duration-700"
            style={{ width: `${need.percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[#738078]">Wants</span>
          <strong className="text-lg">{want.percent}%</strong>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#edf0eb]">
          <span
            className="block h-full rounded-full bg-[#d9bc84] transition-[width] duration-700"
            style={{ width: `${want.percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function PaymentMethodsChart({
  data,
}: {
  data: { method: string; amount: number; percent: number }[];
}) {
  const config = {
    percent: { label: "Share", color: "#128260" },
  } satisfies ChartConfig;
  const label = (value: string) =>
    value.charAt(0) + value.slice(1).toLowerCase();
  return (
    <ChartContainer config={config} className="mt-3 h-[220px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 14, left: 2, bottom: 5 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          dataKey="percent"
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${value}%`}
        />
        <YAxis
          type="category"
          dataKey="method"
          tickLine={false}
          axisLine={false}
          width={82}
          tickFormatter={(value: string) => label(value)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              nameKey="method"
              formatter={(value) => `${value}%`}
            />
          }
        />
        <Bar
          dataKey="percent"
          fill="var(--color-percent)"
          radius={[0, 4, 4, 0]}
          maxBarSize={22}
          isAnimationActive
          animationDuration={700}
        />
      </BarChart>
    </ChartContainer>
  );
}
