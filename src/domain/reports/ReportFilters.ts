import type {
  FinancialTransactionSource,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from "../financial/FinancialTransaction";

import type {
  PaymentMethod,
  SaleStatus,
} from "../sales/Sale";

import type {
  InventoryMovementType,
} from "../../types/Inventory";

import type {
  ProductStatus,
} from "../../types/Product";

import type {
  ReportGroupBy,
  ReportType,
} from "./Report";

import {
  getReportPresetPeriod,
} from "./ReportPeriod";

export type ReportPeriodPreset =
  | "today"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "custom";

export type ReportSortDirection =
  | "asc"
  | "desc";

export type ReportSortField =
  | "date"
  | "description"
  | "amount"
  | "quantity"
  | "profit";

export type ReportStockCondition =
  | "all"
  | "available"
  | "low"
  | "out";

export interface ReportFilters {
  reportType: ReportType;

  periodPreset:
  ReportPeriodPreset;

  dateFrom: string;
  dateTo: string;

  groupBy: ReportGroupBy;

  search: string;
  category: string;
  productId: number | null;

  saleStatus:
  | SaleStatus
  | "all";

  paymentMethod:
  | PaymentMethod
  | "all";

  financialType:
  | FinancialTransactionType
  | "all";

  financialStatus:
  | FinancialTransactionStatus
  | "overdue"
  | "all";

  financialSource:
  | FinancialTransactionSource
  | "all";

  productStatus:
  | ProductStatus
  | "all";

  stockCondition:
  ReportStockCondition;

  inventoryMovementType:
  | InventoryMovementType
  | "all";

  sortBy:
  ReportSortField;

  sortDirection:
  ReportSortDirection;

  page: number;
  pageSize: number;

  includeCancelledRecords:
  boolean;
}

interface DefaultReportFilterOptions {
  periodPreset?:
  ReportPeriodPreset;

  groupBy?:
  ReportGroupBy;

  pageSize?:
  number;

  includeCancelledRecords?:
  boolean;
}

export function createDefaultReportFilters(
  options:
    DefaultReportFilterOptions = {},
): ReportFilters {
  const periodPreset =
    options.periodPreset === "custom"
      ? "month"
      : options.periodPreset ??
      "month";

  const period =
    getReportPresetPeriod(
      periodPreset,
    );

  return {
    reportType: "sales",

    periodPreset,

    dateFrom:
      period.dateFrom,

    dateTo:
      period.dateTo,

    groupBy:
      options.groupBy ??
      "day",

    search: "",
    category: "all",
    productId: null,

    saleStatus: "all",
    paymentMethod: "all",

    financialType: "all",
    financialStatus: "all",
    financialSource: "all",

    productStatus: "all",
    stockCondition: "all",

    inventoryMovementType:
      "all",

    sortBy: "date",
    sortDirection: "desc",

    page: 1,
    pageSize:
      options.pageSize ??
      10,

    includeCancelledRecords:
      options
        .includeCancelledRecords ??
      false,
  };
}

export const defaultReportFilters =
  createDefaultReportFilters();