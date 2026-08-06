import type {
  CancelFinancialTransactionInput,
  CreateFinancialTransactionInput,
  FinancialCategorySummary,
  FinancialSummary,
  FinancialTransaction,
  FinancialTransactionType,
  SettleFinancialTransactionInput,
  UpdateFinancialTransactionInput,
} from "../../domain/financial/FinancialTransaction";

import type {
  FinancialFilters,
} from "../../domain/financial/FinancialFilters";

import type {
  PaginatedResult,
} from "../../types/Pagination";

export interface FinancialRepository {
  list(
    filters: FinancialFilters,
  ): Promise<
    PaginatedResult<FinancialTransaction>
  >;

  getById(
    transactionId: number,
  ): Promise<FinancialTransaction>;

  create(
    input: CreateFinancialTransactionInput,
  ): Promise<FinancialTransaction>;

  update(
    input: UpdateFinancialTransactionInput,
  ): Promise<FinancialTransaction>;

  settle(
    input: SettleFinancialTransactionInput,
  ): Promise<FinancialTransaction>;

  cancel(
    input: CancelFinancialTransactionInput,
  ): Promise<FinancialTransaction>;

  getSummary(
    filters?: Partial<FinancialFilters>,
  ): Promise<FinancialSummary>;

  getCategorySummary(
    filters?: Partial<FinancialFilters>,
  ): Promise<FinancialCategorySummary[]>;

  listCategories(
    type?: FinancialTransactionType,
  ): Promise<string[]>;
}