"use client";

import { useState } from "react";
import { Zap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth";
import { useRouter } from "next/navigation";

// export const Route = createFileRoute("/login")({
//   head: () => ({
//     meta: [
//       { title: "Sign in — CEEMS Enumeration Platform" },
//       {
//         name: "description",
//         content:
//           "Sign in to CEEMS with your work email to manage electricity customers, meters and field enumeration for your business hub.",
//       },
//       { property: "og:title", content: "Sign in — CEEMS Enumeration Platform" },
//       { property: "og:description", content: "Role-based access to customer and enumeration data." },
//     ],
//   }),
//   component: LoginPage,
// });

export default function LoginPage() {
  const { signIn, accounts } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const demo = accounts[0];

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-base font-semibold">CEEMS</p>
            <p className="text-xs text-muted-foreground">
              Enumeration Platform
            </p>
          </div>
        </div>

        <Card className="py-6 space-y-6">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your work email address and password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                const res = signIn(email, password);
                if (!res.ok) {
                  setError(res.error ?? "Unable to sign in.");
                  return;
                }
                setError(null);
                router.push("/dashboard");
              }}
            >
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@utility.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <LogIn className="size-4" /> Sign in
              </Button>
            </form>

            {demo ? (
              <p className="mt-6 rounded-md bg-secondary p-3 text-xs text-muted-foreground">
                Demo access — email{" "}
                <span className="font-mono">{demo.email}</span>, password{" "}
                <span className="font-mono">Ceems@2026</span>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-col gap-1">
          <p className="text-center text-xs text-muted-foreground">
            Accounts are created by a Super Administrator.
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Contact your administrator for access.
          </p>
        </div>
      </div>
    </div>
  );
}
