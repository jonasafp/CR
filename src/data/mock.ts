import { businessConfig } from "../config/businessConfig";

import type {
  DashboardData,
  DashboardSummary,
  FinancialSummary,
  StockAlertItem,
  TopSellingProduct,
} from "../types/Dashboard";

import type { Product } from "../types/Product";

import { calculateProductFinancialData } from "../utils/productCalculations";

import {
  isProductLowStock,
  isProductOutOfStock,
} from "../utils/productFilters";

export const products: Product[] = [
  {
    id: 1,
    code: "RAC-001",

    name: "Ração Premium para Cães",
    category: "Rações para cães",

    description:
      "Ração premium para cães adultos de todos os portes.",

    stockQuantity: 320,
    minimumStock: 80,
    soldQuantity: 180,
    stockUnit: "kg",

    purchasePrice: 4.5,
    salePrice: 7.5,

    status: "active",

    createdAt: "2026-06-01T09:00:00",
    updatedAt: "2026-07-15T14:30:00",
  },

  {
    id: 2,
    code: "RAC-002",

    name: "Ração Premium para Gatos",
    category: "Rações para gatos",

    description:
      "Ração completa para gatos adultos castrados.",

    stockQuantity: 120,
    minimumStock: 50,
    soldQuantity: 95,
    stockUnit: "kg",

    purchasePrice: 5.2,
    salePrice: 8.9,

    status: "active",

    createdAt: "2026-06-02T09:00:00",
    updatedAt: "2026-07-15T15:10:00",
  },

  {
    id: 3,
    code: "RAC-003",

    name: "Ração para Filhotes",
    category: "Rações para cães",

    description:
      "Alimento balanceado para cães em fase de crescimento.",

    stockQuantity: 38,
    minimumStock: 60,
    soldQuantity: 82,
    stockUnit: "kg",

    purchasePrice: 4.8,
    salePrice: 8.2,

    status: "active",

    createdAt: "2026-06-03T09:00:00",
    updatedAt: "2026-07-16T08:20:00",
  },

  {
    id: 4,
    code: "RAC-004",

    name: "Ração para Aves",
    category: "Rações para aves",

    description:
      "Mistura de sementes e nutrientes para aves domésticas.",

    stockQuantity: 22,
    minimumStock: 35,
    soldQuantity: 64,
    stockUnit: "kg",

    purchasePrice: 3.6,
    salePrice: 6.4,

    status: "active",

    createdAt: "2026-06-04T09:00:00",
    updatedAt: "2026-07-16T09:00:00",
  },

  {
    id: 5,
    code: "RAC-005",

    name: "Ração para Peixes",
    category: "Rações para peixes",

    description:
      "Alimento granulado para peixes ornamentais.",

    stockQuantity: 0,
    minimumStock: 15,
    soldQuantity: 48,
    stockUnit: "kg",

    purchasePrice: 7.2,
    salePrice: 12.5,

    status: "inactive",

    createdAt: "2026-06-05T09:00:00",
    updatedAt: "2026-07-16T10:15:00",
  },

  {
    id: 6,
    code: "ACE-001",

    name: "Areia Higiênica para Gatos",
    category: "Acessórios",

    description:
      "Areia absorvente para higiene de gatos.",

    stockQuantity: 95,
    minimumStock: 30,
    soldQuantity: 72,
    stockUnit: "pct",

    purchasePrice: 8.5,
    salePrice: 14.9,

    status: "active",

    createdAt: "2026-06-06T09:00:00",
    updatedAt: "2026-07-16T10:40:00",
  },
];

function createDashboardSummary(): DashboardSummary {
  const productsUsingPrincipalUnit = products.filter(
    (product) =>
      product.stockUnit ===
      businessConfig.principalStockUnit,
  );

  const totalStockQuantity =
    productsUsingPrincipalUnit.reduce(
      (total, product) =>
        total + product.stockQuantity,
      0,
    );

  const totalSoldQuantity =
    productsUsingPrincipalUnit.reduce(
      (total, product) =>
        total + product.soldQuantity,
      0,
    );

  const totals = products.reduce(
    (accumulator, product) => {
      const financialData =
        calculateProductFinancialData(product);

      accumulator.totalStockCost +=
        financialData.stockCost;

      accumulator.totalPotentialRevenue +=
        financialData.estimatedRevenue;

      accumulator.totalEstimatedProfit +=
        financialData.estimatedProfit;

      accumulator.realizedRevenue +=
        financialData.realizedRevenue;

      accumulator.realizedCost +=
        financialData.realizedCost;

      accumulator.realizedProfit +=
        financialData.realizedProfit;

      return accumulator;
    },
    {
      totalStockCost: 0,
      totalPotentialRevenue: 0,
      totalEstimatedProfit: 0,

      realizedRevenue: 0,
      realizedCost: 0,
      realizedProfit: 0,
    },
  );

  const averageProfitMargin =
    totals.realizedRevenue > 0
      ? (totals.realizedProfit /
          totals.realizedRevenue) *
        100
      : 0;

  const lowStockProductsCount = products.filter(
    (product) => isProductLowStock(product),
  ).length;

  const outOfStockProductsCount = products.filter(
    (product) => isProductOutOfStock(product),
  ).length;

  return {
    totalProducts: products.length,

    totalStockQuantity,
    principalStockUnit:
      businessConfig.principalStockUnit,

    totalSoldQuantity,

    totalStockCost: totals.totalStockCost,

    totalPotentialRevenue:
      totals.totalPotentialRevenue,

    totalEstimatedProfit:
      totals.totalEstimatedProfit,

    realizedRevenue: totals.realizedRevenue,
    realizedCost: totals.realizedCost,
    realizedProfit: totals.realizedProfit,

    averageProfitMargin,

    lowStockProductsCount,
    outOfStockProductsCount,
  };
}

const dashboardSummary = createDashboardSummary();

const financialSummary: FinancialSummary = {
  revenue: dashboardSummary.realizedRevenue,
  cost: dashboardSummary.realizedCost,
  profit: dashboardSummary.realizedProfit,

  profitMargin:
    dashboardSummary.averageProfitMargin,
};

const lowStockProducts: StockAlertItem[] = products
  .filter(
    (product) =>
      isProductLowStock(product) ||
      isProductOutOfStock(product),
  )
  .map((product) => ({
    productId: product.id,
    name: product.name,

    currentStock: product.stockQuantity,
    minimumStock: product.minimumStock,
    unit: product.stockUnit,

    severity: isProductOutOfStock(product)
      ? "critical"
      : "warning",
  }));

const topSellingProducts: TopSellingProduct[] = [
  ...products,
]
  .sort(
    (firstProduct, secondProduct) =>
      secondProduct.soldQuantity -
      firstProduct.soldQuantity,
  )
  .slice(0, 5)
  .map((product) => {
    const financialData =
      calculateProductFinancialData(product);

    return {
      productId: product.id,
      name: product.name,
      category: product.category,

      quantitySold: product.soldQuantity,
      unit: product.stockUnit,

      revenue: financialData.realizedRevenue,
      profit: financialData.realizedProfit,
    };
  });

const featuredProduct =
  [...products].sort(
    (firstProduct, secondProduct) =>
      secondProduct.soldQuantity -
      firstProduct.soldQuantity,
  )[0] ?? products[0];

if (!featuredProduct) {
  throw new Error(
    "Não foi possível gerar o Dashboard porque não existem produtos cadastrados.",
  );
}

export const dashboardData: DashboardData = {
  summary: dashboardSummary,
  financialSummary,

  featuredProduct,

  lowStockProducts,
  topSellingProducts,
};