import {
  httpClient,
} from "../../../api/httpClient";

import type {
  AnyReportResult,
} from "../../../domain/reports/Report";

import type {
  ReportFilters,
} from "../../../domain/reports/ReportFilters";

import type {
  ReportFilterOptions,
  ReportRepository,
} from "../ReportRepository";

function createQueryString(
  filters: ReportFilters,
): string {
  const params =
    new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
      if (
        value === "" ||
        value === "all" ||
        value === null ||
        value === undefined
      ) {
        return;
      }

      params.set(
        key,
        String(value),
      );
    },
  );

  return params.toString();
}

export class ApiReportRepository
  implements ReportRepository
{
  generate(
    filters: ReportFilters,
  ): Promise<AnyReportResult> {
    return httpClient.get<AnyReportResult>(
      `/reports/${filters.reportType}?${createQueryString(
        filters,
      )}`,
    );
  }

  getFilterOptions():
    Promise<ReportFilterOptions> {
    return httpClient.get<ReportFilterOptions>(
      "/reports/filter-options",
    );
  }
}