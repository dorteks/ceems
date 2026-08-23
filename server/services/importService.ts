// curl -X POST -F "file=@customers.xlsx" http://localhost:3000/api/customers/import

import * as XLSX from "xlsx";
import { importCustomers } from "./customerService";
import { prisma } from "@/server/db/prisma";

const HEADER_MAP: Record<string, string> = {
  Account_number: "account_number",
  Meter_number: "meter_number",
  Customer_type: "customer_type",
  Meter_type: "meter_type",
  "Meter Phase": "meter_phase",
  "Customer Category (MD1,MD2,NMD)": "customer_category",
  NIN: "nin",
  Surname: "surname",
  Firstname: "first_name",
  Othername: "other_name",
  Address: "address",
  City: "city",
  State: "state",
  LGA: "lga",
  Service_Center: "service_center",
  Service_Code: "service_code",
  email: "email",
  Tariff: "tariff",
  Phone_Number: "phone",
  Premise_Type: "premise_type",
  "Nature Of Business": "nature_of_business",
  Date_Created: "created_at",
  Longitude: "longitude",
  Latitude: "latitude",
  DSS_ID: "dss_id",
  DSS_Name: "dss_name",
  Feeder_ID: "feeder_id",
  Feeder_Name: "feeder_name",
  Feeder_Band: "feeder_band",
  Status: "status",
  Business_hub: "business_hub",
  Region: "region",
  "Enumerator's Name": "enumerator_name",
  "Enumerator's ID": "enumerator_id",
  "Enumerator's Phone NO.": "enumerator_phone_number",
  Remark: "remark",
};

function cleanValue(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const str = String(value).trim();

  if (
    !str ||
    str.toLowerCase() === "null" ||
    str.toLowerCase() === "undefined" ||
    str === "." ||
    str.toLowerCase() === "<br>"
  ) {
    return null;
  }

  return str;
}

