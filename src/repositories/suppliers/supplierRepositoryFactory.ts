import {
  MockSupplierRepository,
} from "./mock/MockSupplierRepository";

import type {
  SupplierRepository,
} from "./SupplierRepository";

function createSupplierRepository():
  SupplierRepository {
  return new MockSupplierRepository();
}

export const supplierRepository =
  createSupplierRepository();