import {
  ApiError,
} from "../../../api/errors/ApiError";

import {
  STORAGE_KEYS,
} from "../../../constants/storageKeys";

import {
  financialCategories,
  initialFinancialTransactions,
} from "../../../data/financialMock";

import type {
  FinancialFilters,
} from "../../../domain/financial/FinancialFilters";

import type {
  CancelFinancialTransactionInput,
  CreateFinancialTransactionInput,
  FinancialCategorySummary,
  FinancialSummary,
  FinancialTransaction,
  FinancialTransactionStatus,
  FinancialTransactionType,
  SettleFinancialTransactionInput,
  UpdateFinancialTransactionInput,
} from "../../../domain/financial/FinancialTransaction";

import {
  getExpectedSettledStatus,
  isFinancialTransactionOverdue,
  isFinancialTransactionSettled,
} from "../../../domain/financial/FinancialTransaction";

import {
  readLocalStorage,
  writeLocalStorage,
} from "../../../services/storage/localStorageService";

import type {
  PaginatedResult,
} from "../../../types/Pagination";

import type {
  FinancialRepository,
} from "../FinancialRepository";

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

function readTransactions():
  FinancialTransaction[] {
  return readLocalStorage<
    FinancialTransaction[]
  >(
    STORAGE_KEYS
      .financialTransactions,

    initialFinancialTransactions,
  );
}

function saveTransactions(
  transactions:
    FinancialTransaction[],
): void {
  writeLocalStorage(
    STORAGE_KEYS
      .financialTransactions,

    transactions,
  );

  window.dispatchEvent(
    new CustomEvent(
      "gestor-facil:financial-transactions-updated",
      {
        detail: transactions,
      },
    ),
  );
}

function createTransactionId(
  transactions:
    FinancialTransaction[],
): number {
  if (
    transactions.length === 0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...transactions.map(
        (transaction) =>
          transaction.id,
      ),
    ) + 1
  );
}

function createTransactionNumber(
  id: number,
): string {
  return `FIN-${String(
    id,
  ).padStart(
    6,
    "0",
  )}`;
}

function validateAmount(
  amount: number,
): number {
  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new ApiError(
      "O valor do lançamento deve ser maior que zero.",
      400,
      "INVALID_FINANCIAL_AMOUNT",
    );
  }

  return roundValue(amount);
}

function validateSettledStatus(
  type:
    FinancialTransactionType,

  status:
    FinancialTransactionStatus,
): void {
  if (
    type === "income" &&
    status === "paid"
  ) {
    throw new ApiError(
      "Uma receita concluída deve possuir a situação Recebida.",
      400,
      "INVALID_INCOME_STATUS",
    );
  }

  if (
    type === "expense" &&
    status === "received"
  ) {
    throw new ApiError(
      "Uma despesa concluída deve possuir a situação Paga.",
      400,
      "INVALID_EXPENSE_STATUS",
    );
  }
}

