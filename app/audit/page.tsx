"use client";

import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "../_components/app-shell";
import { auditLog } from "../data/ceems";

// export const Route = createFileRoute("/audit")({
//   head: () => ({
//     meta: [
//       { title: "Audit Trail — Change History | CEEMS" },
//       {
//         name: "description",
//         content: "Immutable record of who changed what and when across customers, meters, batches and imports.",
//       },
//       { property: "og:title", content: "Audit Trail — Change History | CEEMS" },
//       { property: "og:description", content: "Track every change with actor, entity, before and after values." },
//     ],
//   }),
//   component: AuditPage,
// });

const rows = [...auditLog, ...auditLog].map((a, i) => ({
  ...a,
  key: `${a.entity}-${i}`,
}));

export default function AuditPage() {
  return (
    <>
      <PageHeader
        title="Audit trail"
        description="Every create, update and delete is recorded with before and after values"
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" /> Export log
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by actor, entity or action"
              className="pl-9"
              aria-label="Search audit log"
            />
          </div>
          <Button size="sm" className="sm:w-32">
            Search
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead className="hidden sm:table-cell">Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden md:table-cell">Entity</TableHead>
                  <TableHead className="hidden lg:table-cell">Before</TableHead>
                  <TableHead className="hidden lg:table-cell">After</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.key}>
                    <TableCell className="font-medium">{a.actor}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">{a.role}</Badge>
                    </TableCell>
                    <TableCell>{a.action}</TableCell>
                    <TableCell className="text-numeric hidden md:table-cell">
                      {a.entity}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {a.from}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
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
        </CardContent>
      </Card>
    </>
  );
}
