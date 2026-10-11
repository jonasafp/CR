import type {
  StockUnit,
} from "../../types/Product";

export type PurchaseStatus =
  | "pending"
  | "completed"
  | "cancelled";

export interface PurchaseItem {
  id: string | number;

  productId: string;
  productCode: string;
  productName: string;

  unit:
    StockUnit;

  quantity: number;
  unitCost: number;

  total: number;
}

export interface Purchase {
  id: string | number;
  number: string;

  status:
    PurchaseStatus;

  supplierId: string | number;
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
  productId: string;

  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseInput {
  supplierId: string | number;

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
  purchaseId: string | number;

  supplierId: string | number;

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
  purchaseId: string | number;
}

export interface CancelPurchaseInput {
  purchaseId: string | number;
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
