import { useState, type FormEvent } from "react";
import { Plus, Sprout, Target, Trash2 } from "lucide-react";
import type { Goal } from "../lib/types";
import { apiRequest, getErrorMessage } from "../lib/api";
import { money } from "../lib/dashboard-data";
import {
  ConfirmDialog,
  CurrencyInput,
  EmptyState,
  ErrorState,
  Field,
  LoadingSpinner,
  PageHeading,
  PageSkeleton,
} from "../components/workspace-ui";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { useResource } from "./page-data";

export function GoalsPage({
  refreshKey,
  onSaved,
}: {
  refreshKey: number;
  onSaved: () => void;
}) {
  const resource = useResource<Goal[]>("/goal", refreshKey);
  const [dialog, setDialog] = useState<"new" | "add" | null>(null);
  const [selected, setSelected] = useState<Goal | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Goal | null>(null);

  async function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest("/goal", {
        method: "POST",
        body: { name: name.trim(), target: Number(target) },
      });
      setName("");
      setTarget("");
      setDialog(null);
      onSaved();
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function addMoney(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/goal/${selected.id}`, {
        method: "PATCH",
        body: { saved: selected.saved + Number(amount) },
      });
      setAmount("");
      setDialog(null);
      setSelected(null);
      onSaved();
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function deleteGoal() {
    if (!deleting) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/goal/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      onSaved();
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  if (resource.loading) return <PageSkeleton page="goals" />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={onSaved} />;
  const goals = resource.data ?? [];

  return (
    <div className="page-stack">
      <PageHeading
        title="Goals"
        description="Give your savings a purpose. Build towards the things that matter to you."
        action={
          <Button
            className="primary-action"
            onClick={() => {
              setDialog("new");
              setError("");
            }}
          >
            <Plus size={15} /> New goal
          </Button>
        }
      />
      <h2 className="subsection-heading">Your savings goals</h2>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {goals.length ? (
        <div className="goal-grid">
          {goals.map((goal) => {
            const progress =
              goal.target > 0
                ? Math.min((goal.saved / goal.target) * 100, 100)
                : 0;
            return (
              <Card className="goal-card" key={goal.id}>
                <div className="goal-title">
                  <span className="category-icon">
                    <Target size={16} />
                  </span>
                  <div>
                    <strong>{goal.name}</strong>
                    <span>One step closer, every month.</span>
                  </div>
                </div>
                <div className="goal-progress-row">
                  <div
                    className="goal-ring"
                    style={{
                      background: `conic-gradient(var(--green) ${progress}%, #edf0eb ${progress}% 100%)`,
                    }}
                  >
                    <div>{Math.round(progress)}%</div>
                  </div>
                  <div className="goal-balance">
                    <span>Saved so far</span>
                    <strong>{money(goal.saved)}</strong>
                    <small>of {money(goal.target)}</small>
                  </div>
                </div>
                <div className="goal-card-footer">
                  <Button
                    onClick={() => {
                      setSelected(goal);
                      setDialog("add");
                      setError("");
                    }}
                  >
                    <Plus size={14} /> Add money
                  </Button>
                  <Button
                    variant="outline"
                    className="delete-button"
                    onClick={() => setDeleting(goal)}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Give your savings a purpose"
            description="Create your first goal and watch each contribution move you closer."
            icon={Target}
          />
        </Card>
      )}
      <div className="info-banner goal-tip">
        <Sprout size={18} />
        <div>
          <strong>Progress is built one contribution at a time.</strong>
          <span>
            Use Add money to record your next contribution, or create a new goal
            for what comes next.
          </span>
        </div>
      </div>
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
            setSelected(null);
            setError("");
          }
        }}
      >
        <DialogContent className="form-dialog">
          <DialogHeader>
            <DialogTitle>
              {dialog === "new"
                ? "Create a savings goal"
                : `Add to ${selected?.name ?? "your goal"}`}
            </DialogTitle>
            <DialogDescription>
              {dialog === "new"
                ? "Give your next milestone a name and a target."
                : "Add a contribution to your saved balance."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={dialog === "new" ? createGoal : addMoney}
            className="dialog-form"
          >
            {dialog === "new" ? (
              <>
                <Field label="Goal name">
                  <Input
                    maxLength={80}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Emergency fund"
                    required
                  />
                </Field>
                <Field label="Target amount">
                  <CurrencyInput value={target} onChange={setTarget} />
                </Field>
              </>
            ) : (
              <Field label="Contribution amount">
                <CurrencyInput value={amount} onChange={setAmount} />
              </Field>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy} aria-busy={busy}>
              {busy ? (
                <>
                  Saving… <LoadingSpinner />
                </>
              ) : dialog === "new" ? (
                "Create goal"
              ) : (
                "Add contribution"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this savings goal?"
        description={`${deleting?.name ?? "This goal"} and its saved progress will be removed.`}
        onConfirm={() => void deleteGoal()}
        busy={busy}
      />
    </div>
  );
}
