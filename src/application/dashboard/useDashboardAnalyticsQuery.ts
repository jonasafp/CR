import { useQuery } from "@tanstack/react-query";
import { getDashboardAnalytics } from "../../repositories/dashboard/SupabaseDashboardRepository";
import type { DashboardPeriod } from "../../types/Dashboard";
import type { StockUnit } from "../../types/Product";

export function useDashboardAnalyticsQuery(period:DashboardPeriod,principalUnit:StockUnit){return useQuery({queryKey:["dashboard","analytics",period,principalUnit],queryFn:()=>getDashboardAnalytics(period,principalUnit),staleTime:30_000});}
