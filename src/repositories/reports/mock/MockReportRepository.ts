import {
  STORAGE_KEYS,
} from "../../../constants/storageKeys";

import {
  initialFinancialTransactions,
} from "../../../data/financialMock";

import {
  initialInventoryMovements,
} from "../../../data/inventoryMock";

import {
  products as initialProducts,
} from "../../../data/mock";

import {
  initialSales,
} from "../../../data/salesMock";

import type {
  FinancialTransaction,
} from "../../../domain/financial/FinancialTransaction";

import {
  isFinancialTransactionOverdue,
} from "../../../domain/financial/FinancialTransaction";

import type {
  Sale,
} from "../../../domain/sales/Sale";

import type {
  AnyReportResult,
  FinancialReportRow,
  InventoryReportRow,
  ProductReportRow,
  ReportCategoryItem,
  ReportOverview,
  ReportPaymentMethodItem,
  ReportResult,
  ReportTimeSeriesItem,
  SalesReportRow,
} from "../../../domain/reports/Report";

import type {
  ReportFilters,
} from "../../../domain/reports/ReportFilters";

import {
  readLocalStorage,
} from "../../../services/storage/localStorageService";

import type {
  InventoryMovement,
} from "../../../types/Inventory";

import type {
  Product,
} from "../../../types/Product";

import {
  calculateProductFinancialData,
} from "../../../utils/productCalculations";

import {
  isProductLowStock,
  isProductOutOfStock,
} from "../../../utils/productFilters";

import type {
  ReportFilterOptions,
  ReportRepository,
} from "../ReportRepository";

const MOCK_DELAY = 350;

function wait(
  milliseconds = MOCK_DELAY,
): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(
      resolve,
      milliseconds,
    );
  });
}

function roundValue(
  value: number,
): number {
  return (
    Math.round(
      (value + Number.EPSILON) *
      100,
    ) / 100
  );
}

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function getDatePart(
  value?: string,
): string {
  return value?.slice(0, 10) ?? "";
}

function isDateInPeriod(
  date: string,
  filters: ReportFilters,
): boolean {
  return (
    date >= filters.dateFrom &&
    date <= filters.dateTo
  );
}

function readProducts(): Product[] {
  return readLocalStorage<Product[]>(
    STORAGE_KEYS.products,
    initialProducts,
  );
}

function readSales(): Sale[] {
  return readLocalStorage<Sale[]>(
    STORAGE_KEYS.sales,
    initialSales,
  );
}

function readFinancialTransactions():
  FinancialTransaction[] {
  return readLocalStorage<
    FinancialTransaction[]
  >(
    STORAGE_KEYS.financialTransactions,
    initialFinancialTransactions,
  );
}

function readInventoryMovements():
  InventoryMovement[] {
  return readLocalStorage<
    InventoryMovement[]
  >(
    STORAGE_KEYS.inventoryMovements,
    initialInventoryMovements,
  );
}

function getSaleDate(
  sale: Sale,
): string {
  return getDatePart(
    sale.completedAt ??
    sale.cancelledAt ??
    sale.createdAt,
  );
}

function getFinancialDate(
  transaction:
    FinancialTransaction,
): string {
  return (
    transaction.paymentDate ??
    transaction.dueDate ??
    getDatePart(
      transaction.createdAt,
    )
  );
}

function filterSales(
  sales: Sale[],
  products: Product[],
  filters: ReportFilters,
): Sale[] {
  const search =
    normalizeText(filters.search);

  const productCategoryById =
    new Map(
      products.map((product) => [
        product.id,
        product.category,
      ]),
    );

  return sales.filter((sale) => {
    if (
      !filters
        .includeCancelledRecords &&
      sale.status === "cancelled"
    ) {
      return false;
    }

    if (
      !isDateInPeriod(
        getSaleDate(sale),
        filters,
      )
    ) {
      return false;
    }

    if (
      filters.saleStatus !==
      "all" &&
      sale.status !==
      filters.saleStatus
    ) {
      return false;
    }

    if (
      filters.paymentMethod !==
      "all" &&
      sale.paymentMethod !==
      filters.paymentMethod
    ) {
      return false;
    }

    if (
      filters.productId !== null &&
      !sale.items.some(
        (item) =>
          item.productId ===
          filters.productId,
      )
    ) {
      return false;
    }

    if (
      filters.category !==
      "all" &&
      !sale.items.some(
        (item) =>
          productCategoryById.get(
            item.productId,
          ) === filters.category,
      )
    ) {
      return false;
    }

    if (!search) {
      return true;
    }

    const searchableValue =
      normalizeText(
        [
          sale.number,
          sale.customerName ?? "",
          sale.createdBy,

          ...sale.items.map(
            (item) =>
              `${item.productCode} ${item.productName}`,
          ),
        ].join(" "),
      );

    return searchableValue.includes(
      search,
    );
  });
}

