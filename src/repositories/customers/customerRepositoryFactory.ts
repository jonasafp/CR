import { SupabaseCustomerRepository } from "./supabase/SupabaseCustomerRepository";

import type {
  CustomerRepository,
} from "./CustomerRepository";

function createCustomerRepository():
  CustomerRepository {
  return new SupabaseCustomerRepository();
}

export const customerRepository =
  createCustomerRepository();
