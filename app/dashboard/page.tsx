"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "../_components/app-shell";
import { StatusBadge } from "../_components/status-badge";
import {
  auditLog,
  enumerationBatches,
  enumerationTrend,
  feederBandSplit,
  kpis,
} from "../data/ceems";
import Link from "next/link";

// export const Route = createFileRoute("/")({
//   head: () => ({
//     meta: [
//       { title: "CEEMS Dashboard — Electricity Enumeration Management" },
//       {
//         name: "description",
//         content:
//           "Operational dashboard for customer and electricity enumeration: coverage, metering gaps, data quality and field batches.",
//       },
//       { property: "og:title", content: "CEEMS Dashboard — Electricity Enumeration Management" },
//       {
//         property: "og:description",
//         content: "Track enumeration coverage, metering gaps and data quality across the distribution network.",
//       },
//     ],
//   }),
//   component: Dashboard,
// });

const toneClass = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning-foreground",
  destructive: "text-destructive",
} as const;

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Operations dashboard"
        description="Osun Distribution · data as of today 16:00"
        actions={
          <>
            <Button variant="outline" size="sm">
              <RefreshCw className="size-4" /> Refresh
            </Button>
            <Button size="sm">
              <Download className="size-4" /> Export snapshot
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle
                className={`text-numeric text-3xl ${toneClass[kpi.tone]}`}
              >
                {kpi.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{kpi.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Enumeration throughput</CardTitle>
            <CardDescription>
              Records captured vs supervisor-verified
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={enumerationTrend}
                margin={{ left: -18, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="captured"
                  stroke="var(--color-primary)"
                  fill="url(#cap)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  stroke="var(--color-accent)"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers by feeder band</CardTitle>
            <CardDescription>Distribution across tariff bands</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={feederBandSplit}
                margin={{ left: -18, right: 8, top: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="band"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="customers"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Active enumeration batches</CardTitle>
              <CardDescription>
                Field capture and supervisor review
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <Link href="/enumeration">
                View all <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Hub</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Enumerator
                    </TableHead>
                    <TableHead className="text-right">Records</TableHead>
                    <TableHead className="w-40">Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enumerationBatches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="text-numeric font-medium">
                        {b.id}
                      </TableCell>
                      <TableCell>{b.hub}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {b.enumerator}
                      </TableCell>
                      <TableCell className="text-numeric text-right">
                        {b.records.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Progress value={b.progress} className="h-2" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={b.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Audit trail highlights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditLog.slice(0, 5).map((entry, i) => (
              <div
                key={i}
                className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" />
                <div className="text-sm">
                  <p className="font-medium">
                    {entry.actor} ·{" "}
                    <span className="font-normal text-muted-foreground">
                      {entry.action}
                    </span>
                  </p>
                  <p className="text-numeric text-xs text-muted-foreground">
                    {entry.entity} — {entry.when}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
