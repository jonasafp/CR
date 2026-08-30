import {
  useQuery,
} from "@tanstack/react-query";

import type {
  CustomerFilters,
} from "../../domain/customers/CustomerFilters";

import {
  customerService,
} from "../../services/customers/customerService";

export const customerQueryKeys = {
  all:
    [
      "customers",
    ] as const,

  lists: () =>
    [
      ...customerQueryKeys.all,
      "list",
    ] as const,

  list: (
    filters:
      CustomerFilters,
  ) =>
    [
      ...customerQueryKeys.lists(),
      filters,
    ] as const,

  active: () =>
    [
      ...customerQueryKeys.all,
      "active",
    ] as const,

  details: () =>
    [
      ...customerQueryKeys.all,
      "detail",
    ] as const,

  detail: (
    customerId: number,
  ) =>
    [
      ...customerQueryKeys.details(),
      customerId,
    ] as const,
};

export function useCustomersQuery(
  filters:
    CustomerFilters,
) {
  return useQuery({
    queryKey:
      customerQueryKeys.list(
        filters,
      ),

    queryFn: () =>
      customerService.list(
        filters,
      ),
  });
}

export function useActiveCustomersQuery() {
  return useQuery({
    queryKey:
      customerQueryKeys.active(),

    queryFn: () =>
      customerService.listActive(),

    staleTime:
      30_000,
  });
}

export function useCustomerQuery(
  customerId:
    number | null,
) {
  return useQuery({
    queryKey:
      customerQueryKeys.detail(
        customerId ?? 0,
      ),

    queryFn: () =>
      customerService.getById(
        customerId ?? 0,
      ),

    enabled:
      customerId !== null &&
      customerId > 0,
  });
}