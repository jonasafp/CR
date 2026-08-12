import { ApiError } from "../../../api/errors/ApiError";

import { STORAGE_KEYS } from "../../../constants/storageKeys";

import { initialSales } from "../../../data/salesMock";

import type {
  CancelSaleInput,
  CreateSaleInput,
  Sale,
  SaleItem,
  SalesSummary,
} from "../../../domain/sales/Sale";

import type {
  SaleFilters,
} from "../../../domain/sales/SaleFilters";

import {
  readLocalStorage,
  writeLocalStorage,
} from "../../../services/storage/localStorageService";

import {
  settingsStorageService,
} from "../../../services/settings/settingsStorageService";

import {
  getMaximumDiscount,
} from "../../../services/sales/salesSettingsRules";

import type {
  PaginatedResult,
} from "../../../types/Pagination";

import type {
  Product,
} from "../../../types/Product";

import type {
  SalesRepository,
} from "../SalesRepository";

function delay(
  milliseconds = 350,
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
      (value + Number.EPSILON) * 100,
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
    .toLowerCase()
    .trim();
}

function readSales(): Sale[] {
  return readLocalStorage<Sale[]>(
    STORAGE_KEYS.sales,
    initialSales,
  );
}

function saveSales(
  sales: Sale[],
): void {
  writeLocalStorage(
    STORAGE_KEYS.sales,
    sales,
  );
}

function readProducts(): Product[] {
  return readLocalStorage<Product[]>(
    STORAGE_KEYS.products,
    [],
  );
}

function saveProducts(
  products: Product[],
): void {
  writeLocalStorage(
    STORAGE_KEYS.products,
    products,
  );

  window.dispatchEvent(
    new CustomEvent(
      "gestor-facil:products-updated",
      {
        detail: products,
      },
    ),
  );
}

function createSaleId(
  sales: Sale[],
): number {
  if (sales.length === 0) {
    return 1;
  }

  return (
    Math.max(
      ...sales.map(
        (sale) => sale.id,
      ),
    ) + 1
  );
}

function createSaleNumber(
  id: number,
): string {
  return `VEN-${String(id).padStart(
    6,
    "0",
  )}`;
}

function createSummary(
  sales: Sale[],
): SalesSummary {
  const completedSales =
    sales.filter(
      (sale) =>
        sale.status === "completed",
    );

  const grossRevenue =
    completedSales.reduce(
      (total, sale) =>
        total + sale.subtotal,
      0,
    );

  const discounts =
    completedSales.reduce(
      (total, sale) =>
        total + sale.discount,
      0,
    );

  const netRevenue =
    completedSales.reduce(
      (total, sale) =>
        total + sale.total,
      0,
    );

  const totalCost =
    completedSales.reduce(
      (total, sale) =>
        total + sale.cost,
      0,
    );

  const totalProfit =
    completedSales.reduce(
      (total, sale) =>
        total + sale.profit,
      0,
    );

  return {
    totalSales: sales.length,

    completedSales:
      completedSales.length,

    cancelledSales:
      sales.filter(
        (sale) =>
          sale.status === "cancelled",
      ).length,

    pendingSales:
      sales.filter(
        (sale) =>
          sale.status === "pending",
      ).length,

    grossRevenue:
      roundValue(grossRevenue),

    discounts:
      roundValue(discounts),

    netRevenue:
      roundValue(netRevenue),

    totalCost:
      roundValue(totalCost),

    totalProfit:
      roundValue(totalProfit),

    averageTicket:
      completedSales.length > 0
        ? roundValue(
          netRevenue /
          completedSales.length,
        )
        : 0,
  };
}

