// curl -X POST -F "file=@customers.xlsx" http://localhost:3000/api/customers/import

import * as XLSX from "xlsx";
import { importCustomers } from "./customerService";

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
    .replace(/[\/\-]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
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

    service_center: cleanValue(customer.service_center),
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

    status: cleanValue(customer.status),
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
  if (!customer.first_name) errors.push("first_name is required");

  if (errors.length) {
    return { valid: false, errors, row: rowNumber };
  }

  return { valid: true, errors: [], row: rowNumber };
}

export async function parseAndImportXlsx(fileBuffer: ArrayBuffer | Buffer) {
  const workbook = XLSX.read(fileBuffer as any, {
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
  const errors: any[] = [];

  for (let i = 0; i < mapped.length; i++) {
    const validation = validateCustomer(mapped[i], i + 2);

    if (!validation.valid) {
      errors.push(validation);
      continue;
    }

    validCustomers.push(mapped[i]);
  }

  const importResult = await importCustomers(validCustomers);

  return {
    total_rows: rows.length,
    imported: importResult.imported,
    failed: errors.length,
    errors,
  };
}
