import {
  createSaleDtoSchema,
} from "../../dtos/sales/SaleDto";

import type {
  CancelSaleInput,
  CreateSaleInput,
} from "../../domain/sales/Sale";

import type {
  SaleFilters,
} from "../../domain/sales/SaleFilters";

import {
  salesRepository,
} from "../../repositories/sales/salesRepositoryFactory";

export const salesService = {
  list(filters: SaleFilters) {
    return salesRepository.list(
      filters,
    );
  },

  getById(saleId: number) {
    return salesRepository.getById(
      saleId,
    );
  },

  create(input: CreateSaleInput) {
    const parsedInput =
      createSaleDtoSchema.parse(
        input,
      );

    return salesRepository.create(
      parsedInput,
    );
  },

  cancel(input: CancelSaleInput) {
    if (!input.reason.trim()) {
      throw new Error(
        "Informe o motivo do cancelamento.",
      );
    }

    return salesRepository.cancel({
      ...input,
      reason: input.reason.trim(),
    });
  },

  getSummary(
    filters?: Partial<SaleFilters>,
  ) {
    return salesRepository.getSummary(
      filters,
    );
  },
};