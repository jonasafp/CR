import type {
  CancelPurchaseInput,
  CompletePurchaseInput,
  CreatePurchaseInput,
  Purchase,
  PurchaseSummary,
  UpdatePurchaseInput,
} from "../../domain/purchases/Purchase";

import type {
  PurchaseFilters,
} from "../../domain/purchases/PurchaseFilters";

import type {
  PaginatedResult,
} from "../../types/Pagination";

export interface PurchaseRepository {
  list(
    filters:
      PurchaseFilters,
  ): Promise<
    PaginatedResult<Purchase>
  >;

  getById(
    purchaseId: number,
  ): Promise<Purchase>;

  create(
    input:
      CreatePurchaseInput,
  ): Promise<Purchase>;

  update(
    input:
      UpdatePurchaseInput,
  ): Promise<Purchase>;

  complete(
    input:
      CompletePurchaseInput,
  ): Promise<Purchase>;

  cancel(
    input:
      CancelPurchaseInput,
  ): Promise<Purchase>;

  getSummary(
    filters?: Partial<
      PurchaseFilters
    >,
  ): Promise<
    PurchaseSummary
  >;
}