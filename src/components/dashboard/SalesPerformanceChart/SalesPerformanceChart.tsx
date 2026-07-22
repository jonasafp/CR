import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartNoAxesCombined } from "lucide-react";

import ChartCard from "../../common/ChartCard/ChartCard";

import type {
  DashboardPeriod,
  SalesPerformancePoint,
} from "../../../types/Dashboard";

import { formatCurrency } from "../../../utils/formatters";

import styles from "./SalesPerformanceChart.module.css";

interface SalesPerformanceChartProps {
  data: SalesPerformancePoint[];
  period: DashboardPeriod;
}

const periodLabels: Record<DashboardPeriod, string> = {
  today: "Hoje",
  week: "Esta semana",
  month: "Este mês",
  year: "Este ano",
};

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function SalesPerformanceChart({
  data,
  period,
}: SalesPerformanceChartProps) {
  return (
    <ChartCard
      title="Desempenho financeiro"
      description="Comparativo entre faturamento, custos e lucro."
      icon={ChartNoAxesCombined}
      badge={periodLabels[period]}
      minHeight={330}
      className={styles.card}
    >
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 12,
              right: 8,
              bottom: 0,
              left: 0,
            }}
          >
            <defs>
              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#2563eb"
                  stopOpacity={0.3}
                />

                <stop
                  offset="95%"
                  stopColor="#2563eb"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="profitGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#16a34a"
                  stopOpacity={0.25}
                />

                <stop
                  offset="95%"
                  stopColor="#16a34a"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748b",
                fontSize: 10,
              }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              width={74}
              tick={{
                fill: "#64748b",
                fontSize: 10,
              }}
              tickFormatter={formatCompactCurrency}
            />

            <Tooltip
              cursor={{
                stroke: "#94a3b8",
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow:
                  "0 12px 30px rgba(15, 23, 42, 0.12)",
                fontSize: "11px",
              }}
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === "revenue"
                  ? "Faturamento"
                  : name === "cost"
                    ? "Custos"
                    : "Lucro",
              ]}
            />

            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingTop: "18px",
                fontSize: "10px",
              }}
              formatter={(value) => {
                if (value === "revenue") {
                  return "Faturamento";
                }

                if (value === "cost") {
                  return "Custos";
                }

                return "Lucro";
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2.4}
              fill="url(#revenueGradient)"
              activeDot={{ r: 5 }}
            />

            <Area
              type="monotone"
              dataKey="cost"
              stroke="#ea580c"
              strokeWidth={2}
              fill="transparent"
              strokeDasharray="5 4"
              activeDot={{ r: 4 }}
            />

            <Area
              type="monotone"
              dataKey="profit"
              stroke="#16a34a"
              strokeWidth={2.4}
              fill="url(#profitGradient)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}