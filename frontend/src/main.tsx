import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
const savedTheme = localStorage.getItem("expense-lab-theme")
document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light"
document.documentElement.classList.toggle("dark", savedTheme === "dark")
import "./index.css"
import "./App.css"
import App from "./App"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
