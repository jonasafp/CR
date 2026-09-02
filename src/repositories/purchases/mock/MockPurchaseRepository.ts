import {
  ApiError,
} from "../../../api/errors/ApiError";

import {
  STORAGE_KEYS,
} from "../../../constants/storageKeys";

import {
  initialInventoryMovements,
} from "../../../data/inventoryMock";

import {
  products as initialProducts,
} from "../../../data/mock";

import {
  initialPurchases,
} from "../../../data/purchasesMock";

import {
  initialSuppliers,
} from "../../../data/suppliersMock";

import type {
  CancelPurchaseInput,
  CompletePurchaseInput,
  CreatePurchaseInput,
  Purchase,
  PurchaseItem,
  PurchaseSummary,
  UpdatePurchaseInput,
} from "../../../domain/purchases/Purchase";

import type {
  PurchaseFilters,
} from "../../../domain/purchases/PurchaseFilters";

import {
  getSupplierDisplayName,
} from "../../../domain/suppliers/Supplier";

import type {
  Supplier,
} from "../../../domain/suppliers/Supplier";

import {
  settingsStorageService,
} from "../../../services/settings/settingsStorageService";

import {
  readLocalStorage,
} from "../../../services/storage/localStorageService";

import type {
  InventoryMovement,
} from "../../../types/Inventory";

import type {
  PaginatedResult,
} from "../../../types/Pagination";

import type {
  Product,
} from "../../../types/Product";

import type {
  PurchaseRepository,
} from "../PurchaseRepository";

export const PURCHASES_UPDATED_EVENT =
  "gestor-facil:purchases-updated";

function delay(
  milliseconds = 300,
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

function readPurchases():
  Purchase[] {
  return readLocalStorage<
    Purchase[]
  >(
    STORAGE_KEYS.purchases,
    initialPurchases,
  );
}

function readProducts():
  Product[] {
  return readLocalStorage<
    Product[]
  >(
    STORAGE_KEYS.products,
    initialProducts,
  );
}

function readMovements():
  InventoryMovement[] {
  return readLocalStorage<
    InventoryMovement[]
  >(
    STORAGE_KEYS.inventoryMovements,
    initialInventoryMovements,
  );
}

function readSuppliers():
  Supplier[] {
  return readLocalStorage<
    Supplier[]
  >(
    STORAGE_KEYS.suppliers,
    initialSuppliers,
  );
}

function createPurchaseId(
  purchases: Purchase[],
): number {
  if (
    purchases.length === 0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...purchases.map(
        (purchase) =>
          purchase.id,
      ),
    ) + 1
  );
}

function createPurchaseNumber(
  id: number,
): string {
  return `COM-${String(id).padStart(
    6,
    "0",
  )}`;
}

function createMovementId(
  movements:
    InventoryMovement[],
): number {
  if (
    movements.length === 0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...movements.map(
        (movement) =>
          movement.id,
      ),
    ) + 1
  );
}

function findPurchaseOrThrow(
  purchases: Purchase[],
  purchaseId: number,
): Purchase {
  const purchase =
    purchases.find(
      (item) =>
        item.id ===
        purchaseId,
    );

  if (!purchase) {
    throw new ApiError(
      "Compra não encontrada.",
      404,
      "PURCHASE_NOT_FOUND",
    );
  }

  return purchase;
}

function findActiveSupplierOrThrow(
  supplierId: number,
): Supplier {
  const supplier =
    readSuppliers().find(
      (item) =>
        item.id ===
        supplierId,
    );

  if (!supplier) {
    throw new ApiError(
      "Fornecedor não encontrado.",
      404,
      "SUPPLIER_NOT_FOUND",
    );
  }

  if (
    supplier.status !==
    "active"
  ) {
    throw new ApiError(
      "O fornecedor selecionado está inativo.",
      400,
      "SUPPLIER_INACTIVE",
    );
  }

  return supplier;
}

function validateValue(
  value: number | undefined,
  fieldName: string,
): number {
  const normalizedValue =
    value ?? 0;

  if (
    !Number.isFinite(
      normalizedValue,
    ) ||
    normalizedValue < 0
  ) {
    throw new ApiError(
      `${fieldName} deve possuir um valor válido.`,
      400,
      "INVALID_PURCHASE_VALUE",
    );
  }

  return roundValue(
    normalizedValue,
  );
}

