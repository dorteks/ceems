"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth";
import { AppShell } from "./app-shell";

const PUBLIC_ROUTES = ["/auth/login", "/auth/forgot-password"];

export default function AuthGate({ children }: { children: ReactNode }) {
  const { ready, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!ready) return;
    if (!user && !isPublic) router.replace("/auth/login");
    if (user && user.mustChangePassword && pathname !== "/account/change-password") {
      router.replace("/account/change-password");
      return;
    }
    if (user && isPublic) router.replace("/dashboard");
  }, [ready, user, isPublic, pathname, router]);

  if (!ready) return null;

  if (isPublic) return <>{children}</>;

  if (!user) return null;

  return <AppShell>{children}</AppShell>;
}
