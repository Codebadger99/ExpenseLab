import { ArrowLeft, ArrowRight, Compass, UserRoundPlus } from "lucide-react"
import { Link } from "react-router"
import Brand from "../assets/Brand mark.png"
import { Button } from "../../components/ui/button"
import { ThemeToggle } from "../components/theme-toggle"

export function AccountRequiredPage() {
  return (
    <main className="standalone-page">
      <header className="standalone-header">
        <Link to="/" className="standalone-brand">
          <img src={Brand} alt="" />
          ExpenseLab
        </Link>
        <ThemeToggle />
      </header>
      <section className="standalone-message" aria-labelledby="account-required-title">
        <span className="standalone-icon">
          <UserRoundPlus size={24} />
        </span>
        <p className="standalone-eyebrow">Your workspace is waiting</p>
        <h1 id="account-required-title">Create an account to continue</h1>
        <p className="standalone-description">
          Sign up for an ExpenseLab account to access your transactions, budgets,
          goals, and journal.
        </p>
        <div className="standalone-actions">
          <Button asChild>
            <Link to="/register">
              Create an account <ArrowRight size={16} />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">I already have an account</Link>
          </Button>
        </div>
        <Link className="standalone-back-link" to="/">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </section>
    </main>
  )
}

export function NotFoundPage() {
  return (
    <main className="standalone-page">
      <header className="standalone-header">
        <Link to="/" className="standalone-brand">
          <img src={Brand} alt="" />
          ExpenseLab
        </Link>
        <ThemeToggle />
      </header>
      <section className="standalone-message" aria-labelledby="not-found-title">
        <span className="standalone-icon">
          <Compass size={24} />
        </span>
        <p className="standalone-eyebrow">404 · Page not found</p>
        <h1 id="not-found-title">This page doesn’t exist</h1>
        <p className="standalone-description">
          The link may be outdated, or the page may have moved. Check the address
          or head back to a page that exists.
        </p>
        <div className="standalone-actions">
          <Button asChild>
            <Link to="/">
              Go to home <ArrowRight size={16} />
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft size={16} /> Go back
          </Button>
        </div>
      </section>
    </main>
  )
}
