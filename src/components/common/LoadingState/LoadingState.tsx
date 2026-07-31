import {
  LoaderCircle,
} from "lucide-react";

import styles from "./LoadingState.module.css";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export default function LoadingState({
  title = "Carregando informações",
  description = "Aguarde enquanto os dados são preparados.",
}: LoadingStateProps) {
  return (
    <div className={styles.container}>
      <LoaderCircle
        size={29}
        className={styles.spinner}
      />

      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}