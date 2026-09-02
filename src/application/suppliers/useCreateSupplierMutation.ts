import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CreateSupplierInput,
} from "../../domain/suppliers/Supplier";

import {
  supplierService,
} from "../../services/suppliers/supplierService";

import {
  supplierQueryKeys,
} from "./useSupplierQuery";

export function useCreateSupplierMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CreateSupplierInput,
    ) =>
      supplierService.create(
        input,
      ),

    onSuccess: async (
      supplier,
    ) => {
      queryClient.setQueryData(
        supplierQueryKeys.detail(
          supplier.id,
        ),

        supplier,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            supplierQueryKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey:
            supplierQueryKeys.active(),
        }),
      ]);
    },
  });
}