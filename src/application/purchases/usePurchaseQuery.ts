import {
  useQuery,
} from "@tanstack/react-query";

import type {
  PurchaseFilters,
} from "../../domain/purchases/PurchaseFilters";

import {
  purchaseService,
} from "../../services/purchases/purchaseService";

export const purchaseQueryKeys = {
  all:
    [
      "purchases",
    ] as const,

  lists: () =>
    [
      ...purchaseQueryKeys.all,
      "list",
    ] as const,

  list: (
    filters:
      PurchaseFilters,
  ) =>
    [
      ...purchaseQueryKeys.lists(),
      filters,
    ] as const,

  details: () =>
    [
      ...purchaseQueryKeys.all,
      "detail",
    ] as const,

  detail: (
    purchaseId: number,
  ) =>
    [
      ...purchaseQueryKeys.details(),
      purchaseId,
    ] as const,

  summaries: () =>
    [
      ...purchaseQueryKeys.all,
      "summary",
    ] as const,

  summary: (
    filters?: Partial<
      PurchaseFilters
    >,
  ) =>
    [
      ...purchaseQueryKeys.summaries(),
      filters ?? {},
    ] as const,
};

export function usePurchasesQuery(
  filters:
    PurchaseFilters,
) {
  return useQuery({
    queryKey:
      purchaseQueryKeys.list(
        filters,
      ),

    queryFn: () =>
      purchaseService.list(
        filters,
      ),
  });
}

export function usePurchaseQuery(
  purchaseId:
    number | null,
) {
  return useQuery({
    queryKey:
      purchaseQueryKeys.detail(
        purchaseId ?? 0,
      ),

    queryFn: () =>
      purchaseService.getById(
        purchaseId ?? 0,
      ),

    enabled:
      purchaseId !== null &&
      purchaseId > 0,
  });
}

export function usePurchaseSummaryQuery(
  filters?: Partial<
    PurchaseFilters
  >,
) {
  return useQuery({
    queryKey:
      purchaseQueryKeys.summary(
        filters,
      ),

    queryFn: () =>
      purchaseService.getSummary(
        filters,
      ),
  });
}