function toFloat(value: unknown): number | null {
  const cleaned = cleanValue(value);

  if (cleaned === null) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeEnum(value: unknown): string | null {
  const cleaned = cleanValue(value);

  if (!cleaned) return null;

  return cleaned
    .toUpperCase()
    .trim()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeServiceCenter(value: unknown): string | null {
  const normalized = normalizeEnum(value);
  if (!normalized) return null;

  // Prisma enum values are snake_case, e.g. AYEPE_1, OSOGBO_2
  return normalized;
}

function mapCustomerRow(row: Record<string, unknown>) {
  const customer: Record<string, unknown> = {};

  for (const [excelHeader, dbField] of Object.entries(HEADER_MAP)) {
    customer[dbField] = row[excelHeader];
  }

  return {
    account_number: cleanValue(customer.account_number),
    meter_number: cleanValue(customer.meter_number),

    surname: cleanValue(customer.surname),
    first_name: cleanValue(customer.first_name) ?? "",
    other_name: cleanValue(customer.other_name),

    customer_type: normalizeEnum(customer.customer_type),
    meter_type: normalizeEnum(customer.meter_type),
    meter_phase: normalizeEnum(customer.meter_phase),
    customer_category: normalizeEnum(customer.customer_category),
    premise_type: normalizeEnum(customer.premise_type),

    nin: cleanValue(customer.nin),

    address: cleanValue(customer.address),
    city: cleanValue(customer.city),
    state: cleanValue(customer.state),
    lga: cleanValue(customer.lga),

    service_center: normalizeServiceCenter(customer.service_center),
    service_code: cleanValue(customer.service_code),
    tariff: cleanValue(customer.tariff),

    email: cleanValue(customer.email),
    phone: cleanValue(customer.phone),
    nature_of_business: cleanValue(customer.nature_of_business),

    longitude: toFloat(customer.longitude),
    latitude: toFloat(customer.latitude),

    dss_id: cleanValue(customer.dss_id),
    dss_name: cleanValue(customer.dss_name),
    feeder_id: cleanValue(customer.feeder_id),
    feeder_name: cleanValue(customer.feeder_name),
    feeder_band: cleanValue(customer.feeder_band),

    status: normalizeEnum(customer.status),
    business_hub: cleanValue(customer.business_hub),
    region: cleanValue(customer.region),

    enumerator_name: cleanValue(customer.enumerator_name),
    enumerator_id: cleanValue(customer.enumerator_id),
    enumerator_phone_number: cleanValue(customer.enumerator_phone_number),

    remark: cleanValue(customer.remark),
  } as Record<string, unknown>;
}

function validateCustomer(
  customer: Record<string, unknown>,
  rowNumber: number,
) {
  const errors: string[] = [];

  if (!customer.account_number) errors.push("account_number is required");
  if (!customer.surname) errors.push("surname is required");
  //   if (!customer.first_name) errors.push("first_name is required");

  if (errors.length) {
    return { valid: false, errors, row: rowNumber };
  }

  return { valid: true, errors: [], row: rowNumber };
}

function normalizeState(value: unknown): string | null {
  const v = cleanValue(value);
  if (!v) return null;
  return v
    .toLowerCase()
    .split(/\s+/)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

function normalizePhone(value: unknown): string | null {
  const v = cleanValue(value);
  if (!v) return null;
  const digits = v.replace(/\D+/g, "");
  // assume local format of 11 digits
  if (digits.length === 11) return digits;
  // common case: Excel drops leading zero -> 10 digits, prefix it
  if (digits.length === 10) return "0" + digits;
  if (digits.length === 13 && digits.startsWith("234"))
    return "0" + digits.slice(3);
  return null;
}

function validateCoordinates(lat: unknown, lon: unknown) {
  // allow missing lat or lon; only validate whichever value is present
  if (lat === null && lon === null) return true;
  if (lat !== null) {
    const la = Number(lat);
    if (!Number.isFinite(la)) return false;
    if (la < -90 || la > 90) return false;
  }
  if (lon !== null) {
    const lo = Number(lon);
    if (!Number.isFinite(lo)) return false;
    if (lo < -180 || lo > 180) return false;
  }
  return true;
}

export async function parseAndImportXlsx(
  fileBuffer: ArrayBuffer | Buffer,
  options?: {
    commit?: boolean;
    previewSize?: number;
    checkDuplicates?: boolean;
  },
) {
  const commit = !!options?.commit;
  const previewSize = options?.previewSize ?? 20;
  const checkDuplicates = options?.checkDuplicates ?? true;
  const workbook = XLSX.read(fileBuffer as unknown as ArrayBuffer, {
    type: "buffer",
    cellDates: true,
  });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) throw new Error("Excel file contains no worksheets.");

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: null,
  });

  if (!rows.length) throw new Error("Excel worksheet contains no records.");

  const mapped = rows.map(mapCustomerRow);

  const validCustomers: Record<string, unknown>[] = [];
  const errors: Array<{
    row: number;
    errors: string[];
    data: Record<string, unknown>;
  }> = [];

  for (let i = 0; i < mapped.length; i++) {
    const rowNum = i + 2;
    const validation = validateCustomer(mapped[i], rowNum);

    if (mapped[i].nin) {
      const nin = String(mapped[i].nin).replace(/\D+/g, "");
      if (nin.length !== 11) validation.errors.push("nin must be 11 digits");
    }

    if (!validateCoordinates(mapped[i].latitude, mapped[i].longitude)) {
      validation.errors.push("invalid coordinates");
    }

    if (validation.errors.length) {
      errors.push({
        row: rowNum,
        errors: validation.errors,
        data: mapped[i],
      });
      continue;
    }

    // normalize some fields
    if (mapped[i].state) {
      mapped[i].state = normalizeState(mapped[i].state);
    }

    validCustomers.push(mapped[i]);
  }

  const duplicates: Array<{ data: Record<string, unknown> }> = [];
  let toImport = validCustomers;

  if (checkDuplicates && validCustomers.length) {
    const accounts = validCustomers
      .map((c) => c.account_number as string)
      .filter(Boolean) as string[];
    const meters = validCustomers
      .map((c) => c.meter_number as string)
      .filter(Boolean) as string[];

    const existing: Array<{
      account_number: string;
      meter_number: string | null;
    }> = await prisma.customer.findMany({
      where: {
        OR: [
          { account_number: { in: accounts } },
          { meter_number: { in: meters } },
        ],
      },
      select: { account_number: true, meter_number: true },
    });

    const accSet = new Set(existing.map((e) => e.account_number));
    const meterSet = new Set(
      existing.map((e) => e.meter_number).filter(Boolean) as string[],
    );

    const filtered: Record<string, unknown>[] = [];

    for (const c of validCustomers) {
      const isDup =
        (c.account_number && accSet.has(c.account_number as string)) ||
        (c.meter_number && meterSet.has(c.meter_number as string));

      if (isDup) {
        duplicates.push({ data: c });
      } else {
        filtered.push(c);
      }
    }

    toImport = filtered;
  }

  if (commit && toImport.length) {
    const importResult = await importCustomers(toImport);
    return {
      total_rows: rows.length,
      valid_count: validCustomers.length,
      invalid_count: errors.length,
      duplicates_count: duplicates.length,
      imported: importResult.imported,
      errors,
      duplicates: duplicates.slice(0, 50),
    };
  }

  return {
    total_rows: rows.length,
    preview: mapped.slice(0, previewSize),
    valid_count: validCustomers.length,
    invalid_count: errors.length,
    duplicates_count: duplicates.length,
    errors,
    duplicates: duplicates.slice(0, 50),
  };
}
