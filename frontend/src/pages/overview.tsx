import { useState, type FormEvent } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ChartNoAxesCombined,
  Pencil,
  Wallet,
} from "lucide-react";
import type {
  Budget,
  Categories,
  Goal,
  Overview,
  Transaction,
  Trends,
} from "../lib/types";
import { apiRequest, getErrorMessage } from "../lib/api";
import {
  CATEGORIES,
  label,
  monthTransactions,
  money,
} from "../lib/dashboard-data";
import {
  CategoryDonutChart,
  DailySpendingChart,
  GoalProgressChart,
} from "../components/charts";
import {
  CurrencyInput,
  EmptyState,
  ErrorState,
  Field,
  LoadingSpinner,
  MetricCard,
  PageHeading,
  PageSkeleton,
} from "../components/workspace-ui";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useResource } from "./page-data";

export function OverviewPage({
  month,
  refreshKey,
  monthlyTrackAmount,
  onTrackAmountChange,
  onNavigate,
}: {
  month: string;
  refreshKey: number;
  monthlyTrackAmount: number | null;
  onTrackAmountChange: (amount: number) => void;
  onNavigate: (path: string) => void;
}) {
  const [targetOpen, setTargetOpen] = useState(false);
  const [targetDraft, setTargetDraft] = useState(
    monthlyTrackAmount ? String(monthlyTrackAmount) : "",
  );
  const [savingTarget, setSavingTarget] = useState(false);
  const [targetError, setTargetError] = useState("");
  const query = `?month=${month}`;
  const overview = useResource<Overview>(
    `/analytics/overview${query}`,
    refreshKey,
  );
  const categories = useResource<Categories>(
    `/analytics/categories${query}`,
    refreshKey,
  );
  const trends = useResource<Trends>(`/analytics/trends${query}`, refreshKey);
  const budgets = useResource<Budget[]>("/budget", refreshKey);
  const goals = useResource<Goal[]>("/goal", refreshKey);
  const transactions = useResource<Transaction[]>("/transaction", refreshKey);
  const errors = [
    overview.error,
    categories.error,
    trends.error,
    budgets.error,
    goals.error,
    transactions.error,
  ].filter(Boolean);

  if (
    overview.loading ||
    categories.loading ||
    trends.loading ||
    budgets.loading ||
    goals.loading ||
    transactions.loading
  )
    return <PageSkeleton page="overview" />;
  if (errors.length)
    return (
      <ErrorState
        message={errors[0] ?? "Unable to load your overview."}
        onRetry={() => window.location.reload()}
      />
    );

  const summary = overview.data!;
  const monthItems = monthTransactions(transactions.data ?? [], month);
  const categoryTotals = categories.data?.categories ?? [];
  const budgetsByCategory = new Map(
    (budgets.data ?? []).map((item) => [item.category, item.limit]),
  );
  const budgetRows = CATEGORIES.map((category) => ({
    category,
    spent: monthItems
      .filter((item) => item.type === "EXPENSE" && item.category === category)
      .reduce((total, item) => total + Number(item.amount), 0),
    limit: budgetsByCategory.get(category) ?? 0,
  })).filter((item) => item.limit > 0);

  async function saveMonthlyTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(targetDraft);
    if (!Number.isFinite(amount) || amount < 1) {
      setTargetError("Enter a monthly target greater than zero.");
      return;
    }
    setSavingTarget(true);
    setTargetError("");
    try {
      await apiRequest("/users/me/monthly-track-amount", {
        method: "PATCH",
        body: { monthlyTrackAmount: amount },
      });
      onTrackAmountChange(amount);
      setTargetOpen(false);
    } catch (reason) {
      setTargetError(getErrorMessage(reason));
    } finally {
      setSavingTarget(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeading
        title="Overview"
        description="Your month at a glance. A clear view of what came in and what went out."
      />
      <section className="overview-hero">
        <div className="hero-topline">
          <span>This month · day {summary.daysCounted}</span>
          {monthlyTrackAmount !== null &&
            summary.totalSpent > monthlyTrackAmount && (
              <Badge className="over-budget-badge">
                {money(summary.totalSpent - monthlyTrackAmount)} over budget
              </Badge>
            )}
        </div>
        <div className="hero-number">
          {money(summary.totalSpent)}{" "}
          <span>
            spent{" "}
            {monthlyTrackAmount !== null
              ? `of ${money(monthlyTrackAmount)} budgeted`
              : "this month"}
          </span>
        </div>
        <div className="hero-track">
          <span
            style={{
              width: `${monthlyTrackAmount ? Math.min((summary.totalSpent / monthlyTrackAmount) * 100, 100) : 0}%`,
            }}
          />
        </div>
        <div className="hero-meta">
          <span>Average {money(summary.averagePerDay)} a day</span>
          <button
            className="hero-target-button"
            onClick={() => {
              setTargetDraft(
                monthlyTrackAmount ? String(monthlyTrackAmount) : "",
              );
              setTargetError("");
              setTargetOpen(true);
            }}
          >
            {monthlyTrackAmount === null
              ? "Set monthly target"
              : "Edit monthly target"}{" "}
            <Pencil size={12} />
          </button>
        </div>
      </section>
      <div className="metric-grid four">
        <MetricCard
          title="Income"
          value={money(summary.income)}
          caption="Income this month"
          icon={ArrowDownLeft}
        />
        <MetricCard
          title="Net"
          value={money(summary.net)}
          caption="Income minus expenses"
          icon={Activity}
          highlight
        />
        <MetricCard
          title="Transactions"
          value={String(summary.expenseCount)}
          caption="Expenses this month"
          icon={ArrowLeftRight}
        />
        <MetricCard
          title="Largest purchase"
          value={money(summary.largestExpense?.amount ?? 0)}
          caption={summary.largestExpense?.merchant ?? "No expenses yet"}
          icon={Wallet}
        />
      </div>
      <Card className="chart-card">
        <div className="section-head">
          <div className="section-title">
            <h2>Daily spending</h2>
            <Button
              variant="ghost"
              className="section-title-action"
              aria-label="View transactions"
              onClick={() => onNavigate("/transactions")}
            >
              <ArrowRight size={15} />
            </Button>
            <p>Your spending rhythm across the month.</p>
          </div>
        </div>
        {trends.data?.daily.some((day) => day.amount > 0) ? (
          <DailySpendingChart data={trends.data.daily} />
        ) : (
          <EmptyState
            title="No spending recorded yet"
            description="Add your first expense and your month will start to take shape."
            icon={ChartNoAxesCombined}
          />
        )}
      </Card>
      <div className="overview-bottom">
        <Card className="category-card">
          <div className="section-head">
            <div className="section-title">
              <h2>By category</h2>
              <Button
                variant="ghost"
                className="section-title-action"
                aria-label="View transactions"
                onClick={() => onNavigate("/transactions")}
              >
                <ArrowRight size={15} />
              </Button>
              <p>Where your money went.</p>
            </div>
          </div>
          {categoryTotals.length ? (
            <CategoryDonutChart data={categoryTotals} />
          ) : (
            <EmptyState
              title="No category breakdown yet"
              description="Expense categories will appear here."
            />
          )}
        </Card>
        <Card className="budget-preview-card">
          <div className="section-head">
            <div className="section-title">
              <h2>Budget progress</h2>
              <Button
                variant="ghost"
                className="section-title-action"
                aria-label="Manage budgets"
                onClick={() => onNavigate("/budgets")}
              >
                <ArrowRight size={15} />
              </Button>
              <p>Category spending against your limits.</p>
            </div>
          </div>
          {budgetRows.length ? (
            <div className="budget-preview-list">
              {budgetRows.slice(0, 6).map((item) => {
                const over = item.spent > item.limit;
                return (
                  <div className="budget-preview" key={item.category}>
                    <div>
                      <span>{label(item.category)}</span>
                      <span className={over ? "text-danger" : ""}>
                        {money(item.spent)} / {money(item.limit)}
                      </span>
                    </div>
                    <div className="progress-track">
                      <span
                        className={over ? "danger-fill" : ""}
                        style={{
                          width: `${Math.min((item.spent / item.limit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Set your first budget"
              description="Choose monthly limits to keep spending intentional."
            />
          )}
        </Card>
      </div>
      <Card className="chart-card">
        <div className="section-head">
          <div className="section-title">
            <h2>Savings goals</h2>
            <Button
              variant="ghost"
              className="section-title-action"
              aria-label="View savings goals"
              onClick={() => onNavigate("/goals")}
            >
              <ArrowRight size={15} />
            </Button>
            <p>See how your savings are tracking against each target.</p>
          </div>
        </div>
        {goals.data?.length ? (
          <GoalProgressChart
            data={goals.data.map((goal) => ({
              name: goal.name,
              saved: goal.saved,
              target: goal.target,
            }))}
          />
        ) : (
          <EmptyState
            title="No savings goals yet"
            description="Create a goal to track your progress towards it here."
            icon={Wallet}
          />
        )}
      </Card>
      <Dialog open={targetOpen} onOpenChange={setTargetOpen}>
        <DialogContent className="form-dialog">
          <DialogHeader>
            <DialogTitle>Monthly spending target</DialogTitle>
            <DialogDescription>
              Choose the amount you want to keep your monthly spending within.
            </DialogDescription>
          </DialogHeader>
          <form
            className="dialog-form"
            onSubmit={(event) => void saveMonthlyTarget(event)}
          >
            <Field label="Monthly target">
              <CurrencyInput value={targetDraft} onChange={setTargetDraft} />
            </Field>
            {targetError && (
              <p className="form-error" role="alert">
                {targetError}
              </p>
            )}
            <Button
              type="submit"
              disabled={savingTarget}
              aria-busy={savingTarget}
            >
              {savingTarget ? (
                <>
                  Saving… <LoadingSpinner />
                </>
              ) : (
                "Save target"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
