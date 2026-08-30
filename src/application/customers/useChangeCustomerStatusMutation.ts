import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  ChangeCustomerStatusInput,
} from "../../domain/customers/Customer";

import {
  customerService,
} from "../../services/customers/customerService";

import {
  customerQueryKeys,
} from "./useCustomerQuery";

export function useChangeCustomerStatusMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        ChangeCustomerStatusInput,
    ) =>
      customerService.changeStatus(
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