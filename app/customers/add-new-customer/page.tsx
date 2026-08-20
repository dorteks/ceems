"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createCustomer } from "@/server/services/customerService";

// Adjust this import to wherever your data layer actually lives
// (server action, API route wrapper, etc.)

// ---------------------------------------------------------------------------
// Enums — replace the placeholder options (service centers especially) with
// your real lists once the ERD / lookup tables are finalized.
// ---------------------------------------------------------------------------
const METER_TYPES = ["Prepaid", "Postpaid", "Analogue"] as const;
const METER_PHASES = ["Single Phase", "Three Phase"] as const;
const CUSTOMER_CATEGORIES = [
  "Residential",
  "Commercial",
  "Industrial",
  "MD1",
  "MD2",
  "Special",
] as const;
const PREMISE_TYPES = [
  "Bungalow",
  "Duplex",
  "Flat/Apartment",
  "Shop",
  "Office",
  "Warehouse",
  "Institution",
  "Other",
] as const;
const SERVICE_CENTERS = ["Ikeja", "Alausa", "Oregun", "Agidingbi"] as const; // TODO: replace with your actual service center list
const FEEDER_BANDS = [
  "Band A",
  "Band B",
  "Band C",
  "Band D",
  "Band E",
] as const;
const STATUSES = [
  "Active",
  "Inactive",
  "Pending",
  "Disconnected",
  "Blacklisted",
] as const;

type MeterType = (typeof METER_TYPES)[number];
type MeterPhase = (typeof METER_PHASES)[number];
type CustomerCategory = (typeof CUSTOMER_CATEGORIES)[number];
type PremiseType = (typeof PREMISE_TYPES)[number];
type ServiceCenter = (typeof SERVICE_CENTERS)[number];
type FeederBand = (typeof FEEDER_BANDS)[number];
type Status = (typeof STATUSES)[number];

interface CustomerFormState {
  // Account and Meter
  account_number: string;
  meter_number: string;
  surname: string;
  customer_type: string;

  // Meter and Category
  meter_type: MeterType | "";
  meter_phase: MeterPhase | "";
  customer_category: CustomerCategory | "";
  nin: string;
  premise_type: PremiseType | "";

  // Location
  address: string;
  city: string;
  state: string;
  lga: string;
  service_center: ServiceCenter | "";
  service_code: string;
  tariff: string;
  longitude: string;
  latitude: string;

  // Contact
  email: string;
  phone: string;
  nature_of_business: string;

  // Feeder & grid
  dss_id: string;
  dss_name: string;
  feeder_id: string;
  feeder_name: string;
  feeder_band: FeederBand | "";
  status: Status | "";
  business_hub: string;
  region: string;

  // Enumerator
  enumerator_name: string;
  enumerator_id: string;
  enumerator_phone_number: string;
  remark: string;
}

const INITIAL_STATE: CustomerFormState = {
  account_number: "",
  meter_number: "",
  surname: "",
  customer_type: "",
  meter_type: "",
  meter_phase: "",
  customer_category: "",
  nin: "",
  premise_type: "",
  address: "",
  city: "",
  state: "",
  lga: "",
  service_center: "",
  service_code: "",
  tariff: "",
  longitude: "",
  latitude: "",
  email: "",
  phone: "",
  nature_of_business: "",
  dss_id: "",
  dss_name: "",
  feeder_id: "",
  feeder_name: "",
  feeder_band: "",
  status: "",
  business_hub: "",
  region: "",
  enumerator_name: "",
  enumerator_id: "",
  enumerator_phone_number: "",
  remark: "",
};

