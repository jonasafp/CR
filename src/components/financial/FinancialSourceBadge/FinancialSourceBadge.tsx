import {
  Boxes,
  CircleEllipsis,
  PencilLine,
  ShoppingCart,
} from "lucide-react";

import type {
  FinancialTransactionSource,
} from "../../../domain/financial/FinancialTransaction";

import styles from "./FinancialSourceBadge.module.css";

interface FinancialSourceBadgeProps {
  source:
    FinancialTransactionSource;
}

const sourceLabels: Record<
  FinancialTransactionSource,
  string
> = {
  manual:
    "Manual",

  sale:
    "Venda",

  inventory:
    "Estoque",

  other:
    "Outro",
};

export default function FinancialSourceBadge({
  source,
}: FinancialSourceBadgeProps) {
  const Icon =
    source === "sale"
      ? ShoppingCart
      : source === "inventory"
        ? Boxes
        : source === "manual"
          ? PencilLine
          : CircleEllipsis;

  return (
    <span
      className={`${styles.badge} ${styles[source]}`}
    >
      <Icon size={13} />

      {sourceLabels[source]}
    </span>
  );
}