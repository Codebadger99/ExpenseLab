import { useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AuthScreen, type AuthMode } from "./pages/auth"
import { Workspace } from "./dashboard"
import { ACCESS_TOKEN_KEY, USER_KEY } from "./lib/api"
import type { User } from "./lib/types"
import { ThemeProvider } from "./components/theme-toggle"
import { LandingPage } from "./pages/landing"

type Session = { token: string; user: User }

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

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
