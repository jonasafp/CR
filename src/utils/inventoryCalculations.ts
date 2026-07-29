import type {
  InventoryMovement,
  InventoryMovementFormData,
  InventorySummary,
  ProductInventoryData,
} from "../types/Inventory";

import type { Product } from "../types/Product";

import {
  isProductAvailable,
  isProductLowStock,
  isProductOutOfStock,
} from "./productFilters";

import { calculateProductFinancialData } from "./productCalculations";

export function getProductStockCondition(
  product: Product,
): ProductInventoryData["stockCondition"] {
  if (isProductOutOfStock(product)) {
    return "out";
  }

  if (isProductLowStock(product)) {
    return "low";
  }

  return "available";
}

export function createProductInventoryData(
  product: Product,
): ProductInventoryData {
  const financial =
    calculateProductFinancialData(product);

  return {
    product,

    stockCost: financial.stockCost,
    potentialRevenue:
      financial.estimatedRevenue,
    potentialProfit:
      financial.estimatedProfit,

    stockCondition:
      getProductStockCondition(product),
  };
}

export function createInventorySummary(
  products: Product[],
  movements: InventoryMovement[],
): InventorySummary {
  const productFinancialTotals =
    products.reduce(
      (totals, product) => {
        const financial =
          calculateProductFinancialData(product);

        totals.totalStockCost +=
          financial.stockCost;

        totals.totalPotentialRevenue +=
          financial.estimatedRevenue;

        totals.totalPotentialProfit +=
          financial.estimatedProfit;

        return totals;
      },
      {
        totalStockCost: 0,
        totalPotentialRevenue: 0,
        totalPotentialProfit: 0,
      },
    );

  const totalEntries = movements
    .filter(
      (movement) =>
        movement.type === "entry" ||
        movement.type ===
          "adjustment_positive",
    )
    .reduce(
      (total, movement) =>
        total + movement.quantity,
      0,
    );

  const totalExits = movements
    .filter(
      (movement) =>
        movement.type === "exit" ||
        movement.type ===
          "adjustment_negative",
    )
    .reduce(
      (total, movement) =>
        total + movement.quantity,
      0,
    );

  return {
    totalProducts: products.length,

    availableProducts: products.filter(
      isProductAvailable,
    ).length,

    lowStockProducts: products.filter(
      isProductLowStock,
    ).length,

    outOfStockProducts: products.filter(
      isProductOutOfStock,
    ).length,

    totalStockCost:
      productFinancialTotals.totalStockCost,

    totalPotentialRevenue:
      productFinancialTotals.totalPotentialRevenue,

    totalPotentialProfit:
      productFinancialTotals.totalPotentialProfit,

    totalEntries,
    totalExits,
  };
}

export function isIncomingMovement(
  type: InventoryMovementFormData["type"],
): boolean {
  return (
    type === "entry" ||
    type === "adjustment_positive"
  );
}

export function isOutgoingMovement(
  type: InventoryMovementFormData["type"],
): boolean {
  return (
    type === "exit" ||
    type === "adjustment_negative"
  );
}

export function calculateStockAfterMovement(
  currentStock: number,
  quantity: number,
  type: InventoryMovementFormData["type"],
): number {
  if (isIncomingMovement(type)) {
    return currentStock + quantity;
  }

  return currentStock - quantity;
}

export function applyInventoryMovementToProduct(
  product: Product,
  movement: InventoryMovementFormData,
): Product {
  const nextStock =
    calculateStockAfterMovement(
      product.stockQuantity,
      movement.quantity,
      movement.type,
    );

  return {
    ...product,
    stockQuantity: nextStock,
    updatedAt: new Date().toISOString(),
  };
}