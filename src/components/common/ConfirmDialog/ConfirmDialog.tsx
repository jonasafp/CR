import {
  AlertTriangle,
  X,
} from "lucide-react";

import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;

  confirmLabel?: string;
  cancelLabel?: string;

  variant?: "danger" | "warning";

  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={onCancel}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onCancel}
          aria-label="Fechar confirmação"
        >
          <X size={19} />
        </button>

        <div
          className={`${styles.icon} ${styles[variant]}`}
        >
          <AlertTriangle size={25} />
        </div>

        <h3 id="confirm-dialog-title">{title}</h3>

        <p>{description}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`${styles.confirmButton} ${
              styles[`${variant}Button`]
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}