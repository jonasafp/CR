import {
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import type {
  SaleStatus,
} from "../../../domain/sales/Sale";

import styles from "./SaleStatusBadge.module.css";

interface SaleStatusBadgeProps {
  status: SaleStatus;
}

const statusConfig = {
  completed: {
    label: "Concluída",
    icon: CheckCircle2,
  },

  pending: {
    label: "Pendente",
    icon: Clock3,
  },

  cancelled: {
    label: "Cancelada",
    icon: XCircle,
  },
} satisfies Record<
  SaleStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
  }
>;

export default function SaleStatusBadge({
  status,
}: SaleStatusBadgeProps) {
  const config =
    statusConfig[status];

  const Icon = config.icon;

  return (
    <span
      className={`${styles.badge} ${styles[status]}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}