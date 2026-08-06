import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  UpdateFinancialTransactionInput,
} from "../../domain/financial/FinancialTransaction";

import {
  financialService,
} from "../../services/financial/financialService";

import {
  financialQueryKeys,
} from "./useFinancialQuery";

export function useUpdateFinancialTransactionMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        UpdateFinancialTransactionInput,
    ) =>
      financialService.update(
        input,
      ),

    onSuccess: async (
      transaction,
    ) => {
      queryClient.setQueryData(
        financialQueryKeys.detail(
          transaction.id,
        ),

        transaction,
      );

      await queryClient
        .invalidateQueries({
          queryKey:
            financialQueryKeys.all,
        });
    },
  });
}