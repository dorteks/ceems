"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAuth } from "@/lib/auth/auth";

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

// Tracks the blocking progress modal shown for the upload/preview request and
// the commit request. `status: "loading"` is the only state that suppresses
// closing — once it resolves to "success" or "error" the person can dismiss it.
type ImportStage = "uploading" | "committing" | null;
type StageStatus = "loading" | "success" | "error" | null;

type ImportPreviewRow = {
  account_number?: string;
  surname?: string;
  first_name?: string;
  phone?: string;
  [key: string]: unknown;
};

type ImportJobUploader = {
  id: number;
  name: string;
  username: string;
  role: string;
  hub: string;
};

type ImportJobRecord = {
  id: number;
  fileName: string;
  status: "VALIDATED" | "COMMITTED" | "FAILED";
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  importedRows: number;
  uploadedAt: string;
  completedAt: string | null;
  uploadedBy: ImportJobUploader | null;
  hasErrorReport: boolean;
};

type ImportResult = {
  total_rows?: number;
  preview?: ImportPreviewRow[];
  valid_count?: number;
  invalid_count?: number;
  duplicates_count?: number;
  imported?: number;
  errors?: Array<{ row?: number; errors?: string[] }>;
  duplicates?: unknown[];
  message?: string;
  jobId?: number;
  job?: ImportJobRecord;
};

function formatImportTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ImportPage() {
  const { adminAccess } = useAuth();

  if (!adminAccess) {
    return (
      <PageHeader
        title="Import & export"
        description="You do not have access to manage data import and export."
      />
    );
  }

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [importJobs, setImportJobs] = useState<ImportJobRecord[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [stage, setStage] = useState<ImportStage>(null);
  const [stageStatus, setStageStatus] = useState<StageStatus>(null);
  const [stageMessage, setStageMessage] = useState<string | null>(null);

  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const refreshJobs = async () => {
    try {
      setJobsError(null);
      setJobsLoading(true);
      const response = await fetch("/api/import-jobs?limit=10", {
        credentials: "include",
      });

      const data = (await response.json().catch(() => null)) as {
        jobs?: ImportJobRecord[];
        error?: string;
      } | null;

      if (!response.ok || !data?.jobs) {
        setJobsError(data?.error ?? "Unable to load import history.");
        setImportJobs([]);
        return;
      }

      setImportJobs(data.jobs);
    } catch {
      setJobsError("Unable to load import history.");
      setImportJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    void refreshJobs();
  }, []);

  const closeStageModal = () => {
    // Guard against closing mid-request — only ever called after resolution,
    // but keep the check here too since it's the single source of truth.
    if (stageStatus === "loading") return;
    setStage(null);
    setStageStatus(null);
    setStageMessage(null);
  };

  const onFile = async (file: File) => {
    setMessage(null);
    setResult(null);
    setSelectedFile(file);

    if (!file) return;

    const name = file.name.toLowerCase();
    if (
      !name.endsWith(".xlsx") &&
      !name.endsWith(".xls") &&
      !name.endsWith(".csv")
    ) {
      setMessage("Please upload an .xlsx, .xls or .csv file");
      return;
    }

    try {
      setUploading(true);
      setStage("uploading");
      setStageStatus("loading");
      setStageMessage(null);

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/customers/import", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) {
        const errMsg = json?.error || "Import failed";
        setMessage(errMsg);
        setStageStatus("error");
        setStageMessage(errMsg);
      } else {
        setResult(json);
        const failedValidation =
          (json?.job?.status ?? "").toUpperCase() === "FAILED";
        const okMsg =
          json.message ||
          (failedValidation ? "Validation failed" : "Preview ready");
        setMessage(okMsg);
        setStageStatus(failedValidation ? "error" : "success");
        setStageMessage(okMsg);
        void refreshJobs();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(msg || "Upload failed");
      setStageStatus("error");
      setStageMessage(msg || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  const onSelectClick = () => inputRef.current?.click();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  const commitImport = async () => {
    if (!selectedFile) return setMessage("No file selected to commit");

    setUploading(true);
    setMessage(null);
    setStage("committing");
    setStageStatus("loading");
    setStageMessage(null);

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("commit", "true");
      if (result?.jobId) {
        fd.append("jobId", String(result.jobId));
      }

      const res = await fetch("/api/customers/import", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        const errMsg = json?.error || "Commit failed";
        setMessage(errMsg);
        setStageStatus("error");
        setStageMessage(errMsg);
      } else {
        setResult(json);
        setMessage("Import committed");
        setStageStatus("success");
        setStageMessage("Your import has been committed successfully.");
        void refreshJobs();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(msg || "Commit failed");
      setStageStatus("error");
      setStageMessage(msg || "Commit failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadErrors = async () => {
    if (
      !result?.errors?.length &&
      !result?.duplicates?.length &&
      !result?.jobId
    ) {
      return;
    }

    if (result?.jobId) {
      const a = document.createElement("a");
      a.href = `/api/import-jobs/${result.jobId}/error-report`;
      a.download = "import-errors.csv";
      a.click();
      return;
    }

    const rows: string[] = [];
    rows.push(["row", "type", "messages"].join(","));

    for (const e of result.errors || []) {
      rows.push(
        [e.row, "validation", `"${(e.errors || []).join("; ")}"`].join(","),
      );
    }
    for (const d of result.duplicates || []) {
      rows.push(["", "duplicate", "duplicate record"].join(","));
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Drives the step tracker below from what's actually happened so far,
  // rather than a hardcoded "step 1 active" — Map columns & Validate are
  // folded into the same request as Upload (the API does both in one call),
  // so they complete together; Review duplicates is "current" once a preview
  // is back and stays that way until the commit request succeeds.
  const hasUploadedPreview = Boolean(result && result.preview);
  const hasCommitted = Boolean(result && result.imported !== undefined);

  const currentStepIndex = hasCommitted ? 4 : hasUploadedPreview ? 3 : 0;
  const latestFailedJob =
    importJobs.find((job) => job.status === "FAILED") ?? null;

  const getStepStatus = (i: number): "complete" | "current" | "upcoming" => {
    if (hasCommitted) return "complete";
    if (i < currentStepIndex) return "complete";
    if (i === currentStepIndex) return "current";
    return "upcoming";
  };

  const downloadTemplate = () => {
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
    const blob = new Blob([headers.join(",") + "\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Import & export"
        description="Bring Excel and CSV datasets into CEEMS with validation and duplicate detection"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="size-4" /> Download template
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadErrors}>
              Download errors
            </Button>
          </div>
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
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 px-6 py-12 text-center"
            >
              <UploadCloud className="mb-3 size-8 text-primary" />
              <p className="text-sm font-medium">
                Drag and drop your spreadsheet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or browse from your device
              </p>

              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={onInputChange}
              />

              <Button
                className="mt-4"
                size="sm"
                onClick={onSelectClick}
                disabled={uploading}
              >
                <FileSpreadsheet className="size-4" />{" "}
                {uploading ? "Uploading..." : "Select file"}
              </Button>

              {message && (
                <p className="mt-3 text-sm text-muted-foreground">{message}</p>
              )}

              {result && (
                <div className="mt-3 text-sm text-left w-full max-w-4xl">
                  <p className="font-medium">Result</p>
                  <div className="text-sm text-muted-foreground">
                    <div>Total rows: {result.total_rows}</div>
                    {result.valid_count !== undefined && (
                      <div>Valid: {result.valid_count}</div>
                    )}
                    {result.invalid_count !== undefined && (
                      <div>Invalid: {result.invalid_count}</div>
                    )}
                    {result.duplicates_count !== undefined && (
                      <div>Duplicates: {result.duplicates_count}</div>
                    )}
                    {result.imported !== undefined && (
                      <div>Imported: {result.imported}</div>
                    )}
                  </div>

                  {result.job?.uploadedBy && (
                    <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      Uploaded by{" "}
                      <span className="font-medium text-foreground">
                        {result.job.uploadedBy.name}
                      </span>{" "}
                      ({result.job.uploadedBy.username}) on{" "}
                      {formatImportTime(result.job.uploadedAt)}
                    </div>
                  )}

                  {result.preview && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={commitImport}
                          disabled={
                            uploading || (result.invalid_count ?? 0) > 0
                          }
                        >
                          Commit import
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={downloadErrors}
                        >
                          Download errors
                        </Button>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Account</TableHead>
                              <TableHead>Surname</TableHead>
                              <TableHead>Phone</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.preview?.map((r, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">
                                  {r.account_number}
                                </TableCell>
                                <TableCell>{r.surname}</TableCell>
                                <TableCell>{r.phone}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div
              className="flex items-start"
              role="list"
              aria-label="Import progress"
            >
              {steps.map((s, i) => {
                const status = getStepStatus(i);
                return (
                  <React.Fragment key={s}>
                    {i > 0 && (
                      <div
                        aria-hidden
                        className={`mt-3 h-0.5 flex-1 shrink transition-colors ${
                          getStepStatus(i - 1) === "complete"
                            ? "bg-success"
                            : "bg-border"
                        }`}
                      />
                    )}
                    <div
                      role="listitem"
                      className="flex shrink-0 flex-col items-center gap-1.5 text-center"
                    >
                      <span
                        className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                          status === "complete"
                            ? "bg-success text-success-foreground"
                            : status === "current"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {status === "complete" ? (
                          <Check className="size-3.5" />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span
                        className={`w-20 text-xs ${
                          status === "upcoming"
                            ? "text-muted-foreground"
                            : status === "complete"
                              ? "font-medium text-success"
                              : "font-medium text-foreground"
                        }`}
                      >
                        {s}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
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
          {jobsError ? (
            <div className="mx-6 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground">
              {jobsError}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Uploaded by
                  </TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead className="text-right">Valid</TableHead>
                  <TableHead className="text-right">Invalid</TableHead>
                  <TableHead className="w-36">Quality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">
                    When
                  </TableHead>
                  <TableHead className="text-right">Report</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobsLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading import history...
                    </TableCell>
                  </TableRow>
                ) : importJobs.length ? (
                  importJobs.map((j) => {
                    const quality = j.totalRows
                      ? Math.round((j.validRows / j.totalRows) * 100)
                      : 0;

                    return (
                      <TableRow key={j.id}>
                        <TableCell className="font-medium">
                          {j.fileName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {j.uploadedBy ? (
                            <div className="leading-tight">
                              <div className="font-medium text-foreground">
                                {j.uploadedBy.name}
                              </div>
                              <div>{j.uploadedBy.username}</div>
                            </div>
                          ) : (
                            "System"
                          )}
                        </TableCell>
                        <TableCell className="text-numeric text-right">
                          {j.totalRows.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-numeric text-right text-success">
                          {j.validRows.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-numeric text-right text-destructive">
                          {j.invalidRows.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Progress value={quality} className="h-2" />
                        </TableCell>
                        <TableCell>
                          <StatusBadge value={j.status} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                          {formatImportTime(j.uploadedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {j.hasErrorReport ? (
                            <Button asChild size="sm" variant="ghost">
                              <a href={`/api/import-jobs/${j.id}/error-report`}>
                                Download
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No import jobs yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {latestFailedJob ? (
            <div className="mx-6 mt-4 flex items-start justify-between gap-3 rounded-md border border-warning/40 bg-warning/12 p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
                <p className="text-muted-foreground">
                  {latestFailedJob.invalidRows.toLocaleString()} rows in{" "}
                  <span className="font-medium text-foreground">
                    {latestFailedJob.fileName}
                  </span>{" "}
                  failed validation. Download the error report to correct and
                  re-upload.
                </p>
              </div>

              <Button asChild size="sm" variant="outlineWarning">
                <a href={`/api/import-jobs/${latestFailedJob.id}/error-report`}>
                  Download report
                </a>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Blocking progress modal for both the upload/preview request and the
          commit request. While stageStatus is "loading" the onOpenChange guard
          below refuses to close it — no Escape, no outside click, no X button —
          it only becomes dismissible once the request resolves pass or fail. */}
      <Dialog
        open={stage !== null}
        onOpenChange={(open) => {
          if (!open) closeStageModal();
        }}
      >
        <DialogContent
          className="sm:max-w-sm"
          onInteractOutside={(e) => {
            if (stageStatus === "loading") e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (stageStatus === "loading") e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {stage === "committing" ? "Committing import" : "Uploading file"}
            </DialogTitle>
            <DialogDescription>
              {stageStatus === "loading"
                ? stage === "committing"
                  ? "Writing validated rows to the database. Please keep this window open."
                  : "Validating your file and building a preview. Please keep this window open."
                : stage === "committing"
                  ? "Commit finished."
                  : "Upload finished."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            {stageStatus === "loading" && (
              <Loader2 className="size-10 animate-spin text-primary" />
            )}
            {stageStatus === "success" && (
              <CheckCircle2 className="size-10 text-success" />
            )}
            {stageStatus === "error" && (
              <AlertTriangle className="size-10 text-destructive" />
            )}
            <p className="text-sm text-muted-foreground">
              {stageStatus === "loading"
                ? "This can take a moment for large files — don't close this window."
                : stageMessage}
            </p>
          </div>

          {stageStatus !== "loading" && (
            <div className="flex justify-end">
              <Button size="sm" onClick={closeStageModal}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
