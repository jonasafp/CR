import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import styles from "./MetricCard.module.css";

export type MetricCardColor =
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "red";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;

  icon: LucideIcon;
  color?: MetricCardColor;

  variation?: number;
  variationLabel?: string;

  highlight?: boolean;
}

function getVariationInformation(variation: number) {
  if (variation > 0) {
    return {
      type: "positive",
      icon: ArrowUpRight,
      label: `+${variation.toFixed(1)}%`,
    };
  }

  if (variation < 0) {
    return {
      type: "negative",
      icon: ArrowDownRight,
      label: `${variation.toFixed(1)}%`,
    };
  }

  return {
    type: "neutral",
    icon: Minus,
    label: "0%",
  };
}

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color = "blue",
  variation,
  variationLabel = "comparado ao período anterior",
  highlight = false,
}: MetricCardProps) {
  const variationInformation =
    variation !== undefined
      ? getVariationInformation(variation)
      : null;

  const VariationIcon = variationInformation?.icon;

  return (
    <article
      className={`${styles.card} ${styles[color]} ${
        highlight ? styles.highlight : ""
      }`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconContainer}>
          <Icon size={22} strokeWidth={2.1} />
        </div>

        {variationInformation && VariationIcon && (
          <div
            className={`${styles.variation} ${
              styles[variationInformation.type]
            }`}
          >
            <VariationIcon size={15} strokeWidth={2.4} />

            <span>{variationInformation.label}</span>
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <span className={styles.title}>{title}</span>

        <strong className={styles.value}>{value}</strong>

        <p className={styles.description}>{description}</p>
      </div>

      {variationInformation && (
        <div className={styles.cardFooter}>
          <span
            className={`${styles.variationDot} ${
              styles[variationInformation.type]
            }`}
          />

          <span>{variationLabel}</span>
        </div>
      )}
    </article>
  );
}