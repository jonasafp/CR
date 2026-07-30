import type {
  CancelSaleInput,
  CreateSaleInput,
  Sale,
  SalesSummary,
} from "../../domain/sales/Sale";

import type {
  SaleFilters,
} from "../../domain/sales/SaleFilters";

import type {
  PaginatedResult,
} from "../../types/Pagination";

export interface SalesRepository {
  list(
    filters: SaleFilters,
  ): Promise<PaginatedResult<Sale>>;

  getById(
    saleId: number,
  ): Promise<Sale>;

  create(
    input: CreateSaleInput,
  ): Promise<Sale>;

  cancel(
    input: CancelSaleInput,
  ): Promise<Sale>;

  getSummary(
    filters?: Partial<SaleFilters>,
  ): Promise<SalesSummary>;
}