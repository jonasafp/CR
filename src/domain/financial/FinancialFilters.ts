import type {
  FinancialTransactionSource,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from "./FinancialTransaction";

export type FinancialTransactionStatusFilter =
  | FinancialTransactionStatus
  | "overdue"
  | "all";

export type FinancialTransactionTypeFilter =
  | FinancialTransactionType
  | "all";

export type FinancialTransactionSourceFilter =
  | FinancialTransactionSource
  | "all";

export type FinancialSortField =
  | "createdAt"
  | "dueDate"
  | "amount"
  | "description";

export type FinancialSortDirection =
  | "asc"
  | "desc";

export interface FinancialFilters {
  search: string;

  type:
    FinancialTransactionTypeFilter;

  status:
    FinancialTransactionStatusFilter;

  source:
    FinancialTransactionSourceFilter;

  category: string;

  dateFrom: string;
  dateTo: string;

  sortBy:
    FinancialSortField;

  sortDirection:
    FinancialSortDirection;

  page: number;
  pageSize: number;
}

export const defaultFinancialFilters:
  FinancialFilters = {
    search: "",

    type: "all",
    status: "all",
    source: "all",

    category: "all",

    dateFrom: "",
    dateTo: "",

    sortBy: "dueDate",
    sortDirection: "desc",

    page: 1,
    pageSize: 10,
  };