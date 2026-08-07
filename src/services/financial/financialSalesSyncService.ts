import {
  apiConfig,
} from "../../api/apiConfig";

import {
  STORAGE_KEYS,
} from "../../constants/storageKeys";

import {
  initialFinancialTransactions,
} from "../../data/financialMock";

import {
  initialSales,
} from "../../data/salesMock";

import type {
  FinancialPaymentMethod,
  FinancialTransaction,
} from "../../domain/financial/FinancialTransaction";

import type {
  PaymentMethod,
  Sale,
} from "../../domain/sales/Sale";

import {
  readLocalStorage,
  writeLocalStorage,
} from "../storage/localStorageService";

const FINANCIAL_UPDATE_EVENT =
  "gestor-facil:financial-transactions-updated";

function roundValue(
  value: number,
): number {
  return (
    Math.round(
      (value + Number.EPSILON) * 100,
    ) / 100
  );
}

function readFinancialTransactions(): FinancialTransaction[] {
  return readLocalStorage<FinancialTransaction[]>(
    STORAGE_KEYS.financialTransactions,
    initialFinancialTransactions,
  );
}

function saveFinancialTransactions(
  transactions: FinancialTransaction[],
) {
  writeLocalStorage(
    STORAGE_KEYS.financialTransactions,
    transactions,
  );

  if (
    typeof window !== "undefined"
  ) {
    window.dispatchEvent(
      new CustomEvent(
        FINANCIAL_UPDATE_EVENT,
      ),
    );
  }
}

function readSales(): Sale[] {
  return readLocalStorage<Sale[]>(
    STORAGE_KEYS.sales,
    initialSales,
  );
}

function mapPaymentMethod(
  paymentMethod: PaymentMethod,
): FinancialPaymentMethod {
  const paymentMethodMap: Record<
    PaymentMethod,
    FinancialPaymentMethod
  > = {
    cash: "cash",
    pix: "pix",
    credit_card: "credit_card",
    debit_card: "debit_card",
    bank_transfer: "bank_transfer",
    other: "other",
  };

  return paymentMethodMap[
    paymentMethod
  ];
}

