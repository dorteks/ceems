export const CustomerType = {
  PREPAID: "PREPAID",
  POSTPAID: "POSTPAID",
} as const;
export type CustomerTypeValue =
  (typeof CustomerType)[keyof typeof CustomerType];

export const CustomerCategory = {
  MD1: "MD1",
  MD2: "MD2",
  NMD: "NMD",
} as const;
export type CustomerCategoryValue =
  (typeof CustomerCategory)[keyof typeof CustomerCategory];

export const PremiseType = {
  RESIDENTIAL: "RESIDENTIAL",
  COMMERCIAL: "COMMERCIAL",
  INDUSTRIAL: "INDUSTRIAL",
  GOVERNMENT: "GOVERNMENT",
} as const;
export type PremiseTypeValue = (typeof PremiseType)[keyof typeof PremiseType];

export const MeterType = {
  LONGI: "LONGI",
  MOJEC: "MOJEC",
  MOMAS: "MOMAS",
  PROTOGY: "PROTOGY",
  HEXIN: "HEXIN",
  IRL: "IRL",
  NSTS: "NSTS",
  POSTPAID: "POSTPAID",
  TC_AND_P: "TC_AND_P",
  HOLLEY: "HOLLEY",
  NEW_HAMPSHIRE: "NEW_HAMPSHIRE",
} as const;
export type MeterTypeValue = (typeof MeterType)[keyof typeof MeterType];

export const MeterPhase = {
  Q1: "Q1",
  Q3: "Q3",
  WHOLE_CURRENT: "WHOLE_CURRENT",
  LVMD: "LVMD",
  HVMD: "HVMD",
} as const;
export type MeterPhaseValue = (typeof MeterPhase)[keyof typeof MeterPhase];

export const ServiceCenter = {
  AYEPE_1: "AYEPE_1",
  AYEPE_2: "AYEPE_2",
  AYETORO: "AYETORO",
  GRA: "GRA",
  KELEBE_1: "KELEBE_1",
  KELEBE_2: "KELEBE_2",
  OGO_OLUWA: "OGO_OLUWA",
  OKE_FIA: "OKE_FIA",
  OKEFIA: "OKEFIA",
  OSOGBO_1: "OSOGBO_1",
  OSOGBO_2: "OSOGBO_2",
  OTA_EFUN: "OTA_EFUN",
} as const;
export type ServiceCenterValue =
  (typeof ServiceCenter)[keyof typeof ServiceCenter];

export const Status = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  DISCONNECTED: "DISCONNECTED",
} as const;
export type StatusValue = (typeof Status)[keyof typeof Status];
