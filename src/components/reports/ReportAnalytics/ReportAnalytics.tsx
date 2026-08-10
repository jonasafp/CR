import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartBarBig,
  ChartNoAxesCombined,
  CircleDollarSign,
  WalletCards,
} from "lucide-react";

import ChartCard from "../../common/ChartCard/ChartCard";
import EmptyState from "../../common/EmptyState/EmptyState";

import type {
  ReportCategoryItem,
  ReportPaymentMethodItem,
  ReportTimeSeriesItem,
  ReportType,
} from "../../../domain/reports/Report";

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../../utils/formatters";

import styles from "./ReportAnalytics.module.css";

interface ReportAnalyticsProps {
  reportType: ReportType;

  timeSeries:
    ReportTimeSeriesItem[];

  categories:
    ReportCategoryItem[];

  paymentMethods:
    ReportPaymentMethodItem[];
}

const paymentMethodLabels:
  Record<string, string> = {
    cash: "Dinheiro",
    pix: "Pix",

    credit_card:
      "Cartão de crédito",

    debit_card:
      "Cartão de débito",

    bank_transfer:
      "Transferência bancária",

    bank_slip:
      "Boleto bancário",

    other: "Outro",
  };

function formatCompactCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      notation: "compact",

      style: "currency",
      currency: "BRL",

      maximumFractionDigits: 1,
    },
  ).format(value);
}

function getSeriesName(
  name: string,
): string {
  const labels:
    Record<string, string> = {
      revenue: "Receitas",
      expense: "Despesas",
      profit: "Lucro",
      balance: "Saldo",
    };

  return labels[name] ?? name;
}

