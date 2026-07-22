import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartBarBig } from "lucide-react";

import ChartCard from "../../common/ChartCard/ChartCard";

import type {
  CategoryPerformanceItem,
  DashboardPeriod,
} from "../../../types/Dashboard";

import { formatCurrency } from "../../../utils/formatters";

import styles from "./CategoryPerformanceChart.module.css";

interface CategoryPerformanceChartProps {
  data: CategoryPerformanceItem[];
  period: DashboardPeriod;
}

const periodLabels: Record<DashboardPeriod, string> = {
  today: "Hoje",
  week: "Semana",
  month: "Mês",
  year: "Ano",
};

function formatCompactValue(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function CategoryPerformanceChart({
  data,
  period,
}: CategoryPerformanceChartProps) {
  return (
    <ChartCard
      title="Desempenho por categoria"
      description="Categorias com maior participação nas vendas."
      icon={ChartBarBig}
      badge={periodLabels[period]}
      minHeight={330}
      className={styles.card}
    >
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 15,
              bottom: 5,
              left: 15,
            }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              horizontal={false}
              stroke="#e2e8f0"
            />

            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748b",
                fontSize: 10,
              }}
              tickFormatter={formatCompactValue}
            />

            <YAxis
              dataKey="category"
              type="category"
              axisLine={false}
              tickLine={false}
              width={78}
              tick={{
                fill: "#475569",
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            <Tooltip
              cursor={{
                fill: "rgba(241, 245, 249, 0.7)",
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
                  : "Lucro",
              ]}
            />

            <Bar
              dataKey="revenue"
              name="revenue"
              fill="#2563eb"
              radius={[0, 7, 7, 0]}
              barSize={17}
            />

            <Bar
              dataKey="profit"
              name="profit"
              fill="#22c55e"
              radius={[0, 7, 7, 0]}
              barSize={17}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legend}>
        <span>
          <i className={styles.revenueDot} />
          Faturamento
        </span>

        <span>
          <i className={styles.profitDot} />
          Lucro
        </span>
      </div>
    </ChartCard>
  );
}