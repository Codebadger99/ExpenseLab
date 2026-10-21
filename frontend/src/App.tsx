import { useEffect, useState } from "react"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router"
import { AuthScreen, type AuthMode } from "./pages/auth"
import { Workspace } from "./dashboard"
import {
  ACCESS_TOKEN_KEY,
  AUTH_REQUIRED_EVENT,
  USER_KEY,
} from "./lib/api"
import type { User } from "./lib/types"
import { ThemeProvider } from "./components/theme-toggle"
import { LandingPage } from "./pages/landing"
import { AccountRequiredPage, NotFoundPage } from "./pages/system-pages"

type Session = { token: string; user: User }

const PROTECTED_PATHS = [
  "/overview",
  "/transactions",
  "/budgets",
  "/goals",
  "/journal",
  "/insights",
  "/onboarding/target",
  "/onboarding/budgets",
]

function readSession(): Session | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const savedUser = localStorage.getItem(USER_KEY)
  if (!token || !savedUser) return null
  try {
    return { token, user: JSON.parse(savedUser) as User }
  } catch {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(readSession)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    function handleAuthRequired() {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setSession(null)
      navigate("/account-required", { replace: true })
    }

    window.addEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired)
    return () =>
      window.removeEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired)
  }, [navigate])

  function signIn(token: string, user: User) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setSession({ token, user })
  }

  function updateUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setSession((current) => current ? { ...current, user } : current)
  }

  function signOut() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setSession(null)
  }

  if (!session) {
    const authRoute = (mode: AuthMode) => <AuthScreen mode={mode} onAuthenticated={signIn} />
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={authRoute("login")} />
        <Route path="/register" element={authRoute("register")} />
        <Route path="/forgot-password" element={authRoute("forgot")} />
        <Route path="/reset-password" element={authRoute("reset")} />
        <Route
          path="/account-required"
          element={<AccountRequiredPage />}
        />
        {PROTECTED_PATHS.map((path) => (
          <Route
            key={path}
            path={path}
            element={<AccountRequiredPage />}
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    )
  }

  if (location.pathname === "/") {
    return <Navigate to="/overview" replace />
  }

  if (!PROTECTED_PATHS.includes(location.pathname)) return <NotFoundPage />

  return <Workspace user={session.user} onSignOut={signOut} onUserUpdate={updateUser} />
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>
  )
}
