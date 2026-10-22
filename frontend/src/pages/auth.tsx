import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowRight, Lightbulb, ShieldCheck, Sprout } from "lucide-react";
import Brand from "../assets/Brand mark.png";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { apiRequest, getErrorMessage } from "../lib/api";
import { getFormValidationError } from "../lib/form-validation";
import type { User } from "../lib/types";
import { ThemeToggle } from "../components/theme-toggle";
import { LoadingSpinner } from "../components/workspace-ui";

export type AuthMode = "login" | "register" | "forgot" | "reset";

export function AuthScreen({
  mode,
  onAuthenticated,
}: {
  mode: AuthMode;
  onAuthenticated: (token: string, user: User) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => {
    const state = location.state as { email?: string } | null;
    return (mode === "forgot" || mode === "reset") ? state?.email ?? "" : "";
  });
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(() => {
    const state = location.state as {
      passwordReset?: boolean;
      passwordResetRequested?: boolean;
    } | null;
    if (state?.passwordReset)
      return "Your password has been reset. Sign in with your new password.";
    if (state?.passwordResetRequested)
      return "If an account exists for that email, a reset code has been sent. Check your inbox and spam folder.";
    return "";
  });
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = getFormValidationError(event.currentTarget);
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (isForgot) {
        await apiRequest("/auth/forgot-password", {
          method: "POST",
          body: { email: email.trim() },
          responseType: "text",
        });
        navigate("/reset-password", {
          state: { email: email.trim(), passwordResetRequested: true },
        });
        return;
      }
      if (isReset) {
        await apiRequest("/auth/reset-password", {
          method: "POST",
          body: {
            email: email.trim(),
            code: code.trim(),
            newPassword: password,
          },
        });
        navigate("/login", { replace: true, state: { passwordReset: true } });
        return;
      }

      const response = await apiRequest<{ accessToken: string; user: User }>(
        `/auth/${mode}`,
        {
          method: "POST",
          body: isRegister
            ? { name: name.trim(), email: email.trim(), password }
            : { email: email.trim(), password },
        },
      );
      onAuthenticated(response.accessToken, response.user);
      if (isRegister || response.user.monthlyTrackAmount === null) {
        localStorage.setItem(
          `expense-lab-onboarding-${response.user.id}`,
          "target",
        );
        navigate("/onboarding/target", { replace: true });
      } else {
        navigate("/overview", { replace: true });
      }
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  const title = isRegister
    ? "A clearer picture starts here."
    : isForgot
      ? "Let’s get you back in."
      : isReset
        ? "Choose a new password."
        : "Welcome back.";
  const description = isRegister
    ? "Create your account and give your money a calmer place to land."
    : isForgot
      ? "Enter your account email and we’ll send a password reset code."
      : isReset
        ? "Enter the six-digit code from your email and choose a new password."
        : "Sign in to pick up where you left off.";

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand-row">
          <Link to="/login" className="brand-lockup auth-brand">
            <img src={Brand} alt="" />
            <span>ExpenseLab</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="auth-intro">
          <span className="eyebrow">
            <Sprout size={14} /> Personal finance, made clear
          </span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <form
          onSubmit={(event) => void submit(event)}
          className="auth-form"
          noValidate
        >
          {isRegister && (
            <label className="form-field">
              <span>Your name</span>
              <Input
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          )}
          <label className="form-field">
            <span>Email address</span>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {isReset && (
            <label className="form-field">
              <span>6-digit reset code</span>
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </label>
          )}
          {!isForgot && (
            <label className="form-field">
              <span>{isReset ? "New password" : "Password"}</span>
              <Input
                type="password"
                autoComplete={
                  isRegister || isReset ? "new-password" : "current-password"
                }
                minLength={isRegister || isReset ? 8 : 6}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
          )}
          {notice && (
            <p className="form-notice" role="status">
              {notice}
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button
            className="auth-submit"
            type="submit"
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? (
              <>
                Please wait… <LoadingSpinner />
              </>
            ) : (
              <>
                {isRegister
                  ? "Create account"
                  : isForgot
                    ? "Send reset code"
                    : isReset
                      ? "Reset password"
                      : "Sign in"}
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>
        {mode === "login" && (
          <p className="auth-switch">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        )}
        {isForgot && (
          <p className="auth-switch">
            <Link to="/login">Back to sign in</Link>
          </p>
        )}
        {isReset && (
          <p className="auth-switch">
            Didn’t receive a code?{" "}
            <Link to="/forgot-password" state={{ email }}>
              Send another
            </Link>
          </p>
        )}
        {(isRegister || mode === "login") && (
          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to ExpenseLab?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        )}
        <p className="auth-footnote">
          <ShieldCheck size={14} /> Your financial data is private to your
          account.
        </p>
      </section>
      <aside className="auth-aside">
        <div className="auth-aside-content">
          <span className="aside-icon">
            <Lightbulb size={19} />
          </span>
          <h2>
            Small habits.
            <br />
            Better finances.
          </h2>
          <p>A little clarity, every day.</p>
          <div className="aside-decoration">
            <span />
            <span />
            <span />
          </div>
        </div>
        <span className="auth-aside-footer">
          Made for more mindful money moments.
        </span>
      </aside>
    </main>
  );
}
