import { useState, type FormEvent } from "react"
import { LogOut, Settings2, Trash2 } from "lucide-react"
import { useNavigate } from "react-router"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { apiRequest, getErrorMessage } from "../lib/api"
import { LoadingSpinner } from "./workspace-ui"

export function AccountSettings({ email, onSignOut, onDeleted }: { email: string; onSignOut: () => void; onDeleted: () => void }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      await apiRequest("/auth/account", { method: "DELETE", body: { password } })
      onDeleted()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  function resetPasswordBeforeDeleting() {
    setDeleteOpen(false)
    onSignOut()
    navigate("/forgot-password", { state: { email } })
  }

  return <>
    <Button variant="ghost" className="account-settings-trigger" aria-label="Account settings" onClick={() => setOpen(true)}><Settings2 size={14} /><span>Account settings</span></Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="form-dialog">
        <DialogHeader><DialogTitle>Account</DialogTitle><DialogDescription>Manage your ExpenseLab session and account.</DialogDescription></DialogHeader>
        <div className="grid gap-3">
          <Button variant="outline" className="justify-start gap-2" onClick={() => { setOpen(false); onSignOut() }}><LogOut size={15} /> Sign out</Button>
          <div className="grid gap-2 rounded-lg border border-[#f0d6d0] p-4">
            <strong className="text-sm text-[#b34e3d]">Delete account</strong>
            <p className="m-0 text-xs leading-5 text-[#738078]">Permanently remove your account and associated financial data. This can’t be undone.</p>
            <Button variant="destructive" className="mt-1 w-fit gap-2" onClick={() => { setOpen(false); setDeleteOpen(true); setError("") }}><Trash2 size={14} /> Continue to deletion</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={deleteOpen} onOpenChange={(next) => { setDeleteOpen(next); if (!next) { setPassword(""); setConfirmed(false); setError("") } }}>
      <DialogContent className="form-dialog">
        <DialogHeader><DialogTitle>Delete your account?</DialogTitle><DialogDescription>This permanently deletes your account and its associated data. Enter your current password and confirm to continue.</DialogDescription></DialogHeader>
        <form className="dialog-form" onSubmit={(event) => void deleteAccount(event)}>
          <label className="form-field"><span>Current password</span><Input type="password" autoComplete="current-password" maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-[#59675f]"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} required /><span>I understand this permanently deletes my account and data.</span></label>
          <button
            className="delete-password-help"
            type="button"
            onClick={resetPasswordBeforeDeleting}
          >
            Forgot your password? Reset it first
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="confirm-actions"><Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button type="submit" variant="destructive" disabled={busy || !confirmed || !password} aria-busy={busy}>{busy ? <>Deleting… <LoadingSpinner /></> : "Delete account"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </>
}
