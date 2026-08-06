import {
  cancelFinancialTransactionDtoSchema,
  createFinancialTransactionDtoSchema,
  settleFinancialTransactionDtoSchema,
  updateFinancialTransactionDtoSchema,
} from "../../dtos/financial/FinancialTransactionDto";

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

function validateTransactionId(
  transactionId: number,
): number {
  if (
    !Number.isInteger(
      transactionId,
    ) ||
    transactionId <= 0
  ) {
    throw new Error(
      "O identificador do lançamento financeiro é inválido.",
    );
  }

  return transactionId;
}

export const financialService = {
  list(
    filters: FinancialFilters,
  ) {
    return financialRepository.list(
      filters,
    );
  },

  getById(
    transactionId: number,
  ) {
    return financialRepository.getById(
      validateTransactionId(
        transactionId,
      ),
    );
  },

  create(
    input:
      CreateFinancialTransactionInput,
  ) {
    const parsedInput =
      createFinancialTransactionDtoSchema.parse(
        input,
      );

    return financialRepository.create(
      parsedInput,
    );
  },

  update(
    input:
      UpdateFinancialTransactionInput,
  ) {
    const parsedInput =
      updateFinancialTransactionDtoSchema.parse(
        input,
      );

    return financialRepository.update(
      parsedInput,
    );
  },

  settle(
    input:
      SettleFinancialTransactionInput,
  ) {
    const parsedInput =
      settleFinancialTransactionDtoSchema.parse(
        input,
      );

    return financialRepository.settle(
      parsedInput,
    );
  },

  cancel(
    input:
      CancelFinancialTransactionInput,
  ) {
    const parsedInput =
      cancelFinancialTransactionDtoSchema.parse(
        input,
      );

    return financialRepository.cancel(
      parsedInput,
    );
  },

  getSummary(
    filters?:
      Partial<FinancialFilters>,
  ) {
    return financialRepository.getSummary(
      filters,
    );
  },

  getCategorySummary(
    filters?:
      Partial<FinancialFilters>,
  ) {
    return financialRepository
      .getCategorySummary(
        filters,
      );
  },

  listCategories(
    type?:
      FinancialTransactionType,
  ) {
    return financialRepository
      .listCategories(
        type,
      );
  },
};