import type {
  SupplierStatus,
} from "./Supplier";

import type {
  PaginationRequest,
} from "../../types/Pagination";

export type SupplierStatusFilter =
  | "all"
  | SupplierStatus;

export type SupplierSortField =
  | "tradeName"
  | "legalName"
  | "createdAt"
  | "updatedAt";

export type SupplierSortDirection =
  | "asc"
  | "desc";

export interface SupplierFilters
  extends PaginationRequest {
  search: string;

  status:
    SupplierStatusFilter;

  sortBy:
    SupplierSortField;

  sortDirection:
    SupplierSortDirection;
}

export function createDefaultSupplierFilters():
  SupplierFilters {
  return {
    search:
      "",

    status:
      "active",

    sortBy:
      "tradeName",

    sortDirection:
      "asc",

    page:
      1,

    pageSize:
      20,
  };
}