function filterFinancialTransactions(
  transactions:
    FinancialTransaction[],
  filters: ReportFilters,
): FinancialTransaction[] {
  const search =
    normalizeText(filters.search);

  return transactions.filter(
    (transaction) => {
      if (
        !filters
          .includeCancelledRecords &&
        transaction.status ===
        "cancelled"
      ) {
        return false;
      }

      if (
        !isDateInPeriod(
          getFinancialDate(
            transaction,
          ),
          filters,
        )
      ) {
        return false;
      }

      if (
        filters.financialType !==
        "all" &&
        transaction.type !==
        filters.financialType
      ) {
        return false;
      }

      if (
        filters.financialSource !==
        "all" &&
        transaction.source !==
        filters.financialSource
      ) {
        return false;
      }

      if (
        filters.category !==
        "all" &&
        transaction.category !==
        filters.category
      ) {
        return false;
      }

      if (
        filters.financialStatus ===
        "overdue"
      ) {
        if (
          !isFinancialTransactionOverdue(
            transaction,
          )
        ) {
          return false;
        }
      } else if (
        filters.financialStatus !==
        "all" &&
        transaction.status !==
        filters.financialStatus
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      return normalizeText(
        [
          transaction.number,
          transaction.description,
          transaction.category,

          transaction
            .customerOrSupplier ??
          "",

          transaction.saleNumber ??
          "",
        ].join(" "),
      ).includes(search);
    },
  );
}

function filterProducts(
  products: Product[],
  filters: ReportFilters,
): Product[] {
  const search =
    normalizeText(filters.search);

  return products.filter(
    (product) => {
      if (
        filters.productId !==
        null &&
        product.id !==
        filters.productId
      ) {
        return false;
      }

      if (
        filters.category !==
        "all" &&
        product.category !==
        filters.category
      ) {
        return false;
      }

      if (
        filters.productStatus !==
        "all" &&
        product.status !==
        filters.productStatus
      ) {
        return false;
      }

      if (
        filters.stockCondition ===
        "available" &&
        (
          isProductLowStock(
            product,
          ) ||
          isProductOutOfStock(
            product,
          )
        )
      ) {
        return false;
      }

      if (
        filters.stockCondition ===
        "low" &&
        !isProductLowStock(
          product,
        )
      ) {
        return false;
      }

      if (
        filters.stockCondition ===
        "out" &&
        !isProductOutOfStock(
          product,
        )
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      return normalizeText(
        `${product.code} ${product.name} ${product.category} ${product.barcode ?? ""}`,
      ).includes(search);
    },
  );
}

function filterInventoryMovements(
  movements:
    InventoryMovement[],
  products: Product[],
  filters: ReportFilters,
): InventoryMovement[] {
  const search =
    normalizeText(filters.search);

  const productCategoryById =
    new Map(
      products.map((product) => [
        product.id,
        product.category,
      ]),
    );

  return movements.filter(
    (movement) => {
      if (
        !isDateInPeriod(
          getDatePart(
            movement.createdAt,
          ),
          filters,
        )
      ) {
        return false;
      }

      if (
        filters.productId !==
        null &&
        movement.productId !==
        filters.productId
      ) {
        return false;
      }

      if (
        filters.category !==
        "all" &&
        productCategoryById.get(
          movement.productId,
        ) !== filters.category
      ) {
        return false;
      }

      if (
        filters
          .inventoryMovementType !==
        "all" &&
        movement.type !==
        filters
          .inventoryMovementType
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      return normalizeText(
        `${movement.productCode} ${movement.productName} ${movement.notes ?? ""}`,
      ).includes(search);
    },
  );
}

function createOverview(
  sales: Sale[],
  transactions:
    FinancialTransaction[],
  products: Product[],
  movements:
    InventoryMovement[],
): ReportOverview {
  const completedSales =
    sales.filter(
      (sale) =>
        sale.status ===
        "completed",
    );

  const cancelledSales =
    sales.filter(
      (sale) =>
        sale.status ===
        "cancelled",
    );

  const grossRevenue =
    roundValue(
      completedSales.reduce(
        (total, sale) =>
          total + sale.subtotal,
        0,
      ),
    );

  const discounts =
    roundValue(
      completedSales.reduce(
        (total, sale) =>
          total + sale.discount,
        0,
      ),
    );

  const netRevenue =
    roundValue(
      completedSales.reduce(
        (total, sale) =>
          total + sale.total,
        0,
      ),
    );

  const totalCost =
    roundValue(
      completedSales.reduce(
        (total, sale) =>
          total + sale.cost,
        0,
      ),
    );

  const totalProfit =
    roundValue(
      completedSales.reduce(
        (total, sale) =>
          total + sale.profit,
        0,
      ),
    );

  const totalIncome =
    roundValue(
      transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "income" &&
            transaction.status ===
            "received",
        )
        .reduce(
          (
            total,
            transaction,
          ) =>
            total +
            transaction.amount,
          0,
        ),
    );

  const totalExpense =
    roundValue(
      transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "expense" &&
            transaction.status ===
            "paid",
        )
        .reduce(
          (
            total,
            transaction,
          ) =>
            total +
            transaction.amount,
          0,
        ),
    );

  const accountsReceivable =
    roundValue(
      transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "income" &&
            transaction.status ===
            "pending",
        )
        .reduce(
          (
            total,
            transaction,
          ) =>
            total +
            transaction.amount,
          0,
        ),
    );

  const accountsPayable =
    roundValue(
      transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "expense" &&
            transaction.status ===
            "pending",
        )
        .reduce(
          (
            total,
            transaction,
          ) =>
            total +
            transaction.amount,
          0,
        ),
    );

  const stockTotals =
    products.reduce(
      (
        totals,
        product,
      ) => {
        const financial =
          calculateProductFinancialData(
            product,
          );

        totals.cost +=
          financial.stockCost;

        totals.revenue +=
          financial.estimatedRevenue;

        return totals;
      },
      {
        cost: 0,
        revenue: 0,
      },
    );

  const totalEntries =
    roundValue(
      movements
        .filter(
          (movement) =>
            movement.type ===
            "entry" ||
            movement.type ===
            "adjustment_positive",
        )
        .reduce(
          (total, movement) =>
            total +
            movement.quantity,
          0,
        ),
    );

  const totalExits =
    roundValue(
      movements
        .filter(
          (movement) =>
            movement.type ===
            "exit" ||
            movement.type ===
            "adjustment_negative",
        )
        .reduce(
          (total, movement) =>
            total +
            movement.quantity,
          0,
        ),
    );

  return {
    grossRevenue,
    discounts,
    netRevenue,

    totalCost,
    totalProfit,

    profitMargin:
      netRevenue > 0
        ? roundValue(
          (
            totalProfit /
            netRevenue
          ) * 100,
        )
        : 0,

    totalExpense,

    financialBalance:
      roundValue(
        totalIncome -
        totalExpense,
      ),

    accountsReceivable,
    accountsPayable,

    totalSales: sales.length,

    completedSales:
      completedSales.length,

    cancelledSales:
      cancelledSales.length,

    averageTicket:
      completedSales.length > 0
        ? roundValue(
          netRevenue /
          completedSales.length,
        )
        : 0,

    totalProducts:
      products.length,

    lowStockProducts:
      products.filter(
        isProductLowStock,
      ).length,

    outOfStockProducts:
      products.filter(
        isProductOutOfStock,
      ).length,

    stockCost:
      roundValue(
        stockTotals.cost,
      ),

    potentialRevenue:
      roundValue(
        stockTotals.revenue,
      ),

    totalEntries,
    totalExits,
  };
}

