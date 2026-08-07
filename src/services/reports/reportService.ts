import type {
  ReportFilters,
} from "../../domain/reports/ReportFilters";

import {
  isValidReportPeriod,
} from "../../domain/reports/ReportPeriod";

import {
  reportRepository,
} from "../../repositories/reports/reportRepositoryFactory";

export const reportService = {
  generate(
    filters: ReportFilters,
  ) {
    if (
      !isValidReportPeriod({
        dateFrom:
          filters.dateFrom,

        dateTo:
          filters.dateTo,
      })
    ) {
      return Promise.reject(
        new Error(
          "O período informado para o relatório é inválido.",
        ),
      );
    }

    return reportRepository.generate(
      filters,
    );
  },

  getFilterOptions() {
    return reportRepository
      .getFilterOptions();
  },
};