"use client";

import { useState } from "react";
import { Copy, KeyRound, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth/auth";

type ResetPasswordDialogProps = {
  username: string;
  name: string;
};

export function ResetPasswordDialog({
  username,
  name,
}: ResetPasswordDialogProps) {
  const { resetUserPassword, isSuperAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const copyPassword = async () => {
    if (!generatedPassword || !navigator.clipboard) return;

    await navigator.clipboard.writeText(generatedPassword);
  };

  if (!isSuperAdmin) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setError(null);
          setGeneratedPassword(null);
          setConfirmUsername("");
          setResetting(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <KeyRound className="size-4" />
          Reset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Generate a temporary password for {name}. The account will be set to
            change password at next sign-in.
          </DialogDescription>
        </DialogHeader>

        {generatedPassword ? (
          <div className="space-y-4">
            <Alert className="border-emerald-500/30 bg-emerald-500/5">
              <AlertDescription>
                Temporary password generated successfully.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="generated-password">Temporary password</Label>
              <div className="flex gap-2">
                <Input
                  id="generated-password"
                  readOnly
                  value={generatedPassword}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    void copyPassword().catch(() => {
                      // ignore clipboard failures
                    });
                  }}
                  aria-label="Copy temporary password"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  void copyPassword().catch(() => {
                    // ignore clipboard failures
                  });
                  toast.success(`Password copied for ${username}.`);
                }}
              >
                <Copy className="size-4" />
                Copy password
              </Button>
              <Button type="button" onClick={() => setOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (resetting) return;

              if (
                confirmUsername.trim().toLowerCase() !== username.toLowerCase()
              ) {
                setError("Type the username exactly to confirm the reset.");
                return;
              }

              setError(null);
              setResetting(true);

              try {
                const res = await resetUserPassword(username);

                if (!res.ok) {
                  setError(res.error ?? "Unable to reset password.");
                  return;
                }

                setGeneratedPassword(res.generatedPassword ?? null);
                toast.success(`Temporary password generated for ${username}.`);
              } finally {
                setResetting(false);
              }
            }}
          >
            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
                <span className="text-sm text-destructive">{error}</span>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={username} readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`confirm-${username}`}>
                Type username to confirm
              </Label>
              <Input
                id={`confirm-${username}`}
                placeholder={username}
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
                required
              />
            </div>

            <p className="text-xs text-muted-foreground">
              This will invalidate the current password and force a change on
              the next sign-in.
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={resetting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={resetting}>
                {resetting ? (
                  <>
                    <RotateCcw className="size-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <KeyRound className="size-4" />
                    Reset password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
