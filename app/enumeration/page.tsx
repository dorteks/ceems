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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ServiceCenter, type ServiceCenterValue } from "@/lib/prisma-enums";
import { PageHeader } from "../_components/app-shell";
import { useAuth } from "@/lib/auth/auth";
import { useRouter } from "next/navigation";

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

type EnumerationResponse = {
  items: EnumerationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type EnumerationErrorResponse = {
  error?: string;
};

function isEnumerationResponse(
  value: EnumerationResponse | EnumerationErrorResponse | null,
): value is EnumerationResponse {
  return (
    value !== null &&
    typeof value === "object" &&
    "items" in value &&
    Array.isArray(value.items) &&
    "total" in value &&
    typeof value.total === "number" &&
    "page" in value &&
    typeof value.page === "number" &&
    "pageSize" in value &&
    typeof value.pageSize === "number" &&
    "totalPages" in value &&
    typeof value.totalPages === "number"
  );
}

function isEnumerationErrorResponse(
  value: EnumerationResponse | EnumerationErrorResponse | null,
): value is EnumerationErrorResponse {
  return (
    value !== null &&
    typeof value === "object" &&
    "error" in value &&
    typeof value.error === "string"
  );
}

const DEFAULT_PAGE_SIZE = 100;

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

function buildPaginationItems(page: number, totalPages: number) {
  if (totalPages <= 1) {
    return [];
  }

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);

  return Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b)
    .reduce<Array<number | "ellipsis">>((acc, current, index, array) => {
      if (index > 0 && current - array[index - 1] > 1) {
        acc.push("ellipsis");
      }

      acc.push(current);
      return acc;
    }, []);
}

const CUSTOMER_EXPORT_HEADERS = [
  "Account_number",
  "Meter_number",
  "Customer_type",
  "Meter_type",
  "Meter Phase",
  "Customer Category (MD1,MD2,NMD)",
  "NIN",
  "Surname",
  "Firstname",
  "Othername",
  "Address",
  "City",
  "State",
  "LGA",
  "Service_Center",
  "Service_Code",
  "email",
  "Tariff",
  "Phone_Number",
  "Premise_Type",
  "Nature Of Business",
  "Date_Created",
  "Longitude",
  "Latitude",
  "DSS_ID",
  "DSS_Name",
  "Feeder_ID",
  "Feeder_Name",
  "Feeder_Band",
  "Status",
  "Business_hub",
  "Region",
  "Enumerator's Name",
  "Enumerator's ID",
  "Enumerator's Phone NO.",
  "Remark",
] as const;

const CUSTOMER_EXPORT_FIELDS: Record<
  (typeof CUSTOMER_EXPORT_HEADERS)[number],
  string
