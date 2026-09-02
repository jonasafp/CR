import type {
  Product,
  StockUnit,
} from "./Product";

export type InventoryMovementType =
  | "entry"
  | "exit"
  | "adjustment_positive"
  | "adjustment_negative";

export type InventoryMovementReason =
  | "purchase"
  | "sale"
  | "manual_adjustment"
  | "loss"
  | "damage"
  | "expiration"
  | "return"
  | "initial_balance"
  | "other";

export interface InventoryMovement {
  id: number;

  productId: number;
  productName: string;
  productCode: string;

  type: InventoryMovementType;
  reason: InventoryMovementReason;

  quantity: number;
  unit: StockUnit;

  previousStock: number;
  currentStock: number;

  unitCost: number;
  totalValue: number;

  notes?: string;

  saleId?: number;
  saleNumber?: string;

  purchaseId?: number;
  purchaseNumber?: string;

  createdAt: string;
  createdBy: string;
}

export interface InventoryMovementFormData {
  productId: number | null;

  type: InventoryMovementType;
  reason: InventoryMovementReason;

  quantity: number;
  unitCost: number;

  notes: string;
}

export type InventoryStockFilter =
  | "all"
  | "available"
  | "low"
  | "out";

export type InventoryMovementFilter =
  | "all"
  | InventoryMovementType;

export interface InventoryFiltersState {
  search: string;
  stock: InventoryStockFilter;
  movementType: InventoryMovementFilter;
}

export interface InventorySummary {
  totalProducts: number;
  availableProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  totalStockCost: number;
  totalPotentialRevenue: number;
  totalPotentialProfit: number;

  totalEntries: number;
  totalExits: number;
}

export interface ProductInventoryData {
  product: Product;

  stockCost: number;
  potentialRevenue: number;
  potentialProfit: number;

  stockCondition:
  | "available"
  | "low"
  | "out";
}