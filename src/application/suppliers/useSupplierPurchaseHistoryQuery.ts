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
    string | number | null,
) {
  return useQuery({
    queryKey: [
      ...purchaseQueryKeys.all,
      "supplier-history",
      supplierId ?? "",
    ],

    queryFn: () =>
      supplierPurchaseHistoryService
        .getBySupplierId(
          supplierId ?? "",
        ),

    enabled:
      supplierId !== null &&
      String(supplierId).length > 0,
  });
}
