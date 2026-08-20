"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  buildCustomerPayload,
  EMPTY_CUSTOMER_FORM,
  type CustomerFormValues,
  type SelectOption,
} from "../_lib/customer-form";

type CustomerFormProps = {
  mode: "create" | "edit";
  customerId?: string;
  initialValues?: CustomerFormValues;
  customerTypeOptions: SelectOption[];
  meterTypeOptions: SelectOption[];
  meterPhaseOptions: SelectOption[];
  customerCategoryOptions: SelectOption[];
  premiseTypeOptions: SelectOption[];
  serviceCenterOptions: SelectOption[];
  statusOptions: SelectOption[];
};

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <CardHeader>
      <CardTitle className="text-success">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: SelectOption[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="rounded-sm w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CustomerForm({
  mode,
  customerId,
  initialValues = EMPTY_CUSTOMER_FORM,
  customerTypeOptions,
  meterTypeOptions,
  meterPhaseOptions,
  customerCategoryOptions,
  premiseTypeOptions,
  serviceCenterOptions,
  statusOptions,
}: CustomerFormProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<CustomerFormValues>(initialValues);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const update = <K extends keyof CustomerFormValues>(
    key: K,
    value: CustomerFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const hasCoordinates = form.latitude !== "" || form.longitude !== "";
  const title = mode === "edit" ? "Edit customer" : "Add new customer";
  const description =
    mode === "edit"
      ? "Update the customer record and save your changes."
      : "Enter account, meter, and location details to register a customer.";
  const submitLabel = mode === "edit" ? "Update customer" : "Save customer";
  const returnHref = customerId ? `/customers/${customerId}` : "/customers";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = buildCustomerPayload(form);
      const response = await fetch(
        mode === "edit" && customerId
          ? `/api/customers/${customerId}`
          : "/api/customers",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to save customer.");
      }

      toast.success(mode === "edit" ? "Customer updated" : "Customer created");

      router.push(mode === "edit" && customerId ? returnHref : "/customers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:p-4">
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
            onClick={() => router.push(returnHref)}
            disabled={submitting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="customer-form"
            disabled={submitting}
            className="flex-1 sm:flex-none"
          >
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <form id="customer-form" className="space-y-6" onSubmit={handleSubmit}>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="rounded-sm text-sm">
          <SectionTitle
            title="Account & meter"
            description="Core identifiers for this customer."
          />
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
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                  required
                  className="rounded-sm text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="other_name">Other name</Label>
                <Input
                  id="other_name"
                  value={form.other_name}
                  onChange={(e) => update("other_name", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <SelectField
                label="Customer type"
                value={form.customer_type}
                onChange={(value) => update("customer_type", value)}
                placeholder="Select customer type"
                options={customerTypeOptions}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <SectionTitle
            title="Meter & category"
            description="Classification used for tariffing and billing."
          />
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Meter type"
                value={form.meter_type}
                onChange={(value) => update("meter_type", value)}
                placeholder="Select meter type"
                options={meterTypeOptions}
              />
              <SelectField
                label="Meter phase"
                value={form.meter_phase}
                onChange={(value) => update("meter_phase", value)}
                placeholder="Select meter phase"
                options={meterPhaseOptions}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Customer category"
                value={form.customer_category}
                onChange={(value) => update("customer_category", value)}
                placeholder="Select category"
                options={customerCategoryOptions}
              />
              <SelectField
                label="Premise type"
                value={form.premise_type}
                onChange={(value) => update("premise_type", value)}
                placeholder="Select premise type"
                options={premiseTypeOptions}
              />
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

        <Card>
          <SectionTitle
            title="Location"
            description="Where the meter is physically installed."
          />
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
              <SelectField
                label="Service center"
                value={form.service_center}
                onChange={(value) => update("service_center", value)}
                placeholder="Select service center"
                options={serviceCenterOptions}
              />
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

        <Card>
          <SectionTitle
            title="Contact"
            description="Primary contact details."
          />
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

        <Card>
          <SectionTitle
            title="Feeder & grid"
            description="Network hierarchy this customer sits under."
          />
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
                <Label htmlFor="feeder_band">Feeder band</Label>
                <Input
                  id="feeder_band"
                  value={form.feeder_band}
                  onChange={(e) => update("feeder_band", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  className="rounded-sm text-sm"
                />
              </div>
              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) => update("status", value)}
                placeholder="Select a status"
                options={statusOptions}
              />
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

        <Card>
          <SectionTitle
            title="Enumerator"
            description="Who captured this record in the field."
          />
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

        <div className="flex justify-end gap-2 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(returnHref)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
