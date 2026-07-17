import type {
  Product,
  ProductFinancialData,
} from "../types/Product";

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateProductFinancialData(
  product: Product,
): ProductFinancialData {
  const profitPerUnit =
    product.salePrice - product.purchasePrice;

  const profitMarginPercentage =
    product.salePrice > 0
      ? (profitPerUnit / product.salePrice) * 100
      : 0;

  const totalStockCost =
    product.stockQuantity * product.purchasePrice;

  const totalStockSaleValue =
    product.stockQuantity * product.salePrice;

  const estimatedStockProfit =
    product.stockQuantity * profitPerUnit;

  const realizedRevenue =
    product.soldQuantity * product.salePrice;

  const realizedCost =
    product.soldQuantity * product.purchasePrice;

  const realizedProfit =
    realizedRevenue - realizedCost;

  return {
    profitPerUnit: roundCurrency(profitPerUnit),

    profitMarginPercentage: roundCurrency(
      profitMarginPercentage,
    ),

    totalStockCost: roundCurrency(totalStockCost),

    totalStockSaleValue: roundCurrency(
      totalStockSaleValue,
    ),

    estimatedStockProfit: roundCurrency(
      estimatedStockProfit,
    ),

    realizedRevenue: roundCurrency(realizedRevenue),

    realizedCost: roundCurrency(realizedCost),

    realizedProfit: roundCurrency(realizedProfit),
  };
}