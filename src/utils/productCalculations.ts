import type {
  Product,
  ProductFinancialData,
} from "../types/Product";

function roundValue(value: number): number {
  return Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;
}

export function calculateProductFinancialData(
  product: Product,
): ProductFinancialData {
  const profitPerUnit = roundValue(
    product.salePrice - product.purchasePrice,
  );

  const profitMarginPercentage =
    product.salePrice > 0
      ? roundValue(
          (profitPerUnit / product.salePrice) *
            100,
        )
      : 0;

  const stockCost = roundValue(
    product.stockQuantity *
      product.purchasePrice,
  );

  const estimatedRevenue = roundValue(
    product.stockQuantity * product.salePrice,
  );

  const estimatedProfit = roundValue(
    product.stockQuantity * profitPerUnit,
  );

  const realizedRevenue = roundValue(
    product.soldQuantity * product.salePrice,
  );

  const realizedCost = roundValue(
    product.soldQuantity *
      product.purchasePrice,
  );

  const realizedProfit = roundValue(
    realizedRevenue - realizedCost,
  );

  return {
    profitPerUnit,
    profitMarginPercentage,

    stockCost,
    estimatedRevenue,
    estimatedProfit,

    realizedRevenue,
    realizedCost,
    realizedProfit,
  };
}