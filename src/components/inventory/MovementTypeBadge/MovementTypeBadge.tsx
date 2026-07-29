import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Minus,
  Plus,
} from "lucide-react";

import type { InventoryMovementType } from "../../../types/Inventory";

import styles from "./MovementTypeBadge.module.css";

interface MovementTypeBadgeProps {
  type: InventoryMovementType;
}

const movementConfig = {
  entry: {
    label: "Entrada",
    icon: ArrowDownToLine,
  },

  exit: {
    label: "Saída",
    icon: ArrowUpFromLine,
  },

  adjustment_positive: {
    label: "Ajuste positivo",
    icon: Plus,
  },

  adjustment_negative: {
    label: "Ajuste negativo",
    icon: Minus,
  },
} satisfies Record<
  InventoryMovementType,
  {
    label: string;
    icon: typeof ArrowDownToLine;
  }
>;

export default function MovementTypeBadge({
  type,
}: MovementTypeBadgeProps) {
  const config = movementConfig[type];
  const Icon = config.icon;

  return (
    <span
      className={`${styles.badge} ${styles[type]}`}
    >
      <Icon size={14} strokeWidth={2.3} />
      {config.label}
    </span>
  );
}