import type { ReactNode } from "react"
import { LoaderCircle, Sprout } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Skeleton } from "../../components/ui/skeleton"

export function PageHeading({ title, description, action }: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

export function LoadingSpinner({ size = 15 }: { size?: number }) {
  return <LoaderCircle className="loading-spinner" size={size} aria-hidden="true" />
}

type SkeletonPage = "overview" | "transactions" | "budgets" | "goals" | "journal" | "insights"

function HeadingSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="skeleton-heading">
      <div className="grid gap-2"><Skeleton className="h-7 w-44" /><Skeleton className="h-3 w-72 max-w-[70vw]" /></div>
      {action && <Skeleton className="h-9 w-32" />}
    </div>
  )
}

export function PageSkeleton({ page }: { page: SkeletonPage }) {
  let content: ReactNode

  switch (page) {
    case "overview":
      content = <>
        <HeadingSkeleton />
        <Skeleton className="h-[130px] rounded-xl" />
        <div className="metric-grid four">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-[270px] rounded-xl" />
        <div className="overview-bottom"><Skeleton className="h-[250px] rounded-xl" /><Skeleton className="h-[250px] rounded-xl" /></div>
        <Skeleton className="h-[260px] rounded-xl" />
      </>
      break
    case "transactions":
      content = <>
        <HeadingSkeleton />
        <div className="filters-row"><Skeleton className="h-[34px] rounded-lg" />{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-[34px] rounded-lg" />)}</div>
        <div className="transaction-table-skeleton">
          <div className="table-heading"><Skeleton className="h-4 w-40" /><Skeleton className="h-5 w-16 rounded-full" /></div>
          <div className="transaction-skeleton-columns">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-3 w-full" />)}</div>
          {Array.from({ length: 1 }, (_, row) => (
            <div className="transaction-skeleton-row" key={row}>
              <Skeleton className="h-3 w-10" />
              <div><Skeleton className="h-7 w-7 rounded-lg" /><div className="grid flex-1 gap-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-2 w-20" /></div></div>
              <Skeleton className="h-3 w-16" /><Skeleton className="h-5 w-14 rounded-full" /><Skeleton className="h-3 w-16" /><Skeleton className="h-7 w-20 rounded-md" />
            </div>
          ))}
          <div className="table-footer"><Skeleton className="h-3 w-32" /><Skeleton className="h-7 w-36 rounded-md" /></div>
        </div>
      </>
      break
    case "budgets":
      content = <>
        <HeadingSkeleton />
        <Skeleton className="h-11 rounded-lg" />
        <div className="budget-grid">{Array.from({ length: 8 }, (_, index) => (
          <div className="budget-card" key={index}>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Skeleton className="h-7 w-7 rounded-lg" /><Skeleton className="h-3 w-24" /></div><Skeleton className="h-5 w-20 rounded-full" /></div>
            <div className="grid grid-cols-[1fr_110px_auto] items-center gap-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-7 w-full rounded-md" /><Skeleton className="h-7 w-12 rounded-md" /></div>
            <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-24" /></div>
            <Skeleton className="h-1 w-full rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}</div>
      </>
      break
    case "goals":
      content = <>
        <HeadingSkeleton action />
        <Skeleton className="h-4 w-40" />
        <div className="goal-grid">{Array.from({ length: 1 }, (_, index) => (
          <div className="goal-card" key={index}>
            <div className="flex items-center gap-2"><Skeleton className="h-8 w-8 rounded-lg" /><div className="grid gap-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-2 w-40" /></div></div>
            <div className="flex items-center gap-5"><Skeleton className="h-[106px] w-[106px] rounded-full" /><div className="grid gap-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-6 w-28" /><Skeleton className="h-3 w-24" /></div></div>
            <div className="flex gap-2"><Skeleton className="h-8 w-28 rounded-md" /><Skeleton className="h-8 w-20 rounded-md" /></div>
          </div>
        ))}</div>
        <Skeleton className="h-14 rounded-lg" />
      </>
      break
    case "journal":
      content = <>
        <HeadingSkeleton />
        <Skeleton className="h-[68px] rounded-lg" />
        <div className="flex flex-wrap gap-2"><Skeleton className="h-8 w-14 rounded-md" /><Skeleton className="h-8 w-32 rounded-md" /></div>
        <div className="journal-list">{Array.from({ length: 1 }, (_, index) => (
          <div className="journal-item" key={index}>
            <div className="journal-item-trigger journal-skeleton-trigger" aria-hidden="true">
              <Skeleton className="journal-icon h-[34px] w-[34px] rounded-lg" />
              <div className="journal-merchant journal-skeleton-merchant">
                <span className="journal-name-status">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </span>
              </div>
            </div>
            <Skeleton className="write-entry h-[30px] w-24 rounded-md" />
          </div>
        ))}</div>
      </>
      break
    case "insights":
      content = <>
        <HeadingSkeleton />
        <div className="insight-cards">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}</div>
        <div className="metric-grid three">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-[280px] rounded-xl" />
        <Skeleton className="h-[330px] rounded-xl" />
        <div className="insights-bottom"><Skeleton className="h-[245px] rounded-xl" /><Skeleton className="h-[245px] rounded-xl" /></div>
        <Skeleton className="h-36 rounded-xl" />
      </>
      break
  }

  return (
    <div className="loading-skeleton page-stack" role="status" aria-label={`Loading ${page} page`} aria-busy="true">
      <span className="sr-only">Loading {page}…</span>
      {content}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="error-state">
      <p>{message}</p>
      <Button variant="outline" onClick={onRetry}>Try again</Button>
    </Card>
  )
}

export function EmptyState({ title, description, icon: Icon = Sprout }: {
  title: string
  description: string
  icon?: LucideIcon
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={19} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}

export function CurrencyInput({ value, onChange, placeholder = "0", min = 0, step = 0.01 }: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  step?: number
}) {
  return (
    <label className="currency-input">
      <span>₦</span>
      <Input type="number" min={min} step={step} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} required />
    </label>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="form-field"><span>{label}</span>{children}</label>
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, busy }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  busy: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="form-dialog">
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <div className="confirm-actions">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={busy} aria-busy={busy} onClick={onConfirm}>{busy ? <>Deleting… <LoadingSpinner /></> : "Delete"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function MetricCard({ title, value, caption, icon: Icon, highlight = false }: {
  title: string
  value: string
  caption: string
  icon: LucideIcon
  highlight?: boolean
}) {
  return (
    <Card className={`metric-card ${highlight ? "highlight" : ""}`}>
      <div className="metric-label">{title}<Icon size={15} /></div>
      <strong>{value}</strong>
      <span>{caption}</span>
    </Card>
  )
}

export function InsightCard({ value, title, description, icon: Icon, tone }: {
  value: string
  title: string
  description: string
  icon: LucideIcon
  tone: "green" | "gold"
}) {
  return (
    <Card className="insight-card">
      <span className={`insight-icon ${tone}`}><Icon size={16} /></span>
      <strong className={`insight-value ${tone}`}>{value}</strong>
      <b>{title}</b>
      <p>{description}</p>
    </Card>
  )
}

export function MonthPicker({ month, onChange }: { month: string; onChange: (month: string) => void }) {
  return (
    <label className="month-picker">
      <span className="sr-only">Insights month</span>
      <Input type="month" aria-label="Insights month" value={month} onChange={(event) => event.target.value && onChange(event.target.value)} />
    </label>
  )
}

export function StatusBadge({ children, className }: { children: ReactNode; className: string }) {
  return <Badge className={className}>{children}</Badge>
}
