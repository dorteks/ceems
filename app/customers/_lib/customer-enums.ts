import {
  CustomerCategory,
  CustomerType,
  MeterPhase,
  MeterType,
  PremiseType,
  ServiceCenter,
} from "@prisma/client";

import type { SelectOption } from "./customer-form";

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function optionsFromEnum(values: Record<string, string>): SelectOption[] {
  return Object.values(values).map((value) => ({
    value,
    label: formatEnumLabel(value),
  }));
}

export const customerTypeOptions = optionsFromEnum(CustomerType);
export const meterTypeOptions = optionsFromEnum(MeterType);
export const meterPhaseOptions = optionsFromEnum(MeterPhase);
export const customerCategoryOptions = optionsFromEnum(CustomerCategory);
export const premiseTypeOptions = optionsFromEnum(PremiseType);
export const serviceCenterOptions = optionsFromEnum(ServiceCenter);
