import type { StockUnit } from "./Product";

export type BusinessType =
  | "pet_store"
  | "convenience_store"
  | "small_market"
  | "general_store"
  | "other";

export interface BusinessConfig {
  id: number;
  name: string;
  tradeName: string;
  businessType: BusinessType;

  principalStockUnit: StockUnit;
  currency: "BRL";

  fiscalMode: false;
  allowNegativeStock: boolean;
  lowStockAlertsEnabled: boolean;

  city?: string;
  state?: string;
}