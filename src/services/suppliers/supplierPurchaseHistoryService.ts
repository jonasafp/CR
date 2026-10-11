import type {
  SupplierPurchaseHistory,
} from "../../domain/suppliers/SupplierPurchaseHistory";
import { createDefaultPurchaseFilters } from "../../domain/purchases/PurchaseFilters";
import { purchaseService } from "../purchases/purchaseService";

function roundValue(
  value: number,
): number {
  return (
    Math.round(
      (
        value +
        Number.EPSILON
      ) * 100,
    ) / 100
  );
}

async function getBySupplierId(
  supplierId: string | number,
): Promise<
  SupplierPurchaseHistory
> {
  const result = await purchaseService.list({
    ...createDefaultPurchaseFilters(),
    supplierId,
    pageSize: 10_000,
  });

  const purchases =
    result.items
      .sort(
        (
          firstPurchase,
          secondPurchase,
        ) =>
          secondPurchase.purchaseDate.localeCompare(
            firstPurchase.purchaseDate,
          ),
      );

  const completedPurchases =
    purchases.filter(
      (purchase) =>
        purchase.status ===
        "completed",
    );

  const totalCompletedValue =
    roundValue(
      completedPurchases.reduce(
        (
          total,
          purchase,
        ) =>
          total +
          purchase.total,
        0,
      ),
    );

  return {
    supplierId,

    purchases,

    totalPurchases:
      purchases.length,

    pendingPurchases:
      purchases.filter(
        (purchase) =>
          purchase.status ===
          "pending",
      ).length,

    completedPurchases:
      completedPurchases.length,

    cancelledPurchases:
      purchases.filter(
        (purchase) =>
          purchase.status ===
          "cancelled",
      ).length,

    totalCompletedValue,

    averagePurchaseValue:
      completedPurchases.length >
        0
        ? roundValue(
            totalCompletedValue /
            completedPurchases.length,
          )
        : 0,

    lastPurchaseAt:
      purchases[0]
        ?.purchaseDate,
  };
}

export const supplierPurchaseHistoryService = {
  getBySupplierId,
};
