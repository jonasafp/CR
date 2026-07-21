import { useState } from "react";

import {
  AlertTriangle,
  BadgeDollarSign,
  Boxes,
  CircleDollarSign,
  PackageCheck,
  Percent,
} from "lucide-react";

import StatisticCard from "../../components/common/StatisticCard/StatisticCard";
import FeaturedProductCard from "../../components/dashboard/FeaturedProductCard/FeaturedProductCard";
import FinancialSummaryCard from "../../components/dashboard/FinancialSummaryCard/FinancialSummaryCard";
import StockAlertsCard from "../../components/dashboard/StockAlertsCard/StockAlertsCard";
import TopSellingProductsCard from "../../components/dashboard/TopSellingProductsCard/TopSellingProductsCard";

import PeriodSelector from "../../components/dashboard/PeriodSelector/PeriodSelector";

import { dashboardData } from "../../data/mock";

import type { DashboardPeriod } from "../../types/Dashboard";

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatStockQuantity,
} from "../../utils/formatters";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] =
    useState<DashboardPeriod>("month");

  const { summary } = dashboardData;

  const unavailableProducts =
    summary.lowStockProductsCount +
    summary.outOfStockProductsCount;

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageIntroduction}>
          <span className={styles.eyebrow}>
            Controle interno
          </span>

          <h2>Visão geral do negócio</h2>

          <p>
            Acompanhe estoque, vendas e resultados em um único
            lugar.
          </p>
        </div>

        <PeriodSelector
          value={selectedPeriod}
          onChange={setSelectedPeriod}
        />
      </div>

      <div className={styles.metricsGrid}>
        <StatisticCard
          title="Estoque disponível"
          value={formatStockQuantity(
            summary.totalStockQuantity,
            summary.principalStockUnit,
          )}
          description={`${formatNumber(
            summary.totalProducts,
            0,
          )} produtos cadastrados`}
          icon={Boxes}
          color="blue"
          variation={5.8}
          variationLabel="crescimento do estoque"
        />

        <StatisticCard
          title="Quantidade vendida"
          value={formatStockQuantity(
            summary.totalSoldQuantity,
            summary.principalStockUnit,
          )}
          description="Volume total vendido no período"
          icon={PackageCheck}
          color="purple"
          variation={12.4}
          variationLabel="comparado ao período anterior"
        />

        <StatisticCard
          title="Faturamento realizado"
          value={formatCurrency(summary.realizedRevenue)}
          description="Valor bruto das vendas registradas"
          icon={CircleDollarSign}
          color="green"
          variation={8.7}
          variationLabel="crescimento do faturamento"
          highlighted
        />

        <StatisticCard
          title="Lucro realizado"
          value={formatCurrency(summary.realizedProfit)}
          description="Resultado após dedução dos custos"
          icon={BadgeDollarSign}
          color="green"
          variation={10.2}
          variationLabel="crescimento do resultado"
          highlighted
        />

        <StatisticCard
          title="Margem média"
          value={formatPercentage(
            summary.averageProfitMargin,
          )}
          description="Margem média sobre as vendas"
          icon={Percent}
          color="orange"
          variation={1.6}
          variationLabel="evolução da margem"
        />

        <StatisticCard
          title="Atenção no estoque"
          value={formatNumber(unavailableProducts, 0)}
          description={`${summary.lowStockProductsCount} com estoque baixo e ${summary.outOfStockProductsCount} sem estoque`}
          icon={AlertTriangle}
          color="red"
          variation={-2.3}
          variationLabel="redução dos alertas"
        />
      </div>

      <div className={styles.primaryWidgetsGrid}>
        <FeaturedProductCard
          product={dashboardData.featuredProduct}
        />

        <FinancialSummaryCard
          data={dashboardData.financialSummary}
        />
      </div>

      <div className={styles.secondaryWidgetsGrid}>
        <StockAlertsCard
          items={dashboardData.lowStockProducts}
        />

        <TopSellingProductsCard
          items={dashboardData.topSellingProducts}
        />
      </div>
    </section>
  );
}