function createPurchaseItems(
  inputItems:
    CreatePurchaseInput["items"],
  products:
    Product[],
): PurchaseItem[] {
  if (
    inputItems.length === 0
  ) {
    throw new ApiError(
      "Adicione pelo menos um produto à compra.",
      400,
      "EMPTY_PURCHASE",
    );
  }

  const usedProductIds =
    new Set<number>();

  return inputItems.map(
    (
      inputItem,
      index,
    ) => {
      if (
        usedProductIds.has(
          inputItem.productId,
        )
      ) {
        throw new ApiError(
          "Um produto não pode aparecer duas vezes na mesma compra.",
          400,
          "DUPLICATED_PURCHASE_PRODUCT",
        );
      }

      usedProductIds.add(
        inputItem.productId,
      );

      const product =
        products.find(
          (item) =>
            item.id ===
            inputItem.productId,
        );

      if (!product) {
        throw new ApiError(
          "Um dos produtos selecionados não foi encontrado.",
          404,
          "PRODUCT_NOT_FOUND",
        );
      }

      if (
        product.status !==
        "active"
      ) {
        throw new ApiError(
          `O produto ${product.name} está inativo.`,
          400,
          "PRODUCT_INACTIVE",
        );
      }

      if (
        !Number.isFinite(
          inputItem.quantity,
        ) ||
        inputItem.quantity <= 0
      ) {
        throw new ApiError(
          `Informe uma quantidade válida para ${product.name}.`,
          400,
          "INVALID_PURCHASE_QUANTITY",
        );
      }

      if (
        !Number.isFinite(
          inputItem.unitCost,
        ) ||
        inputItem.unitCost < 0
      ) {
        throw new ApiError(
          `Informe um custo válido para ${product.name}.`,
          400,
          "INVALID_PURCHASE_UNIT_COST",
        );
      }

      const quantity =
        roundValue(
          inputItem.quantity,
        );

      const unitCost =
        roundValue(
          inputItem.unitCost,
        );

      return {
        id:
          index + 1,

        productId:
          product.id,

        productCode:
          product.code,

        productName:
          product.name,

        unit:
          product.stockUnit,

        quantity,

        unitCost,

        total:
          roundValue(
            quantity *
            unitCost,
          ),
      };
    },
  );
}

function buildPurchaseData(
  input:
    CreatePurchaseInput,
  products:
    Product[],
) {
  const supplier =
    findActiveSupplierOrThrow(
      input.supplierId,
    );

  if (
    !input.purchaseDate ||
    Number.isNaN(
      new Date(
        input.purchaseDate,
      ).getTime(),
    )
  ) {
    throw new ApiError(
      "Informe uma data válida para a compra.",
      400,
      "INVALID_PURCHASE_DATE",
    );
  }

  const items =
    createPurchaseItems(
      input.items,
      products,
    );

  const subtotal =
    roundValue(
      items.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.total,
        0,
      ),
    );

  const discount =
    validateValue(
      input.discount,
      "O desconto",
    );

  const freight =
    validateValue(
      input.freight,
      "O frete",
    );

  const otherExpenses =
    validateValue(
      input.otherExpenses,
      "As outras despesas",
    );

  if (
    discount >
    subtotal
  ) {
    throw new ApiError(
      "O desconto não pode ser maior que o subtotal da compra.",
      400,
      "INVALID_PURCHASE_DISCOUNT",
    );
  }

  return {
    supplier,
    items,
    subtotal,
    discount,
    freight,
    otherExpenses,

    total:
      roundValue(
        subtotal -
        discount +
        freight +
        otherExpenses,
      ),
  };
}

function notifyUpdated(
  purchases:
    Purchase[],

  products:
    Product[],

  movements:
    InventoryMovement[],
): void {
  window.dispatchEvent(
    new CustomEvent<Purchase[]>(
      PURCHASES_UPDATED_EVENT,
      {
        detail:
          purchases,
      },
    ),
  );

  window.dispatchEvent(
    new CustomEvent<Product[]>(
      "gestor-facil:products-updated",
      {
        detail:
          products,
      },
    ),
  );

  window.dispatchEvent(
    new CustomEvent<
      InventoryMovement[]
    >(
      "gestor-facil:inventory-movements-updated",
      {
        detail:
          movements,
      },
    ),
  );
}

