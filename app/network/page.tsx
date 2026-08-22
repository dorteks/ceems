"use client";

import { ChevronRight, Construction, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "../_components/app-shell";
import { networkTree } from "../data/ceems";

// export const Route = createFileRoute("/network")({
//   head: () => ({
//     meta: [
//       { title: "Network Infrastructure — Feeders, DSS & Hubs | CEEMS" },
//       {
//         name: "description",
//         content: "Browse the distribution hierarchy: region, business hub, service center, DSS and feeder assignments.",
//       },
//       { property: "og:title", content: "Network Infrastructure — Feeders, DSS & Hubs | CEEMS" },
//       { property: "og:description", content: "Distribution hierarchy from region down to feeder and customer." },
//     ],
//   }),
//   component: NetworkPage,
// });

const feeders = [
  {
    id: "FDR-20",
    name: "Ayepe 11kV",
    band: "A",
    dss: 12,
    customers: 8420,
    status: "Healthy",
  },
  {
    id: "FDR-21",
    name: "Station 33kV",
    band: "B",
    dss: 18,
    customers: 12310,
    status: "Healthy",
  },
  {
    id: "FDR-22",
    name: "Oke-Baale 11kV",
    band: "C",
    dss: 9,
    customers: 6180,
    status: "Overloaded",
  },
  {
    id: "FDR-23",
    name: "Dada Estate 11kV",
    band: "B",
    dss: 11,
    customers: 7245,
    status: "Healthy",
  },
];

export default function NetworkPage() {
  return (
    <>
      <div className="flex items-center gap-4 rounded-lg mb-6 border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
          <Construction className="size-6 text-amber-600 dark:text-amber-400" />
        </div>

        <div>
          <h3 className="font-semibold">Under Construction</h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            This section is currently being built. Please check back soon.
          </p>
        </div>
      </div>

      <PageHeader
        title="Network infrastructure"
        description="Region → Business hub → Service center → DSS → Feeder → Customer"
        actions={
          <Button size="sm">
            <Plus className="size-4" /> Add asset
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hierarchy</CardTitle>
            <CardDescription>Expand to view service centers</CardDescription>
          </CardHeader>
          <CardContent>
            {networkTree.map((region) => (
              <div key={region.region}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {region.region} region
                </p>
                <Accordion type="single" collapsible className="w-full">
                  {region.hubs.map((hub) => (
                    <AccordionItem key={hub.name} value={hub.name}>
                      <AccordionTrigger className="text-sm">
                        {hub.name} hub
                        <Badge
                          className="ml-auto mr-2 bg-muted rounded-sm font-semibold px-2 py-1"
                          variant="secondary"
                        >
                          {hub.centers.length}{" "}
                          {hub.centers.length === 1 ? "center" : "centers"}
                        </Badge>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1">
                          {hub.centers.map((center) => (
                            <li
                              key={center.name}
                              className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-muted"
                            >
                              <span className="flex items-center gap-2">
                                <ChevronRight className="size-3.5 text-muted-foreground" />
                                {center.name}
                              </span>
                              <span className="text-numeric text-xs text-muted-foreground">
                                {center.dss} DSS ·{" "}
                                {center.customers.toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Feeders</CardTitle>
            <CardDescription>
              Load and customer attachment by feeder
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feeder</TableHead>
                    <TableHead>Band</TableHead>
                    <TableHead className="text-right">DSS</TableHead>
                    <TableHead className="text-right">Customers</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeders.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <p className="font-medium">{f.name}</p>
                        <p className="text-numeric text-xs text-muted-foreground">
                          {f.id}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Band {f.band}</Badge>
                      </TableCell>
                      <TableCell className="text-numeric text-right">
                        {f.dss}
                      </TableCell>
                      <TableCell className="text-numeric text-right">
                        {f.customers.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            f.status === "Healthy"
                              ? "border-success/30 bg-success/12 text-success"
                              : "border-destructive/30 bg-destructive/12 text-destructive"
                          }
                        >
                          {f.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
