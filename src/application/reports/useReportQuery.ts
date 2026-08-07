import {
  useQuery,
} from "@tanstack/react-query";

import type {
  ReportFilters,
} from "../../domain/reports/ReportFilters";

import {
  reportService,
} from "../../services/reports/reportService";

export const reportQueryKeys = {
  all:
    [
      "reports",
    ] as const,

  results: () =>
    [
      ...reportQueryKeys.all,
      "result",
    ] as const,

  result: (
    filters: ReportFilters,
  ) =>
    [
      ...reportQueryKeys.results(),
      filters,
    ] as const,

  filterOptions: () =>
    [
      ...reportQueryKeys.all,
      "filter-options",
    ] as const,
};

export function useReportQuery(
  filters: ReportFilters,
) {
  return useQuery({
    queryKey:
      reportQueryKeys.result(
        filters,
      ),

    queryFn: () =>
      reportService.generate(
        filters,
      ),

    staleTime: 0,
    refetchOnMount: "always",
  });
}