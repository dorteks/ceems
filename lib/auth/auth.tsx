import { systemUsers } from "@/app/data/ceems";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const ROLES = [
  "Super Administrator",
  "Data Manager",
  "Supervisor",
  "Enumerator",
  "Viewer",
] as const;
export type Role = (typeof ROLES)[number];

export const HUBS = ["All", "Osogbo", "Ede", "Ile-Ife", "Ilesa"] as const;
export type Hub = (typeof HUBS)[number];

export interface AccountRecord {
  name: string;
  email: string;
  role: Role;
  hub: Hub;
  status: "Active" | "Suspended";
  password: string;
  mustChangePassword: boolean;
}

const STORE_KEY = "ceems.accounts";
const SESSION_KEY = "ceems.session";
const DEFAULT_PASSWORD = "Ceems@2026";

function seed(): AccountRecord[] {
  return systemUsers.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role as Role,
    hub: u.hub as Hub,
    status: u.status as AccountRecord["status"],
    password: DEFAULT_PASSWORD,
    mustChangePassword: false,
  }));
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

interface AuthValue {
  ready: boolean;
  user: AccountRecord | null;
  accounts: AccountRecord[];
  defaultPassword: string;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;
  inviteUser: (input: {
    name: string;
    email: string;
    role: Role;
    hub: Hub;
    password: string;
  }) => { ok: boolean; error?: string };
  changePassword: (
    current: string,
    next: string,
  ) => { ok: boolean; error?: string };
  canManageHub: (hub: string) => boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = read<AccountRecord[] | null>(STORE_KEY, null);
    const list = stored && stored.length ? stored : seed();
    setAccounts(list);
    if (!stored) write(STORE_KEY, list);
    setEmail(read<string | null>(SESSION_KEY, null));
    setReady(true);
  }, []);

  const persist = useCallback((list: AccountRecord[]) => {
    setAccounts(list);
    write(STORE_KEY, list);
  }, []);

  const user = useMemo(
    () => accounts.find((a) => a.email === email) ?? null,
    [accounts, email],
  );

  const value: AuthValue = useMemo(() => {
    const isSuperAdmin = user?.role === "Super Administrator";
    return {
      ready,
      user,
      accounts,
      defaultPassword: DEFAULT_PASSWORD,
      isSuperAdmin,
      signIn: (inputEmail, password) => {
        const found = accounts.find(
          (a) => a.email.toLowerCase() === inputEmail.trim().toLowerCase(),
        );
        if (!found || found.password !== password) {
          return { ok: false, error: "Incorrect email or password." };
        }
        if (found.status === "Suspended") {
          return {
            ok: false,
            error: "This account is suspended. Contact an administrator.",
          };
        }
        setEmail(found.email);
        write(SESSION_KEY, found.email);
        return { ok: true };
      },
      signOut: () => {
        setEmail(null);
        write(SESSION_KEY, null);
      },
      inviteUser: (input) => {
        if (!isSuperAdmin)
          return {
            ok: false,
            error: "Only a Super Administrator can create accounts.",
          };
        const exists = accounts.some(
          (a) => a.email.toLowerCase() === input.email.trim().toLowerCase(),
        );
        if (exists)
          return {
            ok: false,
            error: "An account with that email already exists.",
          };
        persist([
          ...accounts,
          {
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            role: input.role,
            hub: input.hub,
            status: "Active",
            password: input.password,
            mustChangePassword: true,
          },
        ]);
        return { ok: true };
      },
      changePassword: (current, next) => {
        if (!user) return { ok: false, error: "You are not signed in." };
        if (user.password !== current)
          return { ok: false, error: "Current password is incorrect." };
        if (next.length < 8)
          return {
            ok: false,
            error: "New password must be at least 8 characters.",
          };
        persist(
          accounts.map((a) =>
            a.email === user.email
              ? { ...a, password: next, mustChangePassword: false }
              : a,
          ),
        );
        return { ok: true };
      },
      canManageHub: (hub: string) =>
        !!user && (user.hub === "All" || user.hub === hub),
    };
  }, [accounts, persist, ready, user]);

  // Apply role-scoped dashboard domain for theming.
  useEffect(() => {
    if (!ready) return;

    const roleToDomain: Record<Role, string | null> = {
      "Super Administrator": "administrator",
      "Data Manager": "data_manager",
      Supervisor: "supervisor",
      Enumerator: "enumerator",
      Viewer: "viewer",
    };

    const domain = user ? (roleToDomain[user.role] ?? null) : null;

    if (domain) {
      try {
        document.documentElement.setAttribute("data-dashboard-domain", domain);
        if (process.env.NODE_ENV !== "production")
          console.log("applied data-dashboard-domain:", domain);
      } catch {
        /* noop in non-browser env */
      }
    } else {
      try {
        document.documentElement.removeAttribute("data-dashboard-domain");
        if (process.env.NODE_ENV !== "production")
          console.log("removed data-dashboard-domain");
      } catch {
        /* noop in non-browser env */
      }
    }
  }, [ready, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
