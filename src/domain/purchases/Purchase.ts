import type {
  StockUnit,
} from "../../types/Product";

export type PurchaseStatus =
  | "pending"
  | "completed"
  | "cancelled";

export interface PurchaseItem {
  id: number;

  productId: number;
  productCode: string;
  productName: string;

  unit:
    StockUnit;

  quantity: number;
  unitCost: number;

  total: number;
}

export interface Purchase {
  id: number;
  number: string;

  status:
    PurchaseStatus;

  supplierId: number;
  supplierName: string;

  /*
   * Referência interna informada pelo usuário.
   * Não representa emissão ou integração fiscal.
   */
  documentNumber: string;

  purchaseDate: string;

  items:
    PurchaseItem[];

  subtotal: number;
  discount: number;
  freight: number;
  otherExpenses: number;
  total: number;

  notes: string;

  createdAt: string;
  updatedAt: string;

  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  createdBy: string;
}

export interface PurchaseCartItem {
  productId: number;

  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseInput {
  supplierId: number;

  documentNumber?: string;
  purchaseDate: string;

  items:
    PurchaseCartItem[];

  discount?: number;
  freight?: number;
  otherExpenses?: number;

  notes?: string;
}

export interface UpdatePurchaseInput {
  purchaseId: number;

  supplierId: number;

  documentNumber?: string;
  purchaseDate: string;

  items:
    PurchaseCartItem[];

  discount?: number;
  freight?: number;
  otherExpenses?: number;

  notes?: string;
}

export interface CompletePurchaseInput {
  purchaseId: number;
}

export interface CancelPurchaseInput {
  purchaseId: number;
  reason: string;
}

export interface PurchaseSummary {
  totalPurchases: number;

  pendingPurchases: number;
  completedPurchases: number;
  cancelledPurchases: number;

  totalCompletedValue: number;
  averagePurchaseValue: number;
}