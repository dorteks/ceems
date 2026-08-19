"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  UploadCloud,
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
import { Separator } from "@/components/ui/separator";
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
import { importJobs } from "../data/ceems";

// export const Route = createFileRoute("/import")({
//   head: () => ({
//     meta: [
//       { title: "Import & Export — Excel Data Migration | CEEMS" },
//       {
//         name: "description",
//         content: "Upload Excel/CSV datasets, validate and de-duplicate rows before commit, and export filtered reports.",
//       },
//       { property: "og:title", content: "Import & Export — Excel Data Migration | CEEMS" },
//       { property: "og:description", content: "Validate, de-duplicate and commit large Excel imports safely." },
//     ],
//   }),
//   component: ImportPage,
// });

const steps = [
  "Upload",
  "Map columns",
  "Validate",
  "Review duplicates",
  "Commit",
];

export default function ImportPage() {
  return (
    <>
      <PageHeader
        title="Import & export"
        description="Bring Excel and CSV datasets into CEEMS with validation and duplicate detection"
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" /> Download template
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New import</CardTitle>
            <CardDescription>
              XLSX or CSV, up to 250,000 rows per file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 px-6 py-12 text-center">
              <UploadCloud className="mb-3 size-8 text-primary" />
              <p className="text-sm font-medium">
                Drag and drop your spreadsheet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or browse from your device
              </p>
              <Button className="mt-4" size="sm">
                <FileSpreadsheet className="size-4" /> Select file
              </Button>
            </div>

            <Separator className="my-6" />

            <ol className="grid gap-3 sm:grid-cols-5">
              {steps.map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-2 sm:flex-col sm:items-start"
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`text-xs ${i === 0 ? "font-medium" : "text-muted-foreground"}`}
                  >
                    {s}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation rules</CardTitle>
            <CardDescription>
              Applied before any row is committed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              "Account number format and uniqueness",
              "Meter number duplicate detection",
              "Phone normalised to 11 digits",
              "NIN length check",
              "State / LGA name standardisation",
              "Coordinate range validation",
            ].map((r) => (
              <div key={r} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="text-muted-foreground">{r}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent import jobs</CardTitle>
          <CardDescription>Background processing history</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead className="text-right">Valid</TableHead>
                  <TableHead className="text-right">Invalid</TableHead>
                  <TableHead className="w-36">Quality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">
                    When
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importJobs.map((j) => (
                  <TableRow key={j.file}>
                    <TableCell className="font-medium">{j.file}</TableCell>
                    <TableCell className="text-numeric text-right">
                      {j.rows.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-numeric text-right text-success">
                      {j.valid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-numeric text-right text-destructive">
                      {j.invalid.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Progress
                        value={Math.round((j.valid / j.rows) * 100)}
                        className="h-2"
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={j.status} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                      {j.when}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mx-6 mt-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/12 p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
            <p className="text-muted-foreground">
              1,780 rows in{" "}
              <span className="font-medium text-foreground">
                ife_reconcile.xlsx
              </span>{" "}
              failed validation. Download the error report to correct and
              re-upload.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
