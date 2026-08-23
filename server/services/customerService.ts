import { Prisma } from "@/generated/prisma/client";
import {
  type CustomerCategoryValue,
  type CustomerTypeValue,
  type MeterPhaseValue,
  type MeterTypeValue,
  type PremiseTypeValue,
  type ServiceCenterValue,
  type StatusValue,
} from "@/lib/prisma-enums";
import { prisma } from "@/server/db/prisma";

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeRequiredString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCustomerData(data: Record<string, unknown>) {
  return {
    account_number: normalizeRequiredString(data.account_number),
    meter_number: normalizeString(data.meter_number),
    surname: normalizeRequiredString(data.surname),
    first_name: normalizeRequiredString(data.first_name),
    other_name: normalizeString(data.other_name),
    nin: normalizeString(data.nin),
    customer_type: normalizeString(data.customer_type) as
      | CustomerTypeValue
      | null
      | undefined,
    customer_category: normalizeString(data.customer_category) as
      | CustomerCategoryValue
      | null
      | undefined,
    premise_type: normalizeString(data.premise_type) as
      | PremiseTypeValue
      | null
      | undefined,
    meter_type: normalizeString(data.meter_type) as
      | MeterTypeValue
      | null
      | undefined,
    meter_phase: normalizeString(data.meter_phase) as
      | MeterPhaseValue
      | null
      | undefined,
    address: normalizeString(data.address),
    city: normalizeString(data.city),
    state: normalizeString(data.state),
    lga: normalizeString(data.lga),
    service_center: normalizeString(data.service_center) as
      | ServiceCenterValue
      | null
      | undefined,
    service_code: normalizeString(data.service_code),
    tariff: normalizeString(data.tariff),
    longitude: normalizeNumber(data.longitude),
    latitude: normalizeNumber(data.latitude),
    email: normalizeString(data.email),
    phone: normalizeString(data.phone),
    nature_of_business: normalizeString(data.nature_of_business),
    dss_id: normalizeString(data.dss_id),
    dss_name: normalizeString(data.dss_name),
    feeder_id: normalizeString(data.feeder_id),
    feeder_name: normalizeString(data.feeder_name),
    feeder_band: normalizeString(data.feeder_band),
    status: normalizeString(data.status) as StatusValue | null | undefined,
    business_hub: normalizeString(data.business_hub),
    region: normalizeString(data.region),
    enumerator_name: normalizeString(data.enumerator_name),
    enumerator_id: normalizeString(data.enumerator_id),
    enumerator_phone_number: normalizeString(data.enumerator_phone_number),
    remark: normalizeString(data.remark),
    created_by: normalizeString(data.created_by),
    updated_by: normalizeString(data.updated_by),
  };
}

export async function createCustomer(data: Record<string, unknown>) {
  return prisma.customer.create({ data: normalizeCustomerData(data) });
}

export async function updateCustomer(
  id: number,
  data: Record<string, unknown>,
) {
  return prisma.customer.update({
    where: { id },
    data: normalizeCustomerData(data),
  });
}

export async function deleteCustomer(id: number) {
  return prisma.customer.delete({ where: { id } });
}

export async function deleteAllCustomers() {
  const result = await prisma.customer.deleteMany({});

  return {
    deleted: result.count,
  };
}

export async function getCustomerById(id: number) {
  return prisma.customer.findUnique({ where: { id } });
}

export async function listCustomers(opts?: { page?: number; size?: number }) {
  const page = opts?.page && opts.page > 0 ? opts.page : 1;
  const size = opts?.size && opts.size > 0 ? opts.size : 50;
  const skip = (page - 1) * size;

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      skip,
      take: size,
      orderBy: { created_at: "desc" },
    }),
    prisma.customer.count(),
  ]);

  return { items, total, page, size };
}

export async function importCustomers(
  customers: Array<Record<string, unknown>>,
  batchSize = 500,
) {
  let imported = 0;

  for (let i = 0; i < customers.length; i += batchSize) {
    const batch = customers.slice(i, i + batchSize);

    const prepared = batch.map((c) => normalizeCustomerData(c));

    const result = await prisma.customer.createMany({
      data: prepared as Prisma.CustomerCreateManyInput[],
      skipDuplicates: true,
    });

    imported += result.count;
  }

  return { total: customers.length, imported };
}
