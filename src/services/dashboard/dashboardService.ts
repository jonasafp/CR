import { businessConfig } from "../../config/businessConfig";

import type {
    DashboardData,
    DashboardPeriod,
    FinancialSummary,
    StockAlertItem,
    TopSellingProduct,
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

import {
    getDashboardDataByPeriod,
} from "../../data/dashboardAnalytics";

function roundValue(value: number): number {
    return (
        Math.round(
            (value + Number.EPSILON) * 100,
        ) / 100
    );
}

function getPeriodMultiplier(
    period: DashboardPeriod,
): number {
    const multipliers: Record<
        DashboardPeriod,
        number
    > = {
        today: 0.035,
        week: 0.22,
        month: 1,
        year: 10.7,
    };

    return multipliers[period];
}

function createFinancialSummary(
    products: Product[],
    period: DashboardPeriod,
): FinancialSummary {
    const multiplier =
        getPeriodMultiplier(period);

    const totals = products.reduce(
        (accumulator, product) => {
            const financial =
                calculateProductFinancialData(product);

            accumulator.revenue +=
                financial.realizedRevenue;

            accumulator.cost +=
                financial.realizedCost;

            accumulator.profit +=
                financial.realizedProfit;

            return accumulator;
        },
        {
            revenue: 0,
            cost: 0,
            profit: 0,
        },
    );

    const revenue = roundValue(
        totals.revenue * multiplier,
    );

    const cost = roundValue(
        totals.cost * multiplier,
    );

    const profit = roundValue(
        revenue - cost,
    );

    const profitMargin =
        revenue > 0
            ? roundValue(
                (profit / revenue) * 100,
            )
            : 0;

    return {
        revenue,
        cost,
        profit,
        profitMargin,
    };
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

function createTopSellingProducts(
    products: Product[],
    period: DashboardPeriod,
): TopSellingProduct[] {
    const multiplier =
        getPeriodMultiplier(period);

    return [...products]
        .filter(
            (product) =>
                product.status === "active" &&
                product.soldQuantity > 0,
        )
        .sort(
            (firstProduct, secondProduct) =>
                secondProduct.soldQuantity -
                firstProduct.soldQuantity,
        )
        .slice(0, 5)
        .map((product) => {
            const financial =
                calculateProductFinancialData(product);

            return {
                productId: product.id,
                name: product.name,
                category: product.category,

                quantitySold: roundValue(
                    product.soldQuantity *
                    multiplier,
                ),

                unit: product.stockUnit,

                revenue: roundValue(
                    financial.realizedRevenue *
                    multiplier,
                ),

                profit: roundValue(
                    financial.realizedProfit *
                    multiplier,
                ),
            };
        });
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
    period: DashboardPeriod,
): DashboardData | null {
    const featuredProduct =
        getFeaturedProduct(products);

    if (!featuredProduct) {
        return null;
    }

    const periodData =
        getDashboardDataByPeriod(period);

    const financialSummary =
        createFinancialSummary(
            products,
            period,
        );

    const productsWithPrincipalUnit =
        products.filter(
            (product) =>
                product.stockUnit ===
                businessConfig.principalStockUnit,
        );

    const totalStockQuantity =
        productsWithPrincipalUnit.reduce(
            (total, product) =>
                total +
                product.stockQuantity,
            0,
        );

    const totalSoldQuantity =
        productsWithPrincipalUnit.reduce(
            (total, product) =>
                total +
                product.soldQuantity,
            0,
        ) * getPeriodMultiplier(period);

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
                businessConfig.principalStockUnit,

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

        topSellingProducts:
            createTopSellingProducts(
                products,
                period,
            ),

        salesPerformance:
            periodData.salesPerformance,

        categoryPerformance:
            periodData.categoryPerformance,

        variations:
            periodData.variations,

        inventorySummary: {
            totalEntries,
            totalExits,
        },
    };
}