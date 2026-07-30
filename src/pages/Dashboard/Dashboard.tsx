import { useState } from "react";

import {
  AlertTriangle,
  BadgeDollarSign,
  Boxes,
  CircleDollarSign,
  PackageCheck,
  Percent,
  PackagePlus,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import StatisticCard from "../../components/common/StatisticCard/StatisticCard";

import CategoryPerformanceChart from "../../components/dashboard/CategoryPerformanceChart/CategoryPerformanceChart";
import FeaturedProductCard from "../../components/dashboard/FeaturedProductCard/FeaturedProductCard";
import FinancialSummaryCard from "../../components/dashboard/FinancialSummaryCard/FinancialSummaryCard";
import PeriodSelector from "../../components/dashboard/PeriodSelector/PeriodSelector";
import SalesPerformanceChart from "../../components/dashboard/SalesPerformanceChart/SalesPerformanceChart";
import StockAlertsCard from "../../components/dashboard/StockAlertsCard/StockAlertsCard";
import TopSellingProductsCard from "../../components/dashboard/TopSellingProductsCard/TopSellingProductsCard";

import type { DashboardPeriod } from "../../types/Dashboard";

import { Link } from "react-router-dom";

import EmptyState from "../../components/common/EmptyState/EmptyState";
import SectionCard from "../../components/common/SectionCard/SectionCard";

import { useInventory } from "../../hooks/useInventory";
import { useProducts } from "../../hooks/useProducts";

import {
  createDashboardData,
} from "../../services/dashboard/dashboardService";

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

  const { products } = useProducts();
  const { movements } = useInventory();

  const currentDashboardData =
    createDashboardData(
      products,
      movements,
      selectedPeriod,
    );

  if (!currentDashboardData) {
    return (
      <section className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.pageIntroduction}>
            <span className={styles.eyebrow}>
              Controle interno
            </span>

            <h2>Visão geral do negócio</h2>

            <p>
              Cadastre produtos para começar a acompanhar
              os resultados do negócio.
            </p>
          </div>
        </div>

        <div className={styles.emptyDashboard}>
          <SectionCard>
            <EmptyState
              icon={PackagePlus}
              title="Nenhum produto cadastrado"
              description="O Dashboard será preenchido automaticamente após o cadastro do primeiro produto."
              action={
                <Link
                  to="/produtos"
                  className={styles.emptyAction}
                >
                  Cadastrar produto
                </Link>
              }
            />
          </SectionCard>
        </div>
      </section>
    );
  }

  const {
    summary,
    financialSummary,
    featuredProduct,
    lowStockProducts,
    topSellingProducts,
    salesPerformance = [],
    categoryPerformance = [],
    variations,
    inventorySummary,
  } = currentDashboardData;

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
            Acompanhe estoque, vendas e resultados em um
            único lugar.
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
          )} produtos cadastrados · unidade principal`}
          icon={Boxes}
          color="blue"
          variation={variations?.stock}
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
          variation={variations?.soldQuantity}
          variationLabel="comparado ao período anterior"
        />

        <StatisticCard
          title="Faturamento realizado"
          value={formatCurrency(summary.realizedRevenue)}
          description="Valor bruto das vendas registradas"
          icon={CircleDollarSign}
          color="green"
          variation={variations?.revenue}
          variationLabel="crescimento do faturamento"
          highlighted
        />

        <StatisticCard
          title="Lucro realizado"
          value={formatCurrency(summary.realizedProfit)}
          description="Resultado após dedução dos custos"
          icon={BadgeDollarSign}
          color="green"
          variation={variations?.profit}
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
          variation={variations?.margin}
          variationLabel="evolução da margem"
        />

        <StatisticCard
          title="Atenção no estoque"
          value={formatNumber(unavailableProducts, 0)}
          description={`${summary.lowStockProductsCount} com estoque baixo e ${summary.outOfStockProductsCount} sem estoque`}
          icon={AlertTriangle}
          color="red"
          variation={variations?.stockAlerts}
          variationLabel="redução dos alertas"
        />
      </div>

      <div className={styles.inventoryMetricsGrid}>
        <StatisticCard
          title="Entradas acumuladas"
          value={formatNumber(
            inventorySummary?.totalEntries ?? 0,
            2,
          )}
          description="Entradas e ajustes positivos registrados"
          icon={ArrowDownToLine}
          color="blue"
        />

        <StatisticCard
          title="Saídas acumuladas"
          value={formatNumber(
            inventorySummary?.totalExits ?? 0,
            2,
          )}
          description="Saídas e ajustes negativos registrados"
          icon={ArrowUpFromLine}
          color="orange"
        />

        <StatisticCard
          title="Custo atual do estoque"
          value={formatCurrency(
            summary.totalStockCost,
          )}
          description="Capital investido nos produtos atuais"
          icon={WalletCards}
          color="purple"
        />

        <StatisticCard
          title="Receita potencial"
          value={formatCurrency(
            summary.totalPotentialRevenue,
          )}
          description="Valor estimado de venda do estoque"
          icon={TrendingUp}
          color="green"
        />
      </div>

      <div className={styles.primaryWidgetsGrid}>
        <FeaturedProductCard product={featuredProduct} />

        <FinancialSummaryCard data={financialSummary} />
      </div>

      <div className={styles.secondaryWidgetsGrid}>
        <StockAlertsCard
          items={lowStockProducts.slice(0, 5)}
          totalCount={lowStockProducts.length}
        />

        <TopSellingProductsCard
          items={topSellingProducts}
        />
      </div>

      <div className={styles.analyticsGrid}>
        <SalesPerformanceChart
          data={salesPerformance}
          period={selectedPeriod}
        />

        <CategoryPerformanceChart
          data={categoryPerformance}
          period={selectedPeriod}
        />
      </div>
    </section>
  );
}