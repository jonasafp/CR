import type {
  Product,
  StockUnit,
} from "./Product";

export type DashboardPeriod =
  | "today"
  | "week"
  | "month"
  | "year";

export type IndicatorColor =
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "red";

export interface DashboardIndicator {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  description: string;
  variation?: number;
  color: IndicatorColor;
}

export interface DashboardSummary {
  totalProducts: number;

  totalStockQuantity: number;
  principalStockUnit: StockUnit;

  totalSoldQuantity: number;

  totalStockCost: number;
  totalPotentialRevenue: number;
  totalEstimatedProfit: number;

  realizedRevenue: number;
  realizedCost: number;
  realizedProfit: number;

  averageProfitMargin: number;
  lowStockProductsCount: number;
  outOfStockProductsCount: number;
}

export interface FinancialSummary {
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
}

export interface StockAlertItem {
  productId: number;
  name: string;
  currentStock: number;
  minimumStock: number;
  unit: StockUnit;
  severity: "warning" | "critical";
}

export interface TopSellingProduct {
  productId: number;
  name: string;
  category: string;
  quantitySold: number;
  unit: StockUnit;
  revenue: number;
  profit: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  financialSummary: FinancialSummary;
  featuredProduct: Product;
  lowStockProducts: StockAlertItem[];
  topSellingProducts: TopSellingProduct[];
}