function saveOperation(
  purchases:
    Purchase[],

  products:
    Product[],

  movements:
    InventoryMovement[],
): void {
  const entries = [
    [
      STORAGE_KEYS.purchases,
      purchases,
    ],
    [
      STORAGE_KEYS.products,
      products,
    ],
    [
      STORAGE_KEYS.inventoryMovements,
      movements,
    ],
  ] as const;

  const previousValues =
    new Map(
      entries.map(
        ([key]) => [
          key,
          window.localStorage.getItem(
            key,
          ),
        ],
      ),
    );

  try {
    entries.forEach(
      ([
        key,
        value,
      ]) => {
        window.localStorage.setItem(
          key,
          JSON.stringify(
            value,
          ),
        );
      },
    );
  } catch (
    storageError
  ) {
    previousValues.forEach(
      (
        previousValue,
        key,
      ) => {
        if (
          previousValue === null
        ) {
          window.localStorage.removeItem(
            key,
          );
        } else {
          window.localStorage.setItem(
            key,
            previousValue,
          );
        }
      },
    );

    throw new ApiError(
      storageError instanceof Error
        ? `Não foi possível salvar a compra. ${storageError.message}`
        : "Não foi possível salvar a compra.",
      500,
      "PURCHASE_STORAGE_ERROR",
    );
  }

  notifyUpdated(
    purchases,
    products,
    movements,
  );
}

function applyFilters(
  purchases:
    Purchase[],

  filters:
    Partial<PurchaseFilters>,
): Purchase[] {
  const search =
    normalizeText(
      filters.search ?? "",
    );

  return purchases
    .filter(
      (purchase) => {
        const matchesSearch =
          !search ||
          normalizeText(
            [
              purchase.number,
              purchase.supplierName,
              purchase.documentNumber,
              purchase.notes,
            ].join(" "),
          ).includes(
            search,
          );

        const matchesStatus =
          !filters.status ||
          filters.status ===
            "all" ||
          purchase.status ===
            filters.status;

        const matchesSupplier =
          !filters.supplierId ||
          purchase.supplierId ===
            filters.supplierId;

        const matchesDateFrom =
          !filters.dateFrom ||
          purchase.purchaseDate >=
            filters.dateFrom;

        const matchesDateTo =
          !filters.dateTo ||
          purchase.purchaseDate <=
            filters.dateTo;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesSupplier &&
          matchesDateFrom &&
          matchesDateTo
        );
      },
    )
    .sort(
      (
        firstPurchase,
        secondPurchase,
      ) => {
        const sortBy =
          filters.sortBy ??
          "purchaseDate";

        let comparison =
          0;

        if (
          sortBy ===
          "total"
        ) {
          comparison =
            firstPurchase.total -
            secondPurchase.total;
        } else {
          comparison =
            firstPurchase[
              sortBy
            ].localeCompare(
              secondPurchase[
                sortBy
              ],
            );
        }

        return (
          filters.sortDirection ===
            "asc"
            ? comparison
            : comparison * -1
        );
      },
    );
}