function createSalesRows(
  sales: Sale[],
): SalesReportRow[] {
  return sales.map((sale) => ({
    id: sale.id,
    number: sale.number,

    status: sale.status,

    paymentMethod:
      sale.paymentMethod,

    customerName:
      sale.customerName?.trim() ||
      "Cliente balcão",

    itemCount:
      sale.items.length,

    totalQuantity:
      roundValue(
        sale.items.reduce(
          (total, item) =>
            total +
            item.quantity,
          0,
        ),
      ),

    subtotal: sale.subtotal,
    discount: sale.discount,
    total: sale.total,

    cost: sale.cost,
    profit: sale.profit,

    profitMargin:
      sale.total > 0
        ? roundValue(
          (
            sale.profit /
            sale.total
          ) * 100,
        )
        : 0,

    createdAt:
      sale.createdAt,

    completedAt:
      sale.completedAt,

    cancelledAt:
      sale.cancelledAt,

    createdBy:
      sale.createdBy,
  }));
}

function createFinancialRows(
  transactions:
    FinancialTransaction[],
): FinancialReportRow[] {
  return transactions.map(
    (transaction) => ({
      id: transaction.id,
      number:
        transaction.number,

      type: transaction.type,
      status:
        transaction.status,
      source:
        transaction.source,

      description:
        transaction.description,

      category:
        transaction.category,

      amount:
        transaction.amount,

      dueDate:
        transaction.dueDate,

      paymentDate:
        transaction.paymentDate,

      paymentMethod:
        transaction.paymentMethod,

      customerOrSupplier:
        transaction
          .customerOrSupplier,

      saleId:
        transaction.saleId,

      saleNumber:
        transaction.saleNumber,

      createdAt:
        transaction.createdAt,

      createdBy:
        transaction.createdBy,
    }),
  );
}

