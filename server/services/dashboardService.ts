import { prisma } from "@/server/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { listRecentActivity, type AuditEventRecord } from "./auditService";

export type DashboardKpi = {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "success" | "warning" | "destructive";
};

export type DashboardTrendPoint = {
  month: string;
  captured: number;
  verified: number;
};

export type DashboardBandSplit = {
  band: string;
  customers: number;
};

export type DashboardBatch = {
  id: string;
  hub: string;
  enumerator: string;
  records: number;
  status: string;
  progress: number;
  updated: string;
};

export type DashboardData = {
  kpis: DashboardKpi[];
  trend: DashboardTrendPoint[];
  feederBandSplit: DashboardBandSplit[];
  enumerationBatches: DashboardBatch[];
  recentActivity: AuditEventRecord[];
  lastUpdated: string;
};

type CustomerStatsRow = {
  total_customers: number;
  enumerated_customers: number;
  unmetered_customers: number;
  quality_issues: number;
  created_this_month: number;
  created_last_month: number;
};

type TrendRow = {
  month_start: Date;
  captured: number;
  verified: number;
};

type BandRow = {
  band: string | null;
  customers: number;
};

type BatchRow = {
  id: string;
  hub: string | null;
  enumerator: string | null;
  records: number;
  active_records: number;
  pending_records: number;
  last_updated: Date;
};

async function getCustomerStats() {
  const [row] = await prisma.$queryRaw<CustomerStatsRow[]>(Prisma.sql`
    SELECT
      COUNT(*)::int AS total_customers,
      COUNT(*) FILTER (
        WHERE enumerator_id IS NOT NULL OR enumerator_name IS NOT NULL
      )::int AS enumerated_customers,
      COUNT(*) FILTER (
        WHERE meter_number IS NULL OR meter_number = '' OR status = 'PENDING'
      )::int AS unmetered_customers,
      COUNT(*) FILTER (
        WHERE status IN ('INACTIVE', 'DISCONNECTED')
          OR phone IS NULL
          OR email IS NULL
          OR latitude IS NULL
          OR longitude IS NULL
      )::int AS quality_issues,
      COUNT(*) FILTER (
        WHERE created_at >= date_trunc('month', CURRENT_DATE)
      )::int AS created_this_month,
      COUNT(*) FILTER (
        WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
          AND created_at < date_trunc('month', CURRENT_DATE)
      )::int AS created_last_month
    FROM "Customer"
  `);

  return row ?? {
    total_customers: 0,
    enumerated_customers: 0,
    unmetered_customers: 0,
    quality_issues: 0,
    created_this_month: 0,
    created_last_month: 0,
  };
}

async function getTrend() {
  const rows = await prisma.$queryRaw<TrendRow[]>(Prisma.sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '7 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS month_start
    ),
    captured AS (
      SELECT date_trunc('month', created_at) AS month_start, COUNT(*)::int AS captured
      FROM "Customer"
      WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '7 months'
      GROUP BY 1
    ),
    verified AS (
      SELECT date_trunc('month', updated_at) AS month_start, COUNT(*)::int AS verified
      FROM "Customer"
      WHERE updated_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '7 months'
      GROUP BY 1
    )
    SELECT
      months.month_start,
      COALESCE(captured.captured, 0)::int AS captured,
      COALESCE(verified.verified, 0)::int AS verified
    FROM months
    LEFT JOIN captured USING (month_start)
    LEFT JOIN verified USING (month_start)
    ORDER BY months.month_start
  `);

  return rows.map((row) => ({
    month: row.month_start.toLocaleString([], { month: "short" }),
    captured: row.captured,
    verified: row.verified,
  }));
}

async function getFeederBandSplit() {
  const rows = await prisma.$queryRaw<BandRow[]>(Prisma.sql`
    SELECT
      COALESCE(feeder_band, 'Unknown') AS band,
      COUNT(*)::int AS customers
    FROM "Customer"
    GROUP BY 1
    ORDER BY customers DESC, band ASC
    LIMIT 5
  `);

  return rows.map((row) => ({
    band: row.band ?? "Unknown",
    customers: row.customers,
  }));
}

async function getEnumerationBatches() {
  const rows = await prisma.$queryRaw<BatchRow[]>(Prisma.sql`
    SELECT
      COALESCE(enumerator_id, CONCAT('batch-', id::text)) AS id,
      COALESCE(business_hub, 'Unknown') AS hub,
      COALESCE(enumerator_name, 'Unassigned') AS enumerator,
      COUNT(*)::int AS records,
      COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_records,
      COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending_records,
      MAX(updated_at) AS last_updated
    FROM "Customer"
    GROUP BY 1, 2, 3
    ORDER BY last_updated DESC NULLS LAST, records DESC
    LIMIT 5
  `);

  return rows.map((row) => {
    const progress = row.records > 0
      ? Math.min(100, Math.round((row.active_records / row.records) * 100))
      : 0;
    const status =
      progress >= 95
        ? "Approved"
        : row.pending_records > 0
          ? "In review"
          : row.records > 0
            ? "Field capture"
            : "Draft";

    return {
      id: row.id,
      hub: row.hub ?? "Unknown",
      enumerator: row.enumerator ?? "Unassigned",
      records: row.records,
      status,
      progress,
      updated: row.last_updated
        ? row.last_updated.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    };
  });
}

function buildKpis(stats: CustomerStatsRow): DashboardKpi[] {
  const enumeratedPct = stats.total_customers
    ? Math.round((stats.enumerated_customers / stats.total_customers) * 100)
    : 0;
  const unmeteredPct = stats.total_customers
    ? Math.round((stats.unmetered_customers / stats.total_customers) * 100)
    : 0;
  const monthDelta = stats.created_this_month - stats.created_last_month;

  return [
    {
      label: "Total customers",
      value: stats.total_customers.toLocaleString(),
      delta: `${monthDelta >= 0 ? "+" : ""}${monthDelta.toLocaleString()} this month`,
      tone: "primary",
    },
    {
      label: "Enumerated",
      value: stats.enumerated_customers.toLocaleString(),
      delta: `${enumeratedPct}% coverage`,
      tone: "success",
    },
    {
      label: "Unmetered accounts",
      value: stats.unmetered_customers.toLocaleString(),
      delta: `${unmeteredPct}% of base`,
      tone: "warning",
    },
    {
      label: "Data quality issues",
      value: stats.quality_issues.toLocaleString(),
      delta: "Needs review",
      tone: "destructive",
    },
  ];
}

export async function getDashboardData(): Promise<DashboardData> {
  const [stats, trend, feederBandSplit, enumerationBatches, recentActivity] =
    await Promise.all([
      getCustomerStats(),
      getTrend(),
      getFeederBandSplit(),
      getEnumerationBatches(),
      listRecentActivity(5),
    ]);

  return {
    kpis: buildKpis(stats),
    trend,
    feederBandSplit,
    enumerationBatches,
    recentActivity,
    lastUpdated: new Date().toISOString(),
  };
}