> = {
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

function csvCell(value: unknown) {
  if (value === null || value === undefined) {
    return '""';
  }

  const normalized =
    typeof value === "string"
      ? value
      : typeof value === "number" || typeof value === "boolean"
        ? String(value)
        : JSON.stringify(value);

  return `"${normalized.replaceAll('"', '""')}"`;
}

function buildCustomerExportCsv(items: EnumerationItem[]) {
  const rows = items.map((item) => {
    const snapshot =
      item.afterData && Object.keys(item.afterData).length > 0
        ? item.afterData
        : (item.beforeData ?? {});

    return CUSTOMER_EXPORT_HEADERS.map((header) => {
      const fieldName = CUSTOMER_EXPORT_FIELDS[header];
      const value = snapshot[fieldName as keyof typeof snapshot];
      return csvCell(value ?? "");
    }).join(",");
  });

  const headerRow = CUSTOMER_EXPORT_HEADERS.map(csvCell).join(",");
  return [headerRow, ...rows].join("\n");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildExportFilenameSuffix(filters: {
  serviceCenter: string;
  day: string;
  month: string;
  from: string;
  to: string;
}) {
  const parts: string[] = [];

  if (filters.serviceCenter !== "ALL") {
    parts.push(slugify(formatServiceCenter(filters.serviceCenter)));
  }

  if (filters.day) {
    parts.push(filters.day);
  } else if (filters.month) {
    parts.push(filters.month);
  } else if (filters.from || filters.to) {
    parts.push(`${filters.from || "start"}_to_${filters.to || "end"}`);
  }

  return parts.length ? `-${parts.join("-")}` : "";
}

function buildChangesCsv(items: EnumerationItem[]) {
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
      .map((value) => csvCell(value))
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export default function EnumerationPage() {
  const { adminAccess } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<EnumerationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
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

      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
      });

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
        const data = (await response.json()) as
          | EnumerationResponse
          | EnumerationErrorResponse
          | null;

        if (!response.ok) {
          throw new Error(
            isEnumerationErrorResponse(data)
              ? data.error || "Failed to load enumeration data"
              : "Failed to load enumeration data",
          );
        }

        const nextTotal =
          isEnumerationResponse(data) ? data.total : 0;
        const nextTotalPages =
          isEnumerationResponse(data)
            ? data.totalPages
            : Math.max(1, Math.ceil(nextTotal / pageSize));
        setTotal(nextTotal);

        if (page > nextTotalPages) {
          setPage(nextTotalPages);
          return;
        }

        const nextItems = isEnumerationResponse(data) ? data.items : [];

        setItems(nextItems);
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
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => controller.abort();
  }, [serviceCenter, day, month, from, to, page, pageSize]);

  const stats = useMemo(() => {
    const uniqueUsers = new Set(items.map((item) => item.userName)).size;
    const uniqueCenters = new Set(
      items
        .map((item) => item.serviceCenter)
        .filter((value): value is ServiceCenterValue => Boolean(value)),
    ).size;

    return {
      total,
      uniqueUsers,
      uniqueCenters,
    };
  }, [items, total]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstRecordIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRecordIndex = Math.min(currentPage * pageSize, total);

  const resetFilters = () => {
    setServiceCenter("ALL");
    setDay("");
    setMonth("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const handleExport = () => {
    const csv = buildCustomerExportCsv(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const suffix = buildExportFilenameSuffix({
      serviceCenter,
      day,
      month,
      from,
      to,
    });

    link.href = url;
    link.download = `enumeration-customer-export${suffix}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadChanges = () => {
    const csv = buildChangesCsv(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const suffix = buildExportFilenameSuffix({
      serviceCenter,
      day,
      month,
      from,
      to,
    });

    link.href = url;
    link.download = `enumeration-changes${suffix}.csv`;
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
              <>
                <Button
                  size="sm"
                  onClick={handleExport}
                  disabled={items.length === 0}
                >
                  <Download className="size-4" /> Export
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadChanges}
                  disabled={items.length === 0}
                >
                  <Download className="size-4" /> Download changes
                </Button>
              </>
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
            note: `${activeFilterLabel} · Page ${currentPage.toLocaleString()} of ${totalPages.toLocaleString()}`,
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
              <Select
                value={serviceCenter}
                onValueChange={(value) => {
                  setServiceCenter(value);
                  setPage(1);
                }}
              >
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
                  setPage(1);
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
                  setPage(1);
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
                  setPage(1);
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
                  setPage(1);
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
                          colSpan={6}
                          className="py-10 text-center text-muted-foreground"
                        >
                          Loading enumeration records...
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-10 text-center text-muted-foreground"
                        >
                          No enumeration records match the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow
                          key={item.accountNumber}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            router.push(`/customers/${item.customerId}`)
                          }
                        >
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
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Loading enumeration changes...
                </p>
              ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No field changes are available for the selected scope.
                </p>
              ) : (
                items.slice(0, 12).map((item) => {
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
                                  After:{" "}
                                  {String(item.afterData?.[field] ?? "—")}
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
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="my-4 flex w-full flex-col gap-4 rounded-lg border bg-background px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {firstRecordIndex.toLocaleString()}-
            {lastRecordIndex.toLocaleString()}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {total.toLocaleString()}
          </span>{" "}
          records
        </p>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage((current) => Math.max(1, current - 1));
                  }}
                  aria-disabled={page <= 1 || loading}
                  className={
                    page <= 1 || loading ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {buildPaginationItems(currentPage, totalPages).map(
                (item, index) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === currentPage}
                        aria-disabled={loading}
                        className={
                          loading ? "pointer-events-none opacity-50" : ""
                        }
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ),
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage((current) => Math.min(totalPages, current + 1));
                  }}
                  aria-disabled={page >= totalPages || loading}
                  className={
                    page >= totalPages || loading
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
