import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import WidgetHeader from "../WidgetHeader/WidgetHeader";

import styles from "./SectionCard.module.css";

interface SectionCardProps {
  children: ReactNode;

  title?: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  action?: ReactNode;

  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export default function SectionCard({
  children,
  title,
  description,
  icon,
  badge,
  action,
  className = "",
  contentClassName = "",
  noPadding = false,
}: SectionCardProps) {
  const hasHeader =
    Boolean(title) ||
    Boolean(description) ||
    Boolean(icon) ||
    Boolean(action);

  return (
    <section className={`${styles.card} ${className}`}>
      {hasHeader && title && (
        <div className={styles.headerArea}>
          <WidgetHeader
            title={title}
            description={description}
            icon={icon}
            badge={badge}
            action={action}
          />
        </div>
      )}

      <div
        className={`${styles.content} ${
          noPadding ? styles.noPadding : ""
        } ${contentClassName}`}
      >
        {children}
      </div>
    </section>
  );
}