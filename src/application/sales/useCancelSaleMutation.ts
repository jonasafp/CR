import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CancelSaleInput,
} from "../../domain/sales/Sale";

import {
  salesService,
} from "../../services/sales/salesService";

import {
  salesQueryKeys,
} from "./useSalesQuery";

export function useCancelSaleMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input: CancelSaleInput,
    ) =>
      salesService.cancel(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          salesQueryKeys.all,
      });
    },
  });
}