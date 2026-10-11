import type {
  Sale,
} from "../sales/Sale";

export interface CustomerSalesHistory {
  customerId: string;

  completedSales:
    Sale[];

  totalPurchases:
    number;

  totalSpent:
    number;

  averageTicket:
    number;

  lastPurchaseAt?:
    string;
}
