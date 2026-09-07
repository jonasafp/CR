import type {
  Purchase,
} from "../purchases/Purchase";

export interface SupplierPurchaseHistory {
  supplierId:
    number;

  purchases:
    Purchase[];

  totalPurchases:
    number;

  pendingPurchases:
    number;

  completedPurchases:
    number;

  cancelledPurchases:
    number;

  totalCompletedValue:
    number;

  averagePurchaseValue:
    number;

  lastPurchaseAt?:
    string;
}