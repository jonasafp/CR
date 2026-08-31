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
    number | null,
) {
  return useQuery({
    queryKey: [
      ...salesQueryKeys.all,
      "customer-history",
      customerId ?? 0,
    ],

    queryFn: () =>
      customerHistoryService
        .getByCustomerId(
          customerId ?? 0,
        ),

    enabled:
      customerId !== null &&
      customerId > 0,
  });
}