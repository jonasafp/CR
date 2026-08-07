import {
  apiConfig,
} from "../../api/apiConfig";

import {
  ApiReportRepository,
} from "./api/ApiReportRepository";

import {
  MockReportRepository,
} from "./mock/MockReportRepository";

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

  return new MockReportRepository();
}

export const reportRepository =
  createReportRepository();