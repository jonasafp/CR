import type {
  ChangeSupplierStatusInput,
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from "../../domain/suppliers/Supplier";

import type {
  SupplierFilters,
} from "../../domain/suppliers/SupplierFilters";

import type {
  PaginatedResult,
} from "../../types/Pagination";

export interface SupplierRepository {
  list(
    filters:
      SupplierFilters,
  ): Promise<
    PaginatedResult<Supplier>
  >;

  listActive():
    Promise<Supplier[]>;

  getById(
    supplierId: number,
  ): Promise<Supplier>;

  create(
    input:
      CreateSupplierInput,
  ): Promise<Supplier>;

  update(
    input:
      UpdateSupplierInput,
  ): Promise<Supplier>;

  changeStatus(
    input:
      ChangeSupplierStatusInput,
  ): Promise<Supplier>;
}