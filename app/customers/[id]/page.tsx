"use client";

import { ArrowLeft, MapPin, Pencil, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/app/_components/app-shell";
import { StatusBadge } from "@/app/_components/status-badge";
import { auditLog, customers } from "@/app/data/ceems";
import Link from "next/link";
import { useParams } from "next/navigation";

// export const Route = createFileRoute("/customers/$customerId")({
//   loader: ({ params }) => {
//     const customer = customers.find((c) => c.id === params.customerId);
//     if (!customer) throw notFound();
//     return customer;
//   },
//   head: ({ loaderData }) => {
//     const name = loaderData ? `${loaderData.surname} ${loaderData.firstName}` : "Customer";
//     return {
//       meta: [
//         { title: `${name} — Customer record | CEEMS` },
//         {
//           name: "description",
//           content: `Full customer, meter, location, network and enumeration details for account ${loaderData?.accountNumber ?? ""}.`,
//         },
//         { property: "og:title", content: `${name} — Customer record | CEEMS` },
//         { property: "og:description", content: "Customer, meter, network and enumeration detail view." },
//       ],
//     };
//   },
//   component: CustomerDetail,
// });

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();

  const c = customers.find((customer) => String(customer.id) === id);

  if (!c) {
    return <div>Customer not found</div>;
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/customers">
          <ArrowLeft className="size-4" /> Back to customers
        </Link>
      </Button>

      <PageHeader
        title={`${c.surname} ${c.first_name} ${c.other_name}`}
        description={`Account ${c.account_number} · ${c.customer_type} · ${c.business_hub} hub`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Printer className="size-4" /> Print
            </Button>
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
              <CardDescription>Captured {c.date_created}</CardDescription>
            </div>
            <StatusBadge value={c.status} />
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
                <Field label="Feeder band" value={`Band ${c.feeder_band}`} />
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
                  <Field label="Longitude" value={c.longitude.toFixed(5)} />
                  <Field label="Latitude" value={c.latitude.toFixed(5)} />
                </div>
                <div className="mt-4 flex h-48 items-center justify-center rounded-md border border-dashed border-border bg-muted/60 text-sm text-muted-foreground">
                  <MapPin className="mr-2 size-4" /> Map preview —{" "}
                  {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
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
                <Field label="DSS" value={`${c.dss_name} (${c.dss_id})`} />
                <Field
                  label="Feeder"
                  value={`${c.feeder_name} (${c.feeder_id})`}
                />
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          From
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          To
                        </TableHead>
                        <TableHead className="text-right">When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLog.map((a, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {a.actor}
                          </TableCell>
                          <TableCell>{a.action}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {a.from}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {a.to}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {a.when}
                          </TableCell>
                        </TableRow>
                      ))}
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
              <Field label="Phone" value={c.enumerator_phone} />
              <Separator />
              <Field label="Remarks" value={c.remarks} />
              <Field label="Date created" value={c.date_created} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data quality</CardTitle>
              <CardDescription>Automatic validation checks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                ["Account number format", "Pass"],
                [
                  "Meter number uniqueness",
                  c.meter_number ? "Pass" : "Missing",
                ],
                ["Phone format", "Pass"],
                [
                  "Coordinates within hub",
                  c.status === "Flagged" ? "Failed" : "Pass",
                ],
                ["NIN present", "Pass"],
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