export default function AddNewCustomer() {
  const router = useRouter();
  const [form, setForm] = React.useState<CustomerFormState>(INITIAL_STATE);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const update = <K extends keyof CustomerFormState>(
    key: K,
    value: CustomerFormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const hasCoordinates = form.latitude !== "" && form.longitude !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await createCustomer({
        // Account and Meter
        account_number: form.account_number,
        meter_number: form.meter_number,
        surname: form.surname,
        customer_type: form.customer_type || undefined,

        // Meter and Category
        meter_type: form.meter_type || undefined,
        meter_phase: form.meter_phase || undefined,
        customer_category: form.customer_category || undefined,
        nin: form.nin || null,
        premise_type: form.premise_type || undefined,

        // Location
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        lga: form.lga || null,
        service_center: form.service_center || undefined,
        service_code: form.service_code || undefined,
        tariff: form.tariff || undefined,
        longitude: form.longitude ? Number(form.longitude) : null,
        latitude: form.latitude ? Number(form.latitude) : null,

        // Contact
        email: form.email || null,
        phone: form.phone || null,
        nature_of_business: form.nature_of_business || null,

        // Feeder & grid
        dss_id: form.dss_id || null,
        dss_name: form.dss_name || null,
        feeder_id: form.feeder_id || null,
        feeder_name: form.feeder_name || null,
        feeder_band: form.feeder_band || null,
        status: form.status || null,
        business_hub: form.business_hub || null,
        region: form.region || null,

        // Enumerator
        enumerator_name: form.enumerator_name || null,
        enumerator_id: form.enumerator_id || null,
        enumerator_phone_number: form.enumerator_phone_number || null,
        remark: form.remark || null,

        // created_at / updated_at / created_by / updated_by are set server-side
      } as any);

      if (!res.ok) {
        setError(res.error ?? "Unable to create customer.");
        setSubmitting(false);
        return;
      }

      toast.success(`Customer ${form.surname || form.account_number} created`);
      router.push("/customers");
    } catch (err) {
      setError("Something went wrong while creating the customer.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:p-4">
      {/* Page header */}
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="w-fit gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Button>

        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="add-customer-form"
            disabled={submitting}
            className="flex-1 sm:flex-none"
          >
            {submitting ? "Saving..." : "Save customer"}
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Add new customer
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter account, meter, and location details to register a customer.
        </p>
      </div>

      <form
        id="add-customer-form"
        className="space-y-6"
        onSubmit={handleSubmit}
      >
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {/* Account & Meter */}
        <Card className="rounded-sm text-sm">
          <CardHeader>
            <CardTitle className="capitalize text-success">
              ACCOUNT &amp; METER
            </CardTitle>
            <CardDescription>
              Core identifiers for this customer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account_number">Account number</Label>
                <Input
                  id="account_number"
                  value={form.account_number}
                  onChange={(e) => update("account_number", e.target.value)}
                  required
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meter_number">Meter number</Label>
                <Input
                  id="meter_number"
                  value={form.meter_number}
                  onChange={(e) => update("meter_number", e.target.value)}
                  required
                  className="rounded-sm text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  value={form.surname}
                  onChange={(e) => update("surname", e.target.value)}
                  required
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_type">Customer type</Label>
                <Input
                  id="customer_type"
                  placeholder="e.g. Individual, Corporate"
                  value={form.customer_type}
                  onChange={(e) => update("customer_type", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meter & category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-success">METER &amp; CATEGORY</CardTitle>
            <CardDescription>
              Classification used for tariffing and billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Meter type</Label>
                <Select
                  value={form.meter_type}
                  onValueChange={(v) => update("meter_type", v as MeterType)}
                >
                  <SelectTrigger className="rounded-sm w-full">
                    <SelectValue placeholder="Select meter type" />
                  </SelectTrigger>
                  <SelectContent>
                    {METER_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Meter phase</Label>
                <Select
                  value={form.meter_phase}
                  onValueChange={(v) => update("meter_phase", v as MeterPhase)}
                >
                  <SelectTrigger className="rounded-sm w-full">
                    <SelectValue placeholder="Select meter phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {METER_PHASES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer category</Label>
                <Select
                  value={form.customer_category}
                  onValueChange={(v) =>
                    update("customer_category", v as CustomerCategory)
                  }
                >
                  <SelectTrigger className="rounded-sm w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Premise type</Label>
                <Select
                  value={form.premise_type}
                  onValueChange={(v) =>
                    update("premise_type", v as PremiseType)
                  }
                >
                  <SelectTrigger className="rounded-sm w-full">
                    <SelectValue placeholder="Select premise type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREMISE_TYPES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nin">NIN</Label>
              <Input
                id="nin"
                value={form.nin}
                onChange={(e) => update("nin", e.target.value)}
                className="rounded-sm text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-success">LOCATION</CardTitle>
            <CardDescription>
              Where the meter is physically installed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                rows={2}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="rounded-sm text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lga">LGA</Label>
                <Input
                  id="lga"
                  value={form.lga}
                  onChange={(e) => update("lga", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Service center</Label>
                <Select
                  value={form.service_center}
                  onValueChange={(v) =>
                    update("service_center", v as ServiceCenter)
                  }
                >
                  <SelectTrigger className="rounded-sm w-full">
                    <SelectValue placeholder="Select service center" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CENTERS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_code">Service code</Label>
                <Input
                  id="service_code"
                  value={form.service_code}
                  onChange={(e) => update("service_code", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tariff">Tariff</Label>
                <Input
                  id="tariff"
                  value={form.tariff}
                  onChange={(e) => update("tariff", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => update("latitude", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => update("longitude", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
            </div>

            {hasCoordinates ? (
              <p className="flex items-center gap-1.5 text-xs text-success">
                <MapPin className="h-3.5 w-3.5" />
                Coordinates captured for this premise.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Coordinates are optional but recommended for field verification.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-success">CONTACT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nature_of_business">Nature of business</Label>
              <Input
                id="nature_of_business"
                placeholder="Leave blank for residential customers"
                value={form.nature_of_business}
                onChange={(e) => update("nature_of_business", e.target.value)}
                className="rounded-sm text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feeder & grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-success">FEEDER &amp; GRID</CardTitle>
            <CardDescription>
              Network hierarchy this customer sits under.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dss_id">DSS ID</Label>
                <Input
                  id="dss_id"
                  value={form.dss_id}
                  onChange={(e) => update("dss_id", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dss_name">DSS name</Label>
                <Input
                  id="dss_name"
                  value={form.dss_name}
                  onChange={(e) => update("dss_name", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="feeder_id">Feeder ID</Label>
                <Input
                  id="feeder_id"
                  value={form.feeder_id}
                  onChange={(e) => update("feeder_id", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeder_name">Feeder name</Label>
                <Input
                  id="feeder_name"
                  value={form.feeder_name}
                  onChange={(e) => update("feeder_name", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Feeder band</Label>
                <Select
                  value={form.feeder_band}
                  onValueChange={(v) => update("feeder_band", v as FeederBand)}
                >
                  <SelectTrigger className="rounded-sm w-full">
                    <SelectValue placeholder="Select feeder band" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDER_BANDS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => update("status", v as Status)}
                >
                  <SelectTrigger className="rounded-sm w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business_hub">Business hub</Label>
                <Input
                  id="business_hub"
                  value={form.business_hub}
                  onChange={(e) => update("business_hub", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={form.region}
                  onChange={(e) => update("region", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enumerator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-success">ENUMERATOR</CardTitle>
            <CardDescription>
              Who captured this record in the field.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="enumerator_name">Enumerator name</Label>
                <Input
                  id="enumerator_name"
                  value={form.enumerator_name}
                  onChange={(e) => update("enumerator_name", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enumerator_id">Enumerator ID</Label>
                <Input
                  id="enumerator_id"
                  value={form.enumerator_id}
                  onChange={(e) => update("enumerator_id", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enumerator_phone_number">
                  Enumerator phone
                </Label>
                <Input
                  id="enumerator_phone_number"
                  type="tel"
                  value={form.enumerator_phone_number}
                  onChange={(e) =>
                    update("enumerator_phone_number", e.target.value)
                  }
                  className="rounded-sm text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                rows={3}
                placeholder="Any notes from the field visit"
                value={form.remark}
                onChange={(e) => update("remark", e.target.value)}
                className="rounded-sm text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Bottom actions (mirrors the top bar, always visible on mobile) */}
        <div className="flex justify-end gap-2 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
