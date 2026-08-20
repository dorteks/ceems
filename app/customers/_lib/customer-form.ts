export type SelectOption = {
  value: string;
  label: string;
};

export type CustomerFormValues = {
  account_number: string;
  meter_number: string;
  surname: string;
  first_name: string;
  other_name: string;
  customer_type: string;
  meter_type: string;
  meter_phase: string;
  customer_category: string;
  nin: string;
  premise_type: string;
  address: string;
  city: string;
  state: string;
  lga: string;
  service_center: string;
  service_code: string;
  tariff: string;
  longitude: string;
  latitude: string;
  email: string;
  phone: string;
  nature_of_business: string;
  dss_id: string;
  dss_name: string;
  feeder_id: string;
  feeder_name: string;
  feeder_band: string;
  status: string;
  business_hub: string;
  region: string;
  enumerator_name: string;
  enumerator_id: string;
  enumerator_phone_number: string;
  remark: string;
};

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  account_number: "",
  meter_number: "",
  surname: "",
  first_name: "",
  other_name: "",
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

type CustomerSource = Partial<{
  account_number: string | null;
  meter_number: string | null;
  surname: string | null;
  first_name: string | null;
  other_name: string | null;
  customer_type: string | null;
  meter_type: string | null;
  meter_phase: string | null;
  customer_category: string | null;
  nin: string | null;
  premise_type: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  lga: string | null;
  service_center: string | null;
  service_code: string | null;
  tariff: string | null;
  longitude: number | null;
  latitude: number | null;
  email: string | null;
  phone: string | null;
  nature_of_business: string | null;
  dss_id: string | null;
  dss_name: string | null;
  feeder_id: string | null;
  feeder_name: string | null;
  feeder_band: string | null;
  status: string | null;
  business_hub: string | null;
  region: string | null;
  enumerator_name: string | null;
  enumerator_id: string | null;
  enumerator_phone_number: string | null;
  remark: string | null;
}>;

function toText(value: unknown) {
  if (value == null) {
    return "";
  }

  return String(value);
}

function trimOrEmpty(value: string) {
  return value.trim();
}

function trimOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function numberOrEmpty(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

function numberOrNull(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function customerToFormValues(
  customer?: CustomerSource | null,
): CustomerFormValues {
  return {
    account_number: toText(customer?.account_number),
    meter_number: toText(customer?.meter_number),
    surname: toText(customer?.surname),
    first_name: toText(customer?.first_name),
    other_name: toText(customer?.other_name),
    customer_type: toText(customer?.customer_type),
    meter_type: toText(customer?.meter_type),
    meter_phase: toText(customer?.meter_phase),
    customer_category: toText(customer?.customer_category),
    nin: toText(customer?.nin),
    premise_type: toText(customer?.premise_type),
    address: toText(customer?.address),
    city: toText(customer?.city),
    state: toText(customer?.state),
    lga: toText(customer?.lga),
    service_center: toText(customer?.service_center),
    service_code: toText(customer?.service_code),
    tariff: toText(customer?.tariff),
    longitude: numberOrEmpty(customer?.longitude),
    latitude: numberOrEmpty(customer?.latitude),
    email: toText(customer?.email),
    phone: toText(customer?.phone),
    nature_of_business: toText(customer?.nature_of_business),
    dss_id: toText(customer?.dss_id),
    dss_name: toText(customer?.dss_name),
    feeder_id: toText(customer?.feeder_id),
    feeder_name: toText(customer?.feeder_name),
    feeder_band: toText(customer?.feeder_band),
    status: toText(customer?.status),
    business_hub: toText(customer?.business_hub),
    region: toText(customer?.region),
    enumerator_name: toText(customer?.enumerator_name),
    enumerator_id: toText(customer?.enumerator_id),
    enumerator_phone_number: toText(customer?.enumerator_phone_number),
    remark: toText(customer?.remark),
  };
}

export function buildCustomerPayload(values: CustomerFormValues) {
  return {
    account_number: trimOrEmpty(values.account_number),
    meter_number: trimOrNull(values.meter_number),
    surname: trimOrEmpty(values.surname),
    first_name: trimOrEmpty(values.first_name),
    other_name: trimOrNull(values.other_name),
    customer_type: trimOrNull(values.customer_type),
    meter_type: trimOrNull(values.meter_type),
    meter_phase: trimOrNull(values.meter_phase),
    customer_category: trimOrNull(values.customer_category),
    nin: trimOrNull(values.nin),
    premise_type: trimOrNull(values.premise_type),
    address: trimOrNull(values.address),
    city: trimOrNull(values.city),
    state: trimOrNull(values.state),
    lga: trimOrNull(values.lga),
    service_center: trimOrNull(values.service_center),
    service_code: trimOrNull(values.service_code),
    tariff: trimOrNull(values.tariff),
    longitude: numberOrNull(values.longitude),
    latitude: numberOrNull(values.latitude),
    email: trimOrNull(values.email),
    phone: trimOrNull(values.phone),
    nature_of_business: trimOrNull(values.nature_of_business),
    dss_id: trimOrNull(values.dss_id),
    dss_name: trimOrNull(values.dss_name),
    feeder_id: trimOrNull(values.feeder_id),
    feeder_name: trimOrNull(values.feeder_name),
    feeder_band: trimOrNull(values.feeder_band),
    status: trimOrNull(values.status),
    business_hub: trimOrNull(values.business_hub),
    region: trimOrNull(values.region),
    enumerator_name: trimOrNull(values.enumerator_name),
    enumerator_id: trimOrNull(values.enumerator_id),
    enumerator_phone_number: trimOrNull(values.enumerator_phone_number),
    remark: trimOrNull(values.remark),
  };
}