export default function ReportAnalytics({
  reportType,
  timeSeries,
  categories,
  paymentMethods,
}: ReportAnalyticsProps) {
  const categoryData =
    categories.slice(0, 6);

  const isFinancial =
    reportType === "financial";

  const hasTimeSeries =
    (
      reportType === "sales" ||
      isFinancial
    ) &&
    timeSeries.length > 0;

  const showPayments =
    reportType === "sales" ||
    isFinancial;

  return (
    <div className={styles.container}>
      <div
        className={
          styles.chartsGrid
        }
      >
        <ChartCard
          title="Evolução no período"
          description={
            isFinancial
              ? "Comparativo entre receitas, despesas e saldo."
              : "Comparativo entre faturamento e lucro realizado."
          }
          icon={
            ChartNoAxesCombined
          }
          badge={`${timeSeries.length} períodos`}
          minHeight={330}
          className={styles.card}
        >
          {hasTimeSeries ? (
            <div className={styles.chart}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={timeSeries}
                  margin={{
                    top: 12,
                    right: 8,
                    bottom: 0,
                    left: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="reportRevenueGradient"
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
                      id="reportGreenGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#16a34a"
                        stopOpacity={0.24}
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
                      fontSize: 9,
                    }}
                    dy={8}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={76}
                    tick={{
                      fill: "#64748b",
                      fontSize: 9,
                    }}
                    tickFormatter={
                      formatCompactCurrency
                    }
                  />

                  <Tooltip
                    cursor={{
                      stroke:
                        "#94a3b8",

                      strokeDasharray:
                        "4 4",
                    }}
                    contentStyle={{
                      border:
                        "1px solid #e2e8f0",

                      borderRadius:
                        "12px",

                      boxShadow:
                        "0 12px 30px rgba(15, 23, 42, 0.12)",

                      fontSize:
                        "10px",
                    }}
                    formatter={(
                      value,
                      name,
                    ) => [
                      formatCurrency(
                        Number(value),
                      ),

                      getSeriesName(
                        String(name),
                      ),
                    ]}
                  />

                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      paddingTop:
                        "18px",

                      fontSize:
                        "10px",
                    }}
                    formatter={(
                      value,
                    ) =>
                      getSeriesName(
                        String(value),
                      )
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2.4}
                    fill="url(#reportRevenueGradient)"
                    activeDot={{ r: 5 }}
                  />

                  {isFinancial ? (
                    <>
                      <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#dc2626"
                        strokeWidth={2}
                        fill="transparent"
                        strokeDasharray="5 4"
                        activeDot={{
                          r: 4,
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#16a34a"
                        strokeWidth={2.4}
                        fill="url(#reportGreenGradient)"
                        activeDot={{
                          r: 5,
                        }}
                      />
                    </>
                  ) : (
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#16a34a"
                      strokeWidth={2.4}
                      fill="url(#reportGreenGradient)"
                      activeDot={{
                        r: 5,
                      }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={styles.empty}>
              <EmptyState
                icon={
                  ChartNoAxesCombined
                }
                title="Sem dados para o gráfico"
                description="Não existem informações temporais para os filtros selecionados."
              />
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Desempenho por categoria"
          description="Categorias com maior participação no resultado."
          icon={ChartBarBig}
          badge={`${categories.length} categorias`}
          minHeight={330}
          className={styles.card}
        >
          {categoryData.length >
          0 ? (
            <div className={styles.chart}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={categoryData}
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
                      fontSize: 9,
                    }}
                    tickFormatter={
                      formatCompactCurrency
                    }
                  />

                  <YAxis
                    dataKey="category"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={92}
                    tick={{
                      fill: "#475569",
                      fontSize: 9,
                      fontWeight: 600,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill:
                        "rgba(241, 245, 249, 0.7)",
                    }}
                    contentStyle={{
                      border:
                        "1px solid #e2e8f0",

                      borderRadius:
                        "12px",

                      boxShadow:
                        "0 12px 30px rgba(15, 23, 42, 0.12)",

                      fontSize:
                        "10px",
                    }}
                    formatter={(
                      value,
                      name,
                    ) => [
                      formatCurrency(
                        Number(value),
                      ),

                      getSeriesName(
                        String(name),
                      ),
                    ]}
                  />

                  <Bar
                    dataKey="revenue"
                    name="revenue"
                    fill="#2563eb"
                    radius={[
                      0,
                      7,
                      7,
                      0,
                    ]}
                    barSize={16}
                  />

                  <Bar
                    dataKey={
                      reportType ===
                      "inventory"
                        ? "cost"
                        : "profit"
                    }
                    name={
                      reportType ===
                      "inventory"
                        ? "expense"
                        : "profit"
                    }
                    fill={
                      reportType ===
                      "inventory"
                        ? "#ea580c"
                        : "#22c55e"
                    }
                    radius={[
                      0,
                      7,
                      7,
                      0,
                    ]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={styles.empty}>
              <EmptyState
                icon={ChartBarBig}
                title="Nenhuma categoria encontrada"
                description="As categorias aparecerão quando houver dados para os filtros selecionados."
              />
            </div>
          )}
        </ChartCard>
      </div>

      {showPayments && (
        <ChartCard
          title="Formas de pagamento"
          description="Distribuição dos valores recebidos por forma de pagamento."
          icon={WalletCards}
          badge={`${paymentMethods.length} formas`}
          minHeight={180}
          className={
            styles.paymentCard
          }
        >
          {paymentMethods.length >
          0 ? (
            <div
              className={
                styles.paymentGrid
              }
            >
              {paymentMethods.map(
                (item) => (
                  <article
                    key={
                      item.paymentMethod
                    }
                    className={
                      styles.paymentItem
                    }
                  >
                    <div
                      className={
                        styles.paymentIcon
                      }
                    >
                      <CircleDollarSign
                        size={18}
                      />
                    </div>

                    <div
                      className={
                        styles.paymentInformation
                      }
                    >
                      <div>
                        <strong>
                          {paymentMethodLabels[
                            item
                              .paymentMethod
                          ] ??
                            item.paymentMethod}
                        </strong>

                        <span>
                          {formatNumber(
                            item.transactionCount,
                            0,
                          )}{" "}
                          transações
                        </span>
                      </div>

                      <strong>
                        {formatCurrency(
                          item.amount,
                        )}
                      </strong>
                    </div>

                    <div
                      className={
                        styles.progress
                      }
                    >
                      <span
                        style={{
                          width: `${Math.min(
                            item.percentage,
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    <small>
                      {formatPercentage(
                        item.percentage,
                      )}
                    </small>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div
              className={
                styles.paymentEmpty
              }
            >
              Nenhuma forma de pagamento encontrada para o período.
            </div>
          )}
        </ChartCard>
      )}
    </div>
  );
}