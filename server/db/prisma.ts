import { PrismaPg } from "@prisma/adapter-pg";
import prismaClientPkg from "@prisma/client";

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

const { PrismaClient: PrismaClientCtor } = prismaClientPkg as {
  PrismaClient: new (options: { adapter: PrismaPg }) => PrismaClient;
};

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = global.prisma ?? new PrismaClientCtor({ adapter });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
