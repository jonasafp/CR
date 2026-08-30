import type {
  ChangeCustomerStatusInput,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../../domain/customers/Customer";

import type {
  CustomerFilters,
} from "../../domain/customers/CustomerFilters";

import {
  customerRepository,
} from "../../repositories/customers/customerRepositoryFactory";

export const customerService = {
  list(
    filters:
      CustomerFilters,
  ) {
    return customerRepository.list(
      filters,
    );
  },

  listActive() {
    return customerRepository.listActive();
  },

  getById(
    customerId: number,
  ) {
    return customerRepository.getById(
      customerId,
    );
  },

  create(
    input:
      CreateCustomerInput,
  ) {
    return customerRepository.create(
      input,
    );
  },

  update(
    input:
      UpdateCustomerInput,
  ) {
    return customerRepository.update(
      input,
    );
  },

  changeStatus(
    input:
      ChangeCustomerStatusInput,
  ) {
    return customerRepository.changeStatus(
      input,
    );
  },
};