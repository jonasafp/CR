import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  UpdateSupplierInput,
} from "../../domain/suppliers/Supplier";

import {
  supplierService,
} from "../../services/suppliers/supplierService";

import {
  supplierQueryKeys,
} from "./useSupplierQuery";

export function useUpdateSupplierMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        UpdateSupplierInput,
    ) =>
      supplierService.update(
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