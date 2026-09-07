export type FinancialTransactionType =
  | "income"
  | "expense";

export type FinancialTransactionStatus =
  | "pending"
  | "received"
  | "paid"
  | "cancelled";

export type FinancialTransactionSource =
  | "manual"
  | "sale"
  | "purchase"
  | "inventory"
  | "other";

export type FinancialPaymentMethod =
  | "cash"
  | "pix"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "bank_slip"
  | "other";

export interface FinancialTransaction {
  id: number;

  number: string;

  type:
  FinancialTransactionType;

  status:
  FinancialTransactionStatus;

  source:
  FinancialTransactionSource;

  description: string;
  category: string;

  amount: number;

  dueDate: string;

  paymentDate?: string;

  paymentMethod?:
  FinancialPaymentMethod;

  customerOrSupplier?: string;

  notes?: string;

  saleId?: number;
  saleNumber?: string;

  purchaseId?: number;
  purchaseNumber?: string;

  inventoryMovementId?: number;

  createdAt: string;
  updatedAt: string;

  createdBy: string;
}

export interface CreateFinancialTransactionInput {
  type:
  FinancialTransactionType;

  description: string;
  category: string;

  amount: number;

  dueDate: string;

  status?:
  FinancialTransactionStatus;

  paymentDate?: string;

  paymentMethod?:
  FinancialPaymentMethod;

  customerOrSupplier?: string;

  notes?: string;

  source?:
  FinancialTransactionSource;

  saleId?: number;
  saleNumber?: string;

  purchaseId?: number;
  purchaseNumber?: string;

  inventoryMovementId?: number;
}

export interface UpdateFinancialTransactionInput {
  transactionId: number;

  type:
  FinancialTransactionType;

  description: string;
  category: string;

  amount: number;

  dueDate: string;

  status:
  FinancialTransactionStatus;

  paymentDate?: string;

  paymentMethod?:
  FinancialPaymentMethod;

  customerOrSupplier?: string;

  notes?: string;
}

export interface SettleFinancialTransactionInput {
  transactionId: number;

  paymentDate: string;

  paymentMethod:
  FinancialPaymentMethod;
}

export interface CancelFinancialTransactionInput {
  transactionId: number;

  reason: string;
}

export interface FinancialSummary {
  totalIncome: number;

  totalExpense: number;

  balance: number;

  accountsReceivable: number;

  accountsPayable: number;

  overdueReceivable: number;

  overduePayable: number;

  receivedTransactions: number;

  paidTransactions: number;

  pendingTransactions: number;

  overdueTransactions: number;

  cancelledTransactions: number;
}

export interface FinancialCategorySummary {
  category: string;

  income: number;
  expense: number;

  balance: number;

  transactionCount: number;
}

export interface FinancialCashFlowItem {
  date: string;

  income: number;
  expense: number;

  balance: number;
}

export function isFinancialTransactionSettled(
  transaction: FinancialTransaction,
): boolean {
  return (
    transaction.status ===
    "received" ||
    transaction.status ===
    "paid"
  );
}

export function isFinancialTransactionOverdue(
  transaction: FinancialTransaction,
  referenceDate = new Date(),
): boolean {
  if (
    transaction.status !==
    "pending"
  ) {
    return false;
  }

  const today =
    referenceDate
      .toISOString()
      .slice(0, 10);

  return (
    transaction.dueDate <
    today
  );
}

export function getFinancialTransactionOpenStatus(
  transaction: FinancialTransaction,
): "pending" | "overdue" {
  return isFinancialTransactionOverdue(
    transaction,
  )
    ? "overdue"
    : "pending";
}

export function getExpectedSettledStatus(
  type: FinancialTransactionType,
): Extract<
  FinancialTransactionStatus,
  "received" | "paid"
> {
  return type === "income"
    ? "received"
    : "paid";
}