import {
  Database,
  Download,
  FileJson,
  RefreshCcw,
  RotateCcw,
  Upload,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import type {
  SystemSettings,
  UpdateSystemSettingsInput,
} from "../../../domain/settings/SystemSettings";

import styles from "./DataMaintenancePanel.module.css";

interface DataMaintenancePanelProps {
  settings: SystemSettings;
  disabled?: boolean;

  onImport: (
    settings:
      UpdateSystemSettingsInput,
  ) => Promise<void> | void;

  onReset: () =>
    Promise<void> | void;
}

function isSettingsBackup(
  value: unknown,
): value is SystemSettings {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<SystemSettings>;

  return Boolean(
    candidate.business &&
      candidate.general &&
      candidate.sales &&
      candidate.inventory &&
      candidate.financial &&
      candidate.reports &&
      candidate.receipt,
  );
}

function toUpdateInput(
  settings: SystemSettings,
): UpdateSystemSettingsInput {
  return {
    business:
      settings.business,

    general:
      settings.general,

    sales:
      settings.sales,

    inventory:
      settings.inventory,

    financial:
      settings.financial,

    reports:
      settings.reports,

    receipt:
      settings.receipt,
  };
}

export default function DataMaintenancePanel({
  settings,
  disabled = false,
  onImport,
  onReset,
}: DataMaintenancePanelProps) {
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    pendingBackup,
    setPendingBackup,
  ] =
    useState<SystemSettings | null>(
      null,
    );

  const [
    showResetConfirmation,
    setShowResetConfirmation,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    isProcessing,
    setIsProcessing,
  ] = useState(false);

  function exportSettings() {
    const content =
      JSON.stringify(
        settings,
        null,
        2,
      );

    const blob =
      new Blob(
        [content],
        {
          type:
            "application/json;charset=utf-8",
        },
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    link.href = url;

    link.download =
      `gestor-facil-configuracoes-${date}.json`;

    document.body.appendChild(
      link,
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    setError("");

    setMessage(
      "Backup das configurações exportado com sucesso.",
    );
  }

  async function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".json")
    ) {
      setPendingBackup(null);
      setMessage("");

      setError(
        "Selecione um arquivo de backup no formato JSON.",
      );

      return;
    }

    try {
      const parsed =
        JSON.parse(
          await file.text(),
        ) as unknown;

      if (
        !isSettingsBackup(parsed)
      ) {
        throw new Error(
          "invalid-backup",
        );
      }

      setPendingBackup(parsed);
      setError("");
      setMessage("");
    } catch {
      setPendingBackup(null);
      setMessage("");

      setError(
        "O arquivo selecionado não contém um backup válido das configurações.",
      );
    }
  }

  async function confirmImport() {
    if (!pendingBackup) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      await onImport(
        toUpdateInput(
          pendingBackup,
        ),
      );

      setPendingBackup(null);

      setMessage(
        "Configurações importadas com sucesso.",
      );
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Não foi possível importar as configurações.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function confirmReset() {
    setIsProcessing(true);
    setError("");

    try {
      await onReset();

      setShowResetConfirmation(
        false,
      );

      setMessage(
        "Configurações restauradas para os valores padrão.",
      );
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Não foi possível restaurar as configurações.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <Database size={21} />
        </div>

        <div>
          <h3>
            Dados e manutenção
          </h3>

          <p>
            Exporte, importe ou restaure as configurações do sistema.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.actionsGrid}>
          <article className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <Download size={20} />
            </div>

            <div className={styles.actionInformation}>
              <strong>
                Exportar configurações
              </strong>

              <span>
                Gera um arquivo JSON com todas as preferências atuais.
              </span>
            </div>

            <button
              type="button"
              disabled={
                disabled ||
                isProcessing
              }
              onClick={exportSettings}
            >
              <FileJson size={15} />
              Exportar backup
            </button>
          </article>

          <article className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <Upload size={20} />
            </div>

            <div className={styles.actionInformation}>
              <strong>
                Importar configurações
              </strong>

              <span>
                Restaura preferências anteriormente exportadas pelo sistema.
              </span>
            </div>

            <button
              type="button"
              disabled={
                disabled ||
                isProcessing
              }
              onClick={() =>
                inputRef.current?.click()
              }
            >
              <Upload size={15} />
              Selecionar arquivo
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={handleFileChange}
            />
          </article>

          <article
            className={`${styles.actionCard} ${styles.dangerCard}`}
          >
            <div
              className={`${styles.actionIcon} ${styles.dangerIcon}`}
            >
              <RotateCcw size={20} />
            </div>

            <div className={styles.actionInformation}>
              <strong>
                Restaurar configurações
              </strong>

              <span>
                Retorna todas as preferências aos valores originais do sistema.
              </span>
            </div>

            <button
              type="button"
              className={styles.dangerButton}
              disabled={
                disabled ||
                isProcessing
              }
              onClick={() =>
                setShowResetConfirmation(
                  true,
                )
              }
            >
              <RefreshCcw size={15} />
              Restaurar padrões
            </button>
          </article>
        </div>

        {pendingBackup && (
          <div className={styles.confirmation}>
            <div>
              <strong>
                Aplicar o backup selecionado?
              </strong>

              <span>
                As configurações atuais serão substituídas pelas informações do arquivo.
              </span>
            </div>

            <div className={styles.confirmationActions}>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() =>
                  setPendingBackup(null)
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                disabled={isProcessing}
                onClick={() =>
                  void confirmImport()
                }
              >
                {isProcessing
                  ? "Importando..."
                  : "Aplicar backup"}
              </button>
            </div>
          </div>
        )}

        {showResetConfirmation && (
          <div
            className={`${styles.confirmation} ${styles.dangerConfirmation}`}
          >
            <div>
              <strong>
                Restaurar todas as configurações?
              </strong>

              <span>
                Esta operação substituirá as preferências atuais pelos valores padrão, mas não apagará vendas, produtos ou lançamentos.
              </span>
            </div>

            <div className={styles.confirmationActions}>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() =>
                  setShowResetConfirmation(
                    false,
                  )
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className={
                  styles.confirmDangerButton
                }
                disabled={isProcessing}
                onClick={() =>
                  void confirmReset()
                }
              >
                {isProcessing
                  ? "Restaurando..."
                  : "Confirmar restauração"}
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className={styles.success}>
            {message}
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.notice}>
          Este backup contém somente as configurações. Produtos, vendas, estoque e lançamentos financeiros não são incluídos nesta operação.
        </div>
      </div>
    </section>
  );
}