function getNextTransactionId(
  transactions: FinancialTransaction[],
): number {
  if (transactions.length === 0) {
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
  transactionId: number,
): string {
  return `FIN-${String(
    transactionId,
  ).padStart(6, "0")}`;
}

function getSaleDate(
  sale: Sale,
): string {
  return (
    sale.completedAt ??
    sale.cancelledAt ??
    sale.createdAt
  );
}

function createSaleNotes(
  sale: Sale,
): string {
  const messages = [
    `Lançamento gerado automaticamente pela venda ${sale.number}.`,
  ];

  if (sale.notes?.trim()) {
    messages.push(
      `Observações da venda: ${sale.notes.trim()}`,
    );
  }

  if (
    sale.status === "cancelled"
  ) {
    messages.push(
      "Lançamento cancelado automaticamente devido ao cancelamento da venda.",
    );
  }

  return messages.join(" ");
}

function createFinancialTransactionFromSale(
  sale: Sale,
  transactionId: number,
): FinancialTransaction {
  const transactionDate =
    getSaleDate(sale);

  const isCancelled =
    sale.status === "cancelled";

  return {
    id: transactionId,

    number:
      createTransactionNumber(
        transactionId,
      ),

    type: "income",

    status: isCancelled
      ? "cancelled"
      : "received",

    source: "sale",

    description:
      `Venda ${sale.number}`,

    category: "Vendas",

    amount: roundValue(
      sale.total,
    ),

    dueDate:
      transactionDate.slice(0, 10),

    paymentDate: isCancelled
      ? undefined
      : transactionDate.slice(
          0,
          10,
        ),

    paymentMethod:
      mapPaymentMethod(
        sale.paymentMethod,
      ),

    customerOrSupplier:
      sale.customerName?.trim() ||
      "Cliente balcão",

    notes:
      createSaleNotes(sale),

    saleId: sale.id,
    saleNumber: sale.number,

    createdAt:
      transactionDate,

    updatedAt:
      sale.updatedAt ??
      transactionDate,

    createdBy:
      sale.createdBy ||
      "Administrador",
  };
}

function updateTransactionFromSale(
  transaction: FinancialTransaction,
  sale: Sale,
): FinancialTransaction {
  const transactionDate =
    getSaleDate(sale);

  const isCancelled =
    sale.status === "cancelled";

  return {
    ...transaction,

    type: "income",

    status: isCancelled
      ? "cancelled"
      : "received",

    source: "sale",

    description:
      `Venda ${sale.number}`,

    category: "Vendas",

    amount: roundValue(
      sale.total,
    ),

    dueDate:
      transactionDate.slice(0, 10),

    paymentDate: isCancelled
      ? undefined
      : transactionDate.slice(
          0,
          10,
        ),

    paymentMethod:
      mapPaymentMethod(
        sale.paymentMethod,
      ),

    customerOrSupplier:
      sale.customerName?.trim() ||
      "Cliente balcão",

    notes:
      createSaleNotes(sale),

    saleId: sale.id,
    saleNumber: sale.number,

    updatedAt:
      sale.updatedAt ??
      new Date().toISOString(),
  };
}

function transactionsAreEqual(
  first: FinancialTransaction,
  second: FinancialTransaction,
): boolean {
  return (
    JSON.stringify(first) ===
    JSON.stringify(second)
  );
}

function findSaleTransactionIndex(
  transactions: FinancialTransaction[],
  sale: Sale,
): number {
  return transactions.findIndex(
    (transaction) =>
      transaction.source ===
        "sale" &&
      transaction.saleId ===
        sale.id,
  );
}

function synchronizeSaleInList(
  transactions: FinancialTransaction[],
  sale: Sale,
): {
  transactions: FinancialTransaction[];
  changed: boolean;
} {
  if (
    sale.status === "pending"
  ) {
    return {
      transactions,
      changed: false,
    };
  }

  const existingIndex =
    findSaleTransactionIndex(
      transactions,
      sale,
    );

  if (existingIndex === -1) {
    const transactionId =
      getNextTransactionId(
        transactions,
      );

    const newTransaction =
      createFinancialTransactionFromSale(
        sale,
        transactionId,
      );

    return {
      transactions: [
        ...transactions,
        newTransaction,
      ],

      changed: true,
    };
  }

  const existingTransaction =
    transactions[existingIndex];

  const updatedTransaction =
    updateTransactionFromSale(
      existingTransaction,
      sale,
    );

  if (
    transactionsAreEqual(
      existingTransaction,
      updatedTransaction,
    )
  ) {
    return {
      transactions,
      changed: false,
    };
  }

  const updatedTransactions =
    transactions.map(
      (transaction, index) =>
        index === existingIndex
          ? updatedTransaction
          : transaction,
    );

  return {
    transactions:
      updatedTransactions,

    changed: true,
  };
}

function canUseLocalSynchronization(): boolean {
  return (
    apiConfig.dataSource === "mock"
  );
}

export function synchronizeSaleWithFinancial(
  sale: Sale,
): void {
  if (
    !canUseLocalSynchronization()
  ) {
    return;
  }

  if (
    sale.status === "pending"
  ) {
    return;
  }

  const currentTransactions =
    readFinancialTransactions();

  const result =
    synchronizeSaleInList(
      currentTransactions,
      sale,
    );

  if (!result.changed) {
    return;
  }

  saveFinancialTransactions(
    result.transactions,
  );
}

export function synchronizeExistingSalesWithFinancial(): void {
  if (
    !canUseLocalSynchronization()
  ) {
    return;
  }

  const sales =
    readSales();

  let transactions =
    readFinancialTransactions();

  let hasChanges = false;

  sales.forEach((sale) => {
    const result =
      synchronizeSaleInList(
        transactions,
        sale,
      );

    transactions =
      result.transactions;

    if (result.changed) {
      hasChanges = true;
    }
  });

  if (!hasChanges) {
    return;
  }

  saveFinancialTransactions(
    transactions,
  );
}

export const financialSalesSyncEvent =
  FINANCIAL_UPDATE_EVENT;