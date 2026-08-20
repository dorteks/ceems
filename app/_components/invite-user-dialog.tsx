"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, Role, Hub, ROLES, HUBS } from "@/lib/auth/auth";

export function InviteUserDialog() {
  const { inviteUser, defaultPassword, isSuperAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Enumerator");
  const [hub, setHub] = useState<Hub>("Osogbo");
  const [password, setPassword] = useState(defaultPassword);
  const [error, setError] = useState<string | null>(null);

  if (!isSuperAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> Invite user
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            Create an account. The email address is the username, and the user
            is prompted to change the default password after first sign-in.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const res = inviteUser({ name, email, role, hub, password });
            if (!res.ok) {
              setError(res.error ?? "Unable to create account.");
              return;
            }
            setError(null);
            setOpen(false);
            setName("");
            setEmail("");
            setPassword(defaultPassword);
            toast.success(`Account created for ${email}`);
          }}
        >
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="invite-name">Full name</Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email (username)</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@utility.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hub scope</Label>
              <Select value={hub} onValueChange={(v) => setHub(v as Hub)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HUBS.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h === "All" ? "All hubs" : h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {hub === "All"
              ? "Can manage data across every business hub."
              : `Can only manage data belonging to the ${hub} business hub.`}
          </p>

          <div className="space-y-2">
            <Label htmlFor="invite-password">Default password</Label>
            <Input
              id="invite-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
