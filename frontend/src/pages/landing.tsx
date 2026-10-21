import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  LayoutDashboard,
  ShoppingBag,
  Sprout,
  Target,
  Wallet,
  Zap,
} from "lucide-react";
import { Link } from "react-router";
import Brand from "../assets/Brand mark.png";
import { ThemeToggle } from "../components/theme-toggle";
import { Button } from "../../components/ui/button";

const previewBars = [
  19, 10, 36, 13, 12, 29, 21, 13, 16, 9, 8, 37, 35, 19, 14, 26, 10, 14, 30, 20,
  50,
];

const categorySpending = [
  { name: "Food", amount: "₦76,600", value: 33, color: "var(--chart-1)" },
  { name: "Transport", amount: "₦19,600", value: 9, color: "var(--chart-2)" },
  { name: "Bills", amount: "₦31,700", value: 14, color: "var(--chart-3)" },
  { name: "Shopping", amount: "₦7,900", value: 4, color: "var(--chart-4)" },
  { name: "Health", amount: "₦19,800", value: 9, color: "var(--chart-5)" },
  { name: "Entertainment", amount: "₦9,800", value: 5, color: "var(--chart-6)" },
];

const transactions = [
  {
    name: "Shoprite",
    type: "Food · 20 Sep",
    amount: "₦15,800",
    icon: ShoppingBag,
  },
  { name: "Jumia", type: "Shopping · 22 Sep", amount: "₦13,900", icon: Wallet },
  { name: "IKEC", type: "Bills · 26 Sep", amount: "₦15,400", icon: Zap },
];

const questions = [
  {
    question: "What can I manage in ExpenseLab?",
    answer:
      "Record income and expenses, organize transactions, set category budgets, track savings goals, and reflect in your journal. Insights and reports help you see the bigger picture.",
  },
  {
    question: "How do budgets and savings goals differ?",
    answer:
      "Budgets set limits for monthly spending. Savings goals track your recorded contributions toward a target, like a laptop or an emergency fund.",
  },
  {
    question: "What does the journal do?",
    answer:
      "It adds the story behind a purchase. Use it to consider whether an expense was planned, useful, or something you’d approach differently next time.",
  },
  {
    question: "Can I review my month in naira?",
    answer:
      "Yes. The workspace shows naira amounts. Your overview and reports keep income separate from expenses so you can see your net position clearly.",
  },
  {
    question: "Can I export a report?",
    answer:
      "Use Reports to choose a period, review your category breakdown, and export a record of that period.",
  },
];

const landingFeatures = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "Transactions", href: "#transactions", icon: ArrowLeftRight },
  { label: "Budgets", href: "#budgets", icon: Wallet },
  { label: "Goals", href: "#budgets", icon: Target },
  { label: "Journal", href: "#reflection", icon: BookOpen },
  {
    label: "Insights & reports",
    href: "#reflection",
    icon: ChartNoAxesCombined,
  },
];

function BrandLockup() {
  return (
    <Link to="/" className="landing-brand">
      <img src={Brand} alt="" />
      <span>ExpenseLab</span>
    </Link>
  );
}

