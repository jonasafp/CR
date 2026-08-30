import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CreateCustomerInput,
} from "../../domain/customers/Customer";

import {
  customerService,
} from "../../services/customers/customerService";

import {
  customerQueryKeys,
} from "./useCustomerQuery";

export function useCreateCustomerMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CreateCustomerInput,
    ) =>
      customerService.create(
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