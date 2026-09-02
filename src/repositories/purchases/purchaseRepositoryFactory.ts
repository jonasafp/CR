import {
  MockPurchaseRepository,
} from "./mock/MockPurchaseRepository";

import type {
  PurchaseRepository,
} from "./PurchaseRepository";

function createPurchaseRepository():
  PurchaseRepository {
  return new MockPurchaseRepository();
}

export const purchaseRepository =
  createPurchaseRepository();