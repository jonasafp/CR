import {
  useQuery,
} from "@tanstack/react-query";

import {
  reportService,
} from "../../services/reports/reportService";

import {
  reportQueryKeys,
} from "./useReportQuery";

export function useReportFilterOptionsQuery() {
  return useQuery({
    queryKey:
      reportQueryKeys
        .filterOptions(),

    queryFn: () =>
      reportService
        .getFilterOptions(),

    staleTime: 0,
    refetchOnMount: "always",
  });
}