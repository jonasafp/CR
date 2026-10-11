import { apiConfig } from "../../api/apiConfig";
import { MockSupplierRepository } from "./mock/MockSupplierRepository";
import { SupabaseSupplierRepository } from "./supabase/SupabaseSupplierRepository";

import type {
  SupplierRepository,
} from "./SupplierRepository";

function createSupplierRepository():
  SupplierRepository {
  return apiConfig.dataSource === "api"
    ? new MockSupplierRepository()
    : new SupabaseSupplierRepository();
}

export const supplierRepository =
  createSupplierRepository();