function LandingFeatureNav() {
  const viewportRef = useRef<HTMLElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [marquee, setMarquee] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const [duration, setDuration] = useState(24);

  useEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const measure = () => {
      const width = group.getBoundingClientRect().width;
      const overflows = width > viewport.clientWidth + 1;
      const shouldMarquee = overflows && !reducedMotion.matches;
      setOverflowing((current) =>
        current === overflows ? current : overflows,
      );
      setMarquee((current) =>
        current === shouldMarquee ? current : shouldMarquee,
      );
      const nextDuration = Math.max(width / 28, 18);
      setDuration((current) =>
        Math.abs(current - nextDuration) < 0.1 ? current : nextDuration,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(group);
    reducedMotion.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", measure);
    };
  }, []);

  const groups = marquee ? [false, true] : [false];

  return (
    <nav
      ref={viewportRef}
      className={`landing-feature-strip${overflowing ? " is-overflowing" : ""}${marquee ? " has-marquee" : ""}`}
      aria-label="Workspace features"
      style={{ "--feature-marquee-duration": `${duration}s` } as CSSProperties}
    >
      <div className="landing-feature-track">
        {groups.map((duplicate) => (
          <div
            className="landing-feature-group"
            key={duplicate ? "duplicate" : "primary"}
            aria-hidden={duplicate || undefined}
            ref={duplicate ? undefined : groupRef}
          >
            {landingFeatures.map(({ label, href, icon: Icon }) => (
              <a href={href} key={label} tabIndex={duplicate ? -1 : undefined}>
                <Icon size={15} />
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}

function SpendingDonut() {
  const stops = categorySpending.map((item, index) => {
    const start = categorySpending
      .slice(0, index)
      .reduce((total, category) => total + category.value, 0);
    return `${item.color} ${start}% ${start + item.value}%`;
  });

  return (
    <div className="landing-donut-wrap">
      <div
        className="landing-donut"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      >
        <div>
          <span>Total spent</span>
          <strong>₦245,600</strong>
        </div>
      </div>
      <ul className="landing-legend">
        {categorySpending.map((item) => (
          <li key={item.name}>
            <span>
              <i style={{ background: item.color }} />
              {item.name}
            </span>
            <strong>{item.amount}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="landing-preview" aria-label="ExpenseLab workspace preview">
      <div className="landing-preview-heading">
        <strong>Your month at a glance</strong>
        <span>Monthly overview</span>
      </div>
      <div className="landing-spend-card">
        <div>
          <span>Total spent</span>
          <span className="landing-positive">Within your budget</span>
        </div>
        <strong>₦245,600</strong>
        <span className="landing-spend-track">
          <i />
        </span>
        <small>of ₦395,000 budget · Avg. ₦8,187 a day</small>
      </div>
      <div className="landing-preview-stats">
        <div>
          <span>Income</span>
          <strong>₦280,000</strong>
        </div>
        <div>
          <span>Net</span>
          <strong>₦34,400</strong>
        </div>
        <div>
          <span>Transactions</span>
          <strong>29</strong>
        </div>
      </div>
      <div className="landing-chart-heading">Daily spending</div>
      <div className="landing-bars" aria-hidden="true">
        {previewBars.map((height, index) => (
          <i key={index} style={{ height: `${height * 1.3}px` }} />
        ))}
      </div>
      <div className="landing-chart-labels">
        <span>01 Sep</span>
        <span>10 Sep</span>
        <span>20 Sep</span>
        <span>30 Sep</span>
      </div>
      <small className="landing-preview-foot">Workspace preview · NGN</small>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <BrandLockup />
        <nav aria-label="Landing page navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="landing-header-actions">
          <ThemeToggle />
          <Link className="landing-login" to="/login">
            Log in
          </Link>
          <Button asChild className="landing-button">
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">
            <Sprout size={13} /> Personal finance, made clear
          </span>
          <h1>
            Your money.
            <br />A clearer
            <br className="landing-mobile-break" /> picture.
          </h1>
          <p>
            See where your money goes, plan for what matters, and understand the
            habits behind every purchase. All in one calm workspace.
          </p>
          <div className="landing-hero-actions">
            <Button asChild className="landing-button">
              <Link to="/register">
                <ArrowRight size={15} /> Start your ExpenseLab
              </Link>
            </Button>
            <Button asChild variant="outline" className="landing-secondary">
              <a href="#features">Explore the workspace</a>
            </Button>
          </div>
          <span className="landing-hero-tags">
            Spending · Budgets · Goals · Reflection
          </span>
        </div>
        <HeroPreview />
      </section>

      <LandingFeatureNav />

      <section className="landing-section landing-split" id="overview">
        <div className="landing-section-copy">
          <span className="landing-eyebrow">See the whole picture</span>
          <h2>
            Less guesswork.
            <br />
            More perspective.
          </h2>
          <p>
            Separate what came in from what went out. Your overview brings
            income, expenses, and daily spending into focus.
          </p>
          <p>
            A category breakdown shows where your money went, while budget
            progress puts each amount in context.
          </p>
        </div>
        <article className="landing-card landing-category-card">
          <h3>Where your money went</h3>
          <SpendingDonut />
        </article>
      </section>

      <section className="landing-band" id="transactions">
        <div className="landing-section landing-split landing-reverse">
          <article className="landing-card landing-transactions">
            <div className="landing-card-head">
              <h3>Recent transactions</h3>
              <span>29 results</span>
            </div>
            <div className="landing-table-head">
              <span>Merchant / category</span>
              <span>Amount</span>
            </div>
            {transactions.map(({ name, type, amount, icon: Icon }) => (
              <div className="landing-transaction" key={name}>
                <span className="landing-transaction-icon">
                  <Icon size={14} />
                </span>
                <span>
                  <strong>{name}</strong>
                  <small>{type}</small>
                </span>
                <b>{amount}</b>
              </div>
            ))}
          </article>
          <div className="landing-section-copy">
            <span className="landing-eyebrow">Every expense, in one place</span>
            <h2>From scattered purchases to a clear record.</h2>
            <p>
              Keep the details that matter: merchant, category, payment method,
              and whether a purchase was a need or a want.
            </p>
            <Link className="landing-inline-link" to="/register">
              Find it. Edit it. Add a little context. <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-budget-section" id="budgets">
        <div className="landing-section">
          <span className="landing-eyebrow">Plan for what matters</span>
          <h2>Give your money direction.</h2>
          <p className="landing-section-lede">
            Set boundaries for this month and a purpose for your savings. Make
            room for everyday essentials and your next big step.
          </p>
          <div className="landing-two-cards">
            <article className="landing-card landing-budget-card">
              <h3>
                <Wallet size={15} />
                Budgets that keep you aware
              </h3>
              <p>
                Set monthly category limits. See what’s left and where you’ve
                crossed the line.
              </p>
              {[
                ["Food", "₦76,600 / ₦95,000", 81],
                ["Transport", "₦19,600 / ₦30,000", 65],
                ["Bills", "₦31,700 / ₦45,000", 70],
              ].map(([name, amount, progress]) => (
                <div className="landing-budget-row" key={name}>
                  <div>
                    <span>{name}</span>
                    <small>{amount}</small>
                  </div>
                  <span className="landing-progress">
                    <i style={{ width: `${progress}%` }} />
                  </span>
                </div>
              ))}
            </article>
            <article className="landing-card landing-goal-card">
              <h3>
                <Target size={15} />
                Savings with a purpose
              </h3>
              <p>
                Give each goal a name and a target. Record contributions and see
                your progress grow.
              </p>
              <div className="landing-goal">
                <div>
                  <span>Laptop fund</span>
                  <strong>₦180,000 of ₦500,000</strong>
                </div>
                <b>36%</b>
                <span className="landing-progress">
                  <i style={{ width: "36%" }} />
                </span>
              </div>
              <div className="landing-goal">
                <div>
                  <span>Emergency fund</span>
                  <strong>₦120,000 of ₦500,000</strong>
                </div>
                <b>24%</b>
                <span className="landing-progress">
                  <i style={{ width: "24%" }} />
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-reflection-section" id="reflection">
        <div className="landing-section landing-split">
          <div className="landing-section-copy">
            <span className="landing-eyebrow">Understand the why</span>
            <h2>
              Numbers tell a story.
              <br />
              Make it yours.
            </h2>
            <p>
              A purchase is more than an amount. Reflect in your journal, spot
              patterns in Insights, and bring the month together in Reports.
            </p>
            <ul className="landing-tool-list">
              <li>
                <BookOpen size={15} />
                <span>
                  <strong>Journal</strong>
                  <small>
                    Was it planned? Was it worth it? Add context to your
                    purchases.
                  </small>
                </span>
              </li>
              <li>
                <ChartNoAxesCombined size={15} />
                <span>
                  <strong>Insights</strong>
                  <small>
                    Explore needs vs wants, payment methods, and spending
                    patterns.
                  </small>
                </span>
              </li>
              <li>
                <Check size={15} />
                <span>
                  <strong>Reports</strong>
                  <small>
                    Review a monthly breakdown and export a clear record.
                  </small>
                </span>
              </li>
            </ul>
          </div>
          <div className="landing-reflection-previews">
            <article className="landing-reflection-card">
              <h3>A moment to pause and reflect.</h3>
              <div className="landing-reflection-purchase">
                <span>
                  <strong>Shoprite</strong>
                  <small>Recent purchase</small>
                </span>
                <b>₦15,800</b>
              </div>
              <p>What was behind this purchase?</p>
              <span className="landing-journal-tag">
                Needs review · Write entry →
              </span>
            </article>
            <article className="landing-reflection-card">
              <h3>The balance behind your spending</h3>
              <div className="landing-needs-wants">
                <i />
                <i />
              </div>
              <div className="landing-needs-labels">
                <span>49% needs</span>
                <b>51% wants</b>
              </div>
              <small>Monthly overview · Expenses only</small>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section landing-how" id="how-it-works">
        <span className="landing-eyebrow">A simple routine</span>
        <h2>Record. Plan. Reflect.</h2>
        <p>Start with one purchase. Build a routine that fits your day.</p>
        <div className="landing-steps">
          <article>
            <span>01</span>
            <h3>Bring your spending together</h3>
            <p>
              Record income and expenses. Add categories and payment details so
              each entry has a place.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Decide what comes next</h3>
            <p>
              Set monthly limits and savings targets around your priorities, not
              someone else’s rules.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Review with intention</h3>
            <p>
              Pause in your journal. Read your insights and reports, then use
              that perspective to plan again.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-faq-section" id="faq">
        <div className="landing-section landing-faq-layout">
          <div className="landing-section-copy">
            <span className="landing-eyebrow">A little more clarity</span>
            <h2>
              Good questions.
              <br />
              Clear answers.
            </h2>
            <p>Get to know your workspace before you begin.</p>
          </div>
          <div className="landing-faq-list">
            {questions.map(({ question, answer }) => (
              <details key={question}>
                <summary>
                  <span>{question}</span>
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="landing-section">
          <div className="landing-final-cta">
            <h2>Make your next money decision a little clearer.</h2>
            <p>Start with your spending. Build towards what matters.</p>
            <Button asChild className="landing-button">
              <Link to="/register">
                <ArrowRight size={14} /> Get started with ExpenseLab
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-section landing-footer-grid">
          <div>
            <BrandLockup />
            <p>
              Personal finance, made clear.
              <br />A little clarity, every day.
            </p>
          </div>
          <div>
            <strong>Workspace</strong>
            <Link to="/register">Overview &amp; transactions</Link>
            <Link to="/register">Budgets &amp; savings goals</Link>
            <Link to="/register">Journal</Link>
            <Link to="/register">Insights &amp; reports</Link>
          </div>
          <div>
            <strong>Get started</strong>
            <Link to="/register">Create an account</Link>
            <Link to="/login">Log in</Link>
            <a href="#faq">Account help</a>
          </div>
          <div>
            <strong>Legal</strong>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </div>
        <div className="landing-section landing-footer-bottom">
          <span>© ExpenseLab</span>
          <span>Private by design. Made for clearer money moments.</span>
        </div>
      </footer>
    </main>
  );
}
