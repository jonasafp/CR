import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import styles from "./StatisticCard.module.css";

export type StatisticColor =
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "red";

interface StatisticCardProps {
  title: string;
  value: string;
  description?: string;

  icon: LucideIcon;
  color?: StatisticColor;

  variation?: number;
  variationLabel?: string;

  highlighted?: boolean;
}

function getVariationData(variation: number) {
  if (variation > 0) {
    return {
      type: "positive",
      icon: ArrowUpRight,
      text: `+${variation.toFixed(1)}%`,
    };
  }

  if (variation < 0) {
    return {
      type: "negative",
      icon: ArrowDownRight,
      text: `${variation.toFixed(1)}%`,
    };
  }

  return {
    type: "neutral",
    icon: Minus,
    text: "0%",
  };
}

export default function StatisticCard({
  title,
  value,
  description,
  icon: Icon,
  color = "blue",
  variation,
  variationLabel = "comparado ao período anterior",
  highlighted = false,
}: StatisticCardProps) {
  const variationData =
    variation !== undefined
      ? getVariationData(variation)
      : null;

  const VariationIcon = variationData?.icon;

  return (
    <article
      className={`${styles.card} ${styles[color]} ${
        highlighted ? styles.highlighted : ""
      }`}
    >
      <div className={styles.top}>
        <div className={styles.icon}>
          <Icon size={22} strokeWidth={2.1} />
        </div>

        {variationData && VariationIcon && (
          <div
            className={`${styles.variation} ${
              styles[variationData.type]
            }`}
          >
            <VariationIcon size={15} strokeWidth={2.4} />
            <span>{variationData.text}</span>
          </div>
        )}
      </div>

      <div className={styles.information}>
        <span className={styles.title}>{title}</span>
        <strong className={styles.value}>{value}</strong>

        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>

      {variationData && (
        <footer className={styles.footer}>
          <span
            className={`${styles.dot} ${
              styles[variationData.type]
            }`}
          />

          <span>{variationLabel}</span>
        </footer>
      )}
    </article>
  );
}