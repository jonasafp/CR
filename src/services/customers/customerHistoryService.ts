import type { CustomerSalesHistory } from "../../domain/customers/CustomerSalesHistory";
import { defaultSaleFilters } from "../../domain/sales/SaleFilters";
import { salesService } from "../sales/salesService";

function roundValue(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

async function getByCustomerId(customerId: string): Promise<CustomerSalesHistory> {
  const result = await salesService.list({
    ...defaultSaleFilters,
    status: "completed",
    page: 1,
    pageSize: 100_000,
  });

  const completedSales = result.items
    .filter((sale) => sale.customerId === customerId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));

  const totalSpent = roundValue(
    completedSales.reduce((total, sale) => total + sale.total, 0),
  );
  const totalPurchases = completedSales.length;

  return {
    customerId,
    completedSales,
    totalPurchases,
    totalSpent,
    averageTicket: totalPurchases > 0
      ? roundValue(totalSpent / totalPurchases)
      : 0,
    lastPurchaseAt: completedSales[0]?.createdAt,
  };
}

export const customerHistoryService = { getByCustomerId };
