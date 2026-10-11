import {
  apiConfig,
} from "../../api/apiConfig";

import {
  ApiReportRepository,
} from "./api/ApiReportRepository";

import { SupabaseReportRepository } from "./supabase/SupabaseReportRepository";

import type {
  ReportRepository,
} from "./ReportRepository";

function createReportRepository():
  ReportRepository {
  if (
    apiConfig.dataSource ===
    "api"
  ) {
    return new ApiReportRepository();
  }

  return new SupabaseReportRepository();
}

export const reportRepository =
  createReportRepository();
