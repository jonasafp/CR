import {
  useQuery,
} from "@tanstack/react-query";

import type {
  FinancialTransactionType,
} from "../../domain/financial/FinancialTransaction";

import {
  financialService,
} from "../../services/financial/financialService";

import {
  financialQueryKeys,
} from "./useFinancialQuery";

export function useFinancialCategoriesQuery(
  type?:
    FinancialTransactionType,
) {
  return useQuery({
    queryKey:
      financialQueryKeys.categories(
        type,
      ),

    queryFn: () =>
      financialService
        .listCategories(
          type,
        ),
  });
}