import { useState } from "react";
import { ChartNoAxesCombined, Pencil } from "lucide-react";
import type { Budget, Category, Transaction } from "../lib/types";
import { apiRequest, getErrorMessage } from "../lib/api";
import { getFormValidationError } from "../lib/form-validation";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  label,
  monthTransactions,
  money,
} from "../lib/dashboard-data";
import {
  ErrorState,
  LoadingSpinner,
  PageHeading,
  PageSkeleton,
} from "../components/workspace-ui";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { useResource } from "./page-data";

export function BudgetsPage({
  month,
  refreshKey,
  onSaved,
}: {
  month: string;
  refreshKey: number;
  onSaved: () => void;
}) {
  const budgets = useResource<Budget[]>("/budget", refreshKey);
  const transactions = useResource<Transaction[]>("/transaction", refreshKey);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [errorCategory, setErrorCategory] = useState<Category | null>(null);
  if (budgets.loading || transactions.loading)
    return <PageSkeleton page="budgets" />;
  if (budgets.error || transactions.error)
    return (
      <ErrorState
        message={
          budgets.error ?? transactions.error ?? "Unable to load budgets."
        }
        onRetry={onSaved}
      />
    );
  const budgetMap = new Map(
    (budgets.data ?? []).map((item) => [item.category, item.limit]),
  );
  const expenses = monthTransactions(transactions.data ?? [], month).filter(
    (item) => item.type === "EXPENSE",
  );
  const rows = CATEGORIES.map((category) => ({
    category,
    spent: expenses
      .filter((item) => item.category === category)
      .reduce((total, item) => total + Number(item.amount), 0),
    limit: budgetMap.get(category) ?? 0,
  }));

  async function save(category: Category, fallback: number) {
    const limit = Number(drafts[category] ?? fallback);
    if (!Number.isFinite(limit) || limit < 0) {
      setErrorCategory(category);
      setError("Enter a valid monthly limit.");
      return;
    }
    setSaving(category);
    setError("");
    try {
      await apiRequest("/budget", {
        method: "PATCH",
        body: { category, limit },
      });
      setDrafts((current) => {
        const next = { ...current };
        delete next[category];
        return next;
      });
      setErrorCategory(null);
      setEditingCategory(null);
      onSaved();
    } catch (reason) {
      setErrorCategory(category);
      setError(getErrorMessage(reason));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="page-stack">
      <PageHeading
        title="Budgets"
        description="Set your monthly limits. Keep the essentials covered and the extras intentional."
      />
      <div className="info-banner">
        <ChartNoAxesCombined size={16} />
        <span>
          Your monthly limits are editable below. Coral highlights categories
          that have crossed their budget.
        </span>
      </div>
      <div className="budget-grid">
        {rows.map((item) => {
          const Icon = CATEGORY_ICONS[item.category];
          const over = item.limit > 0 && item.spent > item.limit;
          const remaining = item.limit - item.spent;
          const draft = drafts[item.category] ?? String(item.limit || "");
          return (
            <Card
              className={`budget-card ${editingCategory === item.category ? "budget-card-editing" : ""}`}
              key={item.category}
            >
              <div className="budget-card-heading">
                <div className="budget-category">
                  <span className="category-icon">
                    <Icon size={15} />
                  </span>
                  <strong>{label(item.category)}</strong>
                </div>
                <Badge
                  className={over ? "over-budget-badge" : "within-budget-badge"}
                >
                  {over ? "Over budget" : "Within budget"}
                </Badge>
              </div>
              <form
                className="limit-form"
                id={`limit-form-${item.category}`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const validationError = getFormValidationError(
                    event.currentTarget,
                  );
                  if (validationError) {
                    setErrorCategory(item.category);
                    setError(validationError);
                    return;
                  }
                  void save(item.category, item.limit);
                }}
                noValidate
              >
                <label htmlFor={`limit-${item.category}`}>
                  Monthly limit (₦)
                </label>
                <div className="limit-input">
                  <Input
                    id={`limit-${item.category}`}
                    type="number"
                    min="0"
                    step="1"
                    value={draft}
                    onChange={(event) => {
                      setDrafts((current) => ({
                        ...current,
                        [item.category]: event.target.value,
                      }));
                      if (errorCategory === item.category) setError("");
                    }}
                    placeholder="Set a limit"
                  />
                  <Pencil size={13} />
                </div>
                {errorCategory === item.category && error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <Button
                  className="save-limit"
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={saving === item.category}
                  aria-busy={saving === item.category}
                >
                  {saving === item.category ? (
                    <>
                      Saving… <LoadingSpinner size={13} />
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  className="cancel-limit"
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </Button>
              </form>
              <div className={`budget-spent ${over ? "text-danger" : ""}`}>
                <strong>{money(item.spent)}</strong>
                <span>of {item.limit ? money(item.limit) : "no limit"}</span>
              </div>
              <div className="progress-track budget-progress">
                <span
                  className={over ? "danger-fill" : ""}
                  style={{
                    width: `${item.limit ? Math.min((item.spent / item.limit) * 100, 100) : 0}%`,
                  }}
                />
              </div>
              <Button
                className="budget-mobile-edit"
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditingCategory((current) =>
                    current === item.category ? null : item.category,
                  )
                }
                aria-expanded={editingCategory === item.category}
                aria-controls={`limit-form-${item.category}`}
              >
                {editingCategory === item.category ? "Close" : "Edit limit"}
              </Button>
              <p className={`budget-remaining ${over ? "text-danger" : ""}`}>
                {item.limit === 0
                  ? "Set a monthly limit to track this category"
                  : over
                    ? `${money(Math.abs(remaining))} over budget`
                    : `${money(remaining)} left`}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
