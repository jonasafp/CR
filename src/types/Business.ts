import type { StockUnit } from "./Product";

export type BusinessType =
  | "pet_store"
  | "convenience_store"
  | "small_market"
  | "general_store"
  | "bakery"
  | "clothing_store"
  | "other";

export interface BusinessModules {
  dashboard: boolean;
  inventory: boolean;
  products: boolean;
  sales: boolean;
  finance: boolean;
  reports: boolean;
  customers: boolean;
  suppliers: boolean;
  purchases: boolean;
  cashRegister: boolean;
}

export interface BusinessConfig {
  id: number;

  legalName: string;
  tradeName: string;
  shortName: string;

  businessType: BusinessType;

  principalStockUnit: StockUnit;
  currency: "BRL";
  locale: "pt-BR";

  fiscalMode: false;

  allowNegativeStock: boolean;
  lowStockAlertsEnabled: boolean;

  city?: string;
  state?: string;

  modules: BusinessModules;
}