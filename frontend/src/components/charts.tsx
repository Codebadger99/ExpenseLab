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
              formatter={(value, name) => [currency(Number(value)), name]}
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

export function CategoryDonutChart({
  data,
}: {
  data: { category: string; amount: number; percent: number }[];
}) {
  const config = Object.fromEntries(
    data.map((item, index) => [
      item.category,
      {
        label: item.category.charAt(0) + item.category.slice(1).toLowerCase(),
        color: palette[index % palette.length],
      },
    ]),
  ) satisfies ChartConfig;
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(140px,0.8fr)_minmax(150px,1.2fr)]">
      <ChartContainer
        config={config}
        className="mx-auto h-[180px] w-full max-w-[190px]"
      >
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
            innerRadius="64%"
            outerRadius="88%"
            paddingAngle={2}
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
      <ul className="grid gap-2.5">
        {data.map((item, index) => (
          <li
            className="grid grid-cols-[8px_1fr_auto] items-center gap-2 text-xs"
            key={item.category}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: palette[index % palette.length] }}
            />
            <span className="text-[#738078]">
              {item.category.charAt(0) + item.category.slice(1).toLowerCase()}
            </span>
            <strong className="text-[#1d332b]">{currency(item.amount)}</strong>
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
