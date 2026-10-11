import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CancelSaleInput,
} from "../../domain/sales/Sale";

import {
  synchronizeSaleWithFinancial,
} from "../../services/financial/financialSalesSyncService";

import {
  salesService,
} from "../../services/sales/salesService";

import {
  reportQueryKeys,
} from "../reports/useReportQuery";

import {
  salesQueryKeys,
} from "./useSalesQuery";
import { useProducts } from "../../hooks/useProducts";
import { useInventory } from "../../hooks/useInventory";

export function useCancelSaleMutation() {
  const queryClient =
    useQueryClient();
  const { refreshProducts } = useProducts();
  const { refreshMovements } = useInventory();

  return useMutation({
    mutationFn: (
      input: CancelSaleInput,
    ) =>
      salesService.cancel(
        input,
      ),

    onSuccess: async (sale) => {
      synchronizeSaleWithFinancial(
        sale,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            salesQueryKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "financial",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey:
            reportQueryKeys.all,
        }),

        refreshProducts(),
        refreshMovements(),
      ]);
    },
  });
}
