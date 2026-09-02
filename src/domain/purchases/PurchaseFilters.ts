import type {
  PurchaseStatus,
} from "./Purchase";

import type {
  PaginationRequest,
} from "../../types/Pagination";

export type PurchaseStatusFilter =
  | "all"
  | PurchaseStatus;

export type PurchaseSortField =
  | "purchaseDate"
  | "createdAt"
  | "total"
  | "number";

export type PurchaseSortDirection =
  | "asc"
  | "desc";

export interface PurchaseFilters
  extends PaginationRequest {
  search: string;

  status:
    PurchaseStatusFilter;

  supplierId?:
    number;

  dateFrom?:
    string;

  dateTo?:
    string;

  sortBy:
    PurchaseSortField;

  sortDirection:
    PurchaseSortDirection;
}

export function createDefaultPurchaseFilters():
  PurchaseFilters {
  return {
    search:
      "",

    status:
      "all",

    supplierId:
      undefined,

    dateFrom:
      undefined,

    dateTo:
      undefined,

    sortBy:
      "purchaseDate",

    sortDirection:
      "desc",

    page:
      1,

    pageSize:
      20,
  };
}