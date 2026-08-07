import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CancelFinancialTransactionInput,
} from "../../domain/financial/FinancialTransaction";

import {
  financialService,
} from "../../services/financial/financialService";

import {
  reportQueryKeys,
} from "../reports/useReportQuery";

import {
  financialQueryKeys,
} from "./useFinancialQuery";

export function useCancelFinancialTransactionMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CancelFinancialTransactionInput,
    ) =>
      financialService.cancel(
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

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            financialQueryKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey:
            reportQueryKeys.all,
        }),
      ]);
    },
  });
}