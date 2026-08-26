import { Prisma } from "@/generated/prisma/client";
import type { ServiceCenterValue } from "@/lib/prisma-enums";
import { prisma } from "@/server/db/prisma";

type CustomerSnapshotSource = {
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

export type CustomerEnumerationRecord = {
  id: number;

  customerId: number;
  accountNumber: string;
  meterNumber: string | null;

  userId: number | null;
  userName: string;
  serviceCenter: ServiceCenterValue | null;
  enumeratedAt: string;

  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
};

type CustomerEnumerationRow = {
  id: number;

  customer_id: number;
  account_number: string;
  meter_number: string | null;

  user_id: number | null;
  user_name: string;
  service_center: ServiceCenterValue | null;
  enumerated_at: Date;

  before_data: Prisma.JsonValue | null;
  after_data: Prisma.JsonValue | null;
};

function serializeSnapshot(customer: CustomerSnapshotSource) {
  return {
    ...customer,
    created_at: customer.created_at.toISOString(),
    updated_at: customer.updated_at.toISOString(),
  };
}

function serializeEnumeration(
  row: CustomerEnumerationRow,
): CustomerEnumerationRecord {
  return {
    id: row.id,

    customerId: row.customer_id,
    accountNumber: row.account_number,
    meterNumber: row.meter_number,

    userId: row.user_id,
    userName: row.user_name,
    serviceCenter: row.service_center,
    enumeratedAt: row.enumerated_at.toISOString(),

    beforeData: (row.before_data as Record<string, unknown> | null) ?? null,

    afterData: (row.after_data as Record<string, unknown> | null) ?? null,
  };
}

function buildWhereClause(options?: {
  customerId?: number;
  serviceCenter?: ServiceCenterValue | null;
  from?: Date;
  to?: Date;
}) {
  return {
    ...(options?.customerId != null ? { customer_id: options.customerId } : {}),
    ...(options?.serviceCenter
      ? { service_center: options.serviceCenter }
      : {}),
    ...(options?.from || options?.to
      ? {
          enumerated_at: {
            ...(options.from ? { gte: options.from } : {}),
            ...(options.to ? { lte: options.to } : {}),
          },
        }
      : {}),
  };
}

export async function recordCustomerEnumeration(
  client: Pick<typeof prisma, "customerEnumeration">,
  input: {
    customerId: number;
    userId?: number | null;
    userName: string;
    serviceCenter?: ServiceCenterValue | null;

    beforeData: CustomerSnapshotSource;
    afterData: CustomerSnapshotSource;

    enumeratedAt?: Date;
  },
) {
  const created = await client.customerEnumeration.create({
    data: {
      customer_id: input.customerId,

      account_number: input.beforeData.account_number,
      meter_number: input.beforeData.meter_number,

      user_id: input.userId ?? null,
      user_name: input.userName,
      service_center: input.serviceCenter ?? null,
      enumerated_at: input.enumeratedAt ?? new Date(),

      before_data: serializeSnapshot(input.beforeData),
      after_data: serializeSnapshot(input.afterData),
    },
  });

  return serializeEnumeration(created);
}

export async function listEnumerations(options?: {
  customerId?: number;
  serviceCenter?: ServiceCenterValue | null;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}) {
  const rows = await prisma.customerEnumeration.findMany({
    where: buildWhereClause(options),
    orderBy: [{ enumerated_at: "desc" }, { id: "desc" }],
    take: options?.limit ?? 100,
    skip: options?.offset ?? 0,
  });

  return rows.map(serializeEnumeration);
}

export async function getEnumerationById(id: number) {
  const row = await prisma.customerEnumeration.findUnique({
    where: { id },
  });

  return row ? serializeEnumeration(row) : null;
}

export async function getCustomerEnumerationHistory(
  customerId: number,
  options?: {
    limit?: number;
    offset?: number;
  },
) {
  return listEnumerations({
    customerId,
    limit: options?.limit ?? 100,
    offset: options?.offset ?? 0,
  });
}

export async function getEnumerationsByDate(from: Date, to: Date) {
  return listEnumerations({ from, to });
}

export async function getEnumerationsByServiceCenter(serviceCenter: string) {
  return listEnumerations({
    serviceCenter: serviceCenter as ServiceCenterValue,
  });
}

export async function getEnumerationStats(options?: {
  customerId?: number;
  serviceCenter?: ServiceCenterValue | null;
  from?: Date;
  to?: Date;
}) {
  const [row] = await prisma.$queryRaw<
    Array<{
      total_events: number;
      unique_customers: number;
    }>
  >(Prisma.sql`
    SELECT
      COUNT(*)::int AS total_events,
      COUNT(DISTINCT customer_id)::int AS unique_customers
    FROM "customer_enumerations"
    WHERE 1 = 1
      ${options?.customerId != null ? Prisma.sql`AND customer_id = ${options.customerId}` : Prisma.empty}
      ${options?.serviceCenter ? Prisma.sql`AND service_center = ${options.serviceCenter}` : Prisma.empty}
      ${
        options?.from || options?.to
          ? Prisma.sql`
            AND enumerated_at >= ${options.from ?? new Date("1970-01-01T00:00:00.000Z")}
            AND enumerated_at <= ${options.to ?? new Date("9999-12-31T23:59:59.999Z")}
          `
          : Prisma.empty
      }
  `);

  const totalEvents = row?.total_events ?? 0;
  const uniqueCustomers = row?.unique_customers ?? 0;

  return {
    totalEvents,
    uniqueCustomers,
    repeatedEdits: Math.max(0, totalEvents - uniqueCustomers),
  };
}

export async function exportEnumerations(options?: {
  customerId?: number;
  serviceCenter?: ServiceCenterValue | null;
  from?: Date;
  to?: Date;
}) {
  const rows = await prisma.$queryRaw<CustomerEnumerationRow[]>(Prisma.sql`
    SELECT DISTINCT ON (customer_id)
      id,
      customer_id,
      account_number,
      meter_number,
      user_id,
      user_name,
      service_center,
      enumerated_at,
      before_data,
      after_data
    FROM "customer_enumerations"
    WHERE 1 = 1
      ${options?.customerId != null ? Prisma.sql`AND customer_id = ${options.customerId}` : Prisma.empty}
      ${options?.serviceCenter ? Prisma.sql`AND service_center = ${options.serviceCenter}` : Prisma.empty}
      ${
        options?.from || options?.to
          ? Prisma.sql`
            AND enumerated_at >= ${options.from ?? new Date("1970-01-01T00:00:00.000Z")}
            AND enumerated_at <= ${options.to ?? new Date("9999-12-31T23:59:59.999Z")}
          `
          : Prisma.empty
      }
    ORDER BY customer_id, enumerated_at DESC, id DESC
  `);

  return rows.map(serializeEnumeration);
}
