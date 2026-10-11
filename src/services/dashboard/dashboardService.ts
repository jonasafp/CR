import {
    settingsStorageService,
} from "../settings/settingsStorageService";

import type {
    DashboardData,
    DashboardPeriod,
    StockAlertItem,
} from "../../types/Dashboard";

import type {
    InventoryMovement,
} from "../../types/Inventory";

import type { Product } from "../../types/Product";

import {
    calculateProductFinancialData,
} from "../../utils/productCalculations";

import {
    isProductLowStock,
    isProductOutOfStock,
} from "../../utils/productFilters";

import type { DashboardAnalytics } from "../../repositories/dashboard/SupabaseDashboardRepository";

function roundValue(value: number): number {
    return (
        Math.round(
            (value + Number.EPSILON) * 100,
        ) / 100
    );
}

function createStockAlerts(
    products: Product[],
): StockAlertItem[] {
    return products
        .filter(
            (product) =>
                isProductLowStock(product) ||
                isProductOutOfStock(product),
        )
        .sort((firstProduct, secondProduct) => {
            if (
                isProductOutOfStock(firstProduct) &&
                !isProductOutOfStock(secondProduct)
            ) {
                return -1;
            }

            if (
                !isProductOutOfStock(firstProduct) &&
                isProductOutOfStock(secondProduct)
            ) {
                return 1;
            }

            return (
                firstProduct.stockQuantity -
                secondProduct.stockQuantity
            );
        })
        .map((product) => ({
            productId: product.id,
            name: product.name,

            currentStock:
                product.stockQuantity,

            minimumStock:
                product.minimumStock,

            unit: product.stockUnit,

            severity: isProductOutOfStock(product)
                ? "critical"
                : "warning",
        }));
}

function getFeaturedProduct(
    products: Product[],
): Product | null {
    const activeProducts = products.filter(
        (product) =>
            product.status === "active",
    );

    if (activeProducts.length === 0) {
        return products[0] ?? null;
    }

    return [...activeProducts].sort(
        (firstProduct, secondProduct) =>
            secondProduct.soldQuantity -
            firstProduct.soldQuantity,
    )[0];
}

function countMovementQuantity(
    movements: InventoryMovement[],
    movementTypes: InventoryMovement["type"][],
): number {
    return movements
        .filter((movement) =>
            movementTypes.includes(
                movement.type,
            ),
        )
        .reduce(
            (total, movement) =>
                total + movement.quantity,
            0,
        );
}

export function createDashboardData(
    products: Product[],
    movements: InventoryMovement[],
    _period: DashboardPeriod,
    analytics?: DashboardAnalytics,
): DashboardData | null {
    const principalStockUnit =
        settingsStorageService
            .read()
            .general
            .principalStockUnit;

    const featuredProduct =
        getFeaturedProduct(products);

    if (!featuredProduct) {
        return null;
    }

    const financialSummary = analytics?.financialSummary ?? { revenue: 0, cost: 0, profit: 0, profitMargin: 0 };

    const productsWithPrincipalUnit =
        products.filter(
            (product) =>
                product.stockUnit ===
                principalStockUnit,
        );

    const totalStockQuantity =
        productsWithPrincipalUnit.reduce(
            (total, product) =>
                total +
                product.stockQuantity,
            0,
        );

    const totalSoldQuantity = analytics?.totalSoldQuantity ?? 0;

    const totalStockCost = products.reduce(
        (total, product) => {
            const financial =
                calculateProductFinancialData(product);

            return total + financial.stockCost;
        },
        0,
    );

    const totalPotentialRevenue =
        products.reduce(
            (total, product) => {
                const financial =
                    calculateProductFinancialData(product);

                return (
                    total +
                    financial.estimatedRevenue
                );
            },
            0,
        );

    const totalEstimatedProfit =
        products.reduce(
            (total, product) => {
                const financial =
                    calculateProductFinancialData(product);

                return (
                    total +
                    financial.estimatedProfit
                );
            },
            0,
        );

    const lowStockProducts =
        createStockAlerts(products);

    const lowStockProductsCount =
        products.filter(
            isProductLowStock,
        ).length;

    const outOfStockProductsCount =
        products.filter(
            isProductOutOfStock,
        ).length;

    const totalEntries =
        countMovementQuantity(
            movements,
            [
                "entry",
                "adjustment_positive",
            ],
        );

    const totalExits =
        countMovementQuantity(
            movements,
            [
                "exit",
                "adjustment_negative",
            ],
        );

    return {
        summary: {
            totalProducts: products.length,

            totalStockQuantity:
                roundValue(
                    totalStockQuantity,
                ),

            principalStockUnit:
                principalStockUnit,

            totalSoldQuantity:
                roundValue(
                    totalSoldQuantity,
                ),

            totalStockCost:
                roundValue(totalStockCost),

            totalPotentialRevenue:
                roundValue(
                    totalPotentialRevenue,
                ),

            totalEstimatedProfit:
                roundValue(
                    totalEstimatedProfit,
                ),

            realizedRevenue:
                financialSummary.revenue,

            realizedCost:
                financialSummary.cost,

            realizedProfit:
                financialSummary.profit,

            averageProfitMargin:
                financialSummary.profitMargin,

            lowStockProductsCount,
            outOfStockProductsCount,
        },

        financialSummary,

        featuredProduct,

        lowStockProducts,

        topSellingProducts: analytics?.topSellingProducts ?? [],

        salesPerformance:
            analytics?.salesPerformance ?? [],

        categoryPerformance:
            analytics?.categoryPerformance ?? [],

        variations:
            analytics?.variations,

        inventorySummary: {
            totalEntries,
            totalExits,
        },
    };
}
