import type {
  FinancialPaymentMethod,
  FinancialTransactionSource,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from "../financial/FinancialTransaction";

import type {
  PaymentMethod,
  SaleStatus,
} from "../sales/Sale";

import type {
  InventoryMovementReason,
  InventoryMovementType,
} from "../../types/Inventory";

import type {
  ProductStatus,
  StockUnit,
} from "../../types/Product";

export type ReportType =
  | "sales"
  | "financial"
  | "products"
  | "inventory";

export type ReportGroupBy =
  | "day"
  | "week"
  | "month"
  | "year";

export type ReportExportFormat =
  | "csv"
  | "print"
  | "pdf";

export interface ReportPeriod {
  dateFrom: string;
  dateTo: string;
}

export interface ReportOverview {
  grossRevenue: number;
  discounts: number;
  netRevenue: number;

  totalCost: number;
  totalProfit: number;
  profitMargin: number;

  totalExpense: number;
  financialBalance: number;

  accountsReceivable: number;
  accountsPayable: number;

  totalSales: number;
  completedSales: number;
  cancelledSales: number;

  averageTicket: number;

  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  stockCost: number;
  potentialRevenue: number;

  totalEntries: number;
  totalExits: number;
}

export interface ReportTimeSeriesItem {
  key: string;
  label: string;

  dateFrom: string;
  dateTo: string;

  revenue: number;
  expense: number;
  profit: number;
  balance: number;

  salesCount: number;
  transactionCount: number;
}

export interface ReportCategoryItem {
  category: string;

  quantity: number;

  revenue: number;
  cost: number;
  profit: number;

  percentage: number;
}

export interface ReportPaymentMethodItem {
  paymentMethod:
    | PaymentMethod
    | FinancialPaymentMethod;

  transactionCount: number;

  amount: number;
  percentage: number;
}

export interface SalesReportRow {
  id: number;
  number: string;

  status: SaleStatus;

  paymentMethod:
    PaymentMethod;

  customerName: string;

  itemCount: number;
  totalQuantity: number;

  subtotal: number;
  discount: number;
  total: number;

  cost: number;
  profit: number;
  profitMargin: number;

  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;

  createdBy: string;
}

export interface FinancialReportRow {
  id: number;
  number: string;

  type:
    FinancialTransactionType;

  status:
    FinancialTransactionStatus;

  source:
    FinancialTransactionSource;

  description: string;
  category: string;

  amount: number;

  dueDate: string;
  paymentDate?: string;

  paymentMethod?:
    FinancialPaymentMethod;

  customerOrSupplier?: string;

  saleId?: number;
  saleNumber?: string;

  createdAt: string;
  createdBy: string;
}

export interface ProductReportRow {
  id: number;

  code: string;
  name: string;
  category: string;

  status: ProductStatus;
  unit: StockUnit;

  stockQuantity: number;
  minimumStock: number;
  soldQuantity: number;

  purchasePrice: number;
  salePrice: number;

  stockCost: number;
  potentialRevenue: number;
  potentialProfit: number;

  realizedRevenue: number;
  realizedCost: number;
  realizedProfit: number;
  profitMargin: number;
}

export interface InventoryReportRow {
  id: number;

  productId: number;
  productCode: string;
  productName: string;

  type:
    InventoryMovementType;

  reason:
    InventoryMovementReason;

  quantity: number;
  unit: StockUnit;

  previousStock: number;
  currentStock: number;

  unitCost: number;
  totalValue: number;

  notes?: string;

  createdAt: string;
  createdBy: string;
}

export interface ReportResult<T> {
  reportType: ReportType;

  title: string;
  description: string;

  period: ReportPeriod;
  generatedAt: string;

  overview: ReportOverview;

  timeSeries:
    ReportTimeSeriesItem[];

  categories:
    ReportCategoryItem[];

  paymentMethods:
    ReportPaymentMethodItem[];

  rows: T[];

  page: number;
  pageSize: number;

  totalItems: number;
  totalPages: number;
}

export type SalesReportResult =
  ReportResult<SalesReportRow>;

export type FinancialReportResult =
  ReportResult<FinancialReportRow>;

export type ProductReportResult =
  ReportResult<ProductReportRow>;

export type InventoryReportResult =
  ReportResult<InventoryReportRow>;

export type AnyReportResult =
  | SalesReportResult
  | FinancialReportResult
  | ProductReportResult
  | InventoryReportResult;