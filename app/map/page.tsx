"use client";

import { Layers, MapPin } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "../_components/app-shell";
import { StatusBadge } from "../_components/status-badge";
import { customers, feederOptions } from "../data/ceems";

// export const Route = createFileRoute("/map")({
//   head: () => ({
//     meta: [
//       { title: "Customer Map — Geographic Coverage | CEEMS" },
//       {
//         name: "description",
//         content: "Visualise enumerated customers by coordinates, feeder, DSS and LGA on an interactive coverage map.",
//       },
//       { property: "og:title", content: "Customer Map — Geographic Coverage | CEEMS" },
//       { property: "og:description", content: "Geographic view of enumerated customers by feeder and LGA." },
//     ],
//   }),
//   component: MapPage,
// });

export default function MapPage() {
  const pins = customers.slice(0, 24);

  return (
    <>
      <PageHeader
        title="Coverage map"
        description="Enumerated customer locations across the Osun network"
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-3 overflow-hidden py-0">
          <CardContent className="h-full p-0">
            <div className="relative h-full min-h-[28rem] overflow-hidden bg-secondary">
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
              {pins.map((c, i) => (
                <span
                  key={c.id}
                  className="absolute"
                  style={{
                    left: `${8 + ((i * 37) % 84)}%`,
                    top: `${10 + ((i * 53) % 76)}%`,
                  }}
                >
                  <MapPin
                    className={`size-5 drop-shadow ${
                      c.status === "Flagged"
                        ? "text-destructive"
                        : c.status === "Pending"
                          ? "text-warning-foreground"
                          : "text-primary"
                    }`}
                  />
                </span>
              ))}
              <div className="absolute bottom-4 left-4 rounded-md border border-border bg-card/95 px-3 py-2 text-xs">
                <p className="font-medium">Osogbo · Ede · Ile-Ife</p>
                <p className="text-muted-foreground">
                  Showing {pins.length} of 214,806 pins
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="size-4" /> Layers
              </CardTitle>
              <CardDescription>Filter what appears on the map</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-1.5 text-xs text-muted-foreground">
                  Feeder
                </Label>
                <Select defaultValue={feederOptions[0]!}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feederOptions.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {[
                "DSS boundaries",
                "Unmetered only",
                "Flagged coordinates",
                "Cluster pins",
              ].map((l, i) => (
                <div key={l} className="flex items-center justify-between">
                  <Label
                    htmlFor={l}
                    className="text-sm font-normal text-muted-foreground"
                  >
                    {l}
                  </Label>
                  <Switch id={l} defaultChecked={i === 3} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {["Active", "Pending", "Flagged"].map((s) => (
                <div key={s} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{s} customers</span>
                  <StatusBadge value={s} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
