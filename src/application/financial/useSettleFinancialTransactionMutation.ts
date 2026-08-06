import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  SettleFinancialTransactionInput,
} from "../../domain/financial/FinancialTransaction";

import {
  financialService,
} from "../../services/financial/financialService";

import {
  financialQueryKeys,
} from "./useFinancialQuery";

export function useSettleFinancialTransactionMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        SettleFinancialTransactionInput,
    ) =>
      financialService.settle(
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