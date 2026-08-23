"use client";

import { useEffect, useState } from "react";
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

export default function AuditPage() {
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const searchAuditLog = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("limit", "100");

        if (query.trim()) {
          params.set("q", query.trim());
        }

        const response = await fetch(`/api/audit?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });

        const json = (await response.json().catch(() => null)) as {
          events?: AuditEvent[];
          error?: string;
        } | null;

        if (!response.ok || !json?.events) {
          setEvents([]);
          setError(json?.error ?? "Failed to load audit trail");
          return;
        }

        setEvents(json.events);
      } catch (error) {
        // Ignore aborted requests caused by typing a new search
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setEvents([]);
        setError("Failed to load audit trail");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // Wait until the user pauses typing before searching
    const timeout = setTimeout(searchAuditLog, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const fetchEvents = async (search = submittedQuery) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("limit", "100");
      if (search.trim()) params.set("q", search.trim());

      const response = await fetch(`/api/audit?${params.toString()}`, {
        credentials: "include",
      });

      const json = (await response.json().catch(() => null)) as {
        events?: AuditEvent[];
        error?: string;
      } | null;

      if (!response.ok || !json?.events) {
        setEvents([]);
        setError(json?.error ?? "Failed to load audit trail");
        return;
      }

      setEvents(json.events);
    } catch {
      setEvents([]);
      setError("Failed to load audit trail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEvents("");
  }, []);

  const exportCsv = () => {
    if (!events.length) return;

    const rows = [
      ["actor", "role", "action", "entity", "before", "after", "when"].join(
        ",",
      ),
      ...events.map((event) =>
        [
          `"${event.actorName.replace(/"/g, '""')}"`,
          `"${(event.actorRole ?? "").replace(/"/g, '""')}"`,
          `"${event.action.replace(/"/g, '""')}"`,
          `"${event.entityLabel.replace(/"/g, '""')}"`,
          `"${(event.beforeValue ?? "").replace(/"/g, '""')}"`,
          `"${(event.afterValue ?? "").replace(/"/g, '""')}"`,
          `"${new Date(event.occurredAt).toISOString()}"`,
        ].join(","),
      ),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-trail.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Audit trail"
        description="Every create, update and delete is recorded with before and after values"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={!events.length}
          >
            <Download className="size-4" /> Export log
          </Button>
        }
      />

      {error ? (
        <Card className="mb-4 border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 text-sm text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search by actor, entity or action"
              className="pl-9"
              aria-label="Search audit log"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {loading && query.trim() ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                Searching...
              </div>
            ) : null}
          </div>
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading audit trail...
                    </TableCell>
                  </TableRow>
                ) : events.length ? (
                  events.map((event) => (
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
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          className="rounded-sm bg-muted px-2 py-1 font-semibold"
                          variant="secondary"
                        >
                          {event.actorRole ?? "System"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[13px]">
                        {event.action}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="max-w-[220px] leading-tight">
                          <div className="text-[14px] font-medium text-wrap wrap-normal">
                            {event.entityLabel}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.entityType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {event.beforeValue ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {event.afterValue ?? "—"}
                      </TableCell>
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
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No audit events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
