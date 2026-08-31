import {
  STORAGE_KEYS,
} from "../../constants/storageKeys";

import {
  initialSales,
} from "../../data/salesMock";

import type {
  CustomerSalesHistory,
} from "../../domain/customers/CustomerSalesHistory";

import type {
  Sale,
} from "../../domain/sales/Sale";

import {
  readLocalStorage,
} from "../storage/localStorageService";

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

async function getByCustomerId(
  customerId: number,
): Promise<CustomerSalesHistory> {
  await new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        200,
      );
    },
  );

  const sales =
    readLocalStorage<Sale[]>(
      STORAGE_KEYS.sales,
      initialSales,
    );

  const completedSales =
    sales
      .filter(
        (sale) =>
          sale.customerId ===
            customerId &&
          sale.status ===
            "completed",
      )
      .sort(
        (
          firstSale,
          secondSale,
        ) =>
          secondSale.createdAt.localeCompare(
            firstSale.createdAt,
          ),
      );

  const totalSpent =
    roundValue(
      completedSales.reduce(
        (
          total,
          sale,
        ) =>
          total +
          sale.total,
        0,
      ),
    );

  const totalPurchases =
    completedSales.length;

  return {
    customerId,

    completedSales,

    totalPurchases,

    totalSpent,

    averageTicket:
      totalPurchases > 0
        ? roundValue(
            totalSpent /
            totalPurchases,
          )
        : 0,

    lastPurchaseAt:
      completedSales[0]
        ?.createdAt,
  };
}

export const customerHistoryService = {
  getByCustomerId,
};