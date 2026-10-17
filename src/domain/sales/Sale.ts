import type {
  StockUnit,
} from "../../types/Product";

export type SaleStatus =
  | "completed"
  | "cancelled"
  | "pending";

export type PaymentMethod =
  | "cash"
  | "pix"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "other";

export interface SaleItem {
  id: string;

  productId: string;
  productCode: string;
  productName: string;

  quantity: number;
  unit: StockUnit;

  unitCost: number;
  unitPrice: number;

  grossTotal: number;
  discount: number;
  total: number;

  profit: number;
}

export interface Sale {
  id: string;
  number: string;

  status: SaleStatus;
  paymentMethod: PaymentMethod;

  customerId?: string | number;
  customerName?: string;

  items: SaleItem[];

  subtotal: number;
  discount: number;
  total: number;

  cost: number;
  profit: number;

  notes?: string;

  createdAt: string;
  updatedAt: string;

  completedAt?: string;
  cancelledAt?: string;

  createdBy: string;
  sellerName?: string;
}

export interface SaleCartItem {
  productId: string;
  quantity: number;

  unitPrice: number;
  discount: number;
}

export interface CreateSaleInput {
  paymentMethod: PaymentMethod;

  customerId?: string | number;
  customerName?: string;

  items: SaleCartItem[];

  discount: number;
  notes?: string;
}

export interface CancelSaleInput {
  saleId: string;
  reason: string;
}

export interface SalesSummary {
  totalSales: number;

  completedSales: number;
  cancelledSales: number;
  pendingSales: number;

  grossRevenue: number;
  discounts: number;
  netRevenue: number;

  totalCost: number;
  totalProfit: number;

  averageTicket: number;
}
