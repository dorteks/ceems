"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  CalendarRange,
  ClipboardList,
  Download,
  Filter,
  RefreshCw,
  UserRoundCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceCenter, type ServiceCenterValue } from "@/lib/prisma-enums";
import { PageHeader } from "../_components/app-shell";
import { useAuth } from "@/lib/auth/auth";

type EnumerationItem = {
  id: number;
  customerId: number;
  accountNumber: string | null;
  meterNumber: string | null;
  userId: number | null;
  userName: string;
  serviceCenter: ServiceCenterValue | null;
  enumeratedAt: string;
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
};

const serviceCenterOptions = [
  { label: "All service centers", value: "ALL" },
  ...Object.values(ServiceCenter).map((value) => ({
    label: value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value,
  })),
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatServiceCenter(value: string | null) {
  if (!value) {
    return "Unassigned";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getChangedFields(
  beforeData: Record<string, unknown> | null,
  afterData: Record<string, unknown> | null,
) {
  const keys = new Set([
    ...(beforeData ? Object.keys(beforeData) : []),
    ...(afterData ? Object.keys(afterData) : []),
  ]);

  return Array.from(keys)
    .filter((key) => {
      const beforeValue = beforeData?.[key];
      const afterValue = afterData?.[key];
      return JSON.stringify(beforeValue) !== JSON.stringify(afterValue);
    })
    .slice(0, 4);
}

function getSummaryText(item: EnumerationItem) {
  const fields = getChangedFields(item.beforeData, item.afterData);

  if (fields.length === 0) {
    return "No field-level changes detected";
  }

  return fields.join(", ");
}

function buildCsv(items: EnumerationItem[]) {
  const headers = [
    "id",
    "customerId",
    "userName",
    "serviceCenter",
    "enumeratedAt",
    "changedFields",
    "beforeData",
    "afterData",
  ];

  const rows = items.map((item) => {
    const fields = getChangedFields(item.beforeData, item.afterData).join(
      " | ",
    );
    return [
      item.id,
      item.customerId,
      item.userName,
      item.serviceCenter ?? "",
      item.enumeratedAt,
      fields,
      JSON.stringify(item.beforeData ?? {}),
      JSON.stringify(item.afterData ?? {}),
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export default function EnumerationPage() {
  const { adminAccess } = useAuth();

  const [items, setItems] = useState<EnumerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceCenter, setServiceCenter] = useState("ALL");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ limit: "200" });

      if (serviceCenter !== "ALL") {
        params.set("serviceCenter", serviceCenter);
      }

      if (day) {
        params.set("day", day);
      } else if (month) {
        params.set("month", month);
      } else if (from || to) {
        if (from) {
          params.set("from", new Date(`${from}T00:00:00.000Z`).toISOString());
        }

        if (to) {
          params.set("to", new Date(`${to}T23:59:59.999Z`).toISOString());
        }
      }

      try {
        const response = await fetch(`/api/enumerations?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load enumeration data");
        }

        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        console.error("Failed to fetch enumerations:", caughtError);
        setError("Unable to load enumeration records right now.");
        setItems([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => controller.abort();
  }, [serviceCenter, day, month, from, to]);

  const stats = useMemo(() => {
    const uniqueUsers = new Set(items.map((item) => item.userName)).size;
    const uniqueCenters = new Set(
      items
        .map((item) => item.serviceCenter)
        .filter((value): value is ServiceCenterValue => Boolean(value)),
    ).size;

    return {
      total: items.length,
      uniqueUsers,
      uniqueCenters,
    };
  }, [items]);

  const resetFilters = () => {
    setServiceCenter("ALL");
    setDay("");
    setMonth("");
    setFrom("");
    setTo("");
  };

  const handleExport = () => {
    const csv = buildCsv(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = "enumeration-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeFilterLabel = useMemo(() => {
    if (day) {
      return `Day: ${day}`;
    }

    if (month) {
      return `Month: ${month}`;
    }

    if (from || to) {
      return `Range: ${from || "start"} to ${to || "end"}`;
    }

    return "All available records";
  }, [day, month, from, to]);

  return (
    <>
      <PageHeader
        title="Enumeration"
        description="Enumerated customer updates, date filters and service-center audit trail"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RefreshCw className="size-4" /> Reset
            </Button>

            {adminAccess && (
              <Button
                size="sm"
                onClick={handleExport}
                disabled={items.length === 0}
              >
                <Download className="size-4" /> Export
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: ClipboardList,
            label: "Records in scope",
            value: stats.total.toLocaleString(),
            note: activeFilterLabel,
          },
          {
            icon: UserRoundCog,
            label: "Unique users",
            value: stats.uniqueUsers.toLocaleString(),
            note: "updated customer records",
          },
          {
            icon: CalendarRange,
            label: "Service centers",
            value: stats.uniqueCenters.toLocaleString(),
            note: "active in this view",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <s.icon className="size-5" />
              </span>
              <div>
                <p className="text-numeric text-2xl font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">
                  {s.label} · {s.note}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-4" /> Filters
          </CardTitle>
          <CardDescription>
            Filter enumeration activity by service center and date window.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="service-center">Service center</Label>
              <Select value={serviceCenter} onValueChange={setServiceCenter}>
                <SelectTrigger id="service-center" className="w-full">
                  <SelectValue placeholder="All service centers" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCenterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="day">Day</Label>
              <Input
                id="day"
                type="date"
                value={day}
                onChange={(event) => {
                  setDay(event.target.value);
                  setMonth("");
                  setFrom("");
                  setTo("");
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value);
                  setDay("");
                  setFrom("");
                  setTo("");
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from-date">From</Label>
              <Input
                id="from-date"
                type="date"
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setDay("");
                  setMonth("");
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-date">To</Label>
              <Input
                id="to-date"
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);
                  setDay("");
                  setMonth("");
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Tabs defaultValue="activity" className="w-full">
        <TabsList>
          <TabsTrigger value="activity">Activity stream</TabsTrigger>
          <TabsTrigger value="diffs">Changed fields</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Enumeration activity</CardTitle>
              <CardDescription>
                Customer-level update trail and change history for the active
                window.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Account & Meter no.</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Service center</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Key changes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-muted-foreground"
                        >
                          Loading enumeration records...
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-muted-foreground"
                        >
                          No enumeration records match the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            #{item.customerId}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex flex-col gap-0.5">
                              <span>{item.accountNumber}</span>
                              <span className="text-xs font-normal text-muted-foreground">
                                {item.meterNumber ?? "No meter number"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.userName || "Unknown user"}
                          </TableCell>
                          <TableCell>
                            {formatServiceCenter(item.serviceCenter)}
                          </TableCell>
                          <TableCell className="text-numeric text-muted-foreground">
                            {formatDateTime(item.enumeratedAt)}
                          </TableCell>
                          <TableCell className="max-w-xs text-sm text-muted-foreground">
                            {getSummaryText(item)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diffs" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="size-4" /> Field-level changes
              </CardTitle>
              <CardDescription>
                The most relevant fields changed in each enumeration action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.slice(0, 12).map((item) => {
                const changedFields = getChangedFields(
                  item.beforeData,
                  item.afterData,
                );

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-muted/20 p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          Customer #{item.customerId}
                        </p>

                        <div className="flex flex-col gap-1 text-sm text-foreground sm:flex-row sm:items-center sm:gap-4">
                          <p>
                            Account:{" "}
                            <span className="font-semibold">
                              {item.accountNumber}
                            </span>
                          </p>

                          <p>
                            Meter:{" "}
                            <span className="font-semibold">
                              {item.meterNumber ?? "—"}
                            </span>
                          </p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {item.userName} ·{" "}
                          {formatServiceCenter(item.serviceCenter)}
                        </p>
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(item.enumeratedAt)}
                      </span>
                    </div>

                    {changedFields.length > 0 ? (
                      <div className="space-y-2">
                        {changedFields.map((field) => (
                          <div
                            key={field}
                            className="rounded-md border bg-background p-2 text-sm"
                          >
                            <div className="mb-1 font-medium text-foreground">
                              {field}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                              <span>
                                Before:{" "}
                                {String(item.beforeData?.[field] ?? "—")}
                              </span>
                              <span>→</span>
                              <span>
                                After: {String(item.afterData?.[field] ?? "—")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No field-level differences were recorded for this
                        update.
                      </p>
                    )}
                  </div>
                );
              })}

              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No field changes are available for the selected scope.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
