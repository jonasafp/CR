import {
  ArrowDownCircle,
  ArrowUpCircle,
  CircleDollarSign,
  Clock3,
  RefreshCw,
  WalletCards,
} from "lucide-react";

import SectionCard from "../../common/SectionCard/SectionCard";

import type {
  FinancialSummary,
} from "../../../domain/financial/FinancialTransaction";

import type {
  DashboardPeriod,
} from "../../../types/Dashboard";

import {
  formatCurrency,
} from "../../../utils/formatters";

import styles from "./FinancialSummaryCard.module.css";

interface FinancialSummaryCardProps {
  data?: FinancialSummary;
  period: DashboardPeriod;

  isLoading?: boolean;
  isError?: boolean;

  onRetry?: () => void;
}

const periodLabels: Record<
  DashboardPeriod,
  string
> = {
  today: "Hoje",
  week: "Semana atual",
  month: "Mês atual",
  year: "Ano atual",
};

export default function FinancialSummaryCard({
  data,
  period,
  isLoading = false,
  isError = false,
  onRetry,
}: FinancialSummaryCardProps) {
  if (isError) {
    return (
      <SectionCard
        title="Resumo financeiro"
        description="Movimentação financeira real do período."
        icon={CircleDollarSign}
        badge={periodLabels[period]}
        className={styles.card}
      >
        <div className={styles.feedback}>
          <CircleDollarSign size={29} />

          <strong>
            Não foi possível carregar o resumo
          </strong>

          <span>
            Tente consultar novamente os dados financeiros.
          </span>

          <button
            type="button"
            onClick={onRetry}
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      </SectionCard>
    );
  }

  const totalIncome =
    data?.totalIncome ?? 0;

  const totalExpense =
    data?.totalExpense ?? 0;

  const balance =
    data?.balance ?? 0;

  const pendingTotal =
    (data?.accountsReceivable ?? 0) +
    (data?.accountsPayable ?? 0);

  return (
    <SectionCard
      title="Resumo financeiro"
      description="Movimentação financeira real do período."
      icon={CircleDollarSign}
      badge={periodLabels[period]}
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
            <span>
              Receitas recebidas
            </span>

            <strong>
              {isLoading
                ? "Carregando..."
                : formatCurrency(
                    totalIncome,
                  )}
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
            <span>
              Despesas pagas
            </span>

            <strong>
              {isLoading
                ? "Carregando..."
                : formatCurrency(
                    totalExpense,
                  )}
            </strong>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.profitArea}>
          <div className={styles.profitHeader}>
            <div>
              <span>
                Saldo financeiro
              </span>

              <strong>
                {isLoading
                  ? "Carregando..."
                  : formatCurrency(
                      balance,
                    )}
              </strong>
            </div>

            <div className={styles.profitIcon}>
              <WalletCards size={23} />
            </div>
          </div>

          <div className={styles.marginArea}>
            <span>
              <Clock3 size={14} />
              Total em aberto
            </span>

            <strong>
              {formatCurrency(
                pendingTotal,
              )}
            </strong>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}