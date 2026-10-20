import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "../../components/ui/button"

type Theme = "light" | "dark"
type ThemeContextValue = { theme: Theme; toggleTheme: () => void }

const THEME_KEY = "expense-lab-theme"
const ThemeContext = createContext<ThemeContextValue | null>(null)

function savedTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(savedTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((current) => current === "light" ? "dark" : "light")
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function ThemeToggle() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("ThemeToggle must be rendered inside ThemeProvider.")
  const isDark = context.theme === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="theme-toggle"
      onClick={context.toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}
