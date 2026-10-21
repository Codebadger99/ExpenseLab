import { useState, type FormEvent } from "react";
import { BookOpen, Pencil } from "lucide-react";
import type { Journal, Worth } from "../lib/types";
import { apiRequest, getErrorMessage } from "../lib/api";
import { getFormValidationError } from "../lib/form-validation";
import { CATEGORY_ICONS, label, money } from "../lib/dashboard-data";
import {
  EmptyState,
  ErrorState,
  Field,
  LoadingSpinner,
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
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useResource } from "./page-data";

export function JournalPage({
  month,
  refreshKey,
}: {
  month: string;
  refreshKey: number;
}) {
  const resource = useResource<Journal[]>("/journal", refreshKey);
  const [filter, setFilter] = useState<"ALL" | "NEEDS_REVIEW" | "REVIEWED">("ALL");
  const [entry, setEntry] = useState<Journal | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [why, setWhy] = useState("");
  const [reflection, setReflection] = useState("");
  const [worth, setWorth] = useState<Worth>("YES");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Record<number, Journal>>({});
  const entries = (resource.data ?? [])
    .filter((item) => item.transaction.date.slice(0, 7) === month)
    .map((item) => saved[item.id] ?? item);
  const needsReview = entries.filter(
    (item) => item.journalStatus === "NEEDS_REVIEW",
  );
  const reviewed = entries.filter((item) => item.journalStatus === "WORTH_IT");
  const visible =
    filter === "ALL" ? entries : filter === "NEEDS_REVIEW" ? needsReview : reviewed;

  function openEntry(item: Journal) {
    setEntry(item);
    setWhy(item.why ?? "");
    setReflection(item.reflection ?? "");
    setWorth(item.worth ?? "YES");
    setError("");
  }

  async function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = getFormValidationError(event.currentTarget);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!entry) return;
    setBusy(true);
    setError("");
    try {
      const updated = await apiRequest<Partial<Journal>>(
        `/journal/${entry.id}`,
        { method: "PATCH", body: { why, reflection, worth } },
      );
      setSaved((current) => ({
        ...current,
        [entry.id]: {
          ...entry,
          ...updated,
          why,
          reflection,
          worth,
          journalStatus: "WORTH_IT",
        },
      }));
      setFilter("ALL");
      setEntry(null);
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  if (resource.loading) return <PageSkeleton page="journal" />;
  if (resource.error)
    return (
      <ErrorState
        message={resource.error}
        onRetry={() => window.location.reload()}
      />
    );

  return (
    <div className="page-stack">
      <PageHeading
        title="Journal"
        description="The story behind your spending. Reflect on purchases and build more mindful habits."
      />
      <div className="reflection-banner">
        <span className="reflection-icon">
          <BookOpen size={19} />
        </span>
        <div>
          <strong>A moment to pause and reflect.</strong>
          <p>
            Was it planned? Was it worth it? Add a little context to the
            expenses below.
          </p>
        </div>
      </div>
      <div className="journal-tabs">
        <Button
          variant={filter === "ALL" ? "default" : "outline"}
          onClick={() => setFilter("ALL")}
        >
          All
        </Button>
        <Button
          variant={filter === "NEEDS_REVIEW" ? "default" : "outline"}
          onClick={() => setFilter("NEEDS_REVIEW")}
        >
          Needs review ({needsReview!.length})
        </Button>
        <Button
          variant={filter === "REVIEWED" ? "default" : "outline"}
          onClick={() => setFilter("REVIEWED")}
        >
          Reviewed ({reviewed.length})
        </Button>
      </div>
      {visible.length ? (
        <div className="journal-list">
          {visible.map((item) => {
            const transaction = item.transaction;
            const Icon = CATEGORY_ICONS[transaction.category] ?? BookOpen;
            const reviewed = item.journalStatus === "WORTH_IT";
            return (
              <Card className="journal-item" key={item.id}>
                <button
                  className="journal-item-trigger"
                  onClick={() => setSelectedJournal(item)}
                  aria-label={`View ${transaction.merchant || label(transaction.category)} journal details`}
                >
                  <span className="category-icon journal-icon">
                    <Icon size={16} />
                  </span>
                  <span className="journal-merchant">
                    <span className="journal-name-status">
                      <strong>
                        {transaction.merchant || label(transaction.category)}
                      </strong>
                      <Badge
                        className={
                          reviewed ? "within-budget-badge" : "review-badge"
                        }
                      >
                        {reviewed ? "Reviewed" : "Needs review"}
                      </Badge>
                    </span>
                  </span>
                </button>
                <Button
                  variant="outline"
                  className="write-entry"
                  onClick={() => openEntry(item)}
                >
                  <Pencil size={14} />
                  {reviewed ? "Edit entry" : "Write entry"}
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            title={
              filter === "NEEDS_REVIEW"
                ? "Nothing waiting for review"
                : filter === "REVIEWED"
                  ? "No reviewed entries yet"
                : "No expenses to reflect on"
            }
            description={
              filter === "NEEDS_REVIEW"
                ? "You’ve added a little context to every purchase this month."
                : filter === "REVIEWED"
                  ? "Reviewed purchases will appear here."
                : "Your expense journal will appear here as you track spending."
            }
            icon={BookOpen}
          />
        </Card>
      )}
      <Dialog
        open={!!selectedJournal}
        onOpenChange={(open) => {
          if (!open) setSelectedJournal(null);
        }}
      >
        <DialogContent className="form-dialog journal-detail-dialog">
          <DialogHeader>
            <div className="journal-detail-heading">
              <div>
                <DialogTitle>
                  {selectedJournal?.transaction.merchant ||
                    (selectedJournal &&
                      label(selectedJournal.transaction.category)) ||
                    "Journal entry"}
                </DialogTitle>
                <DialogDescription>Purchase details and review                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedJournal && (
            <>
              <Badge
                className={`journal-detail-status ${selectedJournal.journalStatus === "WORTH_IT" ? "within-budget-badge" : "review-badge"}`}
              >
                {selectedJournal.journalStatus === "WORTH_IT"
                  ? "Reviewed"
                  : "Needs review"}
              </Badge>
              <dl className="journal-detail-grid">
                <div>
                  <dt>Price</dt>
                  <dd>{money(selectedJournal.transaction.amount)}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>
                    {new Date(
                      selectedJournal.transaction.date,
                    ).toLocaleDateString("en-NG", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{label(selectedJournal.transaction.category)}</dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>{label(selectedJournal.transaction.payment)}</dd>
                </div>
                {selectedJournal.why && (
                  <div className="journal-detail-note">
                    <dt>Why you bought it</dt>
                    <dd>{selectedJournal.why}</dd>
                  </div>
                )}
                {selectedJournal.worth && (
                  <div>
                    <dt>Worth it?</dt>
                    <dd>{label(selectedJournal.worth)}</dd>
                  </div>
                )}
                {selectedJournal.reflection && (
                  <div className="journal-detail-note">
                    <dt>Note to your future self</dt>
                    <dd>{selectedJournal.reflection}</dd>
                  </div>
                )}
              </dl>
              <Button
                className="journal-detail-edit"
                variant="outline"
                onClick={() => {
                  openEntry(selectedJournal);
                  setSelectedJournal(null);
                }}
              >
                <Pencil size={14} />
                {selectedJournal.journalStatus === "WORTH_IT"
                  ? "Edit entry"
                  : "Write entry"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!entry}
        onOpenChange={(open) => {
          if (!open) setEntry(null);
        }}
      >
        <DialogContent className="form-dialog">
          <DialogHeader>
            <DialogTitle>Reflect on this purchase</DialogTitle>
            <DialogDescription>
              {entry?.transaction.merchant || "Expense"} ·{" "}
              {money(entry?.transaction.amount ?? 0)}
            </DialogDescription>
          </DialogHeader>
          <form className="dialog-form" onSubmit={saveEntry} noValidate>
            <Field label="Why did you make this purchase?">
              <Input
                value={why}
                onChange={(event) => setWhy(event.target.value)}
                placeholder="What was going through your mind?"
              />
            </Field>
            <Field label="Was it worth it?">
              <select
                value={worth}
                onChange={(event) => setWorth(event.target.value as Worth)}
              >
                <option value="YES">Yes, it was worth it</option>
                <option value="SOMEWHAT">Somewhat</option>
                <option value="NO">No, not really</option>
              </select>
            </Field>
            <Field label="A note to your future self">
              <Textarea
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                placeholder="Anything you want to remember?"
              />
            </Field>
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
              ) : (
                "Save reflection"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