function createProductRows(
  products: Product[],
): ProductReportRow[] {
  return products.map(
    (product) => {
      const financial =
        calculateProductFinancialData(
          product,
        );

      return {
        id: product.id,
        code: product.code,
        name: product.name,
        category:
          product.category,

        status:
          product.status,

        unit:
          product.stockUnit,

        stockQuantity:
          product.stockQuantity,

        minimumStock:
          product.minimumStock,

        soldQuantity:
          product.soldQuantity,

        purchasePrice:
          product.purchasePrice,

        salePrice:
          product.salePrice,

        stockCost:
          financial.stockCost,

        potentialRevenue:
          financial
            .estimatedRevenue,

        potentialProfit:
          financial
            .estimatedProfit,

        realizedRevenue:
          financial
            .realizedRevenue,

        realizedCost:
          financial
            .realizedCost,

        realizedProfit:
          financial
            .realizedProfit,

        profitMargin:
          financial
            .profitMarginPercentage,
      };
    },
  );
}

function createInventoryRows(
  movements:
    InventoryMovement[],
): InventoryReportRow[] {
  return movements.map(
    (movement) => ({
      id: movement.id,

      productId:
        movement.productId,

      productCode:
        movement.productCode,

      productName:
        movement.productName,

      type: movement.type,
      reason: movement.reason,

      quantity:
        movement.quantity,

      unit: movement.unit,

      previousStock:
        movement.previousStock,

      currentStock:
        movement.currentStock,

      unitCost:
        movement.unitCost,

      totalValue:
        movement.totalValue,

      notes: movement.notes,

      createdAt:
        movement.createdAt,

      createdBy:
        movement.createdBy,
    }),
  );
}

interface SeriesValues {
  revenue: number;
  expense: number;
  profit: number;

  salesCount: number;
  transactionCount: number;
}

function formatShortDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
    },
  ).format(date);
}

