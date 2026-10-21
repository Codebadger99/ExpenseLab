import {
  Activity,
  ArrowDownLeft,
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  Lightbulb,
  ShoppingBag,
} from "lucide-react";
import type {
  InsightList,
  Merchants,
  NeedsWants,
  PaymentMethods,
  Statistics,
  Transaction,
  Trends,
} from "../lib/types";
import { label, monthName, money } from "../lib/dashboard-data";
import {
  DailySpendingChart,
  NeedsWantsChart,
  PaymentMethodsChart,
} from "../components/charts";
import {
  EmptyState,
  ErrorState,
  InsightCard,
  MetricCard,
  PageHeading,
  PageSkeleton,
} from "../components/workspace-ui";
import { Card } from "../../components/ui/card";
import { useResource } from "./page-data";

const calendarMonthFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  timeZone: "UTC",
});
const calendarDayFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function YearlySpendingCalendar({
  year,
  transactions,
}: {
  year: number;
  transactions: Transaction[];
}) {
  const dailySpending = new Map<string, { amount: number; count: number }>();
  for (const transaction of transactions) {
    if (transaction.type !== "EXPENSE" || transaction.date.slice(0, 4) !== String(year)) {
      continue;
    }
    const day = transaction.date.slice(0, 10);
    const current = dailySpending.get(day) ?? { amount: 0, count: 0 };
    current.amount += Number(transaction.amount);
    current.count += 1;
    dailySpending.set(day, current);
  }
  const maxSpending = Math.max(
    0,
    ...Array.from(dailySpending.values(), (day) => day.amount),
  );

  return (
    <div
      className="year-calendar"
      role="group"
      aria-label={`Daily spending during ${year}`}
    >
      {Array.from({ length: 12 }, (_, monthIndex) => {
        const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
        const daysInMonth = new Date(
          Date.UTC(year, monthIndex + 1, 0),
        ).getUTCDate();
        const monthLabel = calendarMonthFormatter.format(
          new Date(Date.UTC(year, monthIndex, 1)),
        );

        return (
          <section className="year-calendar-month" key={monthIndex}>
            <h3>{monthLabel}</h3>
            <div className="year-calendar-weekdays" aria-hidden="true">
              {"SMTWTFS".split("").map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>
            <div
              className="year-calendar-days"
              role="group"
              aria-label={monthLabel}
            >
              {Array.from({ length: firstWeekday }, (_, index) => (
                <span
                  className="year-calendar-blank"
                  key={`blank-${index}`}
                  aria-hidden="true"
                />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
                const spending = dailySpending.get(date);
                const level =
                  !spending || maxSpending === 0
                    ? 0
                    : Math.min(
                        4,
                        Math.ceil((spending.amount / maxSpending) * 4),
                      );
                const formattedDate = calendarDayFormatter.format(
                  new Date(`${date}T12:00:00Z`),
                );
                return (
                  <span
                    className={`year-calendar-day level-${level}`}
                    key={date}
                    role="img"
                    tabIndex={0}
                    title={
                      spending
                        ? `${formattedDate}: ${money(spending.amount)} across ${spending.count} ${spending.count === 1 ? "expense" : "expenses"}`
                        : `${formattedDate}: No spending`
                    }
                    aria-label={
                      spending
                        ? `${formattedDate}: ${money(spending.amount)} spent`
                        : `${formattedDate}: No spending`
                    }
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function InsightsPage({
  month,
  refreshKey,
}: {
  month: string;
  refreshKey: number;
}) {
  const query = `?month=${month}`;
  const stats = useResource<Statistics>(
    `/analytics/statistics${query}`,
    refreshKey,
  );
  const needsWants = useResource<NeedsWants>(
    `/analytics/needs-wants${query}`,
    refreshKey,
  );
  const paymentMethods = useResource<PaymentMethods>(
    `/analytics/payment-methods${query}`,
    refreshKey,
  );
  const trends = useResource<Trends>(`/analytics/trends${query}`, refreshKey);
  const insights = useResource<InsightList>(
    `/analytics/insights${query}`,
    refreshKey,
  );
  const merchants = useResource<Merchants>(
    `/analytics/merchants/top${query}&limit=3`,
    refreshKey,
  );
  const transactions = useResource<Transaction[]>("/transaction", refreshKey);
  const resources = [
    stats,
    needsWants,
    paymentMethods,
    trends,
    insights,
    merchants,
    transactions,
  ];
  const error = resources.find((item) => item.error)?.error;
  if (resources.some((item) => item.loading))
    return <PageSkeleton page="insights" />;
  if (error)
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );

  const messages = insights.data?.insights ?? [];
  const topThree = merchants.data?.merchants ?? [];
  const topShare = Number(
    topThree.reduce((total, item) => total + item.percent, 0).toFixed(1),
  );
  const selectedYear = Number(month.slice(0, 4));
  const weekendMessage = messages.find((item) => item.includes("weekends"));
  const dailyMessage = messages.find((item) => item.includes("daily spending"));

  return (
    <div className="page-stack">
      <PageHeading
        title="Insights"
        description="Turn your spending into perspective. See the patterns that shape your month."
      />
      {insights.data?.message && (
        <div className="info-banner">
          <Lightbulb size={16} />
          <span>{insights.data.message}</span>
        </div>
      )}
      <div className="insight-cards">
        <InsightCard
          value={dailyMessage ? extractInsightNumber(dailyMessage) : "—"}
          tone="green"
          title="A lighter daily spend"
          description={
            dailyMessage ??
            "Your daily spending patterns will appear once you have data from two months."
          }
          icon={ArrowDownLeft}
        />
        <InsightCard
          value={weekendMessage ? extractInsightNumber(weekendMessage) : "—"}
          tone="gold"
          title="Your spending rhythm"
          description={
            weekendMessage ??
            "Weekend and weekday comparisons appear as your spending history grows."
          }
          icon={CalendarDays}
        />
        <InsightCard
          value={topShare ? `${topShare.toFixed(1)}%` : "—"}
          tone="green"
          title="Your top merchants"
          description={
            topThree.length
              ? `${topThree.map((item) => label(item.merchant)).join(", ")} make up ${topShare.toFixed(1)}% of spending.`
              : "Merchant patterns will appear when you record purchases."
          }
          icon={ShoppingBag}
        />
      </div>
      <div className="metric-grid three">
        <MetricCard
          title="Mean transaction"
          value={money(stats.data?.mean ?? 0)}
          caption="Average expense amount"
          icon={ChartNoAxesCombined}
        />
        <MetricCard
          title="Median transaction"
          value={money(stats.data?.median ?? 0)}
          caption="The middle transaction amount"
          icon={Activity}
        />
        <MetricCard
          title="Standard deviation"
          value={money(stats.data?.standardDeviation ?? 0)}
          caption={`${stats.data?.count ?? 0} expenses this month`}
          icon={Activity}
        />
      </div>
      <Card className="chart-card">
        <div className="section-head">
          <div>
            <h2>Daily spending</h2>
            <p>Your spending pattern across {monthName(month)}.</p>
          </div>
        </div>
        {trends.data?.daily.some((day) => day.amount > 0) ? (
          <DailySpendingChart data={trends.data.daily} />
        ) : (
          <EmptyState
            title="No daily spending yet"
            description="Add an expense to see your month?s spending rhythm."
            icon={ChartNoAxesCombined}
          />
        )}
      </Card>
      <Card className="chart-card yearly-calendar-card">
        <div className="section-head">
          <div>
            <h2>{selectedYear} spending calendar</h2>
            <p>
              Each square is a day. Darker green means more spending; hover or
              focus a day for its total.
            </p>
          </div>
        </div>
        <div className="year-calendar-legend" aria-label="Spending scale">
          <span>Less</span>
          <i className="level-0" />
          <i className="level-1" />
          <i className="level-2" />
          <i className="level-3" />
          <i className="level-4" />
          <span>More</span>
        </div>
        <YearlySpendingCalendar
          year={selectedYear}
          transactions={transactions.data ?? []}
        />
      </Card>
      <div className="insights-bottom">
        <Card className="needs-card">
          <div className="section-head">
            <div>
              <h2>Needs vs wants</h2>
              <p>The balance behind your spending.</p>
            </div>
          </div>
          <NeedsWantsChart
            need={needsWants.data?.need ?? { amount: 0, percent: 0 }}
            want={needsWants.data?.want ?? { amount: 0, percent: 0 }}
          />
        </Card>
        <Card className="payments-card">
          <div className="section-head">
            <div>
              <h2>Payment methods</h2>
              <p>How you paid this month.</p>
            </div>
          </div>
          {paymentMethods.data?.methods.length ? (
            <PaymentMethodsChart
              data={paymentMethods.data.methods.map((method) => ({
                method: method.method,
                amount: method.amount,
                percent: method.percent,
              }))}
            />
          ) : (
            <EmptyState
              title="No payment data yet"
              description="Payment patterns appear with your first expense."
              icon={CreditCard}
            />
          )}
        </Card>
      </div>
      {messages.length > 0 && (
        <Card className="insight-notes">
          <div className="section-head">
            <div>
              <h2>What stands out</h2>
              <p>Patterns from your {monthName(month)} activity.</p>
            </div>
          </div>
          <ul>
            {messages.map((message) => (
              <li key={message}>
                <span className="insight-bullet">
                  <Lightbulb size={14} />
                </span>
                {message}
              </li>
            ))}
          </ul>
        </Card>
      )}
      {!stats.data?.count && (
        <Card>
          <EmptyState
            title="Your insights will grow with your history"
            description="Add at least a few expenses to see meaningful patterns here."
            icon={ChartNoAxesCombined}
          />
        </Card>
      )}
    </div>
  );
}
function extractInsightNumber(value: string) {
  const match = value.match(/\d+%/);
  if (!match) return "—";
  const qualifier = value.includes("lower")
    ? " lower"
    : value.includes("higher") || value.includes("more")
      ? " more"
      : "";
  return `${match[0]}${qualifier}`;
}
