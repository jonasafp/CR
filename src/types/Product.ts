export type StockUnit =
  | "kg"
  | "g"
  | "un"
  | "l"
  | "ml"
  | "cx"
  | "pct";

export type ProductStatus =
  | "active"
  | "low_stock"
  | "out_of_stock"
  | "inactive";

export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  description?: string;
  image?: string;

  stockQuantity: number;
  minimumStock: number;
  soldQuantity: number;
  stockUnit: StockUnit;

  purchasePrice: number;
  salePrice: number;

  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFinancialData {
  profitPerUnit: number;
  profitMarginPercentage: number;
  totalStockCost: number;
  totalStockSaleValue: number;
  estimatedStockProfit: number;
  realizedRevenue: number;
  realizedCost: number;
  realizedProfit: number;
}