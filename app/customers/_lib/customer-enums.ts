import {
  CustomerCategory,
  CustomerType,
  MeterPhase,
  MeterType,
  PremiseType,
  ServiceCenter,
  Status,
} from "@/lib/prisma-enums";
import type { SelectOption } from "./customer-form";

function formatEnumLabel(value: string) {
  const normalized = value.replace(/_AND_/g, " & ").replace(/_+/g, " ");

  if (normalized === "TC & P") {
    return "TC&P";
  }

  return normalized
    .split(" ")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return "";

      if (trimmed === trimmed.toUpperCase() && trimmed.length <= 4) {
        return trimmed;
      }

      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
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
export const statusOptions = optionsFromEnum(Status);
