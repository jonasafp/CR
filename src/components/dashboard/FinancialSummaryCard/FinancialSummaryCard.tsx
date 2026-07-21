import {
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react";

import SectionCard from "../../common/SectionCard/SectionCard";

import type { FinancialSummary } from "../../../types/Dashboard";

import {
  formatCurrency,
  formatPercentage,
} from "../../../utils/formatters";

import styles from "./FinancialSummaryCard.module.css";

interface FinancialSummaryCardProps {
  data: FinancialSummary;
}

export default function FinancialSummaryCard({
  data,
}: FinancialSummaryCardProps) {
  return (
    <SectionCard
      title="Resumo financeiro"
      description="Resultado consolidado das vendas registradas."
      icon={CircleDollarSign}
      badge="Financeiro"
      className={styles.card}
    >
      <div className={styles.summary}>
        <div className={styles.item}>
          <div
            className={`${styles.itemIcon} ${styles.revenueIcon}`}
          >
            <ArrowUpCircle size={20} />
          </div>

          <div>
            <span>Faturamento</span>

            <strong>
              {formatCurrency(data.revenue)}
            </strong>
          </div>
        </div>

        <div className={styles.item}>
          <div
            className={`${styles.itemIcon} ${styles.costIcon}`}
          >
            <ArrowDownCircle size={20} />
          </div>

          <div>
            <span>Custos</span>

            <strong>{formatCurrency(data.cost)}</strong>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.profitArea}>
          <div className={styles.profitHeader}>
            <div>
              <span>Lucro realizado</span>

              <strong>
                {formatCurrency(data.profit)}
              </strong>
            </div>

            <div className={styles.profitIcon}>
              <TrendingUp size={23} />
            </div>
          </div>

          <div className={styles.marginArea}>
            <span>Margem sobre faturamento</span>

            <strong>
              {formatPercentage(data.profitMargin)}
            </strong>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}