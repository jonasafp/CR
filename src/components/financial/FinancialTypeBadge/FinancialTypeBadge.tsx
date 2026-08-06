import {
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

import type {
  FinancialTransactionType,
} from "../../../domain/financial/FinancialTransaction";

import styles from "./FinancialTypeBadge.module.css";

interface FinancialTypeBadgeProps {
  type:
    FinancialTransactionType;
}

export default function FinancialTypeBadge({
  type,
}: FinancialTypeBadgeProps) {
  const isIncome =
    type === "income";

  return (
    <span
      className={`${styles.badge} ${
        isIncome
          ? styles.income
          : styles.expense
      }`}
    >
      {isIncome ? (
        <ArrowDownLeft
          size={13}
        />
      ) : (
        <ArrowUpRight
          size={13}
        />
      )}

      {isIncome
        ? "Receita"
        : "Despesa"}
    </span>
  );
}