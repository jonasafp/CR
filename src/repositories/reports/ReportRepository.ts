import type {
  AnyReportResult,
} from "../../domain/reports/Report";

import type {
  ReportFilters,
} from "../../domain/reports/ReportFilters";

export interface ReportFilterOptions {
  categories: string[];

  products: Array<{
    id: number;
    code: string;
    name: string;
  }>;
}

export interface ReportRepository {
  generate(
    filters: ReportFilters,
  ): Promise<AnyReportResult>;

  getFilterOptions():
    Promise<ReportFilterOptions>;
}