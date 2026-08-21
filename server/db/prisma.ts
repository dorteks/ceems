import { PrismaPg } from "@prisma/adapter-pg";

export type UserRow = {
  id: number;
  username: string;
  name: string;
  email: string | null;
  phone: string | null;
  role:
    | "SUPER_ADMINISTRATOR"
    | "DATA_MANAGER"
    | "SUPERVISOR"
    | "ENUMERATOR"
    | "VIEWER";
  hub: "ALL" | "OSOGBO" | "EDE" | "ILE_IFE" | "ILESA";
  status: "ACTIVE" | "SUSPENDED";
  password_hash: string;
  must_change_password: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

type CustomerRow = {
  id: number;
  account_number: string;
  meter_number: string | null;
  surname: string;
  first_name: string;
  other_name: string | null;
  nin: string | null;
  customer_type: string | null;
  customer_category: string | null;
  premise_type: string | null;
  meter_type: string | null;
  meter_phase: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  lga: string | null;
  service_center: string | null;
  service_code: string | null;
  tariff: string | null;
  longitude: number | null;
  latitude: number | null;
  email: string | null;
  phone: string | null;
  nature_of_business: string | null;
  dss_id: string | null;
  dss_name: string | null;
  feeder_id: string | null;
  feeder_name: string | null;
  feeder_band: string | null;
  status: string | null;
  business_hub: string | null;
  region: string | null;
  enumerator_name: string | null;
  enumerator_id: string | null;
  enumerator_phone_number: string | null;
  remark: string | null;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  updated_by: string | null;
};

type PrismaClient = {
  user: {
    findMany(args?: unknown): Promise<UserRow[]>;
    findUnique(args?: unknown): Promise<UserRow | null>;
    findFirst(args?: unknown): Promise<UserRow | null>;
    update(args?: unknown): Promise<UserRow>;
    create(args?: unknown): Promise<UserRow>;
  };
  customer: {
    findUnique(args?: unknown): Promise<CustomerRow | null>;
    findMany(args?: unknown): Promise<CustomerRow[]>;
    count(args?: unknown): Promise<number>;
    create(args?: unknown): Promise<CustomerRow>;
    update(args?: unknown): Promise<CustomerRow>;
    delete(args?: unknown): Promise<CustomerRow>;
    createMany(args?: unknown): Promise<{ count: number }>;
  };
};

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

let _prisma: PrismaClient | undefined = undefined;

try {
  // Try to require the generated Prisma client. This can fail during build
  // (when the client hasn't been generated), so wrap in try/catch and fall
  // back to a lightweight stub that allows Next.js to collect routes.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pkg = require("@prisma/client") as unknown;
  const PrismaClientCtor = (
    pkg as unknown as {
      PrismaClient?: new (options: { adapter: PrismaPg }) => PrismaClient;
    }
  ).PrismaClient as new (options: { adapter: PrismaPg }) => PrismaClient;

  _prisma = global.prisma as PrismaClient | undefined;
  if (!_prisma) {
    _prisma = new PrismaClientCtor({ adapter });
    if (process.env.NODE_ENV !== "production") {
      // cache across module reloads in dev
      (global as unknown as { prisma?: PrismaClient }).prisma = _prisma;
    }
  }
} catch (err) {
  // Provide a minimal stub to avoid build-time failures when the Prisma
  // generated client is not available. Runtime operations that expect a
  // real database will throw when called (or return sensible defaults).
  const stub = {
    user: {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      update: async () => {
        throw err;
      },
      create: async () => {
        throw err;
      },
    },
    customer: {
      findUnique: async () => null,
      findMany: async () => [],
      count: async () => 0,
      create: async () => {
        throw err;
      },
      update: async () => {
        throw err;
      },
      delete: async () => {
        throw err;
      },
      createMany: async () => ({ count: 0 }),
    },
  };

  _prisma = (global.prisma as PrismaClient) ?? (stub as PrismaClient);
}

export const prisma = _prisma as PrismaClient;
