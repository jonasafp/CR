import {
  useQuery,
} from "@tanstack/react-query";

import type {
  FinancialFilters,
} from "../../domain/financial/FinancialFilters";

import {
  financialService,
} from "../../services/financial/financialService";

export const financialQueryKeys = {
  all:
    [
      "financial",
    ] as const,

  lists: () =>
    [
      ...financialQueryKeys.all,
      "list",
    ] as const,

  list: (
    filters:
      FinancialFilters,
  ) =>
    [
      ...financialQueryKeys.lists(),
      filters,
    ] as const,

  details: () =>
    [
      ...financialQueryKeys.all,
      "detail",
    ] as const,

  detail: (
    transactionId: number,
  ) =>
    [
      ...financialQueryKeys.details(),
      transactionId,
    ] as const,

  summaries: () =>
    [
      ...financialQueryKeys.all,
      "summary",
    ] as const,

  summary: (
    filters?:
      Partial<FinancialFilters>,
  ) =>
    [
      ...financialQueryKeys.summaries(),
      filters,
    ] as const,

  categorySummaries: () =>
    [
      ...financialQueryKeys.all,
      "category-summary",
    ] as const,

  categorySummary: (
    filters?:
      Partial<FinancialFilters>,
  ) =>
    [
      ...financialQueryKeys
        .categorySummaries(),

      filters,
    ] as const,

  categories: (
    type?: string,
  ) =>
    [
      ...financialQueryKeys.all,
      "categories",
      type ?? "all",
    ] as const,
};

export function useFinancialQuery(
  filters: FinancialFilters,
) {
  const summaryFilters:
    Partial<FinancialFilters> = {
      type:
        filters.type,

      source:
        filters.source,

      category:
        filters.category,

      dateFrom:
        filters.dateFrom,

      dateTo:
        filters.dateTo,
    };

  const transactionsQuery =
    useQuery({
      queryKey:
        financialQueryKeys.list(
          filters,
        ),

      queryFn: () =>
        financialService.list(
          filters,
        ),
    });

  const summaryQuery =
    useQuery({
      queryKey:
        financialQueryKeys.summary(
          summaryFilters,
        ),

      queryFn: () =>
        financialService.getSummary(
          summaryFilters,
        ),
    });

  const categorySummaryQuery =
    useQuery({
      queryKey:
        financialQueryKeys
          .categorySummary(
            summaryFilters,
          ),

      queryFn: () =>
        financialService
          .getCategorySummary(
            summaryFilters,
          ),
    });

  return {
    transactionsQuery,

    summaryQuery,

    categorySummaryQuery,
  };
}

export function useFinancialTransactionQuery(
  transactionId:
    number | null,
) {
  return useQuery({
    queryKey:
      financialQueryKeys.detail(
        transactionId ?? 0,
      ),

    queryFn: () =>
      financialService.getById(
        transactionId ?? 0,
      ),

    enabled:
      transactionId !== null &&
      transactionId > 0,
  });
}