import { apiConfig } from "../../api/apiConfig";

import { ApiSalesRepository } from "./api/ApiSalesRepository";
import { SupabaseSalesRepository } from "./supabase/SupabaseSalesRepository";

import type {
  SalesRepository,
} from "./SalesRepository";

function createSalesRepository(): SalesRepository {
  if (
    apiConfig.dataSource === "api"
  ) {
    return new ApiSalesRepository();
  }

  return new SupabaseSalesRepository();
}

export const salesRepository =
  createSalesRepository();
