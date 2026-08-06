import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CreateFinancialTransactionInput,
} from "../../domain/financial/FinancialTransaction";

import {
  financialService,
} from "../../services/financial/financialService";

import {
  financialQueryKeys,
} from "./useFinancialQuery";

export function useCreateFinancialTransactionMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CreateFinancialTransactionInput,
    ) =>
      financialService.create(
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