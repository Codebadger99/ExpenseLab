import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Funnel,
  Search,
} from "lucide-react";
import type {
  Category,
  Desire,
  PaymentMethod,
  Transaction,
  TransactionType,
} from "../lib/types";
import { apiRequest, getErrorMessage } from "../lib/api";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  label,
  localDate,
  money,
} from "../lib/dashboard-data";
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
import { useResource } from "./page-data";

export function TransactionDialog({
  open,
  onOpenChange,
  onSaved,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  initial?: Transaction;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<TransactionType>(initial?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [merchant, setMerchant] = useState(initial?.merchant ?? "");
  const [date, setDate] = useState(initial?.date.slice(0, 10) ?? localDate());
  const today = localDate();
  const [category, setCategory] = useState<Category>(
    initial?.category ?? "FOOD",
  );
  const [desire, setDesire] = useState<Desire>(initial?.desire ?? "NEED");
  const [payment, setPayment] = useState<PaymentMethod>(
    initial?.payment ?? "TRANSFER",
  );
  const [incomeSource, setIncomeSource] = useState(
    initial?.incomeSources ?? "SALARY",
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (date > today) {
      setError("Choose today or an earlier date for this transaction.");
      return;
    }
    setBusy(true);
    setError("");
    const body = {
      type,
      amount,
      date: `${date}T12:00:00.000Z`,
      merchant: merchant.trim() || undefined,
      payment,
      ...(type === "EXPENSE" ? { category, desire } : { incomeSource }),
    };
    try {
      await apiRequest(
        initial ? `/transaction/${initial.id}` : "/transaction",
        {
          method: initial ? "PATCH" : "POST",
          body,
        },
      );
      onOpenChange(false);
      onSaved();
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="form-dialog">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit transaction" : "Add a transaction"}
          </DialogTitle>
          <DialogDescription>
            Keep a clear record of money coming in and going out.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="dialog-form">
          <Field label="Type">
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as TransactionType)
              }
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </Field>
          <Field label="Amount">
            <CurrencyInput value={amount} onChange={setAmount} />
          </Field>
          <Field label={type === "EXPENSE" ? "Merchant" : "Description"}>
            <Input
              maxLength={80}
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
              placeholder="e.g. Groceries"
            />
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={date}
              max={today}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </Field>
          {type === "EXPENSE" ? (
            <>
              <Field label="Category">
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as Category)
                  }
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {label(item)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Need or want">
                <select
                  value={desire}
                  onChange={(event) => setDesire(event.target.value as Desire)}
                >
                  <option value="NEED">Need</option>
                  <option value="WANT">Want</option>
                </select>
              </Field>
            </>
          ) : (
            <Field label="Income source">
              <select
                value={incomeSource}
                onChange={(event) => setIncomeSource(event.target.value)}
              >
                {["SALARY", "BUSINESS", "GIFT", "OTHER"].map((item) => (
                  <option key={item} value={item}>
                    {label(item)}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Payment method">
            <select
              value={payment}
              onChange={(event) =>
                setPayment(event.target.value as PaymentMethod)
              }
            >
              {["TRANSFER", "CASH", "CARD", "USSD", "POS"].map((item) => (
                <option key={item} value={item}>
                  {label(item)}
                </option>
              ))}
            </select>
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
            ) : initial ? (
              "Save changes"
            ) : (
              "Save transaction"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function TransactionsPage({
  month,
  refreshKey,
  onSaved,
}: {
  month: string;
  refreshKey: number;
  onSaved: () => void;
}) {
  const navigate = useNavigate();
  const resource = useResource<Transaction[]>("/transaction", refreshKey);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [desire, setDesire] = useState("ALL");
  const [payment, setPayment] = useState("ALL");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 900px)");
    const updatePageSize = () => {
      setPageSize(mobileQuery.matches ? 10 : 20);
      setPage(1);
    };

    updatePageSize();
    mobileQuery.addEventListener("change", updatePageSize);
    return () => mobileQuery.removeEventListener("change", updatePageSize);
  }, []);

  const filtered = useMemo(
    () =>
      (resource.data ?? [])
        .filter((item) => item.date.slice(0, 7) === month)
        .filter((item) =>
          `${item.merchant ?? ""} ${item.incomeSources ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .filter((item) => category === "ALL" || item.category === category)
        .filter((item) => desire === "ALL" || item.desire === desire)
        .filter((item) => payment === "ALL" || item.payment === payment),
    [resource.data, month, search, category, desire, payment],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const activeFilterCount = [
    search.trim() !== "",
    category !== "ALL",
    desire !== "ALL",
    payment !== "ALL",
  ].filter(Boolean).length;

  function transactionFilters() {
    return (
      <>
        <label className="search-field">
          <Search size={16} />
          <Input
            aria-label="Search merchant or note"
            placeholder="Search merchant or note"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {label(item)}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by need or want"
          value={desire}
          onChange={(event) => {
            setDesire(event.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">Need or want</option>
          <option value="NEED">Need</option>
          <option value="WANT">Want</option>
        </select>
        <select
          aria-label="Filter by payment method"
          value={payment}
          onChange={(event) => {
            setPayment(event.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">Any payment</option>
          {["TRANSFER", "CASH", "CARD", "USSD", "POS"].map((item) => (
            <option key={item} value={item}>
              {label(item)}
            </option>
          ))}
        </select>
      </>
    );
  }

  function clearFilters() {
    setSearch("");
    setCategory("ALL");
    setDesire("ALL");
    setPayment("ALL");
    setPage(1);
  }

  async function deleteTransaction() {
    if (!deleting) return;
    setBusy(true);
    setActionError("");
    try {
      await apiRequest(`/transaction/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      onSaved();
    } catch (reason) {
      setActionError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  if (resource.loading) return <PageSkeleton page="transactions" />;
  if (resource.error)
    return <ErrorState message={resource.error} onRetry={onSaved} />;

  return (
    <div className="page-stack">
      <PageHeading
        title="Transactions"
        description="Every expense, in one place. Find, edit, and reflect on your spending."
      />
      <div className="filters-row">{transactionFilters()}</div>
      <div className="mobile-filters">
        <Button
          variant="outline"
          className="mobile-filters-trigger"
          onClick={() => setFiltersOpen(true)}
        >
          <Funnel size={15} />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <span className="mobile-filter-summary">
            {filtered.length} matching {filtered.length === 1 ? "transaction" : "transactions"}
          </span>
        )}
      </div>
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="form-dialog transaction-filter-dialog">
          <DialogHeader>
            <DialogTitle>Filter transactions</DialogTitle>
            <DialogDescription>
              Search and narrow down the transactions shown.
            </DialogDescription>
          </DialogHeader>
          <div className="transaction-filter-fields">{transactionFilters()}</div>
          <div className="transaction-filter-actions">
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
            <Button onClick={() => setFiltersOpen(false)}>Show {filtered.length} results</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
      >
        <DialogContent className="form-dialog transaction-details-dialog">
          <DialogHeader>
            <DialogTitle>
              {selectedTransaction?.merchant ||
                label(selectedTransaction?.incomeSources ?? "Income")}
            </DialogTitle>
            <DialogDescription>Transaction details and actions</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <>
              <dl className="transaction-detail-grid">
                <div>
                  <dt>Amount</dt>
                  <dd>
                    {selectedTransaction.type === "INCOME" ? "+" : ""}
                    {money(selectedTransaction.amount)}
                  </dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>
                    {new Date(selectedTransaction.date).toLocaleDateString(
                      "en-NG",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      },
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>
                    {selectedTransaction.type === "INCOME"
                      ? "Income"
                      : label(selectedTransaction.category)}
                  </dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>
                    {selectedTransaction.type === "INCOME"
                      ? "Income"
                      : label(selectedTransaction.desire)}
                  </dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>{label(selectedTransaction.payment)}</dd>
                </div>
              </dl>
              <div className="transaction-detail-actions">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(selectedTransaction);
                    setSelectedTransaction(null);
                    setEditOpen(true);
                  }}
                >
                  Edit transaction
                </Button>
                {selectedTransaction.type === "EXPENSE" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTransaction(null);
                      navigate("/journal");
                    }}
                  >
                    Journal
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleting(selectedTransaction);
                    setSelectedTransaction(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Card className="transactions-card">
        <div className="table-heading">
          <h2>Transactions</h2>
          <Badge variant="secondary">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </Badge>
        </div>
        {visible.length ? (
          <div className="table-scroll">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const Icon =
                    CATEGORY_ICONS[item.category] ?? CircleDollarSign;
                  return (
                    <tr key={item.id}>
                      <td data-label="Date">
                        {new Date(item.date).toLocaleDateString("en-NG", {
                          month: "2-digit",
                          day: "2-digit",
                          timeZone: "UTC",
                        })}
                      </td>
                      <td data-label="Merchant">
                        <button
                          className="transaction-card-trigger"
                          aria-haspopup="dialog"
                          onClick={() => setSelectedTransaction(item)}
                        >
                          <span className="merchant-name">
                            <span className="category-icon">
                              <Icon size={14} />
                            </span>
                            {item.merchant ||
                              label(item.incomeSources ?? "Income")}
                          </span>
                          <ChevronRight
                            className="transaction-card-chevron"
                            size={16}
                          />
                        </button>
                      </td>
                      <td data-label="Category" className="muted-cell">
                        {item.type === "INCOME"
                          ? "Income"
                          : label(item.category)}
                      </td>
                      <td data-label="Type">
                        <Badge
                          className={
                            item.type === "INCOME"
                              ? "income-badge"
                              : item.desire === "NEED"
                                ? "need-badge"
                                : "want-badge"
                          }
                        >
                          {item.type === "INCOME"
                            ? "Income"
                            : label(item.desire)}
                        </Badge>
                      </td>
                      <td
                        data-label="Amount"
                        className={`amount-cell ${item.type === "INCOME" ? "income-amount" : ""}`}
                      >
                        {item.type === "INCOME" ? "+" : ""}
                        {money(item.amount)}
                      </td>
                      <td data-label="Actions">
                        <div className="table-actions">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditing(item);
                              setEditOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          {item.type === "EXPENSE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate("/journal")}
                            >
                              Journal
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleting(item)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No transactions found"
            description={
              search || category !== "ALL"
                ? "Try a different search or filter."
                : "Add a transaction to start tracking this month."
            }
            icon={Search}
          />
        )}
        <div className="table-footer">
          <span className="table-results" aria-live="polite">
            {filtered.length === 0
              ? "No transactions"
              : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length} transactions`}
          </span>
          {pageCount > 1 && (
            <nav className="pagination" aria-label="Transaction pages">
              <Button
                variant="outline"
                size="sm"
                aria-label="Previous page"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft size={15} />
                <span>Previous</span>
              </Button>
              <span aria-live="polite">
                Page {currentPage} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                aria-label="Next page"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((value) => value + 1)}
              >
                <span>Next</span>
                <ChevronRight size={15} />
              </Button>
            </nav>
          )}
        </div>
      </Card>
      {actionError && (
        <p className="form-error" role="alert">
          {actionError}
        </p>
      )}
      <TransactionDialog
        key={`${editing?.id ?? "new"}-${editOpen}`}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditing(undefined);
        }}
        onSaved={onSaved}
        initial={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this transaction?"
        description={`This will permanently remove ${deleting?.merchant || "this transaction"} from your records.`}
        onConfirm={() => void deleteTransaction()}
        busy={busy}
      />
    </div>
  );
}