function getSeriesBucket(
  dateValue: string,
  filters: ReportFilters,
) {
  const date =
    new Date(
      `${dateValue}T00:00:00Z`,
    );

  const startDate =
    new Date(date);

  const endDate =
    new Date(date);

  if (
    filters.groupBy ===
    "week"
  ) {
    const currentDay =
      startDate.getUTCDay();

    const daysSinceMonday =
      currentDay === 0
        ? 6
        : currentDay - 1;

    startDate.setUTCDate(
      startDate.getUTCDate() -
      daysSinceMonday,
    );

    endDate.setTime(
      startDate.getTime(),
    );

    endDate.setUTCDate(
      endDate.getUTCDate() + 6,
    );
  } else if (
    filters.groupBy ===
    "month"
  ) {
    startDate.setUTCDate(1);

    endDate.setUTCMonth(
      endDate.getUTCMonth() + 1,
      0,
    );
  } else if (
    filters.groupBy ===
    "year"
  ) {
    startDate.setUTCMonth(
      0,
      1,
    );

    endDate.setUTCMonth(
      11,
      31,
    );
  }

  const dateFrom =
    startDate
      .toISOString()
      .slice(0, 10);

  const dateTo =
    endDate
      .toISOString()
      .slice(0, 10);

  let label =
    formatShortDate(
      startDate,
    );

  if (
    filters.groupBy ===
    "week"
  ) {
    label = `${formatShortDate(
      startDate,
    )} a ${formatShortDate(
      endDate,
    )}`;
  } else if (
    filters.groupBy ===
    "month"
  ) {
    label =
      new Intl.DateTimeFormat(
        "pt-BR",
        {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        },
      ).format(startDate);
  } else if (
    filters.groupBy ===
    "year"
  ) {
    label = String(
      startDate.getUTCFullYear(),
    );
  }

  return {
    key: dateFrom,
    label,
    dateFrom,
    dateTo,
  };
}

function createTimeSeries(
  sales: Sale[],
  transactions:
    FinancialTransaction[],
  filters: ReportFilters,
): ReportTimeSeriesItem[] {
  const seriesMap =
    new Map<
      string,
      ReturnType<
        typeof getSeriesBucket
      > &
      SeriesValues
    >();

  function addValue(
    date: string,
    values:
      Partial<SeriesValues>,
  ) {
    const bucket =
      getSeriesBucket(
        date,
        filters,
      );

    const current =
      seriesMap.get(
        bucket.key,
      ) ?? {
        ...bucket,

        revenue: 0,
        expense: 0,
        profit: 0,

        salesCount: 0,
        transactionCount: 0,
      };

    current.revenue +=
      values.revenue ?? 0;

    current.expense +=
      values.expense ?? 0;

    current.profit +=
      values.profit ?? 0;

    current.salesCount +=
      values.salesCount ?? 0;

    current.transactionCount +=
      values.transactionCount ??
      0;

    seriesMap.set(
      bucket.key,
      current,
    );
  }

  if (
    filters.reportType ===
    "sales"
  ) {
    sales
      .filter(
        (sale) =>
          sale.status ===
          "completed",
      )
      .forEach((sale) => {
        addValue(
          getSaleDate(sale),
          {
            revenue:
              sale.total,

            profit:
              sale.profit,

            salesCount: 1,
          },
        );
      });
  } else if (
    filters.reportType ===
    "financial"
  ) {
    transactions
      .filter(
        (transaction) =>
          transaction.status !==
          "cancelled",
      )
      .forEach(
        (transaction) => {
          addValue(
            getFinancialDate(
              transaction,
            ),
            {
              revenue:
                transaction.type ===
                  "income" &&
                  transaction.status ===
                  "received"
                  ? transaction.amount
                  : 0,

              expense:
                transaction.type ===
                  "expense" &&
                  transaction.status ===
                  "paid"
                  ? transaction.amount
                  : 0,

              transactionCount: 1,
            },
          );
        },
      );
  }

  return Array.from(
    seriesMap.values(),
  )
    .sort(
      (first, second) =>
        first.key.localeCompare(
          second.key,
        ),
    )
    .map((item) => ({
      ...item,

      revenue:
        roundValue(
          item.revenue,
        ),

      expense:
        roundValue(
          item.expense,
        ),

      profit:
        roundValue(
          item.profit,
        ),

      balance:
        roundValue(
          item.revenue -
          item.expense,
        ),
    }));
}

