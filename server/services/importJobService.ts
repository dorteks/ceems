import { type UserRow, prisma } from "@/server/db/prisma";
import { Prisma } from "@/generated/prisma/client";

export type ImportJobStatus = "VALIDATED" | "COMMITTED" | "FAILED";

export type ImportJobErrorRow = {
  row?: number;
  errors: string[];
  data?: Record<string, unknown>;
};

export type ImportJobDuplicateRow = {
  data?: Record<string, unknown>;
};

export type ImportJobUploader = {
  id: number;
  name: string;
  username: string;
  role: UserRow["role"];
  hub: UserRow["hub"];
};

export type ImportJobRecord = {
  id: number;
  fileName: string;
  status: ImportJobStatus;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  importedRows: number;
  previewRows: unknown[];
  validationErrors: ImportJobErrorRow[];
  duplicateRecords: ImportJobDuplicateRow[];
  uploadedAt: string;
  completedAt: string | null;
  uploadedBy: ImportJobUploader | null;
  hasErrorReport: boolean;
};

type ImportJobRow = {
  id: number;
  file_name: string;
  status: ImportJobStatus;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  imported_rows: number;
  preview_rows: unknown | null;
  validation_errors: unknown | null;
  duplicate_records: unknown | null;
  uploaded_at: Date;
  completed_at: Date | null;
  uploaded_by_id: number | null;
  uploaded_by_name: string | null;
  uploaded_by_username: string | null;
  uploaded_by_role: UserRow["role"] | null;
  uploaded_by_hub: UserRow["hub"] | null;
};

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function serializeUploader(row: ImportJobRow): ImportJobUploader | null {
  if (
    row.uploaded_by_id === null ||
    row.uploaded_by_name === null ||
    row.uploaded_by_username === null ||
    row.uploaded_by_role === null ||
    row.uploaded_by_hub === null
  ) {
    return null;
  }

  return {
    id: row.uploaded_by_id,
    name: row.uploaded_by_name,
    username: row.uploaded_by_username,
    role: row.uploaded_by_role,
    hub: row.uploaded_by_hub,
  };
}

function serializeImportJob(row: ImportJobRow): ImportJobRecord {
  return {
    id: row.id,
    fileName: row.file_name,
    status: row.status,
    totalRows: row.total_rows,
    validRows: row.valid_rows,
    invalidRows: row.invalid_rows,
    duplicateRows: row.duplicate_rows,
    importedRows: row.imported_rows,
    previewRows: toArray(row.preview_rows),
    validationErrors: toArray<ImportJobErrorRow>(row.validation_errors),
    duplicateRecords: toArray<ImportJobDuplicateRow>(row.duplicate_records),
    uploadedAt: row.uploaded_at.toISOString(),
    completedAt: row.completed_at?.toISOString() ?? null,
    uploadedBy: serializeUploader(row),
    hasErrorReport:
      row.invalid_rows > 0 ||
      row.duplicate_rows > 0 ||
      toArray(row.validation_errors).length > 0 ||
      toArray(row.duplicate_records).length > 0,
  };
}

function buildErrorReport(job: ImportJobRecord) {
  const lines = [["row", "type", "messages"].join(",")];

  for (const row of job.validationErrors) {
    const rowNumber = row.row ?? "";
    const messages = row.errors.join("; ");
    lines.push(
      [rowNumber, "validation", `"${messages.replace(/"/g, '""')}"`].join(","),
    );
  }

  for (const _row of job.duplicateRecords) {
    lines.push(["", "duplicate", "duplicate record"].join(","));
  }

  return lines.join("\n");
}

async function fetchImportJob(id: number) {
  const [row] = await prisma.$queryRaw<ImportJobRow[]>(Prisma.sql`
    SELECT
      ij.id,
      ij.file_name,
      ij.status,
      ij.total_rows,
      ij.valid_rows,
      ij.invalid_rows,
      ij.duplicate_rows,
      ij.imported_rows,
      ij.preview_rows,
      ij.validation_errors,
      ij.duplicate_records,
      ij.uploaded_at,
      ij.completed_at,
      ij.uploaded_by_id,
      u.name AS uploaded_by_name,
      u.username AS uploaded_by_username,
      u.role AS uploaded_by_role,
      u.hub AS uploaded_by_hub
    FROM "import_jobs" ij
    LEFT JOIN "users" u ON u.id = ij.uploaded_by_id
    WHERE ij.id = ${id}
    LIMIT 1
  `);

  return row ?? null;
}

