import {
  MockPurchaseRepository,
} from "./mock/MockPurchaseRepository";
import { apiConfig } from "../../api/apiConfig";
import { SupabasePurchaseRepository } from "./supabase/SupabasePurchaseRepository";

import type {
  PurchaseRepository,
} from "./PurchaseRepository";

function createPurchaseRepository():
  PurchaseRepository {
  return apiConfig.dataSource === "api"
    ? new MockPurchaseRepository()
    : new SupabasePurchaseRepository();
}

export const purchaseRepository =
  createPurchaseRepository();
