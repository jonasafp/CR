import type {
  CancelFinancialTransactionInput,
  CreateFinancialTransactionInput,
  FinancialTransactionType,
  SettleFinancialTransactionInput,
  UpdateFinancialTransactionInput,
} from "../../domain/financial/FinancialTransaction";

import type {
  FinancialFilters,
} from "../../domain/financial/FinancialFilters";

import {
  financialRepository,
} from "../../repositories/financial/financialRepositoryFactory";

import {
  synchronizeExistingSalesWithFinancial,
} from "./financialSalesSyncService";

function ensureSalesSynchronization() {
  synchronizeExistingSalesWithFinancial();
}

export const financialService = {
  list(
    filters: FinancialFilters,
  ) {
    ensureSalesSynchronization();

    return financialRepository.list(
      filters,
    );
  },

  getById(
    transactionId: number,
  ) {
    ensureSalesSynchronization();

    return financialRepository.getById(
      transactionId,
    );
  },

  create(
    input: CreateFinancialTransactionInput,
  ) {
    return financialRepository.create(
      input,
    );
  },

  update(
    input: UpdateFinancialTransactionInput,
  ) {
    return financialRepository.update(
      input,
    );
  },

  settle(
    input: SettleFinancialTransactionInput,
  ) {
    return financialRepository.settle(
      input,
    );
  },

  cancel(
    input: CancelFinancialTransactionInput,
  ) {
    return financialRepository.cancel(
      input,
    );
  },

  getSummary(
    filters?: Partial<FinancialFilters>,
  ) {
    ensureSalesSynchronization();

    return financialRepository.getSummary(
      filters,
    );
  },

  getCategorySummary(
    filters?: Partial<FinancialFilters>,
  ) {
    ensureSalesSynchronization();

    return financialRepository.getCategorySummary(
      filters,
    );
  },

  listCategories(
    type?: FinancialTransactionType,
  ) {
    return financialRepository.listCategories(
      type,
    );
  },
};