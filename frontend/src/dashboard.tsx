import { useEffect, useState } from "react";
import { Bell, CalendarDays, Check, Plus, Sprout } from "lucide-react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import Brand from "./assets/Brand mark.png";
import { apiRequest, getErrorMessage } from "./lib/api";
import type { Notification, User } from "./lib/types";
import {
  currentMonth,
  formatDate,
  monthName,
  NAVIGATION,
} from "./lib/dashboard-data";
import { AccountSettings } from "./components/account-settings";
import { OnboardingPage } from "./pages/onboarding";
import { OverviewPage } from "./pages/overview";
import { TransactionsPage, TransactionDialog } from "./pages/transactions";
import { BudgetsPage } from "./pages/budgets";
import { GoalsPage } from "./pages/goals";
import { JournalPage } from "./pages/journal";
import { InsightsPage } from "./pages/insights";
import { EmptyState, LoadingSpinner } from "./components/workspace-ui";
import { ThemeToggle } from "./components/theme-toggle";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";

function Notifications({ onRead }: { onRead: () => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingRead, setPendingRead] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [notifications, unread] = await Promise.all([
        apiRequest<Notification[]>("/notifications"),
        apiRequest<{ count: number }>("/notifications/unread-count"),
      ]);
      setItems(notifications);
      setCount(unread.count);
      setError("");
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<Notification[]>("/notifications"),
      apiRequest<{ count: number }>("/notifications/unread-count"),
    ])
      .then(([notifications, unread]) => {
        if (!active) return;
        setItems(notifications);
        setCount(unread.count);
      })
      .catch((reason: unknown) => {
        if (active) setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function markRead(id: number) {
    setPendingRead(id);
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
      await refresh();
      onRead();
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setPendingRead(null);
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      await refresh();
      onRead();
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <>
      <Button
        className="notification-trigger"
        variant="outline"
        aria-label={`Notifications, ${count} unread`}
        onClick={() => setOpen(true)}
      >
        <Bell size={16} />
        {count > 0 && <span>{count}</span>}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="form-dialog notification-dialog">
          <DialogHeader>
            <div className="notification-heading">
              <div>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>
                  Updates about your spending and budgets.
                </DialogDescription>
              </div>
              {count > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={markingAll}
                  aria-busy={markingAll}
                  onClick={() => void markAllRead()}
                >
                  {markingAll ? (
                    <>
                      Marking… <LoadingSpinner size={13} />
                    </>
                  ) : (
                    "Mark all read"
                  )}
                </Button>
              )}
            </div>
          </DialogHeader>
          {error && <p className="form-error">{error}</p>}
          <div
            className="notification-list"
            role={loading ? "status" : undefined}
            aria-label={loading ? "Loading notifications" : undefined}
            aria-busy={loading}
          >
            {loading ? (
              Array.from({ length: 3 }, (_, index) => (
                <div
                  className="notification-item notification-loading-item"
                  key={index}
                  aria-hidden="true"
                >
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <div className="grid gap-2">
                    <Skeleton className="h-3 w-36 max-w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              ))
            ) : items.length ? (
              items.map((item) => (
                <div
                  className={`notification-item ${item.isRead ? "" : "unread"}`}
                  key={item.id}
                >
                  <span className="notification-dot" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <time>{formatDate(item.createdAt)}</time>
                  </div>
                  {!item.isRead && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Mark notification read"
                      disabled={pendingRead === item.id}
                      aria-busy={pendingRead === item.id}
                      onClick={() => void markRead(item.id)}
                    >
                      {pendingRead === item.id ? (
                        <LoadingSpinner size={15} />
                      ) : (
                        <Check size={15} />
                      )}
                    </Button>
                  )}
                </div>
              ))
            ) : error ? null : (
              <EmptyState
                title="You’re all caught up"
                description="Budget alerts will appear here when you need them."
                icon={Bell}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function Workspace({
  user,
  onSignOut,
  onUserUpdate,
}: {
  user: User;
  onSignOut: () => void;
  onUserUpdate: (user: User) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonth());
  const [refreshKey, setRefreshKey] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [unreadRefresh, setUnreadRefresh] = useState(0);
  const [monthlyTrackAmount, setMonthlyTrackAmount] = useState(
    user.monthlyTrackAmount,
  );
  const onboardingKey = `expense-lab-onboarding-${user.id}`;
  const [onboardingStage, setOnboardingStage] = useState<
    "target" | "budgets" | null
  >(() => {
    const saved = localStorage.getItem(onboardingKey);
    if (saved === "target" || saved === "budgets") return saved;
    return user.monthlyTrackAmount === null ? "target" : null;
  });
  const activeItem =
    NAVIGATION.find((item) => item.path === location.pathname) ?? NAVIGATION[0];
  const pageMonth = activeItem.path === "/insights" ? month : currentMonth();

  useEffect(() => {
    if (onboardingStage) localStorage.setItem(onboardingKey, onboardingStage);
    else localStorage.removeItem(onboardingKey);
  }, [onboardingKey, onboardingStage]);

  function persistMonthlyTarget(amount: number) {
    setMonthlyTrackAmount(amount);
    onUserUpdate({ ...user, monthlyTrackAmount: amount });
  }

  function updateMonthlyTarget(amount: number) {
    persistMonthlyTarget(amount);
    setOnboardingStage("budgets");
  }

  function finishOnboarding() {
    setOnboardingStage(null);
    navigate("/overview", { replace: true });
  }

  if (onboardingStage) {
    return (
      <OnboardingPage
        key={onboardingStage}
        stage={onboardingStage}
        monthlyTrackAmount={monthlyTrackAmount}
        onTargetSaved={updateMonthlyTarget}
        onComplete={finishOnboarding}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <Link to="/overview" className="brand-lockup">
          <img src={Brand} alt="" />
          <span>ExpenseLab</span>
        </Link>
        <p className="nav-caption">Personal workspace</p>
        <nav className="side-nav" aria-label="Main navigation">
          {NAVIGATION.map(({ label: navLabel, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${activeItem.path === path ? "active" : ""}`}
              aria-current={activeItem.path === path ? "page" : undefined}
            >
              <Icon size={16} />
              <span>{navLabel}</span>
              {activeItem.path === path && <span className="active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sprout size={16} />
            <strong>Small habits. Better finances.</strong>
            <span>A little clarity, every day.</span>
          </div>
          <div className="account-button">
            <span className="avatar">
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            <span>
              <strong>{user.name}</strong>
              <small>Personal account</small>
            </span>
          </div>
          <AccountSettings onSignOut={onSignOut} onDeleted={onSignOut} />
        </div>
      </aside>
      <main className="workspace-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>My workspace</span>
            <span>/</span>
            <strong>{activeItem.label}</strong>
          </div>
          <div className="topbar-actions">
            {activeItem.path === "/insights" && (
              <label className="month-picker">
                <CalendarDays size={15} />
                <span className="sr-only">Selected month</span>
                <input
                  type="month"
                  aria-label="Insights month"
                  value={month}
                  onChange={(event) =>
                    event.target.value && setMonth(event.target.value)
                  }
                />
              </label>
            )}
            <ThemeToggle />
            <Notifications
              onRead={() => setUnreadRefresh((current) => current + 1)}
            />
            <Button className="primary-action" onClick={() => setAddOpen(true)}>
              <Plus size={16} />
              <span>Add transaction</span>
            </Button>
          </div>
        </header>
        <section className="page-content">
          <Routes>
            <Route
              path="/overview"
              element={
                <OverviewPage
                  month={pageMonth}
                  refreshKey={refreshKey}
                  monthlyTrackAmount={monthlyTrackAmount}
                  onTrackAmountChange={persistMonthlyTarget}
                  onNavigate={navigate}
                />
              }
            />
            <Route
              path="/transactions"
              element={
                <TransactionsPage
                  month={pageMonth}
                  refreshKey={refreshKey}
                  onSaved={() => setRefreshKey((current) => current + 1)}
                />
              }
            />
            <Route
              path="/budgets"
              element={
                <BudgetsPage
                  month={pageMonth}
                  refreshKey={refreshKey}
                  onSaved={() => setRefreshKey((current) => current + 1)}
                />
              }
            />
            <Route
              path="/goals"
              element={
                <GoalsPage
                  refreshKey={refreshKey}
                  onSaved={() => setRefreshKey((current) => current + 1)}
                />
              }
            />
            <Route
              path="/journal"
              element={
                <JournalPage month={pageMonth} refreshKey={refreshKey} />
              }
            />
            <Route
              path="/insights"
              element={
                <InsightsPage month={pageMonth} refreshKey={refreshKey} />
              }
            />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
          <footer className="page-footer">
            <span>ExpenseLab · Personal finance, made clear.</span>
            <span>
              {activeItem.path === "/insights"
                ? `${monthName(month)} · NGN`
                : "Personal account · NGN"}
            </span>
          </footer>
        </section>
      </main>
      <TransactionDialog
        key={`new-${addOpen}`}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => setRefreshKey((current) => current + 1)}
      />
      <span className="sr-only" aria-live="polite">
        Notifications updated {unreadRefresh}
      </span>
    </div>
  );
}