export async function listImportJobs(options?: {
  limit?: number;
  uploadedById?: number | null;
  includeAll?: boolean;
}) {
  const limit = options?.limit ?? 10;
  const whereClause =
    options?.includeAll || options?.uploadedById == null
      ? Prisma.empty
      : Prisma.sql`WHERE ij.uploaded_by_id = ${options.uploadedById}`;

  const rows = await prisma.$queryRaw<ImportJobRow[]>(Prisma.sql`
    SELECT
      ij.id,
      ij.file_name,
      ij.status,
      ij.total_rows,
      ij.valid_rows,
      ij.invalid_rows,
      ij.duplicate_rows,
      ij.imported_rows,
      ij.preview_rows,
      ij.validation_errors,
      ij.duplicate_records,
      ij.uploaded_at,
      ij.completed_at,
      ij.uploaded_by_id,
      u.name AS uploaded_by_name,
      u.username AS uploaded_by_username,
      u.role AS uploaded_by_role,
      u.hub AS uploaded_by_hub
    FROM "import_jobs" ij
    LEFT JOIN "users" u ON u.id = ij.uploaded_by_id
    ${whereClause}
    ORDER BY ij.uploaded_at DESC, ij.id DESC
    LIMIT ${limit}
  `);

  return rows.map(serializeImportJob);
}

export async function createImportJob(input: {
  fileName: string;
  status: ImportJobStatus;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  importedRows: number;
  previewRows: unknown[];
  validationErrors: unknown[];
  duplicateRecords: unknown[];
  uploadedById: number | null;
  completedAt?: Date | null;
}) {
  const [row] = await prisma.$queryRaw<Pick<ImportJobRow, "id">[]>(Prisma.sql`
    INSERT INTO "import_jobs" (
      file_name,
      status,
      total_rows,
      valid_rows,
      invalid_rows,
      duplicate_rows,
      imported_rows,
      preview_rows,
      validation_errors,
      duplicate_records,
      uploaded_by_id,
      completed_at,
      updated_at
    ) VALUES (
      ${input.fileName},
      ${input.status},
      ${input.totalRows},
      ${input.validRows},
      ${input.invalidRows},
      ${input.duplicateRows},
      ${input.importedRows},
      ${JSON.stringify(input.previewRows)}::jsonb,
      ${JSON.stringify(input.validationErrors)}::jsonb,
      ${JSON.stringify(input.duplicateRecords)}::jsonb,
      ${input.uploadedById},
      ${input.completedAt ?? null},
      NOW()
    )
    RETURNING id
  `);

  if (!row) {
    throw new Error("Failed to create import job.");
  }

  const created = await fetchImportJob(row.id);

  if (!created) {
    throw new Error("Failed to load created import job.");
  }

  return serializeImportJob(created);
}

export async function updateImportJob(
  id: number,
  input: Partial<{
    status: ImportJobStatus;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateRows: number;
    importedRows: number;
    previewRows: unknown[];
    validationErrors: unknown[];
    duplicateRecords: unknown[];
    completedAt: Date | null;
  }>,
) {
  const sets: Prisma.Sql[] = [Prisma.sql`updated_at = NOW()`];

  if (input.status) sets.push(Prisma.sql`status = ${input.status}`);
  if (input.totalRows !== undefined)
    sets.push(Prisma.sql`total_rows = ${input.totalRows}`);
  if (input.validRows !== undefined)
    sets.push(Prisma.sql`valid_rows = ${input.validRows}`);
  if (input.invalidRows !== undefined)
    sets.push(Prisma.sql`invalid_rows = ${input.invalidRows}`);
  if (input.duplicateRows !== undefined)
    sets.push(Prisma.sql`duplicate_rows = ${input.duplicateRows}`);
  if (input.importedRows !== undefined)
    sets.push(Prisma.sql`imported_rows = ${input.importedRows}`);
  if (input.previewRows !== undefined)
    sets.push(
      Prisma.sql`preview_rows = ${JSON.stringify(input.previewRows)}::jsonb`,
    );
  if (input.validationErrors !== undefined)
    sets.push(
      Prisma.sql`validation_errors = ${JSON.stringify(input.validationErrors)}::jsonb`,
    );
  if (input.duplicateRecords !== undefined)
    sets.push(
      Prisma.sql`duplicate_records = ${JSON.stringify(input.duplicateRecords)}::jsonb`,
    );
  if (input.completedAt !== undefined)
    sets.push(Prisma.sql`completed_at = ${input.completedAt}`);

  await prisma.$executeRaw(Prisma.sql`
    UPDATE "import_jobs"
    SET ${Prisma.join(sets, ", ")}
    WHERE id = ${id}
  `);

  const updated = await fetchImportJob(id);

  if (!updated) {
    throw new Error("Import job not found.");
  }

  return serializeImportJob(updated);
}

export async function getImportJobById(id: number) {
  const row = await fetchImportJob(id);
  return row ? serializeImportJob(row) : null;
}

export async function getImportJobErrorReport(id: number) {
  const job = await getImportJobById(id);

  if (!job) return null;

  return {
    job,
    csv: buildErrorReport(job),
  };
}
