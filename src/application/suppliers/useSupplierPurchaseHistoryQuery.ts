import {
  useQuery,
} from "@tanstack/react-query";

import {
  purchaseQueryKeys,
} from "../purchases/usePurchaseQuery";

import {
  supplierPurchaseHistoryService,
} from "../../services/suppliers/supplierPurchaseHistoryService";

export function useSupplierPurchaseHistoryQuery(
  supplierId:
    number | null,
) {
  return useQuery({
    queryKey: [
      ...purchaseQueryKeys.all,
      "supplier-history",
      supplierId ?? 0,
    ],

    queryFn: () =>
      supplierPurchaseHistoryService
        .getBySupplierId(
          supplierId ?? 0,
        ),

    enabled:
      supplierId !== null &&
      supplierId > 0,
  });
}