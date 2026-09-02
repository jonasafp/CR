import type {
  CancelPurchaseInput,
  CompletePurchaseInput,
  CreatePurchaseInput,
  UpdatePurchaseInput,
} from "../../domain/purchases/Purchase";

import type {
  PurchaseFilters,
} from "../../domain/purchases/PurchaseFilters";

import {
  purchaseRepository,
} from "../../repositories/purchases/purchaseRepositoryFactory";

export const purchaseService = {
  list(
    filters:
      PurchaseFilters,
  ) {
    return purchaseRepository.list(
      filters,
    );
  },

  getById(
    purchaseId: number,
  ) {
    return purchaseRepository.getById(
      purchaseId,
    );
  },

  create(
    input:
      CreatePurchaseInput,
  ) {
    return purchaseRepository.create(
      input,
    );
  },

  update(
    input:
      UpdatePurchaseInput,
  ) {
    return purchaseRepository.update(
      input,
    );
  },

  complete(
    input:
      CompletePurchaseInput,
  ) {
    return purchaseRepository.complete(
      input,
    );
  },

  cancel(
    input:
      CancelPurchaseInput,
  ) {
    return purchaseRepository.cancel(
      input,
    );
  },

  getSummary(
    filters?: Partial<
      PurchaseFilters
    >,
  ) {
    return purchaseRepository.getSummary(
      filters,
    );
  },
};