import {
  apiConfig,
} from "../../api/apiConfig";

import {
  STORAGE_KEYS,
} from "../../constants/storageKeys";

import {
  initialFinancialTransactions,
} from "../../data/financialMock";

import type {
  FinancialTransaction,
} from "../../domain/financial/FinancialTransaction";

import type {
  Purchase,
} from "../../domain/purchases/Purchase";

import {
  settingsStorageService,
} from "../settings/settingsStorageService";

import {
  readLocalStorage,
  writeLocalStorage,
} from "../storage/localStorageService";

const FINANCIAL_UPDATED_EVENT =
  "gestor-facil:financial-transactions-updated";

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

function readTransactions():
  FinancialTransaction[] {
  return readLocalStorage<
    FinancialTransaction[]
  >(
    STORAGE_KEYS.financialTransactions,
    initialFinancialTransactions,
  );
}

function saveTransactions(
  transactions:
    FinancialTransaction[],
): void {
  writeLocalStorage(
    STORAGE_KEYS.financialTransactions,
    transactions,
  );

  window.dispatchEvent(
    new CustomEvent<
      FinancialTransaction[]
    >(
      FINANCIAL_UPDATED_EVENT,
      {
        detail:
          transactions,
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
  return `FIN-${String(id).padStart(
    6,
    "0",
  )}`;
}

function addDays(
  dateValue: string,
  days: number,
): string {
  const date =
    new Date(
      `${dateValue.slice(0, 10)}T12:00:00`,
    );

  date.setDate(
    date.getDate() +
    Math.max(
      0,
      days,
    ),
  );

  return date
    .toISOString()
    .slice(
      0,
      10,
    );
}

function createNotes(
  purchase: Purchase,
): string {
  const messages = [
    `Lançamento gerado automaticamente pela compra ${purchase.number}.`,
  ];

  if (
    purchase.documentNumber.trim()
  ) {
    messages.push(
      `Referência: ${purchase.documentNumber.trim()}.`,
    );
  }

  if (
    purchase.notes.trim()
  ) {
    messages.push(
      `Observações da compra: ${purchase.notes.trim()}`,
    );
  }

  if (
    purchase.status ===
    "cancelled"
  ) {
    messages.push(
      `Cancelada automaticamente: ${
        purchase.cancellationReason ||
        "compra cancelada"
      }.`,
    );
  }

  return messages.join(
    " ",
  );
}

function createFromPurchase(
  purchase: Purchase,
  transactionId: number,
): FinancialTransaction {
  const settings =
    settingsStorageService.read();

  const financialSettings =
    settings.financial;

  const isCancelled =
    purchase.status ===
    "cancelled";

  const referenceDate =
    purchase.completedAt ||
    purchase.updatedAt ||
    purchase.createdAt;

  return {
    id:
      transactionId,

    number:
      createTransactionNumber(
        transactionId,
      ),

    type:
      "expense",

    status:
      isCancelled
        ? "cancelled"
        : "pending",

    source:
      "purchase",

    description:
      `Compra ${purchase.number}`,

    category:
      financialSettings.defaultExpenseCategory,

    amount:
      roundValue(
        purchase.total,
      ),

    dueDate:
      addDays(
        purchase.purchaseDate,
        financialSettings.defaultDueDays,
      ),

    paymentDate:
      undefined,

    paymentMethod:
      financialSettings.defaultPaymentMethod,

    customerOrSupplier:
      purchase.supplierName,

    notes:
      createNotes(
        purchase,
      ),

    purchaseId:
      purchase.id,

    purchaseNumber:
      purchase.number,

    createdAt:
      referenceDate,

    updatedAt:
      purchase.updatedAt,

    createdBy:
      purchase.createdBy ||
      "Administrador",
  };
}

function updateFromPurchase(
  transaction:
    FinancialTransaction,

  purchase:
    Purchase,
): FinancialTransaction {
  const settings =
    settingsStorageService.read();

  const isCancelled =
    purchase.status ===
    "cancelled";

  return {
    ...transaction,

    type:
      "expense",

    status:
      isCancelled
        ? "cancelled"
        : transaction.status ===
            "cancelled"
          ? "pending"
          : transaction.status,

    source:
      "purchase",

    description:
      `Compra ${purchase.number}`,

    category:
      settings.financial
        .defaultExpenseCategory,

    amount:
      roundValue(
        purchase.total,
      ),

    dueDate:
      addDays(
        purchase.purchaseDate,
        settings.financial.defaultDueDays,
      ),

    paymentDate:
      isCancelled
        ? undefined
        : transaction.paymentDate,

    customerOrSupplier:
      purchase.supplierName,

    notes:
      createNotes(
        purchase,
      ),

    purchaseId:
      purchase.id,

    purchaseNumber:
      purchase.number,

    updatedAt:
      purchase.updatedAt,
  };
}

export function synchronizePurchaseWithFinancial(
  purchase: Purchase,
): void {
  /*
   * A API futura será responsável pela própria transação.
   */
  if (
    apiConfig.dataSource ===
    "api"
  ) {
    return;
  }

  const transactions =
    readTransactions();

  const existingTransaction =
    transactions.find(
      (transaction) =>
        transaction.purchaseId ===
        purchase.id,
    );

  /*
   * Compra pendente ou cancelada antes de ser concluída
   * não deve gerar despesa.
   */
  if (
    !existingTransaction &&
    !purchase.completedAt
  ) {
    return;
  }

  if (
    existingTransaction
  ) {
    saveTransactions(
      transactions.map(
        (transaction) =>
          transaction.id ===
          existingTransaction.id
            ? updateFromPurchase(
                transaction,
                purchase,
              )
            : transaction,
      ),
    );

    return;
  }

  const transaction =
    createFromPurchase(
      purchase,
      createTransactionId(
        transactions,
      ),
    );

  saveTransactions([
    transaction,
    ...transactions,
  ]);
}