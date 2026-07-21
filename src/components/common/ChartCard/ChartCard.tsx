import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import SectionCard from "../SectionCard/SectionCard";

import styles from "./ChartCard.module.css";

interface ChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  minHeight?: number;
}

export default function ChartCard({
  title,
  description,
  icon,
  badge,
  action,
  children,
  className,
  minHeight = 320,
}: ChartCardProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      icon={icon}
      badge={badge}
      action={action}
      className={className}
    >
      <div
        className={styles.chartArea}
        style={{ minHeight }}
      >
        {children}
      </div>
    </SectionCard>
  );
}