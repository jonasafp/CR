import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  UpdateCustomerInput,
} from "../../domain/customers/Customer";

import {
  customerService,
} from "../../services/customers/customerService";

import {
  customerQueryKeys,
} from "./useCustomerQuery";

export function useUpdateCustomerMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        UpdateCustomerInput,
    ) =>
      customerService.update(
        input,
      ),

    onSuccess: async (
      customer,
    ) => {
      queryClient.setQueryData(
        customerQueryKeys.detail(
          customer.id,
        ),

        customer,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            customerQueryKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey:
            customerQueryKeys.active(),
        }),
      ]);
    },
  });
}