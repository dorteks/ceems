import { prisma } from "@/server/db/prisma";
import { Prisma } from "@/generated/prisma/client";

export type AuditEventRecord = {
  id: number;
  actorName: string;
  actorUsername: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string;
  beforeValue: string | null;
  afterValue: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
};

type AuditEventRow = {
  id: number;
  actor_name: string;
  actor_username: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string;
  before_value: string | null;
  after_value: string | null;
  metadata: Record<string, unknown> | null;
  occurred_at: Date;
};

function serializeEvent(row: AuditEventRow): AuditEventRecord {
  return {
    id: row.id,
    actorName: row.actor_name,
    actorUsername: row.actor_username,
    actorRole: row.actor_role,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityLabel: row.entity_label,
    beforeValue: row.before_value,
    afterValue: row.after_value,
    metadata: row.metadata,
    occurredAt: row.occurred_at.toISOString(),
  };
}

function buildWhereClause(search?: string) {
  const term = search?.trim();

  if (!term) return Prisma.empty;

  const like = `%${term}%`;
  return Prisma.sql`
    WHERE (
      actor_name ILIKE ${like}
      OR COALESCE(actor_username, '') ILIKE ${like}
      OR action ILIKE ${like}
      OR entity_label ILIKE ${like}
      OR COALESCE(entity_id, '') ILIKE ${like}
      OR COALESCE(before_value, '') ILIKE ${like}
      OR COALESCE(after_value, '') ILIKE ${like}
    )
  `;
}

export async function listAuditEvents(options?: {
  search?: string;
  limit?: number;
}) {
  const limit = options?.limit ?? 100;
  const whereClause = buildWhereClause(options?.search);

  const rows = await prisma.$queryRaw<AuditEventRow[]>(Prisma.sql`
    SELECT
      id,
      actor_name,
      actor_username,
      actor_role,
      action,
      entity_type,
      entity_id,
      entity_label,
      before_value,
      after_value,
      metadata,
      occurred_at
    FROM "audit_events"
    ${whereClause}
    ORDER BY occurred_at DESC, id DESC
    LIMIT ${limit}
  `);

  return rows.map(serializeEvent);
}

export async function listRecentActivity(limit = 5) {
  return listAuditEvents({ limit });
}

export async function recordAuditEvent(input: {
  actorName: string;
  actorUsername?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  entityLabel: string;
  beforeValue?: string | null;
  afterValue?: string | null;
  metadata?: Record<string, unknown> | null;
  occurredAt?: Date;
}) {
  return recordAuditEventWithClient(prisma, input);
}

export async function recordAuditEventWithClient(
  client: Pick<typeof prisma, "auditEvent">,
  input: {
    actorName: string;
    actorUsername?: string | null;
    actorRole?: string | null;
    action: string;
    entityType: string;
    entityId?: string | number | null;
    entityLabel: string;
    beforeValue?: string | null;
    afterValue?: string | null;
    metadata?: Record<string, unknown> | null;
    occurredAt?: Date;
  },
) {
  const created = await client.auditEvent.create({
    data: {
      actor_name: input.actorName,
      actor_username: input.actorUsername ?? null,
      actor_role: input.actorRole ?? null,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId == null ? null : String(input.entityId),
      entity_label: input.entityLabel,
      before_value: input.beforeValue ?? null,
      after_value: input.afterValue ?? null,
      metadata: input.metadata
        ? (input.metadata as Prisma.InputJsonValue)
        : undefined,
      occurred_at: input.occurredAt ?? new Date(),
    },
  });

  return created.id;
}
