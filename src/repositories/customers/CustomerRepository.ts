import type {
  ChangeCustomerStatusInput,
  CreateCustomerInput,
  Customer,
  UpdateCustomerInput,
} from "../../domain/customers/Customer";

import type {
  CustomerFilters,
} from "../../domain/customers/CustomerFilters";

import type {
  PaginatedResult,
} from "../../types/Pagination";

export interface CustomerRepository {
  list(
    filters:
      CustomerFilters,
  ): Promise<
    PaginatedResult<Customer>
  >;

  listActive():
    Promise<Customer[]>;

  getById(
    customerId: number,
  ): Promise<Customer>;

  create(
    input:
      CreateCustomerInput,
  ): Promise<Customer>;

  update(
    input:
      UpdateCustomerInput,
  ): Promise<Customer>;

  changeStatus(
    input:
      ChangeCustomerStatusInput,
  ): Promise<Customer>;
}