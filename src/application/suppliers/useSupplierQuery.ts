import {
  useQuery,
} from "@tanstack/react-query";

import type {
  SupplierFilters,
} from "../../domain/suppliers/SupplierFilters";

import {
  supplierService,
} from "../../services/suppliers/supplierService";

export const supplierQueryKeys = {
  all:
    [
      "suppliers",
    ] as const,

  lists: () =>
    [
      ...supplierQueryKeys.all,
      "list",
    ] as const,

  list: (
    filters:
      SupplierFilters,
  ) =>
    [
      ...supplierQueryKeys.lists(),
      filters,
    ] as const,

  active: () =>
    [
      ...supplierQueryKeys.all,
      "active",
    ] as const,

  details: () =>
    [
      ...supplierQueryKeys.all,
      "detail",
    ] as const,

  detail: (
    supplierId: number,
  ) =>
    [
      ...supplierQueryKeys.details(),
      supplierId,
    ] as const,
};

export function useSuppliersQuery(
  filters:
    SupplierFilters,
) {
  return useQuery({
    queryKey:
      supplierQueryKeys.list(
        filters,
      ),

    queryFn: () =>
      supplierService.list(
        filters,
      ),
  });
}

export function useActiveSuppliersQuery() {
  return useQuery({
    queryKey:
      supplierQueryKeys.active(),

    queryFn: () =>
      supplierService.listActive(),

    staleTime:
      30_000,
  });
}

export function useSupplierQuery(
  supplierId:
    number | null,
) {
  return useQuery({
    queryKey:
      supplierQueryKeys.detail(
        supplierId ?? 0,
      ),

    queryFn: () =>
      supplierService.getById(
        supplierId ?? 0,
      ),

    enabled:
      supplierId !== null &&
      supplierId > 0,
  });
}