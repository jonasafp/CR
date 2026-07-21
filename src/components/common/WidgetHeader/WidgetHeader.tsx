import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./WidgetHeader.module.css";

interface WidgetHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  action?: ReactNode;
}

export default function WidgetHeader({
  title,
  description,
  icon: Icon,
  badge,
  action,
}: WidgetHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.information}>
        {Icon && (
          <div className={styles.icon}>
            <Icon size={20} strokeWidth={2.1} />
          </div>
        )}

        <div className={styles.text}>
          <div className={styles.titleLine}>
            <h3>{title}</h3>

            {badge && (
              <span className={styles.badge}>{badge}</span>
            )}
          </div>

          {description && <p>{description}</p>}
        </div>
      </div>

      {action && <div className={styles.action}>{action}</div>}
    </header>
  );
}