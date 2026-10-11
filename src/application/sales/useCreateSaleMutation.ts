import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CreateSaleInput,
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

export function useCreateSaleMutation() {
  const queryClient =
    useQueryClient();
  const { refreshProducts } = useProducts();
  const { refreshMovements } = useInventory();

  return useMutation({
    mutationFn: (
      input: CreateSaleInput,
    ) =>
      salesService.create(
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
