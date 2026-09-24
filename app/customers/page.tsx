"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
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
  customers,
  statusOptions,
  lgaOptions,
  feederBands,
} from "../data/ceems";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  type CustomerTypeValue,
  type CustomerCategoryValue,
  type PremiseTypeValue,
  type MeterTypeValue,
  type MeterPhaseValue,
  type ServiceCenterValue,
  type StatusValue,
} from "@/lib/prisma-enums";
import { useAuth } from "@/lib/auth/auth";
import { serviceCenterOptions as scOptionsRaw } from "./_lib/customer-enums";

type CustomerTableRow = {
  id: string | number;

  // Account and meter
  account_number: string;
  meter_number?: string | null;

  // Personal information
  surname: string;
  first_name: string;
  other_name?: string | null;
  nin?: string | null;

  // Customer classification
  customer_type?: CustomerTypeValue | null;
  customer_category?: CustomerCategoryValue | null;
  premise_type?: PremiseTypeValue | null;
  meter_type?: MeterTypeValue | null;
  meter_phase?: MeterPhaseValue | null;

  // Location / service
  address?: string | null;
  city?: string | null;
  state?: string | null;
  lga?: string | null;
  service_center?: ServiceCenterValue | null;
  service_code?: string | null;
  tariff?: string | null;
  longitude?: number | null;
  latitude?: number | null;

  // Contact
  email?: string | null;
  phone?: string | null;

  // Business
  nature_of_business?: string | null;

  // Feeder / grid
  dss_id?: string | null;
  dss_name?: string | null;
  feeder_id?: string | null;
  feeder_name?: string | null;
  feeder_band?: string | null;
  status?: StatusValue | null;
  business_hub?: string | null;
  region?: string | null;

  // Enumerator
  enumerator_name?: string | null;
  enumerator_id?: string | null;
  enumerator_phone_number?: string | null;
  remark?: string | null;

  // Audit
  created_at: Date;
  updated_at: Date;
  created_by?: string | null;
  updated_by?: string | null;
};

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function matchesFilter(value: string | null | undefined, filter: string) {
  if (!filter || filter.startsWith("All ")) {
    return true;
  }

  return normalizeText(value) === normalizeText(filter);
}

// export const Route = createFileRoute("/customers/")({
//   head: () => ({
//     meta: [
//       { title: "Customers — CEEMS Records Register" },
//       {
//         name: "description",
//         content: "Search, filter and manage electricity customer, account and meter records across hubs and feeders.",
//       },
//       { property: "og:title", content: "Customers — CEEMS Records Register" },
//       { property: "og:description", content: "Search and manage 200,000+ electricity customer and meter records." },
//     ],
//   }),
//   component: CustomersPage,
// });

