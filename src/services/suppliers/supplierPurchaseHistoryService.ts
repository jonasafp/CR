import {
  STORAGE_KEYS,
} from "../../constants/storageKeys";

import {
  initialPurchases,
} from "../../data/purchasesMock";

import type {
  Purchase,
} from "../../domain/purchases/Purchase";

import type {
  SupplierPurchaseHistory,
} from "../../domain/suppliers/SupplierPurchaseHistory";

import {
  readLocalStorage,
} from "../storage/localStorageService";

function delay(
  milliseconds = 200,
): Promise<void> {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

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
  supplierId: number,
): Promise<
  SupplierPurchaseHistory
> {
  await delay();

  const storedPurchases =
    readLocalStorage<
      Purchase[]
    >(
      STORAGE_KEYS.purchases,
      initialPurchases,
    );

  const purchases =
    storedPurchases
      .filter(
        (purchase) =>
          purchase.supplierId ===
          supplierId,
      )
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