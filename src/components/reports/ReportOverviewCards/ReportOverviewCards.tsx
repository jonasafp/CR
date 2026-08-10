import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BadgeDollarSign,
  Boxes,
  CircleDollarSign,
  HandCoins,
  Landmark,
  PackageCheck,
  Percent,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import StatisticCard from "../../common/StatisticCard/StatisticCard";

import type {
  ReportOverview,
  ReportType,
} from "../../../domain/reports/Report";

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../../utils/formatters";

import styles from "./ReportOverviewCards.module.css";

interface ReportOverviewCardsProps {
  reportType: ReportType;
  overview: ReportOverview;
}

export default function ReportOverviewCards({
  reportType,
  overview,
}: ReportOverviewCardsProps) {
  const financialIncome =
    overview.financialBalance +
    overview.totalExpense;

  if (
    reportType ===
    "financial"
  ) {
    return (
      <div className={styles.grid}>
        <StatisticCard
          title="Receitas recebidas"
          value={formatCurrency(
            financialIncome,
          )}
          description="Entradas financeiras realizadas"
          icon={CircleDollarSign}
          color="green"
          highlighted
        />

        <StatisticCard
          title="Despesas pagas"
          value={formatCurrency(
            overview.totalExpense,
          )}
          description="Saídas financeiras realizadas"
          icon={ArrowDownToLine}
          color="red"
        />

        <StatisticCard
          title="Saldo financeiro"
          value={formatCurrency(
            overview.financialBalance,
          )}
          description="Receitas menos despesas pagas"
          icon={Landmark}
          color="blue"
          highlighted
        />

        <StatisticCard
          title="Contas a receber"
          value={formatCurrency(
            overview.accountsReceivable,
          )}
          description="Receitas pendentes no período"
          icon={HandCoins}
          color="green"
        />

        <StatisticCard
          title="Contas a pagar"
          value={formatCurrency(
            overview.accountsPayable,
          )}
          description="Despesas pendentes no período"
          icon={WalletCards}
          color="orange"
        />

        <StatisticCard
          title="Total em aberto"
          value={formatCurrency(
            overview.accountsReceivable +
              overview.accountsPayable,
          )}
          description="Soma dos compromissos pendentes"
          icon={ReceiptText}
          color="purple"
        />
      </div>
    );
  }

  if (
    reportType ===
    "products"
  ) {
    return (
      <div className={styles.grid}>
        <StatisticCard
          title="Produtos analisados"
          value={formatNumber(
            overview.totalProducts,
            0,
          )}
          description="Produtos encontrados pelos filtros"
          icon={Boxes}
          color="blue"
        />

        <StatisticCard
          title="Custo do estoque"
          value={formatCurrency(
            overview.stockCost,
          )}
          description="Capital aplicado no estoque atual"
          icon={WalletCards}
          color="purple"
        />

        <StatisticCard
          title="Receita potencial"
          value={formatCurrency(
            overview.potentialRevenue,
          )}
          description="Valor estimado de venda do estoque"
          icon={TrendingUp}
          color="green"
          highlighted
        />

        <StatisticCard
          title="Lucro realizado"
          value={formatCurrency(
            overview.totalProfit,
          )}
          description="Resultado dos produtos vendidos"
          icon={BadgeDollarSign}
          color="green"
        />

        <StatisticCard
          title="Estoque baixo"
          value={formatNumber(
            overview.lowStockProducts,
            0,
          )}
          description="Produtos abaixo do estoque mínimo"
          icon={AlertTriangle}
          color="orange"
        />

        <StatisticCard
          title="Sem estoque"
          value={formatNumber(
            overview.outOfStockProducts,
            0,
          )}
          description="Produtos sem quantidade disponível"
          icon={AlertTriangle}
          color="red"
        />
      </div>
    );
  }

  if (
    reportType ===
    "inventory"
  ) {
    return (
      <div className={styles.grid}>
        <StatisticCard
          title="Entradas"
          value={formatNumber(
            overview.totalEntries,
          )}
          description="Entradas e ajustes positivos"
          icon={ArrowDownToLine}
          color="blue"
        />

        <StatisticCard
          title="Saídas"
          value={formatNumber(
            overview.totalExits,
          )}
          description="Saídas e ajustes negativos"
          icon={ArrowUpFromLine}
          color="orange"
        />

        <StatisticCard
          title="Movimentação líquida"
          value={formatNumber(
            overview.totalEntries -
              overview.totalExits,
          )}
          description="Diferença entre entradas e saídas"
          icon={PackageCheck}
          color="purple"
        />

        <StatisticCard
          title="Produtos analisados"
          value={formatNumber(
            overview.totalProducts,
            0,
          )}
          description="Produtos encontrados pelos filtros"
          icon={Boxes}
          color="blue"
        />

        <StatisticCard
          title="Custo atual"
          value={formatCurrency(
            overview.stockCost,
          )}
          description="Valor de custo do estoque"
          icon={WalletCards}
          color="purple"
        />

        <StatisticCard
          title="Receita potencial"
          value={formatCurrency(
            overview.potentialRevenue,
          )}
          description="Potencial de venda do estoque"
          icon={TrendingUp}
          color="green"
        />
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <StatisticCard
        title="Vendas concluídas"
        value={formatNumber(
          overview.completedSales,
          0,
        )}
        description={`${overview.cancelledSales} vendas canceladas`}
        icon={ShoppingCart}
        color="blue"
      />

      <StatisticCard
        title="Faturamento líquido"
        value={formatCurrency(
          overview.netRevenue,
        )}
        description={`${formatCurrency(
          overview.discounts,
        )} em descontos`}
        icon={CircleDollarSign}
        color="green"
        highlighted
      />

      <StatisticCard
        title="Lucro realizado"
        value={formatCurrency(
          overview.totalProfit,
        )}
        description="Resultado após o custo dos produtos"
        icon={BadgeDollarSign}
        color="green"
        highlighted
      />

      <StatisticCard
        title="Ticket médio"
        value={formatCurrency(
          overview.averageTicket,
        )}
        description="Valor médio por venda concluída"
        icon={ReceiptText}
        color="purple"
      />

      <StatisticCard
        title="Margem média"
        value={formatPercentage(
          overview.profitMargin,
        )}
        description="Margem sobre o faturamento líquido"
        icon={Percent}
        color="orange"
      />

      <StatisticCard
        title="Custo das vendas"
        value={formatCurrency(
          overview.totalCost,
        )}
        description="Custo dos produtos comercializados"
        icon={WalletCards}
        color="red"
      />
    </div>
  );
}