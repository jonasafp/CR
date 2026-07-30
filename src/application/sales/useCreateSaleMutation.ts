import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CreateSaleInput,
} from "../../domain/sales/Sale";

import {
  salesService,
} from "../../services/sales/salesService";

import {
  salesQueryKeys,
} from "./useSalesQuery";

export function useCreateSaleMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateSaleInput,
    ) =>
      salesService.create(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          salesQueryKeys.all,
      });
    },
  });
}