import {
  useQuery,
} from "@tanstack/react-query";

import {
  financialQueryKeys,
} from "../financial/useFinancialQuery";

import {
  financialService,
} from "../../services/financial/financialService";

import type {
  DashboardPeriod,
} from "../../types/Dashboard";

function formatDate(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPeriodDateRange(
  period: DashboardPeriod,
) {
  const today =
    new Date();

  const endDate =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

  const startDate =
    new Date(endDate);

  if (period === "week") {
    const currentDay =
      startDate.getDay();

    const daysSinceMonday =
      currentDay === 0
        ? 6
        : currentDay - 1;

    startDate.setDate(
      startDate.getDate() -
        daysSinceMonday,
    );
  } else if (
    period === "month"
  ) {
    startDate.setDate(1);
  } else if (
    period === "year"
  ) {
    startDate.setMonth(0, 1);
  }

  return {
    dateFrom:
      formatDate(startDate),

    dateTo:
      formatDate(endDate),
  };
}

export function useDashboardFinancialQuery(
  period: DashboardPeriod,
) {
  const dateRange =
    getPeriodDateRange(period);

  return useQuery({
    queryKey:
      financialQueryKeys.summary(
        dateRange,
      ),

    queryFn: () =>
      financialService.getSummary(
        dateRange,
      ),
  });
}