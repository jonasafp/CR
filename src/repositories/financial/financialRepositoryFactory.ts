import {
  apiConfig,
} from "../../api/apiConfig";

import {
  ApiFinancialRepository,
} from "./api/ApiFinancialRepository";

import {
  MockFinancialRepository,
} from "./mock/MockFinancialRepository";

import type {
  FinancialRepository,
} from "./FinancialRepository";

function createFinancialRepository():
  FinancialRepository {
  if (
    apiConfig.dataSource ===
    "api"
  ) {
    return new ApiFinancialRepository();
  }

  return new MockFinancialRepository();
}

export const financialRepository =
  createFinancialRepository();