function createCategorySummary(
  sales: Sale[],
  transactions:
    FinancialTransaction[],
  products: Product[],
  movements:
    InventoryMovement[],
  filters: ReportFilters,
): ReportCategoryItem[] {
  const categoryMap =
    new Map<
      string,
      Omit<
        ReportCategoryItem,
        "percentage"
      >
    >();

  const productById =
    new Map(
      products.map(
        (product) => [
          product.id,
          product,
        ],
      ),
    );

  function addCategory(
    category: string,
    values: {
      quantity?: number;
      revenue?: number;
      cost?: number;
      profit?: number;
    },
  ) {
    const current =
      categoryMap.get(
        category,
      ) ?? {
        category,

        quantity: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      };

    current.quantity +=
      values.quantity ?? 0;

    current.revenue +=
      values.revenue ?? 0;

    current.cost +=
      values.cost ?? 0;

    current.profit +=
      values.profit ?? 0;

    categoryMap.set(
      category,
      current,
    );
  }

  if (
    filters.reportType ===
    "sales"
  ) {
    sales
      .filter(
        (sale) =>
          sale.status ===
          "completed",
      )
      .forEach((sale) => {
        sale.items.forEach(
          (item) => {
            const category =
              productById.get(
                item.productId,
              )?.category ??
              "Sem categoria";

            addCategory(
              category,
              {
                quantity:
                  item.quantity,

                revenue:
                  item.total,

                cost:
                  item.quantity *
                  item.unitCost,

                profit:
                  item.profit,
              },
            );
          },
        );
      });
  } else if (
    filters.reportType ===
    "financial"
  ) {
    transactions
      .filter(
        (transaction) =>
          transaction.status !==
          "cancelled",
      )
      .forEach(
        (transaction) => {
          const isIncome =
            transaction.type ===
            "income";

          addCategory(
            transaction.category,
            {
              revenue:
                isIncome
                  ? transaction.amount
                  : 0,

              cost:
                isIncome
                  ? 0
                  : transaction.amount,

              profit:
                isIncome
                  ? transaction.amount
                  : -transaction.amount,
            },
          );
        },
      );
  } else if (
    filters.reportType ===
    "products"
  ) {
    products.forEach(
      (product) => {
        const financial =
          calculateProductFinancialData(
            product,
          );

        addCategory(
          product.category,
          {
            quantity:
              product.soldQuantity,

            revenue:
              financial
                .realizedRevenue,

            cost:
              financial
                .realizedCost,

            profit:
              financial
                .realizedProfit,
          },
        );
      },
    );
  } else {
    movements.forEach(
      (movement) => {
        const category =
          productById.get(
            movement.productId,
          )?.category ??
          "Sem categoria";

        addCategory(
          category,
          {
            quantity:
              movement.quantity,

            cost:
              movement.totalValue,
          },
        );
      },
    );
  }

  const items =
    Array.from(
      categoryMap.values(),
    );

  const totalReference =
    items.reduce(
      (total, item) =>
        total +
        Math.max(
          item.revenue,
          item.cost,
          0,
        ),
      0,
    );

  return items
    .map((item) => ({
      ...item,

      quantity:
        roundValue(
          item.quantity,
        ),

      revenue:
        roundValue(
          item.revenue,
        ),

      cost:
        roundValue(
          item.cost,
        ),

      profit:
        roundValue(
          item.profit,
        ),

      percentage:
        totalReference > 0
          ? roundValue(
            (
              Math.max(
                item.revenue,
                item.cost,
                0,
              ) /
              totalReference
            ) * 100,
          )
          : 0,
    }))
    .sort(
      (first, second) =>
        second.percentage -
        first.percentage,
    );
}

