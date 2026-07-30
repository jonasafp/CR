import type {
  PaymentMethod,
  SaleStatus,
} from "./Sale";

import type {
  PaginationRequest,
} from "../../types/Pagination";

export interface SaleFilters
  extends PaginationRequest {
  search: string;

  status: SaleStatus | "all";

  paymentMethod:
    | PaymentMethod
    | "all";

  dateFrom?: string;
  dateTo?: string;

  sortBy:
    | "createdAt"
    | "total"
    | "number";

  sortDirection:
    | "asc"
    | "desc";
}

export const defaultSaleFilters: SaleFilters = {
  search: "",

  status: "all",
  paymentMethod: "all",

  page: 1,
  pageSize: 10,

  sortBy: "createdAt",
  sortDirection: "desc",
};