export default function CustomersPage() {
  const router = useRouter();
  const { adminAccess } = useAuth();
  const pageSize = 100;

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [lga, setLga] = useState("All LGAs");
  const [feederBand, setFeederBand] = useState("All bands");
  const [stateFilter, setStateFilter] = useState("All states");
  const [serviceCenterFilter, setServiceCenterFilter] = useState(
    "All service centers",
  );
  // check for updates
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [apiCustomers, setApiCustomers] = useState<CustomerTableRow[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CustomerTableRow | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch customers from API
  useEffect(() => {
    const controller = new AbortController();

    const fetchCustomers = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("size", String(pageSize));

        const search = query.trim();

        if (search) {
          params.set("q", search);
        }

        if (!status.startsWith("All ")) {
          params.set("status", status);
        }

        if (!lga.startsWith("All ")) {
          params.set("lga", lga);
        }

        if (!feederBand.startsWith("All ")) {
          const band = feederBand.replace("Band ", "").trim();
          params.set("feeder_band", band);
        }

        if (!stateFilter.startsWith("All ")) {
          params.set("state", stateFilter);
        }
        if (!serviceCenterFilter.startsWith("All ")) {
          params.set("service_center", serviceCenterFilter);
        }

        const response = await fetch(`/api/customers?${params.toString()}`, {
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || "Failed to fetch customers");
        }

        setApiCustomers(
          Array.isArray(data.items)
            ? data.items.map((item: CustomerTableRow) => ({
                ...item,
                id: item.id,
              }))
            : [],
        );

        setTotalCount(typeof data.total === "number" ? data.total : 0);
        setLoadError(null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to fetch customers:", error);
        setLoadError("Using demo data while the API is unavailable.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchCustomers();

    return () => {
      controller.abort();
    };
  }, [query, status, lga, feederBand, stateFilter, serviceCenterFilter, page]);

  const demoRows = useMemo(() => {
    const q = normalizeText(query);

    const filtered = customers.filter((c) => {
      const matchQ =
        !q ||
        [
          c.account_number,
          c.meter_number ?? "",
          c.surname,
          c.first_name,
          c.phone ?? "",
          c.nin ?? "",
          c.address ?? "",
          c.feeder_name ?? "",
          c.feeder_id ?? "",
          c.feeder_band ?? "",
          c.lga ?? "",
          c.state ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return (
        matchQ &&
        matchesFilter(c.status, status) &&
        matchesFilter(c.lga, lga) &&
        matchesFilter(formatFeederBand(c.feeder_band), feederBand) &&
        matchesFilter(c.state, stateFilter) &&
        matchesFilter(c.service_center, serviceCenterFilter)
      );
    });

    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
    };
  }, [
    query,
    status,
    lga,
    feederBand,
    stateFilter,
    serviceCenterFilter,
    page,
    pageSize,
  ]);

  const rows = loadError ? demoRows.items : apiCustomers;
  const displayTotalCount = loadError ? demoRows.total : totalCount;
  const pageStart = displayTotalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, displayTotalCount);
  const totalPages = Math.max(1, Math.ceil(displayTotalCount / pageSize));

  function getPageNumbers(current: number, total: number): (number | "...")[] {
    const delta = 1;
    const range: (number | "...")[] = [];
    const rangeStart = Math.max(2, current - delta);
    const rangeEnd = Math.min(total - 1, current + delta);

    range.push(1);

    if (rangeStart > 2) range.push("...");

    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }

    if (rangeEnd < total - 1) range.push("...");

    if (total > 1) range.push(total);

    return range;
  }

  const reset = () => {
    setQuery("");
    setStatus("All statuses");
    setLga("All LGAs");
    setFeederBand("All bands");
    setStateFilter("All states");
    setServiceCenterFilter("All service centers");
    setPage(1);
  };

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const targetId = deleteTarget.id;
    setDeletingId(targetId);

    try {
      const response = await fetch(`/api/customers/${targetId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete customer");
      }

      setApiCustomers((current) =>
        current.filter((item) => String(item.id) !== String(targetId)),
      );
      setTotalCount((current) => Math.max(0, current - 1));
      setSelected((current) => current.filter((id) => id !== String(targetId)));
      toast.success("Customer deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete customer",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const handleDeleteAllCustomers = async () => {
    setDeletingAll(true);

    try {
      const response = await fetch("/api/customers", {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || "Failed to delete all customers");
      }

      setApiCustomers([]);
      setSelected([]);
      setTotalCount(0);
      setPage(1);

      toast.success(`${result.deleted ?? 0} customers deleted successfully`);

      setDeleteAllOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete all customers",
      );
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${pageStart}–${pageEnd} of ${displayTotalCount} records${loading && !loadError ? " (loading...)" : ""}${loadError ? " (demo data)" : ""}`}
        actions={
          <>
            {adminAccess && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteAllOpen(true)}
                disabled={loading || deletingAll}
              >
                <Trash className="size-4" />
                Delete All Customers
              </Button>
            )}

            {adminAccess && (
              <Button
                onClick={async () => {
                  try {
                    const params = new URLSearchParams();
                    if (!serviceCenterFilter.startsWith("All ")) {
                      params.set("serviceCenter", serviceCenterFilter);
                    }

                    const response = await fetch(
                      `/api/customers/export?${params.toString()}`,
                    );
                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(
                        data?.error || "Failed to export customers",
                      );
                    }

                    const items = Array.isArray(data.items) ? data.items : [];

                    // Build CSV using same headers as enumeration exporter
                    const headers = [
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
                    ];

                    function csvCell(value: unknown) {
                      if (value === null || value === undefined) return '""';
                      const normalized =
                        typeof value === "string"
                          ? value
                          : typeof value === "number" ||
                              typeof value === "boolean"
                            ? String(value)
                            : JSON.stringify(value);
                      return `"${normalized.replaceAll('"', '""')}"`;
                    }

                    const fieldMap: Record<string, string> = {
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

                    const rows = items.map((it: Record<string, unknown>) =>
                      headers
                        .map((h) =>
                          csvCell(
                            it[fieldMap[h as keyof typeof fieldMap]] ?? "",
                          ),
                        )
                        .join(","),
                    );

                    const csv = [headers.map(csvCell).join(","), ...rows].join(
                      "\n",
                    );

                    const blob = new Blob([csv], { type: "text/csv" });
                    const urlObj = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = urlObj;
                    const suffix = serviceCenterFilter.startsWith("All ")
                      ? ""
                      : `-${serviceCenterFilter.replace(/\s+/g, "-").toLowerCase()}`;
                    link.download = `customers-export${suffix}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    URL.revokeObjectURL(urlObj);
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Failed to export customers",
                    );
                  }
                }}
                variant="outline"
                size="sm"
              >
                <Download className="size-4" /> Export
              </Button>
            )}

            <Button size="sm">
              <Link
                className="flex flex-row gap-2 items-center"
                href={`/customers/add-new-customer`}
              >
                <Plus className="size-4" /> New customer
              </Link>
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="grid gap-3 pt-6 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Label htmlFor="q" className="mb-1.5 text-xs text-muted-foreground">
              Search
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="q"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Account, meter, NIN, phone or name"
                className="pl-9"
              />
            </div>
          </div>
          <FilterSelect
            label="Status"
            value={status}
            onChange={(next) => {
              setStatus(next ?? "All statuses");
              setPage(1);
            }}
            options={statusOptions}
          />
          <FilterSelect
            label="LGA"
            value={lga}
            onChange={(next) => {
              setLga(next ?? "All LGAs");
              setPage(1);
            }}
            options={lgaOptions}
          />
          <FilterSelect
            label="Feeder band"
            value={feederBand}
            onChange={(next) => {
              setFeederBand(next ?? "All bands");
              setPage(1);
            }}
            options={feederBands}
          />
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">
              Service center
            </Label>
            <Select
              value={serviceCenterFilter}
              onValueChange={(next) => {
                setServiceCenterFilter(next ?? "All service centers");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All service centers">
                  All service centers
                </SelectItem>
                {scOptionsRaw.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <FilterState
            label="State"
            value={stateFilter}
            onChange={(next) => {
              setStateFilter(next ?? "All states");
              setPage(1);
            }}
          /> */}
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-5">
            <Button size="sm">
              <Filter className="size-4" /> Apply filters
            </Button>
            <Button size="sm" variant="ghost" onClick={reset}>
              <RotateCcw className="size-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {selected.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-border bg-secondary px-4 py-2 text-sm">
          <span className="font-medium">{selected.length} selected</span>
          <Button size="sm" variant="outline">
            Bulk export
          </Button>
          <Button size="sm" variant="outline">
            Assign enumerator
          </Button>
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Customer</TableHead>
                  <TableHead>Account & Meter no.</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Nin/Category
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Address
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">Feeder</TableHead>
                  <TableHead>Enumerator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && !loadError && rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : rows.length ? (
                  rows.map((c) => (
                    <TableRow
                      key={String(c.id)}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/customers/${String(c.id)}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(String(c.id))}
                          onCheckedChange={() => toggle(String(c.id))}
                          aria-label={`Select ${c.account_number}`}
                        />
                      </TableCell>

                      <TableCell>
                        <p className="max-w-[200px] whitespace-normal uppercase font-semibold pb-0.5">
                          {c.surname} {c.first_name}
                        </p>
                        <p className="text-numeric text-sm font-medium text-muted-foreground">
                          {c.phone}
                        </p>
                      </TableCell>

                      <TableCell className="text-numeric">
                        <div className="flex flex-col items-start gap-0.5">
                          <p className="font-medium">{c.account_number}</p>
                          <p className="text-muted-foreground font-medium">
                            {c.meter_number ?? "Unmetered"}
                          </p>
                          <p className="text-xs text-muted-foreground font-normal">
                            {c.customer_type}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-numeric hidden md:table-cell">
                        <div className="flex flex-col items-start">
                          <span className="font-bold">{c.nin ?? "-"}</span>
                          <span className="text-xs">
                            {c.customer_category ?? "-"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell uppercase">
                        <div className="flex max-w-[220px] flex-col items-start gap-0.5">
                          <p
                            className="w-full truncate font-semibold"
                            title={c.address ?? undefined}
                          >
                            {c.address ?? "-"}
                          </p>

                          <span className="w-full truncate text-xs text-muted-foreground">
                            {c.city ?? "-"} · {c.state ?? "-"} · {c.lga ?? "-"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="hidden xl:table-cell">
                        <div className="flex max-w-[160px] flex-col items-start break-words gap-1">
                          <p className="font-semibold whitespace-normal">
                            {c.feeder_name ?? "-"}
                          </p>
                          <p className="text-xs text-muted-foreground whitespace-normal">
                            {formatFeederBand(c.feeder_band)}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <p className="max-w-[150px] break-words whitespace-normal font-semibold">
                          {c.enumerator_name ?? "-"}
                        </p>
                      </TableCell>

                      <TableCell>
                        {c.status && <StatusBadge value={c.status} />}
                      </TableCell>

                      <TableCell className="max-w-fit">
                        <div
                          className="flex items-center justify-end gap-1 max-w-fit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            aria-label={`Edit ${c.account_number}`}
                          >
                            <Link href={`/customers/${String(c.id)}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Delete ${c.account_number}`}
                            onClick={() =>
                              setDeleteTarget(c as unknown as CustomerTableRow)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No records match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p>
          Showing {pageStart}–{pageEnd} of {displayTotalCount} records
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {getPageNumbers(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1.5 text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                disabled={loading}
                onClick={() => setPage(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDelete}
        title={
          deleteTarget
            ? `Delete ${deleteTarget.account_number}?`
            : "Delete customer?"
        }
        description={
          deleteTarget
            ? `This will permanently delete ${deleteTarget.surname} ${deleteTarget.first_name}.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete customer"
        isDeleting={Boolean(deletingId)}
      />

      <DeleteConfirmationDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        onConfirm={handleDeleteAllCustomers}
        title="Delete all customers?"
        description={`This will permanently delete all ${totalCount.toLocaleString()} customer records. This action cannot be undone.`}
        confirmLabel="Delete all customers"
        isDeleting={deletingAll}
        confirmationText="DELETE ALL"
      />
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <Label className="mb-1.5 text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(next) => onChange(next ?? value)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const formatFeederBand = (value: string | null | undefined) => {
  if (!value) return "—";

  const normalized = value.trim().toUpperCase();

  if (normalized.startsWith("A")) return "Band A";
  if (normalized.startsWith("B")) return "Band B";
  if (normalized.startsWith("C")) return "Band C";
  if (normalized.startsWith("D")) return "Band D";
  if (normalized.startsWith("E")) return "Band E";

  return value;
};