function createPaymentMethodSummary(
  sales: Sale[],
  transactions:
    FinancialTransaction[],
  filters: ReportFilters,
): ReportPaymentMethodItem[] {
  const paymentMap =
    new Map<
      string,
      {
        count: number;
        amount: number;
      }
    >();

  function addPayment(
    paymentMethod:
      string | undefined,
    amount: number,
  ) {
    if (!paymentMethod) {
      return;
    }

    const current =
      paymentMap.get(
        paymentMethod,
      ) ?? {
        count: 0,
        amount: 0,
      };

    current.count += 1;
    current.amount += amount;

    paymentMap.set(
      paymentMethod,
      current,
    );
  }

  if (
    filters.reportType ===
    "sales"
  ) {
    sales
      .filter(
        (sale) =>
          sale.status ===
          "completed",
      )
      .forEach((sale) => {
        addPayment(
          sale.paymentMethod,
          sale.total,
        );
      });
  } else if (
    filters.reportType ===
    "financial"
  ) {
    transactions
      .filter(
        (transaction) =>
          transaction.status ===
          "received" ||
          transaction.status ===
          "paid",
      )
      .forEach(
        (transaction) => {
          addPayment(
            transaction
              .paymentMethod,

            transaction.amount,
          );
        },
      );
  }

  const totalAmount =
    Array.from(
      paymentMap.values(),
    ).reduce(
      (total, item) =>
        total + item.amount,
      0,
    );

  return Array.from(
    paymentMap.entries(),
  )
    .map(
      ([
        paymentMethod,
        item,
      ]) => ({
        paymentMethod:
          paymentMethod as
          ReportPaymentMethodItem[
          "paymentMethod"
          ],

        transactionCount:
          item.count,

        amount:
          roundValue(
            item.amount,
          ),

        percentage:
          totalAmount > 0
            ? roundValue(
              (
                item.amount /
                totalAmount
              ) * 100,
            )
            : 0,
      }),
    )
    .sort(
      (first, second) =>
        second.amount -
        first.amount,
    );
}

type ReportRow =
  | SalesReportRow
  | FinancialReportRow
  | ProductReportRow
  | InventoryReportRow;

function getRowDate(
  row: ReportRow,
): string {
  if ("dueDate" in row) {
    return (
      row.paymentDate ??
      row.dueDate
    );
  }

  if ("completedAt" in row) {
    return getDatePart(
      row.completedAt ??
      row.cancelledAt ??
      row.createdAt,
    );
  }

  if ("createdAt" in row) {
    return getDatePart(
      row.createdAt,
    );
  }

  return "";
}

function getRowSortValue(
  row: ReportRow,
  filters: ReportFilters,
): string | number {
  if (
    filters.sortBy ===
    "date"
  ) {
    return getRowDate(row);
  }

  if (
    filters.sortBy ===
    "description"
  ) {
    if ("description" in row) {
      return normalizeText(
        row.description,
      );
    }

    if ("name" in row) {
      return normalizeText(
        row.name,
      );
    }

    if (
      "productName" in row
    ) {
      return normalizeText(
        row.productName,
      );
    }

    return normalizeText(
      row.number,
    );
  }

  if (
    filters.sortBy ===
    "quantity"
  ) {
    if ("quantity" in row) {
      return row.quantity;
    }

    if (
      "soldQuantity" in row
    ) {
      return row.soldQuantity;
    }

    if (
      "totalQuantity" in row
    ) {
      return row.totalQuantity;
    }

    return 0;
  }

  if (
    filters.sortBy ===
    "profit"
  ) {
    if ("profit" in row) {
      return row.profit;
    }

    if (
      "realizedProfit" in row
    ) {
      return row.realizedProfit;
    }

    return 0;
  }

  if ("amount" in row) {
    return row.amount;
  }

  if ("total" in row) {
    return row.total;
  }

  if ("totalValue" in row) {
    return row.totalValue;
  }

  if ("salePrice" in row) {
    return row.salePrice;
  }

  return 0;
}

function sortRows<
  T extends ReportRow,
>(
  rows: T[],
  filters: ReportFilters,
): T[] {
  return [...rows].sort(
    (first, second) => {
      const firstValue =
        getRowSortValue(
          first,
          filters,
        );

      const secondValue =
        getRowSortValue(
          second,
          filters,
        );

      const comparison =
        firstValue < secondValue
          ? -1
          : firstValue >
            secondValue
            ? 1
            : 0;

      return (
        filters.sortDirection ===
          "asc"
          ? comparison
          : comparison * -1
      );
    },
  );
}

const reportMetadata = {
  sales: {
    title:
      "Relatório de vendas",

    description:
      "Desempenho das vendas e resultados comerciais do período.",
  },

  financial: {
    title:
      "Relatório financeiro",

    description:
      "Receitas, despesas e posição financeira do período.",
  },

  products: {
    title:
      "Relatório de produtos",

    description:
      "Estoque, vendas e rentabilidade dos produtos.",
  },

  inventory: {
    title:
      "Relatório de estoque",

    description:
      "Entradas, saídas e ajustes realizados no estoque.",
  },
} as const;

