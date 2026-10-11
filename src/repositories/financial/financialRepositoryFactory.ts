import {
  apiConfig,
} from "../../api/apiConfig";

import {
  ApiFinancialRepository,
} from "./api/ApiFinancialRepository";

import { SupabaseFinancialRepository } from "./supabase/SupabaseFinancialRepository";

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

  return new SupabaseFinancialRepository();
}

export const financialRepository =
  createFinancialRepository();
