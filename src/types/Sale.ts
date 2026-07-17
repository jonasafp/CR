export type SaleStatus =
  | "completed"
  | "cancelled"
  | "pending";

export type PaymentMethod =
  | "cash"
  | "pix"
  | "debit_card"
  | "credit_card"
  | "bank_transfer"
  | "other";

export interface SaleItem {
  id: number;
  productId: number;
  productName: string;

  quantity: number;
  unit: string;

  purchasePrice: number;
  salePrice: number;

  totalCost: number;
  totalValue: number;
  totalProfit: number;
}

export interface Sale {
  id: number;
  code: string;
  date: string;

  customerName?: string;
  paymentMethod: PaymentMethod;
  status: SaleStatus;

  items: SaleItem[];

  totalCost: number;
  totalValue: number;
  totalProfit: number;
}