export class MockSalesRepository
  implements SalesRepository {
  async list(
    filters: SaleFilters,
  ): Promise<
    PaginatedResult<Sale>
  > {
    await delay();

    const search =
      normalizeText(filters.search);

    let sales = readSales().filter(
      (sale) => {
        const searchableContent =
          normalizeText(
            [
              sale.number,
              sale.customerName ?? "",
              sale.paymentMethod,
              ...sale.items.map(
                (item) =>
                  item.productName,
              ),
            ].join(" "),
          );

        const matchesSearch =
          !search ||
          searchableContent.includes(
            search,
          );

        const matchesStatus =
          filters.status === "all" ||
          sale.status ===
          filters.status;

        const matchesPayment =
          filters.paymentMethod ===
          "all" ||
          sale.paymentMethod ===
          filters.paymentMethod;

        const saleDate =
          sale.createdAt.slice(0, 10);

        const matchesDateFrom =
          !filters.dateFrom ||
          saleDate >= filters.dateFrom;

        const matchesDateTo =
          !filters.dateTo ||
          saleDate <= filters.dateTo;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPayment &&
          matchesDateFrom &&
          matchesDateTo
        );
      },
    );

    sales = sales.sort(
      (firstSale, secondSale) => {
        let firstValue:
          | string
          | number;

        let secondValue:
          | string
          | number;

        if (
          filters.sortBy === "total"
        ) {
          firstValue =
            firstSale.total;

          secondValue =
            secondSale.total;
        } else if (
          filters.sortBy === "number"
        ) {
          firstValue =
            firstSale.number;

          secondValue =
            secondSale.number;
        } else {
          firstValue =
            firstSale.createdAt;

          secondValue =
            secondSale.createdAt;
        }

        const comparison =
          firstValue <
            secondValue
            ? -1
            : firstValue >
              secondValue
              ? 1
              : 0;

        return filters.sortDirection ===
          "asc"
          ? comparison
          : comparison * -1;
      },
    );

    const totalItems =
      sales.length;

    const totalPages = Math.max(
      1,
      Math.ceil(
        totalItems /
        filters.pageSize,
      ),
    );

    const validPage = Math.min(
      Math.max(filters.page, 1),
      totalPages,
    );

    const startIndex =
      (validPage - 1) *
      filters.pageSize;

    const items = sales.slice(
      startIndex,
      startIndex +
      filters.pageSize,
    );

    return {
      items,

      page: validPage,
      pageSize:
        filters.pageSize,

      totalItems,
      totalPages,

      hasPreviousPage:
        validPage > 1,

      hasNextPage:
        validPage < totalPages,
    };
  }

  async getById(
    saleId: number,
  ): Promise<Sale> {
    await delay(200);

    const sale = readSales().find(
      (item) =>
        item.id === saleId,
    );

    if (!sale) {
      throw new ApiError(
        "Venda não encontrada.",
        404,
        "SALE_NOT_FOUND",
      );
    }

    return sale;
  }

  async create(
    input: CreateSaleInput,
  ): Promise<Sale> {
    await delay(500);

    const sales = readSales();
    const products = readProducts();
    const salesSettings =
      settingsStorageService
        .read()
        .sales;

    if (input.items.length === 0) {
      throw new ApiError(
        "Adicione pelo menos um produto à venda.",
        400,
        "EMPTY_SALE",
      );
    }

    if (
      salesSettings
        .requireCustomerIdentification &&
      !input.customerName?.trim()
    ) {
      throw new ApiError(
        "Identifique o cliente antes de finalizar a venda.",
        400,
        "CUSTOMER_REQUIRED",
      );
    }

    if (
      !salesSettings
        .allowGeneralDiscount &&
      input.discount > 0
    ) {
      throw new ApiError(
        "O desconto geral não está permitido nas configurações.",
        400,
        "GENERAL_DISCOUNT_NOT_ALLOWED",
      );
    }

    const saleItems: SaleItem[] =
      input.items.map(
        (cartItem, index) => {
          const product =
            products.find(
              (item) =>
                item.id ===
                cartItem.productId,
            );

          if (!product) {
            throw new ApiError(
              "Um dos produtos selecionados não existe.",
              404,
              "PRODUCT_NOT_FOUND",
            );
          }

          if (
            product.status ===
            "inactive"
          ) {
            throw new ApiError(
              `O produto “${product.name}” está inativo.`,
              409,
              "PRODUCT_INACTIVE",
            );
          }

          if (
            product.stockUnit === "kg" &&
            !salesSettings
              .allowFractionalKgSales &&
            !Number.isInteger(
              cartItem.quantity,
            )
          ) {
            throw new ApiError(
              `A venda fracionada de “${product.name}” não está permitida.`,
              400,
              "FRACTIONAL_SALE_NOT_ALLOWED",
            );
          }

          if (
            !salesSettings
              .allowPriceChange &&
            roundValue(
              cartItem.unitPrice,
            ) !==
            roundValue(
              product.salePrice,
            )
          ) {
            throw new ApiError(
              `A alteração do preço de “${product.name}” não está permitida.`,
              400,
              "PRICE_CHANGE_NOT_ALLOWED",
            );
          }

          if (
            !salesSettings
              .allowItemDiscount &&
            cartItem.discount > 0
          ) {
            throw new ApiError(
              `O desconto no item “${product.name}” não está permitido.`,
              400,
              "ITEM_DISCOUNT_NOT_ALLOWED",
            );
          }

          if (
            cartItem.quantity >
            product.stockQuantity
          ) {
            throw new ApiError(
              `Estoque insuficiente para “${product.name}”.`,
              409,
              "INSUFFICIENT_STOCK",
            );
          }

          const grossTotal =
            roundValue(
              cartItem.quantity *
              cartItem.unitPrice,
            );

          const itemDiscount =
            Math.min(
              cartItem.discount,

              getMaximumDiscount(
                grossTotal,
                salesSettings,
              ),
            );

          const total =
            roundValue(
              grossTotal -
              itemDiscount,
            );

          const cost =
            roundValue(
              cartItem.quantity *
              product.purchasePrice,
            );

          return {
            id: index + 1,

            productId:
              product.id,

            productCode:
              product.code,

            productName:
              product.name,

            quantity:
              cartItem.quantity,

            unit:
              product.stockUnit,

            unitCost:
              product.purchasePrice,

            unitPrice:
              cartItem.unitPrice,

            grossTotal,
            discount:
              itemDiscount,

            total,

            profit:
              roundValue(
                total - cost,
              ),
          };
        },
      );

    const subtotal =
      roundValue(
        saleItems.reduce(
          (total, item) =>
            total +
            item.grossTotal,
          0,
        ),
      );

    const itemDiscounts =
      saleItems.reduce(
        (total, item) =>
          total + item.discount,
        0,
      );

    const generalDiscount =
      Math.min(
        input.discount,

        getMaximumDiscount(
          subtotal -
          itemDiscounts,

          salesSettings,
        ),
      );

    const totalDiscount =
      roundValue(
        itemDiscounts +
        generalDiscount,
      );

    const total =
      roundValue(
        subtotal -
        totalDiscount,
      );

    const cost =
      roundValue(
        saleItems.reduce(
          (value, item) =>
            value +
            item.quantity *
            item.unitCost,
          0,
        ),
      );

    const id =
      createSaleId(sales);

    const now =
      new Date().toISOString();

    const newSale: Sale = {
      id,
      number:
        createSaleNumber(id),

      status: "completed",

      paymentMethod:
        input.paymentMethod,

      customerId:
        input.customerId,

      customerName:
        input.customerName?.trim() ||
        "Cliente balcão",

      items: saleItems,

      subtotal,
      discount:
        totalDiscount,
      total,

      cost,
      profit:
        roundValue(total - cost),

      notes:
        input.notes?.trim() || "",

      createdAt: now,
      updatedAt: now,
      completedAt: now,

      createdBy:
        "Administrador",
    };

    const updatedProducts =
      products.map((product) => {
        const soldItem =
          saleItems.find(
            (item) =>
              item.productId ===
              product.id,
          );

        if (!soldItem) {
          return product;
        }

        return {
          ...product,

          stockQuantity:
            product.stockQuantity -
            soldItem.quantity,

          soldQuantity:
            product.soldQuantity +
            soldItem.quantity,

          updatedAt: now,
        };
      });

    saveProducts(updatedProducts);

    saveSales([
      newSale,
      ...sales,
    ]);

    return newSale;
  }

  async cancel(
    input: CancelSaleInput,
  ): Promise<Sale> {
    await delay(400);

    const sales = readSales();

    const sale = sales.find(
      (item) =>
        item.id === input.saleId,
    );

    if (!sale) {
      throw new ApiError(
        "Venda não encontrada.",
        404,
        "SALE_NOT_FOUND",
      );
    }

    if (
      sale.status === "cancelled"
    ) {
      throw new ApiError(
        "Esta venda já foi cancelada.",
        409,
        "SALE_ALREADY_CANCELLED",
      );
    }

    const now =
      new Date().toISOString();

    const cancelledSale: Sale = {
      ...sale,

      status: "cancelled",

      notes: [
        sale.notes,
        `Cancelamento: ${input.reason}`,
      ]
        .filter(Boolean)
        .join("\n"),

      cancelledAt: now,
      updatedAt: now,
    };

    const nextSales =
      sales.map((item) =>
        item.id === sale.id
          ? cancelledSale
          : item,
      );

    const products =
      readProducts();

    const restoredProducts =
      products.map((product) => {
        const saleItem =
          sale.items.find(
            (item) =>
              item.productId ===
              product.id,
          );

        if (!saleItem) {
          return product;
        }

        return {
          ...product,

          stockQuantity:
            product.stockQuantity +
            saleItem.quantity,

          soldQuantity:
            Math.max(
              0,
              product.soldQuantity -
              saleItem.quantity,
            ),

          updatedAt: now,
        };
      });

    saveProducts(restoredProducts);
    saveSales(nextSales);

    return cancelledSale;
  }

  async getSummary(
    filters?: Partial<SaleFilters>,
  ): Promise<SalesSummary> {
    await delay(200);

    let sales = readSales();

    if (filters?.status) {
      sales = sales.filter(
        (sale) =>
          filters.status === "all" ||
          sale.status ===
          filters.status,
      );
    }

    if (
      filters?.paymentMethod
    ) {
      sales = sales.filter(
        (sale) =>
          filters.paymentMethod ===
          "all" ||
          sale.paymentMethod ===
          filters.paymentMethod,
      );
    }

    return createSummary(sales);
  }
}