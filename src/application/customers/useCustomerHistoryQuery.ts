import {
  useQuery,
} from "@tanstack/react-query";

import {
  salesQueryKeys,
} from "../sales/useSalesQuery";

import {
  customerHistoryService,
} from "../../services/customers/customerHistoryService";

export function useCustomerHistoryQuery(
  customerId:
    string | null,
) {
  return useQuery({
    queryKey: [
      ...salesQueryKeys.all,
      "customer-history",
      customerId ?? "",
    ],

    queryFn: () =>
      customerHistoryService
        .getByCustomerId(
          customerId ?? "",
        ),

    enabled:
      Boolean(customerId),
  });
}
