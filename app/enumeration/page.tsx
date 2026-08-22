"use client";

import {
  CheckCircle2,
  ClipboardList,
  Construction,
  Plus,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { enumerationBatches } from "../data/ceems";

// export const Route = createFileRoute("/enumeration")({
//   head: () => ({
//     meta: [
//       { title: "Enumeration — Field Capture & Review | CEEMS" },
//       {
//         name: "description",
//         content: "Manage enumerators, field capture batches, supervisor review and enumeration history.",
//       },
//       { property: "og:title", content: "Enumeration — Field Capture & Review | CEEMS" },
//       { property: "og:description", content: "Track field capture batches, enumerators and supervisor approvals." },
//     ],
//   }),
//   component: EnumerationPage,
// });

const enumerators = [
  {
    name: "Samuel Adeoye",
    id: "ENU-1042",
    hub: "Osogbo",
    captured: 4820,
    approved: 4510,
    status: "Active",
  },
  {
    name: "Grace Ilesanmi",
    id: "ENU-1088",
    hub: "Ede",
    captured: 3960,
    approved: 3880,
    status: "Active",
  },
  {
    name: "Kabir Danjuma",
    id: "ENU-1123",
    hub: "Ile-Ife",
    captured: 2740,
    approved: 2115,
    status: "Active",
  },
  {
    name: "Rita Onuoha",
    id: "ENU-1170",
    hub: "Ilesa",
    captured: 1980,
    approved: 1290,
    status: "Suspended",
  },
];

export default function EnumerationPage() {
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
        title="Enumeration"
        description="Field capture batches, enumerator performance and supervisor review queue"
        actions={
          <Button size="sm">
            <Plus className="size-4" /> New batch
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: ClipboardList,
            label: "Open batches",
            value: "18",
            note: "3 overdue",
          },
          {
            icon: UserCheck,
            label: "Active enumerators",
            value: "42",
            note: "across 4 hubs",
          },
          {
            icon: CheckCircle2,
            label: "Awaiting review",
            value: "6,412",
            note: "records",
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

      <Tabs defaultValue="batches">
        <TabsList>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="enumerators">Enumerators</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch queue</CardTitle>
              <CardDescription>
                Capture progress and review state
              </CardDescription>
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
                      <TableHead className="hidden sm:table-cell text-right">
                        Updated
                      </TableHead>
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
                        <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                          {b.updated}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enumerators" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Enumerator performance</CardTitle>
              <CardDescription>
                Captured vs approved records this cycle
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Hub
                      </TableHead>
                      <TableHead className="text-right">Captured</TableHead>
                      <TableHead className="text-right">Approved</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enumerators.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell className="text-numeric">{e.id}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {e.hub}
                        </TableCell>
                        <TableCell className="text-numeric text-right">
                          {e.captured.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-numeric text-right">
                          {e.approved.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={e.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
