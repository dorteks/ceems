-- CreateTable
CREATE TABLE "audit_events" (
    "id" SERIAL NOT NULL,
    "actor_name" TEXT NOT NULL,
    "actor_username" TEXT,
    "actor_role" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "entity_label" TEXT NOT NULL,
    "before_value" TEXT,
    "after_value" TEXT,
    "metadata" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_events_occurred_at_idx" ON "audit_events"("occurred_at");

-- CreateIndex
CREATE INDEX "audit_events_entity_type_idx" ON "audit_events"("entity_type");

-- CreateIndex
CREATE INDEX "audit_events_actor_username_idx" ON "audit_events"("actor_username");

-- Seed initial audit history from current data
INSERT INTO "audit_events" (
    "actor_name",
    "actor_username",
    "actor_role",
    "action",
    "entity_type",
    "entity_id",
    "entity_label",
    "before_value",
    "after_value",
    "metadata",
    "occurred_at"
)
SELECT
    COALESCE(u.name, 'System') AS actor_name,
    u.username AS actor_username,
    CASE WHEN u.id IS NULL THEN 'System' ELSE u.role::text END AS actor_role,
    'Created customer' AS action,
    'customer' AS entity_type,
    c.id::text AS entity_id,
    c.account_number AS entity_label,
    '—' AS before_value,
    COALESCE(c.status::text, 'Created') AS after_value,
    jsonb_build_object('hub', c.business_hub, 'service_center', c.service_center, 'source', 'customers') AS metadata,
    c.created_at AS occurred_at
FROM "Customer" c
LEFT JOIN "users" u ON u.username = c.created_by
ORDER BY c.created_at DESC
LIMIT 25;

INSERT INTO "audit_events" (
    "actor_name",
    "actor_username",
    "actor_role",
    "action",
    "entity_type",
    "entity_id",
    "entity_label",
    "before_value",
    "after_value",
    "metadata",
    "occurred_at"
)
SELECT
    COALESCE(u.name, 'System') AS actor_name,
    u.username AS actor_username,
    CASE WHEN u.id IS NULL THEN 'System' ELSE u.role::text END AS actor_role,
    'Created user' AS action,
    'user' AS entity_type,
    usr.id::text AS entity_id,
    usr.username AS entity_label,
    '—' AS before_value,
    usr.role::text || ' · ' || usr.hub::text AS after_value,
    jsonb_build_object('status', usr.status::text, 'source', 'users') AS metadata,
    usr.created_at AS occurred_at
FROM "users" usr
LEFT JOIN "users" u ON u.username = usr.created_by
ORDER BY usr.created_at DESC
LIMIT 10;

INSERT INTO "audit_events" (
    "actor_name",
    "actor_username",
    "actor_role",
    "action",
    "entity_type",
    "entity_id",
    "entity_label",
    "before_value",
    "after_value",
    "metadata",
    "occurred_at"
)
SELECT
    COALESCE(u.name, 'System') AS actor_name,
    u.username AS actor_username,
    CASE WHEN u.id IS NULL THEN 'System' ELSE u.role::text END AS actor_role,
    CASE
        WHEN ij.status = 'COMMITTED' THEN 'Committed import'
        WHEN ij.status = 'FAILED' THEN 'Failed import'
        ELSE 'Validated import'
    END AS action,
    'import' AS entity_type,
    ij.id::text AS entity_id,
    ij.file_name AS entity_label,
    CASE
        WHEN ij.status = 'COMMITTED' THEN 'Preview'
        WHEN ij.status = 'FAILED' THEN 'Preview'
        ELSE 'Upload'
    END AS before_value,
    CASE
        WHEN ij.status = 'COMMITTED' THEN ij.imported_rows::text || ' rows'
        WHEN ij.status = 'FAILED' THEN ij.invalid_rows::text || ' failed'
        ELSE ij.valid_rows::text || ' valid'
    END AS after_value,
    jsonb_build_object('total_rows', ij.total_rows, 'valid_rows', ij.valid_rows, 'invalid_rows', ij.invalid_rows, 'duplicate_rows', ij.duplicate_rows, 'source', 'import_jobs') AS metadata,
    COALESCE(ij.completed_at, ij.uploaded_at) AS occurred_at
FROM "import_jobs" ij
LEFT JOIN "users" u ON u.id = ij.uploaded_by_id
ORDER BY COALESCE(ij.completed_at, ij.uploaded_at) DESC
LIMIT 25;
