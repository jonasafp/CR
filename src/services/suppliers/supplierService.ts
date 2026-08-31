import type {
  ChangeSupplierStatusInput,
  CreateSupplierInput,
  UpdateSupplierInput,
} from "../../domain/suppliers/Supplier";

import type {
  SupplierFilters,
} from "../../domain/suppliers/SupplierFilters";

import {
  supplierRepository,
} from "../../repositories/suppliers/supplierRepositoryFactory";

export const supplierService = {
  list(
    filters:
      SupplierFilters,
  ) {
    return supplierRepository.list(
      filters,
    );
  },

  listActive() {
    return supplierRepository.listActive();
  },

  getById(
    supplierId: number,
  ) {
    return supplierRepository.getById(
      supplierId,
    );
  },

  create(
    input:
      CreateSupplierInput,
  ) {
    return supplierRepository.create(
      input,
    );
  },

  update(
    input:
      UpdateSupplierInput,
  ) {
    return supplierRepository.update(
      input,
    );
  },

  changeStatus(
    input:
      ChangeSupplierStatusInput,
  ) {
    return supplierRepository.changeStatus(
      input,
    );
  },
};