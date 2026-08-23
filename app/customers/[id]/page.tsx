"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Pencil, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PageHeader } from "@/app/_components/app-shell";
import { StatusBadge } from "@/app/_components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CustomerDetailRecord = {
  id: number;
  account_number: string;
  meter_number: string | null;
  surname: string;
  first_name: string;
  other_name: string | null;
  nin: string | null;
  customer_type: string | null;
  customer_category: string | null;
  premise_type: string | null;
  meter_type: string | null;
  meter_phase: string | null;
  nature_of_business: string | null;
  status: string | null;
  phone: string | null;
  email: string | null;
  tariff: string | null;
  feeder_band: string | null;
  address: string | null;
  city: string | null;
  lga: string | null;
  state: string | null;
  longitude: number | null;
  latitude: number | null;
  region: string | null;
  business_hub: string | null;
  service_center: string | null;
  service_code: string | null;
  dss_id: string | null;
  dss_name: string | null;
  feeder_id: string | null;
  feeder_name: string | null;
  enumerator_name: string | null;
  enumerator_id: string | null;
  enumerator_phone_number: string | null;
  remark: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

type AuditEvent = {
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
  occurredAt: string;
};

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

function joinPair(left: string | null, right: string | null) {
  if (!left && !right) {
    return null;
  }

  if (left && right) {
    return `${left} (${right})`;
  }

  return left ?? right;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${id}`);
        const data = (await response.json().catch(() => ({}))) as
          | CustomerDetailRecord
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Failed to fetch customer",
          );
        }

        if (!cancelled) {
          setCustomer(data as CustomerDetailRecord);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to fetch customer",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCustomer();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAuditEvents = async () => {
      try {
        setAuditLoading(true);
        setAuditError(null);

        const params = new URLSearchParams();
        params.set("limit", "20");
        params.set("entityType", "customer");
        params.set("entityId", id);

        const response = await fetch(`/api/audit?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });

        const json = (await response.json().catch(() => null)) as {
          events?: AuditEvent[];
          error?: string;
        } | null;

        if (!response.ok || !json?.events) {
          setAuditEvents([]);
          setAuditError(json?.error ?? "Failed to load audit trail");
          return;
        }

        setAuditEvents(json.events);
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          return;
        }

        setAuditEvents([]);
        setAuditError("Failed to load audit trail");
      } finally {
        if (!controller.signal.aborted) {
          setAuditLoading(false);
        }
      }
    };

    void fetchAuditEvents();

    return () => {
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return <div>Loading customer...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  const c = customer;
  const title = `${c.surname} ${c.first_name} ${c.other_name ?? ""}`.trim();
  const mapLabel =
    c.latitude != null && c.longitude != null
      ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`
      : "Coordinates unavailable";

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-3 -ml-2" asChild>
        <Link href="/customers">
          <ArrowLeft className="size-4" /> Back to customers
        </Link>
      </Button>

      <PageHeader
        title={title}
        description={
          <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-4">
            <span>
              Account -{" "}
              <span className="font-semibold text-foreground">
                {c.account_number}
              </span>
            </span>

            <span>
              Meter -{" "}
              <span className="font-semibold text-foreground">
                {c.meter_number ?? "—"}
              </span>
            </span>

            <span className="flex flex-row gap-2">
              {c.customer_type ?? "Unclassified"} ·{" "}
              {c.business_hub ?? "Unknown"} hub
            </span>
          </div>
        }
        actions={
          <>
            {/* <Button variant="outline" size="sm">
              <Printer className="size-4" /> Print
            </Button> */}
            <Button size="sm" asChild>
              <Link href={`/customers/${id}/edit`}>
                <Pencil className="size-4" /> Edit record
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Record details</CardTitle>
              <CardDescription>
                Captured {new Date(c.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <StatusBadge value={c.status ?? "Pending"} />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer">
              <TabsList className="flex w-full flex-wrap justify-start">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="meter">Meter</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent
                value="customer"
                className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <Field label="Account No." value={c.account_number} />
                <Field label="Surname" value={c.surname} />
                <Field label="First name" value={c.first_name} />
                <Field label="Other name" value={c.other_name} />
                <Field label="NIN" value={c.nin} />
                <Field label="Phone" value={c.phone} />
                <Field label="Email" value={c.email} />
                <Field label="Customer type" value={c.customer_type} />
                <Field label="Category" value={c.customer_category} />
                <Field label="Premise type" value={c.premise_type} />
                <Field
                  label="Nature of business"
                  value={c.nature_of_business}
                />
              </TabsContent>

              <TabsContent
                value="meter"
                className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <Field
                  label="Meter number"
                  value={c.meter_number || "Unmetered"}
                />
                <Field label="Meter type" value={c.meter_type} />
                <Field label="Meter phase" value={c.meter_phase} />
                <Field label="Tariff" value={c.tariff} />
                <Field
                  label="Feeder band"
                  value={c.feeder_band ? `Band ${c.feeder_band}` : null}
                />
                <Field
                  label="Account relationship"
                  value="Primary account holder"
                />
              </TabsContent>

              <TabsContent value="location" className="pt-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Address" value={c.address} />
                  <Field label="City" value={c.city} />
                  <Field label="LGA" value={c.lga} />
                  <Field label="State" value={c.state} />
                  <Field
                    label="Longitude"
                    value={c.longitude?.toFixed(5) ?? null}
                  />
                  <Field
                    label="Latitude"
                    value={c.latitude?.toFixed(5) ?? null}
                  />
                </div>
                <div className="mt-4 flex h-48 items-center justify-center rounded-md border border-dashed border-border bg-muted/60 text-sm text-muted-foreground">
                  <MapPin className="mr-2 size-4" /> Map preview - {mapLabel}
                </div>
              </TabsContent>

              <TabsContent
                value="network"
                className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <Field label="Region" value={c.region} />
                <Field label="Business hub" value={c.business_hub} />
                <Field label="Service center" value={c.service_center} />
                <Field label="Service code" value={c.service_code} />
                <Field label="DSS" value={joinPair(c.dss_name, c.dss_id)} />
                <Field
                  label="Feeder"
                  value={joinPair(c.feeder_name, c.feeder_id)}
                />
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        {/* <TableHead className="hidden sm:table-cell">
                          From
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          To
                        </TableHead> */}
                        <TableHead className="text-right">When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-8 text-center text-muted-foreground"
                          >
                            Loading customer audit trail...
                          </TableCell>
                        </TableRow>
                      ) : auditError ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-8 text-center text-muted-foreground"
                          >
                            {auditError}
                          </TableCell>
                        </TableRow>
                      ) : auditEvents.length ? (
                        auditEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">
                              <div className="leading-tight">
                                <div>{event.actorName}</div>
                                {event.actorUsername ? (
                                  <div className="text-xs text-muted-foreground">
                                    @{event.actorUsername}
                                  </div>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell>{event.action}</TableCell>
                            {/* <TableCell className="hidden sm:table-cell">
                              {event.beforeValue ?? "—"}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {event.afterValue ?? "—"}
                            </TableCell> */}
                            <TableCell className="text-right text-muted-foreground">
                              {new Date(event.occurredAt).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No customer audit events found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enumeration</CardTitle>
              <CardDescription>Field capture details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="Enumerator" value={c.enumerator_name} />
              <Field label="Enumerator ID" value={c.enumerator_id} />
              <Field label="Phone" value={c.enumerator_phone_number} />
              <Separator />
              <Field label="Remarks" value={c.remark} />
              <Field
                label="Date created"
                value={new Date(c.created_at).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              />
              <Field label="Updated By" value={c.updated_by} />
              <Field
                label="Date updated"
                value={new Date(c.updated_at).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data quality</CardTitle>
              <CardDescription>Automatic validation checks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                [
                  "Account number format",
                  c.account_number ? "Pass" : "Missing",
                ],
                [
                  "Meter number uniqueness",
                  c.meter_number ? "Pass" : "Missing",
                ],
                ["Phone format", c.phone ? "Pass" : "Missing"],
                [
                  "Coordinates within hub",
                  c.status === "DISCONNECTED" ? "Failed" : "Pass",
                ],
                ["NIN present", c.nin ? "Pass" : "Missing"],
              ].map(([label, result]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <StatusBadge value={result!} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
