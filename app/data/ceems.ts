export type CustomerStatus = "Active" | "Pending" | "Inactive" | "Flagged";

export interface CustomerRecord {
  id: string;
  account_number: string;
  nin: string;
  surname: string;
  first_name: string;
  other_name: string;
  email: string;
  phone: string;
  customer_type: "Residential" | "Commercial" | "Industrial" | "Special";
  customer_category: string;
  premise_type: string;
  nature_of_business: string;
  status: CustomerStatus;
  meter_number: string;
  meter_type: "Prepaid" | "Postpaid" | "Unmetered";
  meter_phase: "Single" | "Three";
  tariff: string;
  address: string;
  city: string;
  state: string;
  lga: string;
  longitude: number;
  latitude: number;
  region: string;
  business_hub: string;
  service_center: string;
  service_code: string;
  dss_id: string;
  dss_name: string;
  feeder_id: string;
  feeder_name: string;
  feeder_band: "A" | "B" | "C" | "D" | "E";
  enumerator_name: string;
  enumerator_id: string;
  enumerator_phone: string;
  remarks: string;
  date_created: string;
}

const first = [
  "Philip",
  "Adebayo",
  "Ngozi",
  "Yusuf",
  "Chinelo",
  "Tunde",
  "Amina",
  "Femi",
  "Blessing",
  "Ibrahim",
];
const other = [
  "Oluwatosin",
  "Chidera",
  "Kehinde",
  "Amaka",
  "Sunday",
  "Ifeoluwa",
  "Halima",
  "Emeka",
  "Tosin",
  "Sadiq",
];
const sur = [
  "Okitika",
  "Adeyemi",
  "Okonkwo",
  "Bello",
  "Eze",
  "Balogun",
  "Musa",
  "Ogunleye",
  "Nwachukwu",
  "Lawal",
];
const lgas = [
  "Osogbo",
  "Olorunda",
  "Egbedore",
  "Ede North",
  "Ife Central",
  "Ilesa West",
];
const hubs = ["Osogbo", "Ede", "Ile-Ife", "Ilesa"];
const centers = [
  "Ayepe 1",
  "Ayepe 2",
  "Oke-Fia",
  "Alekuwodo",
  "Sabo",
  "Oja-Oba",
];
const feeders = [
  "Ayepe 11kV",
  "Station 33kV",
  "Oke-Baale 11kV",
  "Dada Estate 11kV",
];
const dss = ["Ayepe DSS 3", "Oke-Fia DSS 1", "Sabo DSS 7", "Alekuwodo DSS 2"];
const tariffs = ["R2SA", "R2SB", "C1SA", "C2SB", "D1"];
const premises = ["Bungalow", "Duplex", "Shop", "Flat", "Warehouse"];
const statuses: CustomerStatus[] = [
  "Active",
  "Active",
  "Pending",
  "Inactive",
  "Flagged",
];
const types: CustomerRecord["customer_type"][] = [
  "Residential",
  "Residential",
  "Commercial",
  "Industrial",
  "Special",
];
const enumerators = [
  { name: "Samuel Adeoye", id: "ENU-1042", phone: "08031002211" },
  { name: "Grace Ilesanmi", id: "ENU-1088", phone: "08145509876" },
  { name: "Kabir Danjuma", id: "ENU-1123", phone: "07066721189" },
  { name: "Rita Onuoha", id: "ENU-1170", phone: "09022114567" },
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

export const customers: CustomerRecord[] = Array.from(
  { length: 52 },
  (_, i) => {
    const en = pick(enumerators, i);
    const status = pick(statuses, i * 3 + 1);
    return {
      id: `cus-${i + 1}`,
      account_number: `AC${(4520011 + i * 137).toString()}`,
      nin: `${(11122233344 + i * 977).toString()}`,
      surname: pick(sur, i).toUpperCase(),
      first_name: pick(first, i * 3),
      other_name: pick(other, i * 5),
      email: `${pick(first, i * 3).toLowerCase()}.${pick(sur, i).toLowerCase()}@mail.com`,
      phone: `080${(31000000 + i * 45311).toString().slice(0, 8)}`,
      customer_type: pick(types, i * 2),
      customer_category: i % 3 === 0 ? "MD" : "Non-MD",
      premise_type: pick(premises, i),
      nature_of_business: i % 4 === 0 ? "Retail trade" : "Residential dwelling",
      status,
      meter_number:
        status === "Pending" ? "" : `4519${(220011 + i * 733).toString()}`,
      meter_type:
        status === "Pending"
          ? "Unmetered"
          : i % 3 === 0
            ? "Postpaid"
            : "Prepaid",
      meter_phase: i % 5 === 0 ? "Three" : "Single",
      tariff: pick(tariffs, i),
      address: `${(i % 40) + 1} ${pick(centers, i)} Road, ${pick(lgas, i)}`,
      city: "Osogbo",
      state: "Osun",
      lga: pick(lgas, i),
      longitude: 4.5 + (i % 20) * 0.011,
      latitude: 7.75 + (i % 17) * 0.009,
      region: "South West",
      business_hub: pick(hubs, i),
      service_center: pick(centers, i),
      service_code: `SC-${100 + (i % 6)}`,
      dss_id: `DSS-${400 + (i % 4)}`,
      dss_name: pick(dss, i),
      feeder_id: `FDR-${20 + (i % 4)}`,
      feeder_name: pick(feeders, i),
      feeder_band: (["A", "B", "C", "D", "E"] as const)[i % 5]!,
      enumerator_name: en.name,
      enumerator_id: en.id,
      enumerator_phone: en.phone,
      remarks:
        status === "Flagged"
          ? "Coordinates outside service area"
          : "Captured on field visit",
      date_created: `2026-0${(i % 8) + 1}-${((i % 27) + 1).toString().padStart(2, "0")}`,
    };
  },
);

export const kpis = [
  {
    label: "Total customers",
    value: "214,806",
    delta: "+1.8% this week",
    tone: "primary" as const,
  },
  {
    label: "Enumerated",
    value: "186,412",
    delta: "86.8% coverage",
    tone: "success" as const,
  },
  {
    label: "Unmetered accounts",
    value: "28,394",
    delta: "13.2% of base",
    tone: "warning" as const,
  },
  {
    label: "Data quality issues",
    value: "4,127",
    delta: "1,204 duplicates",
    tone: "destructive" as const,
  },
];

export const enumerationTrend = [
  { month: "Jan", captured: 9200, verified: 7400 },
  { month: "Feb", captured: 12400, verified: 10100 },
  { month: "Mar", captured: 15600, verified: 13200 },
  { month: "Apr", captured: 14100, verified: 12800 },
  { month: "May", captured: 18800, verified: 16050 },
  { month: "Jun", captured: 21050, verified: 18700 },
  { month: "Jul", captured: 19700, verified: 17900 },
  { month: "Aug", captured: 23400, verified: 20120 },
];

export const feederBandSplit = [
  { band: "Band A", customers: 42100 },
  { band: "Band B", customers: 61350 },
  { band: "Band C", customers: 55980 },
  { band: "Band D", customers: 33220 },
  { band: "Band E", customers: 22156 },
];

export const enumerationBatches = [
  {
    id: "ENB-2041",
    hub: "Osogbo",
    enumerator: "Samuel Adeoye",
    records: 1420,
    status: "In review",
    progress: 74,
    updated: "2h ago",
  },
  {
    id: "ENB-2039",
    hub: "Ede",
    enumerator: "Grace Ilesanmi",
    records: 980,
    status: "Approved",
    progress: 100,
    updated: "1d ago",
  },
  {
    id: "ENB-2036",
    hub: "Ile-Ife",
    enumerator: "Kabir Danjuma",
    records: 1755,
    status: "Field capture",
    progress: 41,
    updated: "4h ago",
  },
  {
    id: "ENB-2033",
    hub: "Ilesa",
    enumerator: "Rita Onuoha",
    records: 640,
    status: "Rejected",
    progress: 88,
    updated: "3d ago",
  },
  {
    id: "ENB-2030",
    hub: "Osogbo",
    enumerator: "Samuel Adeoye",
    records: 2210,
    status: "Approved",
    progress: 100,
    updated: "5d ago",
  },
];

export const networkTree = [
  {
    region: "South West",
    hubs: [
      {
        name: "Osogbo",
        centers: [
          { name: "Ayepe 1", dss: 34, feeders: 6, customers: 18420 },
          { name: "Oke-Fia", dss: 28, feeders: 5, customers: 15230 },
        ],
      },
      {
        name: "Ede",
        centers: [
          { name: "Sabo", dss: 22, feeders: 4, customers: 11870 },
          { name: "Alekuwodo", dss: 19, feeders: 3, customers: 9640 },
        ],
      },
      {
        name: "Ile-Ife",
        centers: [{ name: "Oja-Oba", dss: 31, feeders: 5, customers: 16110 }],
      },
    ],
  },
];

export const importJobs = [
  {
    file: "osun_enumeration_aug.xlsx",
    rows: 42310,
    valid: 40985,
    invalid: 1325,
    status: "Validated",
    when: "Today 09:12",
  },
  {
    file: "ede_hub_batch_7.csv",
    rows: 18740,
    valid: 18740,
    invalid: 0,
    status: "Committed",
    when: "Yesterday 16:40",
  },
  {
    file: "ife_reconcile.xlsx",
    rows: 9880,
    valid: 8100,
    invalid: 1780,
    status: "Failed",
    when: "16 Aug 11:05",
  },
];

export const auditLog = [
  {
    actor: "A. Ogunsanya",
    role: "Data Manager",
    action: "Updated tariff",
    entity: "AC4520148",
    from: "R2SA",
    to: "C1SA",
    when: "10 min ago",
  },
  {
    actor: "S. Adeoye",
    role: "Enumerator",
    action: "Created enumeration",
    entity: "ENB-2041",
    from: "—",
    to: "Draft",
    when: "2h ago",
  },
  {
    actor: "G. Ilesanmi",
    role: "Supervisor",
    action: "Approved batch",
    entity: "ENB-2039",
    from: "In review",
    to: "Approved",
    when: "1d ago",
  },
  {
    actor: "System",
    role: "Import job",
    action: "Committed import",
    entity: "ede_hub_batch_7.csv",
    from: "—",
    to: "18,740 rows",
    when: "1d ago",
  },
  {
    actor: "R. Onuoha",
    role: "Supervisor",
    action: "Rejected batch",
    entity: "ENB-2033",
    from: "In review",
    to: "Rejected",
    when: "3d ago",
  },
];

export const systemUsers = [
  {
    name: "Adaeze Ogunsanya",
    email: "adaeze@utility.ng",
    role: "Super Administrator",
    hub: "All",
    status: "Active",
  },
  {
    name: "Musa Bello",
    email: "musa@utility.ng",
    role: "Data Manager",
    hub: "Osogbo",
    status: "Active",
  },
  {
    name: "Grace Ilesanmi",
    email: "grace@utility.ng",
    role: "Supervisor",
    hub: "Ede",
    status: "Active",
  },
  {
    name: "Samuel Adeoye",
    email: "samuel@utility.ng",
    role: "Enumerator",
    hub: "Osogbo",
    status: "Active",
  },
  {
    name: "Kabir Danjuma",
    email: "kabir@utility.ng",
    role: "Enumerator",
    hub: "Ile-Ife",
    status: "Suspended",
  },
  {
    name: "Tola Bamgbose",
    email: "tola@utility.ng",
    role: "Viewer",
    hub: "Ilesa",
    status: "Active",
  },
];

export const states = ["All states", "Osun", "Oyo", "Ogun", "Ondo"];
export const lgaOptions = ["All LGAs", ...lgas];
export const statusOptions = [
  "All statuses",
  "Active",
  "Pending",
  "Inactive",
  "Flagged",
];
export const feederOptions = ["All feeders", ...feeders];