export class MockPurchaseRepository
  implements PurchaseRepository {
  async list(
    filters:
      PurchaseFilters,
  ): Promise<
    PaginatedResult<Purchase>
  > {
    await delay();

    const purchases =
      applyFilters(
        readPurchases(),
        filters,
      );

    const pageSize =
      Math.max(
        1,
        filters.pageSize,
      );

    const totalItems =
      purchases.length;

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          totalItems /
          pageSize,
        ),
      );

    const page =
      Math.min(
        Math.max(
          1,
          filters.page,
        ),
        totalPages,
      );

    const startIndex =
      (
        page -
        1
      ) * pageSize;

    return {
      items:
        purchases.slice(
          startIndex,
          startIndex +
            pageSize,
        ),

      page,
      pageSize,
      totalItems,
      totalPages,

      hasPreviousPage:
        page > 1,

      hasNextPage:
        page <
        totalPages,
    };
  }

  async getById(
    purchaseId: number,
  ): Promise<Purchase> {
    await delay();

    return findPurchaseOrThrow(
      readPurchases(),
      purchaseId,
    );
  }

  async create(
    input:
      CreatePurchaseInput,
  ): Promise<Purchase> {
    await delay();

    const purchases =
      readPurchases();

    const products =
      readProducts();

    const movements =
      readMovements();

    const data =
      buildPurchaseData(
        input,
        products,
      );

    const id =
      createPurchaseId(
        purchases,
      );

    const now =
      new Date()
        .toISOString();

    const purchase:
      Purchase = {
      id,

      number:
        createPurchaseNumber(
          id,
        ),

      status:
        "pending",

      supplierId:
        data.supplier.id,

      supplierName:
        getSupplierDisplayName(
          data.supplier,
        ),

      documentNumber:
        input.documentNumber
          ?.trim() ?? "",

      purchaseDate:
        input.purchaseDate,

      items:
        data.items,

      subtotal:
        data.subtotal,

      discount:
        data.discount,

      freight:
        data.freight,

      otherExpenses:
        data.otherExpenses,

      total:
        data.total,

      notes:
        input.notes
          ?.trim() ?? "",

      createdAt:
        now,

      updatedAt:
        now,

      createdBy:
        "Administrador",
    };

    saveOperation(
      [
        purchase,
        ...purchases,
      ],
      products,
      movements,
    );

    return purchase;
  }

  async update(
    input:
      UpdatePurchaseInput,
  ): Promise<Purchase> {
    await delay();

    const purchases =
      readPurchases();

    const currentPurchase =
      findPurchaseOrThrow(
        purchases,
        input.purchaseId,
      );

    if (
      currentPurchase.status !==
      "pending"
    ) {
      throw new ApiError(
        "Somente compras pendentes podem ser editadas.",
        400,
        "PURCHASE_NOT_PENDING",
      );
    }

    const products =
      readProducts();

    const movements =
      readMovements();

    const data =
      buildPurchaseData(
        input,
        products,
      );

    const updatedPurchase:
      Purchase = {
      ...currentPurchase,

      supplierId:
        data.supplier.id,

      supplierName:
        getSupplierDisplayName(
          data.supplier,
        ),

      documentNumber:
        input.documentNumber
          ?.trim() ?? "",

      purchaseDate:
        input.purchaseDate,

      items:
        data.items,

      subtotal:
        data.subtotal,

      discount:
        data.discount,

      freight:
        data.freight,

      otherExpenses:
        data.otherExpenses,

      total:
        data.total,

      notes:
        input.notes
          ?.trim() ?? "",

      updatedAt:
        new Date()
          .toISOString(),
    };

    const updatedPurchases =
      purchases.map(
        (purchase) =>
          purchase.id ===
          updatedPurchase.id
            ? updatedPurchase
            : purchase,
      );

    saveOperation(
      updatedPurchases,
      products,
      movements,
    );

    return updatedPurchase;
  }

  async complete(
    input:
      CompletePurchaseInput,
  ): Promise<Purchase> {
    await delay();

    const purchases =
      readPurchases();

    const purchase =
      findPurchaseOrThrow(
        purchases,
        input.purchaseId,
      );

    if (
      purchase.status !==
      "pending"
    ) {
      throw new ApiError(
        "Somente compras pendentes podem ser concluídas.",
        400,
        "PURCHASE_NOT_PENDING",
      );
    }

    const products =
      readProducts();

    const movements =
      readMovements();

    const settings =
      settingsStorageService.read();

    const now =
      new Date()
        .toISOString();

    let nextMovementId =
      createMovementId(
        movements,
      );

    const newMovements:
      InventoryMovement[] = [];

    const updatedProducts =
      products.map(
        (product) => {
          const purchaseItem =
            purchase.items.find(
              (item) =>
                item.productId ===
                product.id,
            );

          if (!purchaseItem) {
            return product;
          }

          const previousStock =
            product.stockQuantity;

          const currentStock =
            roundValue(
              previousStock +
              purchaseItem.quantity,
            );

          newMovements.push({
            id:
              nextMovementId++,

            productId:
              product.id,

            productName:
              product.name,

            productCode:
              product.code,

            type:
              "entry",

            reason:
              "purchase",

            quantity:
              purchaseItem.quantity,

            unit:
              product.stockUnit,

            previousStock,

            currentStock,

            unitCost:
              purchaseItem.unitCost,

            totalValue:
              purchaseItem.total,

            notes:
              `Entrada referente à compra ${purchase.number}.`,

            purchaseId:
              purchase.id,

            purchaseNumber:
              purchase.number,

            createdAt:
              now,

            createdBy:
              "Administrador",
          });

          return {
            ...product,

            stockQuantity:
              currentStock,

            purchasePrice:
              settings.inventory
                .updatePurchasePriceOnEntry
                ? purchaseItem.unitCost
                : product.purchasePrice,

            updatedAt:
              now,
          };
        },
      );

    const completedPurchase:
      Purchase = {
      ...purchase,

      status:
        "completed",

      completedAt:
        now,

      updatedAt:
        now,
    };

    const updatedPurchases =
      purchases.map(
        (item) =>
          item.id ===
          completedPurchase.id
            ? completedPurchase
            : item,
      );

    saveOperation(
      updatedPurchases,
      updatedProducts,
      [
        ...newMovements,
        ...movements,
      ],
    );

    return completedPurchase;
  }

  async cancel(
    input:
      CancelPurchaseInput,
  ): Promise<Purchase> {
    await delay();

    const purchases =
      readPurchases();

    const purchase =
      findPurchaseOrThrow(
        purchases,
        input.purchaseId,
      );

    if (
      purchase.status ===
      "cancelled"
    ) {
      throw new ApiError(
        "Esta compra já está cancelada.",
        400,
        "PURCHASE_ALREADY_CANCELLED",
      );
    }

    const reason =
      input.reason.trim();

    if (
      reason.length < 3
    ) {
      throw new ApiError(
        "Informe o motivo do cancelamento.",
        400,
        "PURCHASE_CANCELLATION_REASON_REQUIRED",
      );
    }

    const products =
      readProducts();

    const movements =
      readMovements();

    const settings =
      settingsStorageService.read();

    const now =
      new Date()
        .toISOString();

    let updatedProducts =
      products;

    let updatedMovements =
      movements;

    if (
      purchase.status ===
      "completed"
    ) {
      let nextMovementId =
        createMovementId(
          movements,
        );

      const reversalMovements:
        InventoryMovement[] = [];

      updatedProducts =
        products.map(
          (product) => {
            const purchaseItem =
              purchase.items.find(
                (item) =>
                  item.productId ===
                  product.id,
              );

            if (!purchaseItem) {
              return product;
            }

            if (
              !settings.inventory
                .allowNegativeStock &&
              product.stockQuantity <
                purchaseItem.quantity
            ) {
              throw new ApiError(
                `Não é possível cancelar a compra porque o estoque de ${product.name} já foi utilizado.`,
                400,
                "INSUFFICIENT_STOCK_TO_CANCEL_PURCHASE",
              );
            }

            const previousStock =
              product.stockQuantity;

            const currentStock =
              roundValue(
                previousStock -
                purchaseItem.quantity,
              );

            reversalMovements.push({
              id:
                nextMovementId++,

              productId:
                product.id,

              productName:
                product.name,

              productCode:
                product.code,

              type:
                "exit",

              reason:
                "return",

              quantity:
                purchaseItem.quantity,

              unit:
                product.stockUnit,

              previousStock,

              currentStock,

              unitCost:
                purchaseItem.unitCost,

              totalValue:
                purchaseItem.total,

              notes:
                `Estorno da compra ${purchase.number}: ${reason}`,

              purchaseId:
                purchase.id,

              purchaseNumber:
                purchase.number,

              createdAt:
                now,

              createdBy:
                "Administrador",
            });

            return {
              ...product,

              stockQuantity:
                currentStock,

              updatedAt:
                now,
            };
          },
        );

      updatedMovements = [
        ...reversalMovements,
        ...movements,
      ];
    }

    const cancelledPurchase:
      Purchase = {
      ...purchase,

      status:
        "cancelled",

      cancellationReason:
        reason,

      cancelledAt:
        now,

      updatedAt:
        now,
    };

    const updatedPurchases =
      purchases.map(
        (item) =>
          item.id ===
          cancelledPurchase.id
            ? cancelledPurchase
            : item,
      );

    saveOperation(
      updatedPurchases,
      updatedProducts,
      updatedMovements,
    );

    return cancelledPurchase;
  }

  async getSummary(
    filters?: Partial<
      PurchaseFilters
    >,
  ): Promise<PurchaseSummary> {
    await delay();

    const purchases =
      applyFilters(
        readPurchases(),
        filters ?? {},
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
    };
  }
}