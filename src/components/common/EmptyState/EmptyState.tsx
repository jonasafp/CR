import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <Icon size={30} strokeWidth={1.8} />
      </div>

      <strong>{title}</strong>

      <p>{description}</p>

      {action && (
        <div className={styles.action}>{action}</div>
      )}
    </div>
  );
}