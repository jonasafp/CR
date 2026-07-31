import {
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  title?: string;
  description?: string;

  onRetry?: () => void;
}

export default function ErrorState({
  title = "Não foi possível carregar os dados",
  description = "Verifique a conexão e tente novamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <TriangleAlert size={27} />
      </div>

      <strong>{title}</strong>
      <span>{description}</span>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
        >
          <RefreshCw size={15} />
          Tentar novamente
        </button>
      )}
    </div>
  );
}