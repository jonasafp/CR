import {
  useQuery,
} from "@tanstack/react-query";

import type {
  SaleFilters,
} from "../../domain/sales/SaleFilters";

import {
  salesService,
} from "../../services/sales/salesService";

export const salesQueryKeys = {
  all: ["sales"] as const,

  list: (
    filters: SaleFilters,
  ) =>
    [
      ...salesQueryKeys.all,
      "list",
      filters,
    ] as const,

  summary: (
    filters?: Partial<SaleFilters>,
  ) =>
    [
      ...salesQueryKeys.all,
      "summary",
      filters,
    ] as const,
};

export function useSalesQuery(
  filters: SaleFilters,
) {
  const salesQuery = useQuery({
    queryKey:
      salesQueryKeys.list(filters),

    queryFn: () =>
      salesService.list(filters),
  });

  const summaryQuery = useQuery({
    queryKey:
      salesQueryKeys.summary({
        status: filters.status,

        paymentMethod:
          filters.paymentMethod,
      }),

    queryFn: () =>
      salesService.getSummary({
        status: filters.status,

        paymentMethod:
          filters.paymentMethod,
      }),
  });

  return {
    salesQuery,
    summaryQuery,
  };
}