function applyFilters(
  transactions:
    FinancialTransaction[],

  filters:
    Partial<FinancialFilters>,
): FinancialTransaction[] {
  const search =
    normalizeText(
      filters.search ?? "",
    );

  return transactions.filter(
    (transaction) => {
      const searchableContent =
        normalizeText(
          [
            transaction.number,
            transaction.description,
            transaction.category,

            transaction
              .customerOrSupplier ??
            "",

            transaction.saleNumber ??
            "",

            transaction.purchaseNumber ??
            "",

            transaction.notes ?? "",
          ].join(" "),
        );

      const matchesSearch =
        !search ||
        searchableContent.includes(
          search,
        );

      const matchesType =
        !filters.type ||
        filters.type === "all" ||
        transaction.type ===
        filters.type;

      const matchesSource =
        !filters.source ||
        filters.source === "all" ||
        transaction.source ===
        filters.source;

      const matchesCategory =
        !filters.category ||
        filters.category === "all" ||
        transaction.category ===
        filters.category;

      let matchesStatus =
        true;

      if (
        filters.status &&
        filters.status !== "all"
      ) {
        if (
          filters.status ===
          "overdue"
        ) {
          matchesStatus =
            isFinancialTransactionOverdue(
              transaction,
            );
        } else {
          matchesStatus =
            transaction.status ===
            filters.status;
        }
      }

      const matchesDateFrom =
        !filters.dateFrom ||
        transaction.dueDate >=
        filters.dateFrom;

      const matchesDateTo =
        !filters.dateTo ||
        transaction.dueDate <=
        filters.dateTo;

      return (
        matchesSearch &&
        matchesType &&
        matchesSource &&
        matchesCategory &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    },
  );
}

function sortTransactions(
  transactions:
    FinancialTransaction[],

  filters:
    FinancialFilters,
): FinancialTransaction[] {
  return [
    ...transactions,
  ].sort(
    (
      firstTransaction,
      secondTransaction,
    ) => {
      let firstValue:
        | string
        | number;

      let secondValue:
        | string
        | number;

      if (
        filters.sortBy ===
        "amount"
      ) {
        firstValue =
          firstTransaction.amount;

        secondValue =
          secondTransaction.amount;
      } else if (
        filters.sortBy ===
        "description"
      ) {
        firstValue =
          normalizeText(
            firstTransaction.description,
          );

        secondValue =
          normalizeText(
            secondTransaction.description,
          );
      } else if (
        filters.sortBy ===
        "createdAt"
      ) {
        firstValue =
          firstTransaction.createdAt;

        secondValue =
          secondTransaction.createdAt;
      } else {
        firstValue =
          firstTransaction.dueDate;

        secondValue =
          secondTransaction.dueDate;
      }

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

function createSummary(
  transactions:
    FinancialTransaction[],
): FinancialSummary {
  const activeTransactions =
    transactions.filter(
      (transaction) =>
        transaction.status !==
        "cancelled",
    );

  const receivedTransactions =
    activeTransactions.filter(
      (transaction) =>
        transaction.type ===
        "income" &&
        transaction.status ===
        "received",
    );

  const paidTransactions =
    activeTransactions.filter(
      (transaction) =>
        transaction.type ===
        "expense" &&
        transaction.status ===
        "paid",
    );

  const pendingIncome =
    activeTransactions.filter(
      (transaction) =>
        transaction.type ===
        "income" &&
        transaction.status ===
        "pending",
    );

  const pendingExpense =
    activeTransactions.filter(
      (transaction) =>
        transaction.type ===
        "expense" &&
        transaction.status ===
        "pending",
    );

  const overdueIncome =
    pendingIncome.filter(
      (transaction) =>
        isFinancialTransactionOverdue(
          transaction,
        ),
    );

  const overdueExpense =
    pendingExpense.filter(
      (transaction) =>
        isFinancialTransactionOverdue(
          transaction,
        ),
    );

  const totalIncome =
    roundValue(
      receivedTransactions.reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0,
      ),
    );

  const totalExpense =
    roundValue(
      paidTransactions.reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0,
      ),
    );

  const accountsReceivable =
    roundValue(
      pendingIncome.reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0,
      ),
    );

  const accountsPayable =
    roundValue(
      pendingExpense.reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0,
      ),
    );

  const overdueReceivable =
    roundValue(
      overdueIncome.reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0,
      ),
    );

  const overduePayable =
    roundValue(
      overdueExpense.reduce(
        (total, transaction) =>
          total +
          transaction.amount,
        0,
      ),
    );

  const overdueTransactions =
    activeTransactions.filter(
      (transaction) =>
        isFinancialTransactionOverdue(
          transaction,
        ),
    );

  return {
    totalIncome,

    totalExpense,

    balance:
      roundValue(
        totalIncome -
        totalExpense,
      ),

    accountsReceivable,

    accountsPayable,

    overdueReceivable,

    overduePayable,

    receivedTransactions:
      receivedTransactions.length,

    paidTransactions:
      paidTransactions.length,

    pendingTransactions:
      pendingIncome.length +
      pendingExpense.length,

    overdueTransactions:
      overdueTransactions.length,

    cancelledTransactions:
      transactions.filter(
        (transaction) =>
          transaction.status ===
          "cancelled",
      ).length,
  };
}

