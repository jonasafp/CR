import {
  Archive,
  CheckCircle2,
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
  SystemBackup,
} from "../../../domain/backup/SystemBackup";

import type {
  SystemSettings,
  UpdateSystemSettingsInput,
} from "../../../domain/settings/SystemSettings";

import {
  systemBackupService,
} from "../../../services/backup/systemBackupService";

import styles from "./DataMaintenancePanel.module.css";

interface DataMaintenancePanelProps {
  settings: SystemSettings;

  disabled?: boolean;

  onImport: (
    settings: UpdateSystemSettingsInput,
  ) => Promise<void> | void;

  onReset: () => Promise<void> | void;
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
  const settingsInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const fullBackupInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    pendingSettingsBackup,
    setPendingSettingsBackup,
  ] = useState<SystemSettings | null>(
    null,
  );

  const [
    pendingFullBackup,
    setPendingFullBackup,
  ] = useState<SystemBackup | null>(
    null,
  );

  const [
    showResetConfirmation,
    setShowResetConfirmation,
  ] = useState(false);

  const [
    showFullRestoreConfirmation,
    setShowFullRestoreConfirmation,
  ] = useState(false);

  const [
    restoreConfirmationText,
    setRestoreConfirmationText,
  ] = useState("");

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

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  function formatBackupDate(
    value: string,
  ) {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }

    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        dateStyle:
          "short",

        timeStyle:
          "short",
      },
    ).format(date);
  }

  function exportFullBackup() {
    try {
      const backup =
        systemBackupService.create();

      systemBackupService.download(
        backup,
      );

      setError("");

      setMessage(
        "Backup completo exportado com sucesso. Guarde o arquivo em um local seguro.",
      );
    } catch (
    exportError
    ) {
      setMessage("");

      setError(
        exportError instanceof Error
          ? exportError.message
          : "Não foi possível exportar o backup completo.",
      );
    }
  }

  async function handleFullBackupFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".json")
    ) {
      setPendingFullBackup(
        null,
      );

      setMessage("");

      setError(
        "Selecione um arquivo de backup completo no formato JSON.",
      );

      return;
    }

    try {
      const content =
        await file.text();

      const backup =
        systemBackupService.parse(
          content,
        );

      setPendingFullBackup(
        backup,
      );

      setPendingSettingsBackup(
        null,
      );

      setShowResetConfirmation(
        false,
      );

      setShowFullRestoreConfirmation(
        false,
      );

      setRestoreConfirmationText(
        "",
      );

      clearFeedback();
    } catch (
    validationError
    ) {
      setPendingFullBackup(
        null,
      );

      setMessage("");

      setError(
        validationError instanceof Error
          ? validationError.message
          : "Não foi possível validar o backup completo.",
      );
    }
  }

  function exportSettings() {
    try {
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
        URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          "a",
        );

      const date =
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          );

      link.href =
        url;

      link.download =
        `gestor-facil-configuracoes-${date}.json`;

      document.body.appendChild(
        link,
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(
        url,
      );

      setError("");

      setMessage(
        "Backup das configurações exportado com sucesso.",
      );
    } catch (
    exportError
    ) {
      setMessage("");

      setError(
        exportError instanceof Error
          ? exportError.message
          : "Não foi possível exportar as configurações.",
      );
    }
  }

  async function handleSettingsFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".json")
    ) {
      setPendingSettingsBackup(
        null,
      );

      setMessage("");

      setError(
        "Selecione um arquivo de backup no formato JSON.",
      );

      return;
    }

    try {
      const content =
        await file.text();

      const parsed =
        JSON.parse(
          content,
        ) as unknown;

      if (
        !isSettingsBackup(
          parsed,
        )
      ) {
        throw new Error(
          "invalid-settings-backup",
        );
      }

      setPendingSettingsBackup(
        parsed,
      );

      setPendingFullBackup(
        null,
      );

      setShowResetConfirmation(
        false,
      );

      clearFeedback();
    } catch {
      setPendingSettingsBackup(
        null,
      );

      setMessage("");

      setError(
        "O arquivo selecionado não contém um backup válido das configurações.",
      );
    }
  }

  async function confirmSettingsImport() {
    if (
      !pendingSettingsBackup
    ) {
      return;
    }

    setIsProcessing(
      true,
    );

    setError("");

    try {
      await onImport(
        toUpdateInput(
          pendingSettingsBackup,
        ),
      );

      setPendingSettingsBackup(
        null,
      );

      setMessage(
        "Configurações importadas com sucesso.",
      );
    } catch (
    importError
    ) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Não foi possível importar as configurações.",
      );
    } finally {
      setIsProcessing(
        false,
      );
    }
  }

  async function confirmReset() {
    setIsProcessing(
      true,
    );

    setError("");

    try {
      await onReset();

      setShowResetConfirmation(
        false,
      );

      setMessage(
        "Configurações restauradas para os valores padrão.",
      );
    } catch (
    resetError
    ) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Não foi possível restaurar as configurações.",
      );
    } finally {
      setIsProcessing(
        false,
      );
    }
  }

  async function confirmFullRestore() {
    if (
      !pendingFullBackup
    ) {
      return;
    }

    const normalizedConfirmation =
      restoreConfirmationText
        .trim()
        .toUpperCase();

    if (
      normalizedConfirmation !==
      "RESTAURAR"
    ) {
      setError(
        'Digite a palavra "RESTAURAR" para confirmar a operação.',
      );

      return;
    }

    setIsProcessing(
      true,
    );

    setError("");
    setMessage("");

    try {
      /*
       * Cria e baixa uma cópia dos dados atuais
       * antes de iniciar qualquer alteração.
       */
      const safetyBackup =
        systemBackupService.create();

      systemBackupService.download(
        safetyBackup,
        "gestor-facil-backup-antes-da-restauracao",
      );

      /*
       * Executa a restauração atômica.
       */
      systemBackupService.restore(
        pendingFullBackup,
      );

      setShowFullRestoreConfirmation(
        false,
      );

      setPendingFullBackup(
        null,
      );

      setRestoreConfirmationText(
        "",
      );

      setMessage(
        "Backup restaurado com sucesso. O sistema será recarregado para aplicar os dados.",
      );

      /*
       * O recarregamento faz todos os contextos e repositórios
       * buscarem novamente os dados restaurados.
       */
      window.setTimeout(
        () => {
          window.location.reload();
        },
        1200,
      );
    } catch (
    restoreError
    ) {
      setError(
        restoreError instanceof Error
          ? restoreError.message
          : "Não foi possível restaurar o backup completo.",
      );

      setIsProcessing(
        false,
      );
    }
  }

  return (
    <section
      className={
        styles.card
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div
          className={
            styles.headerIcon
          }
        >
          <Database
            size={21}
          />
        </div>

        <div>
          <h3>
            Dados e manutenção
          </h3>

          <p>
            Proteja os dados internos e gerencie as configurações do sistema.
          </p>
        </div>
      </header>

      <div
        className={
          styles.content
        }
      >
        <div
          className={
            styles.sectionHeading
          }
        >
          <div>
            <strong>
              Backup completo do sistema
            </strong>

            <span>
              Inclui configurações, produtos, estoque, vendas e financeiro.
            </span>
          </div>

          <span
            className={
              styles.recommendedBadge
            }
          >
            Recomendado
          </span>
        </div>

        <div
          className={
            styles.fullBackupGrid
          }
        >
          <article
            className={
              `${styles.actionCard} ${styles.featuredCard}`
            }
          >
            <div
              className={
                styles.actionIcon
              }
            >
              <Archive
                size={20}
              />
            </div>

            <div
              className={
                styles.actionInformation
              }
            >
              <strong>
                Exportar backup completo
              </strong>

              <span>
                Gera uma cópia de segurança de todos os dados internos atuais.
              </span>
            </div>

            <button
              type="button"
              disabled={
                disabled ||
                isProcessing
              }
              onClick={
                exportFullBackup
              }
            >
              <Download
                size={15}
              />

              Baixar backup completo
            </button>
          </article>

          <article
            className={
              `${styles.actionCard} ${styles.featuredCard}`
            }
          >
            <div
              className={
                styles.actionIcon
              }
            >
              <Upload
                size={20}
              />
            </div>

            <div
              className={
                styles.actionInformation
              }
            >
              <strong>
                Validar backup completo
              </strong>

              <span>
                Selecione um arquivo para conferir a origem, a data e o conteúdo.
                Nenhum dado será alterado nesta etapa.
              </span>
            </div>

            <button
              type="button"
              disabled={
                disabled ||
                isProcessing
              }
              onClick={() =>
                fullBackupInputRef
                  .current
                  ?.click()
              }
            >
              <FileJson
                size={15}
              />

              Selecionar e validar
            </button>

            <input
              ref={
                fullBackupInputRef
              }
              type="file"
              accept="application/json,.json"
              hidden
              onChange={
                handleFullBackupFileChange
              }
            />
          </article>
        </div>

        {pendingFullBackup && (
          <div
            className={
              styles.backupPreview
            }
          >
            <div
              className={
                styles.previewHeader
              }
            >
              <div
                className={
                  styles.validatedIcon
                }
              >
                <CheckCircle2
                  size={18}
                />
              </div>

              <div>
                <strong>
                  Backup completo validado
                </strong>

                <span>
                  O arquivo é compatível e está pronto para a etapa de restauração.
                </span>
              </div>
            </div>

            <dl
              className={
                styles.backupMetadata
              }
            >
              <div>
                <dt>
                  Estabelecimento
                </dt>

                <dd>
                  {
                    pendingFullBackup.businessName ||
                    "Não informado"
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Criado em
                </dt>

                <dd>
                  {
                    formatBackupDate(
                      pendingFullBackup.createdAt,
                    )
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Versão do backup
                </dt>

                <dd>
                  {
                    pendingFullBackup.schemaVersion
                  }
                </dd>
              </div>
            </dl>

            <div
              className={
                styles.summaryGrid
              }

            >
              <div>
                <strong>
                  {
                    pendingFullBackup
                      .summary
                      .customers
                  }
                </strong>

                <span>
                  Clientes
                </span>
              </div>
              <div>
                <strong>
                  {
                    pendingFullBackup
                      .summary
                      .products
                  }
                </strong>

                <span>
                  Produtos
                </span>
              </div>

              <div>
                <strong>
                  {
                    pendingFullBackup
                      .summary
                      .inventoryMovements
                  }
                </strong>

                <span>
                  Movimentações
                </span>
              </div>

              <div>
                <strong>
                  {
                    pendingFullBackup
                      .summary
                      .sales
                  }
                </strong>

                <span>
                  Vendas
                </span>
              </div>

              <div>
                <strong>
                  {
                    pendingFullBackup
                      .summary
                      .financialTransactions
                  }
                </strong>

                <span>
                  Lançamentos
                </span>
              </div>
            </div>

            <div
              className={
                styles.previewFooter
              }
            >
              <span>
                Antes da restauração, o sistema baixará automaticamente
                um backup preventivo dos dados atuais.
              </span>

              <div
                className={
                  styles.previewActions
                }
              >
                <button
                  type="button"
                  disabled={
                    isProcessing
                  }
                  onClick={() => {
                    setPendingFullBackup(
                      null,
                    );

                    setShowFullRestoreConfirmation(
                      false,
                    );

                    setRestoreConfirmationText(
                      "",
                    );
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className={
                    styles.restoreButton
                  }
                  disabled={
                    disabled ||
                    isProcessing
                  }
                  onClick={() => {
                    setShowFullRestoreConfirmation(
                      true,
                    );

                    setRestoreConfirmationText(
                      "",
                    );

                    setError("");
                    setMessage("");
                  }}
                >
                  <RotateCcw
                    size={14}
                  />

                  Restaurar este backup
                </button>
              </div>
            </div>
          </div>
        )}

        {pendingFullBackup &&
          showFullRestoreConfirmation && (
            <div
              className={
                `${styles.confirmation} ${styles.dangerConfirmation} ${styles.fullRestoreConfirmation}`
              }
            >
              <div>
                <strong>
                  Confirmar restauração completa?
                </strong>

                <span>
                  Os dados atuais serão substituídos pelos dados de{" "}
                  {
                    pendingFullBackup.businessName ||
                    "Estabelecimento"
                  }.
                  Um backup preventivo será baixado antes da alteração.
                </span>

                <label
                  className={
                    styles.confirmationField
                  }
                >
                  <span>
                    Digite RESTAURAR para continuar
                  </span>

                  <input
                    type="text"
                    value={
                      restoreConfirmationText
                    }
                    disabled={
                      isProcessing
                    }
                    autoComplete="off"
                    onChange={(
                      event,
                    ) =>
                      setRestoreConfirmationText(
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>

              <div
                className={
                  styles.confirmationActions
                }
              >
                <button
                  type="button"
                  disabled={
                    isProcessing
                  }
                  onClick={() => {
                    setShowFullRestoreConfirmation(
                      false,
                    );

                    setRestoreConfirmationText(
                      "",
                    );
                  }}
                >
                  Voltar
                </button>

                <button
                  type="button"
                  className={
                    styles.confirmDangerButton
                  }
                  disabled={
                    isProcessing ||
                    restoreConfirmationText
                      .trim()
                      .toUpperCase() !==
                    "RESTAURAR"
                  }
                  onClick={() =>
                    void confirmFullRestore()
                  }
                >
                  {
                    isProcessing
                      ? "Restaurando..."
                      : "Confirmar restauração"
                  }
                </button>
              </div>
            </div>
          )}

        <div
          className={
            styles.sectionHeading
          }
        >
          <div>
            <strong>
              Manutenção das configurações
            </strong>

            <span>
              Operações que alteram somente as preferências do sistema.
            </span>
          </div>
        </div>

        <div
          className={
            styles.actionsGrid
          }
        >
          <article
            className={
              styles.actionCard
            }
          >
            <div
              className={
                styles.actionIcon
              }
            >
              <Download
                size={20}
              />
            </div>

            <div
              className={
                styles.actionInformation
              }
            >
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
              onClick={
                exportSettings
              }
            >
              <FileJson
                size={15}
              />

              Exportar backup
            </button>
          </article>

          <article
            className={
              styles.actionCard
            }
          >
            <div
              className={
                styles.actionIcon
              }
            >
              <Upload
                size={20}
              />
            </div>

            <div
              className={
                styles.actionInformation
              }
            >
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
                settingsInputRef
                  .current
                  ?.click()
              }
            >
              <Upload
                size={15}
              />

              Selecionar arquivo
            </button>

            <input
              ref={
                settingsInputRef
              }
              type="file"
              accept="application/json,.json"
              hidden
              onChange={
                handleSettingsFileChange
              }
            />
          </article>

          <article
            className={
              `${styles.actionCard} ${styles.dangerCard}`
            }
          >
            <div
              className={
                `${styles.actionIcon} ${styles.dangerIcon}`
              }
            >
              <RotateCcw
                size={20}
              />
            </div>

            <div
              className={
                styles.actionInformation
              }
            >
              <strong>
                Restaurar configurações
              </strong>

              <span>
                Retorna todas as preferências aos valores originais do sistema.
              </span>
            </div>

            <button
              type="button"
              className={
                styles.dangerButton
              }
              disabled={
                disabled ||
                isProcessing
              }
              onClick={() => {
                setPendingFullBackup(
                  null,
                );

                setPendingSettingsBackup(
                  null,
                );

                setShowResetConfirmation(
                  true,
                );

                clearFeedback();
              }}
            >
              <RefreshCcw
                size={15}
              />

              Restaurar padrões
            </button>
          </article>
        </div>

        {pendingSettingsBackup && (
          <div
            className={
              styles.confirmation
            }
          >
            <div>
              <strong>
                Aplicar o backup selecionado?
              </strong>

              <span>
                As configurações atuais serão substituídas pelas informações do arquivo.
              </span>
            </div>

            <div
              className={
                styles.confirmationActions
              }
            >
              <button
                type="button"
                disabled={
                  isProcessing
                }
                onClick={() =>
                  setPendingSettingsBackup(
                    null,
                  )
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className={
                  styles.primaryButton
                }
                disabled={
                  isProcessing
                }
                onClick={() =>
                  void confirmSettingsImport()
                }
              >
                {
                  isProcessing
                    ? "Importando..."
                    : "Aplicar backup"
                }
              </button>
            </div>
          </div>
        )}

        {showResetConfirmation && (
          <div
            className={
              `${styles.confirmation} ${styles.dangerConfirmation}`
            }
          >
            <div>
              <strong>
                Restaurar todas as configurações?
              </strong>

              <span>
                Esta operação substituirá as preferências atuais pelos valores padrão,
                mas não apagará vendas, produtos ou lançamentos.
              </span>
            </div>

            <div
              className={
                styles.confirmationActions
              }
            >
              <button
                type="button"
                disabled={
                  isProcessing
                }
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
                disabled={
                  isProcessing
                }
                onClick={() =>
                  void confirmReset()
                }
              >
                {
                  isProcessing
                    ? "Restaurando..."
                    : "Confirmar restauração"
                }
              </button>
            </div>
          </div>
        )}

        {message && (
          <div
            className={
              styles.success
            }
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className={
              styles.error
            }
          >
            {error}
          </div>
        )}

        <div
          className={
            styles.notice
          }
        >
          O backup completo é destinado exclusivamente ao controle interno.
        </div>
      </div>
    </section>
  );
}