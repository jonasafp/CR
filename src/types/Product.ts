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
  | "inactive";

export interface Product {
  id: number;

  code: string;
  barcode?: string;

  name: string;
  description?: string;
  category: string;

  stockUnit: StockUnit;
  stockQuantity: number;
  minimumStock: number;
  soldQuantity: number;

  purchasePrice: number;
  salePrice: number;

  status: ProductStatus;
  image?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFinancialData {
  profitPerUnit: number;
  profitMarginPercentage: number;

  stockCost: number;
  estimatedRevenue: number;
  estimatedProfit: number;

  realizedRevenue: number;
  realizedCost: number;
  realizedProfit: number;
}

export interface ProductFormData {
  code: string;
  barcode: string;

  name: string;
  description: string;
  category: string;

  stockUnit: StockUnit;
  stockQuantity: number;
  minimumStock: number;

  purchasePrice: number;
  salePrice: number;

  status: ProductStatus;
}