export class MockFinancialRepository
  implements FinancialRepository {
  async list(
    filters:
      FinancialFilters,
  ): Promise<
    PaginatedResult<
      FinancialTransaction
    >
  > {
    await delay();

    const filteredTransactions =
      applyFilters(
        readTransactions(),
        filters,
      );

    const sortedTransactions =
      sortTransactions(
        filteredTransactions,
        filters,
      );

    const totalItems =
      sortedTransactions.length;

    const totalPages =
      Math.max(
        1,

        Math.ceil(
          totalItems /
          filters.pageSize,
        ),
      );

    const validPage =
      Math.min(
        Math.max(
          filters.page,
          1,
        ),
        totalPages,
      );

    const startIndex =
      (
        validPage -
        1
      ) * filters.pageSize;

    const items =
      sortedTransactions.slice(
        startIndex,
        startIndex +
        filters.pageSize,
      );

    return {
      items,

      page:
        validPage,

      pageSize:
        filters.pageSize,

      totalItems,

      totalPages,

      hasPreviousPage:
        validPage > 1,

      hasNextPage:
        validPage <
        totalPages,
    };
  }

  async getById(
    transactionId: number,
  ): Promise<FinancialTransaction> {
    await delay(150);

    const transaction =
      readTransactions().find(
        (item) =>
          item.id ===
          transactionId,
      );

    if (!transaction) {
      throw new ApiError(
        "Lançamento financeiro não encontrado.",
        404,
        "FINANCIAL_TRANSACTION_NOT_FOUND",
      );
    }

    return transaction;
  }

  async create(
    input:
      CreateFinancialTransactionInput,
  ): Promise<FinancialTransaction> {
    await delay(300);

    const transactions =
      readTransactions();

    const id =
      createTransactionId(
        transactions,
      );

    const now =
      new Date().toISOString();

    const status =
      input.status ??
      "pending";

    const source =
      input.source ??
      "manual";

    validateSettledStatus(
      input.type,
      status,
    );

    const settled =
      status === "received" ||
      status === "paid";

    if (
      settled &&
      !input.paymentDate
    ) {
      throw new ApiError(
        "Informe a data de pagamento ou recebimento.",
        400,
        "PAYMENT_DATE_REQUIRED",
      );
    }

    if (
      settled &&
      !input.paymentMethod
    ) {
      throw new ApiError(
        "Informe a forma de pagamento.",
        400,
        "PAYMENT_METHOD_REQUIRED",
      );
    }

    const newTransaction:
      FinancialTransaction = {
      id,

      number:
        createTransactionNumber(
          id,
        ),

      type:
        input.type,

      status,

      source,

      description:
        input.description.trim(),

      category:
        input.category.trim(),

      amount:
        validateAmount(
          input.amount,
        ),

      dueDate:
        input.dueDate,

      paymentDate:
        settled
          ? input.paymentDate
          : undefined,

      paymentMethod:
        settled
          ? input.paymentMethod
          : undefined,

      customerOrSupplier:
        input
          .customerOrSupplier
          ?.trim() ||
        undefined,

      notes:
        input.notes?.trim() ||
        undefined,

      saleId:
        input.saleId,

      saleNumber:
        input.saleNumber?.trim() ||
        undefined,

      inventoryMovementId:
        input.inventoryMovementId,

      createdAt:
        now,

      updatedAt:
        now,

      createdBy:
        "Administrador",
    };

    saveTransactions([
      newTransaction,
      ...transactions,
    ]);

    return newTransaction;
  }

  async update(
    input:
      UpdateFinancialTransactionInput,
  ): Promise<FinancialTransaction> {
    await delay(300);

    const transactions =
      readTransactions();

    const transaction =
      transactions.find(
        (item) =>
          item.id ===
          input.transactionId,
      );

    if (!transaction) {
      throw new ApiError(
        "Lançamento financeiro não encontrado.",
        404,
        "FINANCIAL_TRANSACTION_NOT_FOUND",
      );
    }

    if (
      transaction.source !==
      "manual"
    ) {
      throw new ApiError(
        "Lançamentos automáticos não podem ser editados manualmente.",
        409,
        "AUTOMATIC_TRANSACTION_CANNOT_BE_EDITED",
      );
    }

    if (
      transaction.status ===
      "cancelled"
    ) {
      throw new ApiError(
        "Um lançamento cancelado não pode ser editado.",
        409,
        "CANCELLED_TRANSACTION_CANNOT_BE_EDITED",
      );
    }

    validateSettledStatus(
      input.type,
      input.status,
    );

    const settled =
      input.status ===
      "received" ||
      input.status ===
      "paid";

    if (
      settled &&
      !input.paymentDate
    ) {
      throw new ApiError(
        "Informe a data de pagamento ou recebimento.",
        400,
        "PAYMENT_DATE_REQUIRED",
      );
    }

    if (
      settled &&
      !input.paymentMethod
    ) {
      throw new ApiError(
        "Informe a forma de pagamento.",
        400,
        "PAYMENT_METHOD_REQUIRED",
      );
    }

    const updatedTransaction:
      FinancialTransaction = {
      ...transaction,

      type:
        input.type,

      status:
        input.status,

      description:
        input.description.trim(),

      category:
        input.category.trim(),

      amount:
        validateAmount(
          input.amount,
        ),

      dueDate:
        input.dueDate,

      paymentDate:
        settled
          ? input.paymentDate
          : undefined,

      paymentMethod:
        settled
          ? input.paymentMethod
          : undefined,

      customerOrSupplier:
        input
          .customerOrSupplier
          ?.trim() ||
        undefined,

      notes:
        input.notes?.trim() ||
        undefined,

      updatedAt:
        new Date().toISOString(),
    };

    saveTransactions(
      transactions.map(
        (item) =>
          item.id ===
            transaction.id
            ? updatedTransaction
            : item,
      ),
    );

    return updatedTransaction;
  }

  async settle(
    input:
      SettleFinancialTransactionInput,
  ): Promise<FinancialTransaction> {
    await delay(250);

    const transactions =
      readTransactions();

    const transaction =
      transactions.find(
        (item) =>
          item.id ===
          input.transactionId,
      );

    if (!transaction) {
      throw new ApiError(
        "Lançamento financeiro não encontrado.",
        404,
        "FINANCIAL_TRANSACTION_NOT_FOUND",
      );
    }

    if (
      transaction.status ===
      "cancelled"
    ) {
      throw new ApiError(
        "Um lançamento cancelado não pode ser concluído.",
        409,
        "CANCELLED_TRANSACTION_CANNOT_BE_SETTLED",
      );
    }

    if (
      isFinancialTransactionSettled(
        transaction,
      )
    ) {
      throw new ApiError(
        "Este lançamento já foi concluído.",
        409,
        "FINANCIAL_TRANSACTION_ALREADY_SETTLED",
      );
    }

    const settledTransaction:
      FinancialTransaction = {
      ...transaction,

      status:
        getExpectedSettledStatus(
          transaction.type,
        ),

      paymentDate:
        input.paymentDate,

      paymentMethod:
        input.paymentMethod,

      updatedAt:
        new Date().toISOString(),
    };

    saveTransactions(
      transactions.map(
        (item) =>
          item.id ===
            transaction.id
            ? settledTransaction
            : item,
      ),
    );

    return settledTransaction;
  }

  async cancel(
    input:
      CancelFinancialTransactionInput,
  ): Promise<FinancialTransaction> {
    await delay(250);

    const transactions =
      readTransactions();

    const transaction =
      transactions.find(
        (item) =>
          item.id ===
          input.transactionId,
      );

    if (!transaction) {
      throw new ApiError(
        "Lançamento financeiro não encontrado.",
        404,
        "FINANCIAL_TRANSACTION_NOT_FOUND",
      );
    }

    if (
      transaction.status ===
      "cancelled"
    ) {
      throw new ApiError(
        "Este lançamento já foi cancelado.",
        409,
        "FINANCIAL_TRANSACTION_ALREADY_CANCELLED",
      );
    }

    if (
      transaction.source !==
      "manual"
    ) {
      throw new ApiError(
        "Lançamentos automáticos devem ser cancelados pelo módulo de origem.",
        409,
        "AUTOMATIC_TRANSACTION_MUST_BE_CANCELLED_AT_SOURCE",
      );
    }

    const reason =
      input.reason.trim();

    if (!reason) {
      throw new ApiError(
        "Informe o motivo do cancelamento.",
        400,
        "CANCELLATION_REASON_REQUIRED",
      );
    }

    const cancelledTransaction:
      FinancialTransaction = {
      ...transaction,

      status:
        "cancelled",

      notes: [
        transaction.notes,

        `Cancelamento: ${reason}`,
      ]
        .filter(Boolean)
        .join("\n"),

      updatedAt:
        new Date().toISOString(),
    };

    saveTransactions(
      transactions.map(
        (item) =>
          item.id ===
            transaction.id
            ? cancelledTransaction
            : item,
      ),
    );

    return cancelledTransaction;
  }

  async getSummary(
    filters?:
      Partial<FinancialFilters>,
  ): Promise<FinancialSummary> {
    await delay(180);

    const transactions =
      applyFilters(
        readTransactions(),
        {
          ...filters,

          status:
            filters?.status ===
              "overdue"
              ? "overdue"
              : undefined,
        },
      );

    return createSummary(
      transactions,
    );
  }

  async getCategorySummary(
    filters?:
      Partial<FinancialFilters>,
  ): Promise<
    FinancialCategorySummary[]
  > {
    await delay(180);

    const transactions =
      applyFilters(
        readTransactions(),
        {
          ...filters,

          status:
            filters?.status ===
              "overdue"
              ? "overdue"
              : undefined,
        },
      ).filter(
        (transaction) =>
          transaction.status !==
          "cancelled",
      );

    const categories =
      Array.from(
        new Set(
          transactions.map(
            (transaction) =>
              transaction.category,
          ),
        ),
      );

    return categories
      .map(
        (category) => {
          const categoryTransactions =
            transactions.filter(
              (transaction) =>
                transaction.category ===
                category,
            );

          const income =
            roundValue(
              categoryTransactions
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

          const expense =
            roundValue(
              categoryTransactions
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

          return {
            category,

            income,

            expense,

            balance:
              roundValue(
                income -
                expense,
              ),

            transactionCount:
              categoryTransactions.length,
          };
        },
      )
      .sort(
        (
          firstCategory,
          secondCategory,
        ) =>
          (
            secondCategory.income +
            secondCategory.expense
          ) -
          (
            firstCategory.income +
            firstCategory.expense
          ),
      );
  }

  async listCategories(
    type?:
      FinancialTransactionType,
  ): Promise<string[]> {
    await delay(100);

    const storedCategories =
      readTransactions()
        .filter(
          (transaction) =>
            !type ||
            transaction.type ===
            type,
        )
        .map(
          (transaction) =>
            transaction.category,
        );

    const defaultCategories =
      type === "income"
        ? [
          ...financialCategories
            .income,
        ]
        : type === "expense"
          ? [
            ...financialCategories
              .expense,
          ]
          : [
            ...financialCategories
              .income,

            ...financialCategories
              .expense,
          ];

    return Array.from(
      new Set([
        ...defaultCategories,
        ...storedCategories,
      ]),
    ).sort(
      (
        firstCategory,
        secondCategory,
      ) =>
        firstCategory.localeCompare(
          secondCategory,
          "pt-BR",
        ),
    );
  }
}