import {
  Ban,
  CheckCircle2,
  Clock3,
  TriangleAlert,
} from "lucide-react";

import type {
  FinancialTransaction,
} from "../../../domain/financial/FinancialTransaction";

import {
  isFinancialTransactionOverdue,
} from "../../../domain/financial/FinancialTransaction";

import styles from "./FinancialStatusBadge.module.css";

interface FinancialStatusBadgeProps {
  transaction:
    FinancialTransaction;
}

export default function FinancialStatusBadge({
  transaction,
}: FinancialStatusBadgeProps) {
  if (
    transaction.status ===
    "cancelled"
  ) {
    return (
      <span
        className={`${styles.badge} ${styles.cancelled}`}
      >
        <Ban size={13} />
        Cancelado
      </span>
    );
  }

  if (
    transaction.status ===
    "received"
  ) {
    return (
      <span
        className={`${styles.badge} ${styles.received}`}
      >
        <CheckCircle2
          size={13}
        />

        Recebido
      </span>
    );
  }

  if (
    transaction.status ===
    "paid"
  ) {
    return (
      <span
        className={`${styles.badge} ${styles.paid}`}
      >
        <CheckCircle2
          size={13}
        />

        Pago
      </span>
    );
  }

  if (
    isFinancialTransactionOverdue(
      transaction,
    )
  ) {
    return (
      <span
        className={`${styles.badge} ${styles.overdue}`}
      >
        <TriangleAlert
          size={13}
        />

        Vencido
      </span>
    );
  }

  return (
    <span
      className={`${styles.badge} ${styles.pending}`}
    >
      <Clock3 size={13} />
      Pendente
    </span>
  );
}