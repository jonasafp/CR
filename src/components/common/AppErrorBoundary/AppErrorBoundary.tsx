import {
  Component,
} from "react";

import type {
  ErrorInfo,
  ReactNode,
} from "react";

import {
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

import styles from "./AppErrorBoundary.module.css";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state:
    AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError():
    AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(
    error: Error,
    information: ErrorInfo,
  ) {
    console.error(
      "Erro inesperado na interface.",
      error,
      information,
    );
  }

  render() {
    if (
      !this.state.hasError
    ) {
      return this.props.children;
    }

    return (
      <main
        className={styles.page}
      >
        <section
          className={styles.card}
        >
          <div
            className={styles.icon}
          >
            <AlertTriangle
              size={30}
            />
          </div>

          <h1>
            Não foi possível
            exibir esta tela
          </h1>

          <p>
            O sistema encontrou um
            erro inesperado. Seus
            dados armazenados não
            foram apagados.
          </p>

          <button
            type="button"
            onClick={() =>
              window.location
                .reload()
            }
          >
            <RefreshCcw
              size={17}
            />

            Recarregar sistema
          </button>
        </section>
      </main>
    );
  }
}