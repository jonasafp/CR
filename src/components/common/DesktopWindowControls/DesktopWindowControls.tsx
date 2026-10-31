import {
  Maximize2,
  Minimize2,
  Minus,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import styles from "./DesktopWindowControls.module.css";

type DesktopWindowControlsProps = {
  login?: boolean;
};

export default function DesktopWindowControls({
  login = false,
}: DesktopWindowControlsProps) {
  const desktop =
    window.gestorFacilDesktop;

  const [
    isMaximized,
    setIsMaximized,
  ] = useState(false);

  useEffect(() => {
    if (!desktop) {
      return undefined;
    }

    void desktop
      .getWindowState()
      .then((state) => {
        setIsMaximized(
          state.maximized,
        );
      });

    return desktop.onWindowState(
      (state) => {
        setIsMaximized(
          state.maximized,
        );
      },
    );
  }, [desktop]);

  if (!desktop?.isDesktop) {
    return null;
  }

  if (login) {
    return (
      <button
        type="button"
        className={`${styles.button} ${styles.loginClose}`}
        onClick={() => {
          void desktop.close();
        }}
        aria-label="Fechar aplicativo"
        title="Fechar aplicativo"
      >
        <X size={18} />
      </button>
    );
  }

  return (
    <div
      className={styles.controls}
      aria-label="Controles da janela"
    >
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          void desktop.minimize();
        }}
        aria-label="Minimizar"
        title="Minimizar"
      >
        <Minus size={17} />
      </button>

      <button
        type="button"
        className={styles.button}
        onClick={() => {
          void desktop.toggleMaximize();
        }}
        aria-label={isMaximized ? "Restaurar" : "Maximizar"}
        title={isMaximized ? "Restaurar" : "Maximizar"}
      >
        {isMaximized
          ? <Minimize2 size={15} />
          : <Maximize2 size={15} />}
      </button>

      <button
        type="button"
        className={`${styles.button} ${styles.close}`}
        onClick={() => {
          void desktop.close();
        }}
        aria-label="Fechar aplicativo"
        title="Fechar aplicativo"
      >
        <X size={17} />
      </button>
    </div>
  );
}
