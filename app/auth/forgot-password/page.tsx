"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  MailQuestion,
} from "lucide-react";
import Link from "next/link";
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

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const copyPassword = async () => {
    if (!generatedPassword || !navigator.clipboard) return;

    await navigator.clipboard.writeText(generatedPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <KeyRound className="size-5" />
          </span>

          <div className="leading-tight">
            <p className="text-base font-semibold">CEEMS</p>
            <p className="text-xs text-muted-foreground">
              Password recovery
            </p>
          </div>
        </div>

        <Card className="space-y-6 py-6">
          <CardHeader>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>
              Enter your username or email address to generate a temporary
              password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {generatedPassword ? (
              <div className="space-y-4">
                <Alert className="border-emerald-500/30 bg-emerald-500/5">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <AlertDescription>
                    A temporary password has been generated for your account.
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

                <p className="text-sm text-muted-foreground">
                  Use this password to sign in, then change it immediately when
                  prompted.
                </p>

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      void copyPassword().catch(() => {
                        // ignore clipboard failures
                      });
                    }}
                  >
                    <Copy className="size-4" />
                    Copy password
                  </Button>
                  <Button asChild variant="secondary" className="flex-1">
                    <Link href="/auth/login">
                      <ArrowLeft className="size-4" />
                      Back to sign in
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form
                className="space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (submitting) return;

                  setError(null);
                  setSubmitting(true);

                  try {
                    const response = await fetch("/api/auth/forgot-password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ identifier }),
                    });

                    const data = (await response
                      .json()
                      .catch(() => null)) as {
                      error?: string;
                      generatedPassword?: string;
                    } | null;

                    if (!response.ok || !data?.generatedPassword) {
                      setError(data?.error ?? "Unable to reset password.");
                      return;
                    }

                    setGeneratedPassword(data.generatedPassword);
                  } catch {
                    setError("Unable to reset password. Please try again.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="identifier">Username or email</Label>
                  <Input
                    id="identifier"
                    placeholder="superadmin or admin@utility.ng"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <MailQuestion className="size-4" />
                        Generate password
                      </>
                    )}
                  </Button>

                  <Button asChild variant="secondary" className="flex-1">
                    <Link href="/auth/login">
                      <ArrowLeft className="size-4" />
                      Back to sign in
                    </Link>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
