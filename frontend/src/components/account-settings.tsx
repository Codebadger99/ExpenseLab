import { useState, type FormEvent } from "react";
import { AlertTriangle, LogOut, Settings2, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { apiRequest, getErrorMessage } from "../lib/api";
import { LoadingSpinner } from "./workspace-ui";

export function AccountSettings({
  onSignOut,
  onDeleted,
}: {
  onSignOut: () => void;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmation !== "DELETE") {
      setError("Type DELETE exactly to confirm account deletion.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await apiRequest("/auth/account", {
        method: "DELETE",
      });
      onDeleted();
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        className="account-settings-trigger"
        aria-label="Account settings"
        onClick={() => setOpen(true)}
      >
        <Settings2 size={14} />
        <span>Account settings</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="form-dialog">
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>
              Manage your ExpenseLab session and account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              <LogOut size={15} /> Sign out
            </Button>
            <div className="grid gap-2 rounded-lg border border-[#f0d6d0] p-4">
              <strong className="text-sm text-[#b34e3d]">Delete account</strong>
              <p className="m-0 text-xs leading-5 text-[#738078]">
                Permanently remove your account and associated financial data.
                This can’t be undone.
              </p>
              <Button
                variant="destructive"
                className="mt-1 w-fit gap-2"
                onClick={() => {
                  setOpen(false);
                  setDeleteOpen(true);
                  setError("");
                }}
              >
                <Trash2 size={14} /> Continue to deletion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleteOpen}
        onOpenChange={(next) => {
          setDeleteOpen(next);
          if (!next) {
            setConfirmation("");
            setError("");
          }
        }}
      >
        <DialogContent className="form-dialog delete-account-dialog">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription className="delete-account-warning">
              <AlertTriangle size={17} aria-hidden="true" />
              <span>
                This permanently deletes your account and all associated
                financial data. This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <form
            className="dialog-form"
            onSubmit={(event) => void deleteAccount(event)}
            noValidate
          >
            <label className="form-field">
              <span>
                To confirm, type <strong>DELETE</strong> below
              </span>
              <Input
                className="delete-account-input"
                autoComplete="off"
                autoCapitalize="characters"
                aria-label="Type DELETE to confirm account deletion"
                placeholder="DELETE"
                spellCheck={false}
                value={confirmation}
                onChange={(event) => {
                  setConfirmation(event.target.value);
                  setError("");
                }}
                required
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="confirm-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="delete-account-submit"
                disabled={busy || confirmation !== "DELETE"}
                aria-busy={busy}
              >
                {busy ? (
                  <>
                    Deleting… <LoadingSpinner />
                  </>
                ) : (
                  "Delete account"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
