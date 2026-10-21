import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, LogOut, Sprout } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Link } from "react-router";
import { apiRequest, getErrorMessage } from "../lib/api";
import {
  CATEGORIES as categories,
  label as categoryName,
  money,
} from "../lib/dashboard-data";
import type { Budget, Category } from "../lib/types";
import { ThemeToggle } from "../components/theme-toggle";
import { Skeleton } from "../../components/ui/skeleton";
import { LoadingSpinner } from "../components/workspace-ui";

export function OnboardingPage({
  stage,
  monthlyTrackAmount,
  onTargetSaved,
  onComplete,
  onSignOut,
}: {
  stage: "target" | "budgets";
  monthlyTrackAmount: number | null;
  onTargetSaved: (amount: number) => void;
  onComplete: () => void;
  onSignOut: () => void;
}) {
  const [target, setTarget] = useState(
    monthlyTrackAmount ? String(monthlyTrackAmount) : "",
  );
  const [drafts, setDrafts] = useState<Record<Category, string>>(
    {} as Record<Category, string>,
  );
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(stage);
  const targetAmount = Number(target) || monthlyTrackAmount || 0;

  useEffect(() => {
    let active = true;
    apiRequest<Budget[]>("/budget")
      .then((items) => {
        if (!active) return;
        const values = Object.fromEntries(
          categories.map((category) => [
            category,
            String(
              items.find((item) => item.category === category)?.limit ?? "",
            ),
          ]),
        ) as Record<Category, string>;
        setDrafts(values);
      })
      .catch((reason: unknown) => {
        if (active) setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const allocated = useMemo(
    () =>
      categories.reduce(
        (total, category) => total + (Number(drafts[category]) || 0),
        0,
      ),
    [drafts],
  );
  const remaining = Math.max(0, targetAmount - allocated);

  async function saveTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(target);
    if (!Number.isSafeInteger(amount) || amount < 1) {
      setError("Enter a whole-number monthly target greater than zero.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiRequest("/users/me/monthly-track-amount", {
        method: "PATCH",
        body: { monthlyTrackAmount: amount },
      });
      onTargetSaved(amount);
      setStep("budgets");
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  function changeLimit(category: Category, value: string) {
    const amount = Number(value) || 0;
    const others = allocated - (Number(drafts[category]) || 0);
    if (amount + others > targetAmount) {
      setError(
        `Your allocations can’t exceed the ${money(targetAmount)} monthly target.`,
      );
      return;
    }
    setError("");
    setDrafts((current) => ({ ...current, [category]: value }));
  }

  async function saveBudgets(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (allocated > targetAmount) {
      setError(
        "Reduce your category limits so they fit within your monthly target.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      await Promise.all(
        categories.map((category) =>
          apiRequest("/budget", {
            method: "PATCH",
            body: { category, limit: Number(drafts[category]) || 0 },
          }),
        ),
      );
      onComplete();
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="onboarding-root min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">
      <div className="onboarding-screen mx-auto grid w-full max-w-3xl gap-7">
        <div className="flex items-center justify-between">
          <Link
            to="/overview"
            className="flex w-fit items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <Sprout className="text-primary" size={20} /> ExpenseLab
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              className="gap-2 text-muted-foreground"
              onClick={onSignOut}
            >
              <LogOut size={15} /> Sign out
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Your setup · {step === "target" ? "Step 1 of 2" : "Step 2 of 2"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {step === "target"
              ? "Set a monthly spending target"
              : "Give every category a limit"}
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {step === "target"
              ? "Choose an amount to guide your monthly spending. You can adjust it any time."
              : "Allocate your target across categories. Your total can’t go over the amount you set."}
          </p>
        </div>
        {step === "target" ? (
          <Card className="grid gap-6 rounded-2xl border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
            <form
              className="grid gap-5"
              onSubmit={(event) => void saveTarget(event)}
            >
              <label className="grid gap-2 text-sm font-medium">
                Monthly target (₦)
                <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-2 focus-within:border-primary">
                  <span className="text-sm text-muted-foreground">₦</span>
                  <Input
                    className="h-12 border-0 px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
                    type="number"
                    min="1"
                    step="1"
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
              </label>
              <div className="flex items-center justify-between rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
                <span>Your monthly target</span>
                <strong className="text-base">
                  {money(targetAmount)}
                </strong>
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button
                className="h-11"
                type="submit"
                disabled={busy}
                aria-busy={busy}
              >
                {busy ? (
                  <>
                    Saving… <LoadingSpinner />
                  </>
                ) : (
                  <>
                    Continue to budgets
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="grid gap-5 rounded-2xl border-border bg-card p-5 text-card-foreground shadow-sm sm:p-8">
            <div className="grid gap-3 rounded-xl bg-primary p-5 text-primary-foreground sm:grid-cols-3">
              <div>
                <span className="text-xs opacity-75">Monthly target</span>
                <strong className="mt-1 block text-xl">
                  {money(targetAmount)}
                </strong>
              </div>
              <div>
                <span className="text-xs opacity-75">Allocated</span>
                <strong className="mt-1 block text-xl">
                  {money(allocated)}
                </strong>
              </div>
              <div>
                <span className="text-xs opacity-75">Remaining</span>
                <strong className="mt-1 block text-xl">
                  {money(remaining)}
                </strong>
              </div>
            </div>
            {!loaded ? (
              <div
                className="grid min-h-36 gap-3 sm:grid-cols-2"
                role="status"
                aria-label="Loading your budgets"
                aria-busy="true"
              >
                <span className="sr-only">Loading your budgets…</span>
                {categories.map((category) => (
                  <Skeleton key={category} className="h-[74px] rounded-xl" />
                ))}
              </div>
            ) : (
              <form
                className="grid gap-3"
                onSubmit={(event) => void saveBudgets(event)}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {categories.map((category) => (
                    <label
                      className="grid gap-2 rounded-xl border border-border p-3 text-sm"
                      key={category}
                    >
                      <span className="font-medium">
                        {categoryName(category)}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span>₦</span>
                        <Input
                          aria-label={`${categoryName(category)} monthly limit`}
                          className="h-10"
                          type="number"
                          min="0"
                          step="1"
                          max={Math.max(
                            0,
                            targetAmount -
                              allocated +
                              (Number(drafts[category]) || 0),
                          )}
                          value={drafts[category] ?? ""}
                          onChange={(event) =>
                            changeLimit(category, event.target.value)
                          }
                          placeholder="No limit"
                        />
                      </span>
                    </label>
                  ))}
                </div>
                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
                  <Button
                    className="gap-2"
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep("target");
                      setError("");
                    }}
                  >
                    <ArrowLeft size={15} /> Edit target
                  </Button>
                  <Button
                    className="gap-2"
                    type="submit"
                    disabled={busy || allocated > targetAmount}
                    aria-busy={busy}
                  >
                    {busy ? (
                      <>
                        Saving budgets… <LoadingSpinner />
                      </>
                    ) : (
                      <>
                        Save budgets and continue
                        <Check size={15} />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        )}
        <p className="text-center text-xs text-[#89958e]">
          You can edit your target and budgets any time in your workspace.
        </p>
      </div>
    </main>
  );
}
