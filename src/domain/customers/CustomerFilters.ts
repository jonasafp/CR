import type {
  CustomerStatus,
} from "./Customer";

import type {
  PaginationRequest,
} from "../../types/Pagination";

export type CustomerStatusFilter =
  | "all"
  | CustomerStatus;

export type CustomerSortField =
  | "name"
  | "createdAt"
  | "updatedAt";

export type CustomerSortDirection =
  | "asc"
  | "desc";

export interface CustomerFilters
  extends PaginationRequest {
  search: string;

  status:
    CustomerStatusFilter;

  sortBy:
    CustomerSortField;

  sortDirection:
    CustomerSortDirection;
}

export function createDefaultCustomerFilters():
  CustomerFilters {
  return {
    search:
      "",

    status:
      "active",

    sortBy:
      "name",

    sortDirection:
      "asc",

    page:
      1,

    pageSize:
      20,
  };
}