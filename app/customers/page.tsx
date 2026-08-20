"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Plus, RotateCcw, Search } from "lucide-react";
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
  feederOptions,
  states,
} from "../data/ceems";
import Link from "next/link";

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
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [lga, setLga] = useState("All LGAs");
  const [feeder, setFeeder] = useState("All feeders");
  const [selected, setSelected] = useState<string[]>([]);
  const [apiCustomers, setApiCustomers] = useState<typeof customers>([]);
  const [loading, setLoading] = useState(true);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers?page=1&size=100");
        const data = await response.json();
        console.log("API Response:", data);
        if (data.data) {
          setApiCustomers(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const rows = useMemo(() => {
    const dataSource = apiCustomers.length > 0 ? apiCustomers : customers;
    return dataSource.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchQ =
        !q ||
        [c.accountNumber, c.meterNumber, c.surname, c.firstName, c.phone, c.nin]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return (
        matchQ &&
        (status === "All statuses" || c.status === status) &&
        (lga === "All LGAs" || c.lga === lga) &&
        (feeder === "All feeders" || c.feederName === feeder)
      );
    });
  }, [query, status, lga, feeder, apiCustomers]);

  const reset = () => {
    setQuery("");
    setStatus("All statuses");
    setLga("All LGAs");
    setFeeder("All feeders");
  };

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${rows.length} records shown${loading ? " (loading...)" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm">
              <Plus className="size-4" /> New customer
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Account, meter, NIN, phone or name"
                className="pl-9"
              />
            </div>
          </div>
          <FilterSelect
            label="Status"
            value={status}
            onChange={(next) => setStatus(next ?? "All statuses")}
            options={statusOptions}
          />
          <FilterSelect
            label="LGA"
            value={lga}
            onChange={(next) => setLga(next ?? "All LGAs")}
            options={lgaOptions}
          />
          <FilterSelect
            label="Feeder"
            value={feeder}
            onChange={(next) => setFeeder(next ?? "All feeders")}
            options={feederOptions}
          />
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-5">
            <Button size="sm">
              <Filter className="size-4" /> Apply filters
            </Button>
            <Button size="sm" variant="ghost" onClick={reset}>
              <RotateCcw className="size-4" /> Reset
            </Button>
            <FilterState label="State" />
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
                  <TableHead>Account no.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Meter no.
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Tariff</TableHead>
                  <TableHead className="hidden lg:table-cell">LGA</TableHead>
                  <TableHead className="hidden xl:table-cell">Feeder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(c.id)}
                        onCheckedChange={() => toggle(c.id)}
                        aria-label={`Select ${c.accountNumber}`}
                      />
                    </TableCell>
                    <TableCell className="text-numeric font-medium">
                      {c.accountNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {c.surname} {c.firstName}
                      </p>
                      <p className="text-numeric text-xs text-muted-foreground">
                        {c.phone}
                      </p>
                    </TableCell>
                    <TableCell className="text-numeric hidden md:table-cell">
                      {c.meterNumber || (
                        <span className="text-muted-foreground">Unmetered</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {c.tariff}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {c.lga}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {c.feederName}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={c.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Link href={`/customers/${c.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No records match the current filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p>Showing 1–{rows.length} of 214,806 records</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
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
  options: string[];
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

function FilterState({ label }: { label: string }) {
  const [value, setValue] = useState(states[0]!);
  return (
    <div className="ml-auto hidden w-48 sm:block">
      <Label className="sr-only">{label}</Label>
      <Select
        value={value}
        onValueChange={(next) => setValue(next ?? states[0]!)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {states.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
