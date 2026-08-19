"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Network,
  Upload,
  Map,
  History,
  Shield,
  Zap,
  Search,
  Bell,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/enumeration", label: "Enumeration", icon: ClipboardList },
  { to: "/network", label: "Network", icon: Network },
  { to: "/import", label: "Import & Export", icon: Upload },
  { to: "/map", label: "Map", icon: Map },
  { to: "/audit", label: "Audit trail", icon: History },
  { to: "/administration", label: "Administration", icon: Shield },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((item) => {
        const active =
          item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);

        return (
          <Link
            key={item.to}
            href={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active &&
                "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_var(--sidebar-primary)]",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
      <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Zap className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-sidebar-accent-foreground">
          CEEMS
        </p>
        <p className="text-xs text-sidebar-foreground/70">
          Enumeration Platform
        </p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/70">
          <p className="font-medium text-sidebar-accent-foreground">
            Osun Distribution
          </p>
          <p>214,806 records synced</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur md:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search account, meter, NIN, phone…"
              className="pl-9"
              aria-label="Global search"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="size-5" />
            </Button>
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                AO
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-xs leading-tight sm:block">
              <p className="font-medium">Adaeze O.</p>
              <p className="text-muted-foreground">Super Admin</p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