function createResult<
  T extends ReportRow,
>(
  rows: T[],
  filters: ReportFilters,
  overview: ReportOverview,

  timeSeries:
    ReportTimeSeriesItem[],

  categories:
    ReportCategoryItem[],

  paymentMethods:
    ReportPaymentMethodItem[],
): ReportResult<T> {
  const sortedRows =
    sortRows(
      rows,
      filters,
    );

  const totalItems =
    sortedRows.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
        filters.pageSize,
      ),
    );

  const safePage =
    Math.min(
      Math.max(
        filters.page,
        1,
      ),
      totalPages,
    );

  const startIndex =
    (safePage - 1) *
    filters.pageSize;

  const metadata =
    reportMetadata[
    filters.reportType
    ];

  return {
    reportType:
      filters.reportType,

    title:
      metadata.title,

    description:
      metadata.description,

    period: {
      dateFrom:
        filters.dateFrom,

      dateTo:
        filters.dateTo,
    },

    generatedAt:
      new Date().toISOString(),

    overview,
    timeSeries,
    categories,
    paymentMethods,

    rows:
      sortedRows.slice(
        startIndex,
        startIndex +
        filters.pageSize,
      ),

    page: safePage,
    pageSize:
      filters.pageSize,

    totalItems,
    totalPages,
  };
}

export class MockReportRepository
  implements ReportRepository {
  async generate(
    filters: ReportFilters,
  ): Promise<AnyReportResult> {
    await wait();

    const allProducts =
      readProducts();

    const filteredSales =
      filterSales(
        readSales(),
        allProducts,
        filters,
      );

    const filteredTransactions =
      filterFinancialTransactions(
        readFinancialTransactions(),
        filters,
      );

    const filteredProducts =
      filterProducts(
        allProducts,
        filters,
      );

    const filteredMovements =
      filterInventoryMovements(
        readInventoryMovements(),
        allProducts,
        filters,
      );

    const overview =
      createOverview(
        filteredSales,
        filteredTransactions,
        filteredProducts,
        filteredMovements,
      );

    const timeSeries =
      createTimeSeries(
        filteredSales,
        filteredTransactions,
        filters,
      );

    const categories =
      createCategorySummary(
        filteredSales,
        filteredTransactions,
        filteredProducts,
        filteredMovements,
        filters,
      );

    const paymentMethods =
      createPaymentMethodSummary(
        filteredSales,
        filteredTransactions,
        filters,
      );

    if (
      filters.reportType ===
      "financial"
    ) {
      return createResult(
        createFinancialRows(
          filteredTransactions,
        ),
        filters,
        overview,
        timeSeries,
        categories,
        paymentMethods,
      ) as AnyReportResult;
    }

    if (
      filters.reportType ===
      "products"
    ) {
      return createResult(
        createProductRows(
          filteredProducts,
        ),
        filters,
        overview,
        timeSeries,
        categories,
        paymentMethods,
      ) as AnyReportResult;
    }

    if (
      filters.reportType ===
      "inventory"
    ) {
      return createResult(
        createInventoryRows(
          filteredMovements,
        ),
        filters,
        overview,
        timeSeries,
        categories,
        paymentMethods,
      ) as AnyReportResult;
    }

    return createResult(
      createSalesRows(
        filteredSales,
      ),
      filters,
      overview,
      timeSeries,
      categories,
      paymentMethods,
    ) as AnyReportResult;
  }

  async getFilterOptions():
    Promise<ReportFilterOptions> {
    await wait(180);

    const products =
      readProducts();

    const financialCategories =
      readFinancialTransactions()
        .map(
          (transaction) =>
            transaction.category,
        );

    const categories =
      Array.from(
        new Set([
          ...products.map(
            (product) =>
              product.category,
          ),

          ...financialCategories,
        ]),
      ).sort(
        (first, second) =>
          first.localeCompare(
            second,
            "pt-BR",
          ),
      );

    return {
      categories,

      products:
        products
          .map((product) => ({
            id: product.id,
            code: product.code,
            name: product.name,
          }))
          .sort(
            (first, second) =>
              first.name.localeCompare(
                second.name,
                "pt-BR",
              ),
          ),
    };
  }
}