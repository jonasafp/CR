import {
  AlertTriangle,
  Check,
  RotateCcw,
  Save,
  Settings2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ErrorState from "../../components/common/ErrorState/ErrorState";
import LoadingState from "../../components/common/LoadingState/LoadingState";

import BusinessSettingsForm from "../../components/settings/BusinessSettingsForm/BusinessSettingsForm";
import DataMaintenancePanel from "../../components/settings/DataMaintenancePanel/DataMaintenancePanel";
import FinancialSettingsForm from "../../components/settings/FinancialSettingsForm/FinancialSettingsForm";
import GeneralSettingsForm from "../../components/settings/GeneralSettingsForm/GeneralSettingsForm";
import InventorySettingsForm from "../../components/settings/InventorySettingsForm/InventorySettingsForm";
import ReceiptSettingsForm from "../../components/settings/ReceiptSettingsForm/ReceiptSettingsForm";
import ReportSettingsForm from "../../components/settings/ReportSettingsForm/ReportSettingsForm";
import SalesSettingsForm from "../../components/settings/SalesSettingsForm/SalesSettingsForm";
import SettingsNavigation from "../../components/settings/SettingsNavigation/SettingsNavigation";

import type {
  SettingsSection,
  SystemSettings,
  UpdateSystemSettingsInput,
} from "../../domain/settings/SystemSettings";

import {
  useSettings,
} from "../../hooks/useSettings";

import {
  applicationIdentityService,
} from "../../services/desktop/applicationIdentityService";

import styles from "./Configuracoes.module.css";

function createEditableSettings(
  settings: SystemSettings,
): UpdateSystemSettingsInput {
  return {
    business: {
      ...settings.business,
    },

    general: {
      ...settings.general,
    },

    sales: {
      ...settings.sales,
    },

    inventory: {
      ...settings.inventory,
    },

    financial: {
      ...settings.financial,
    },

    reports: {
      ...settings.reports,
    },

    receipt: {
      ...settings.receipt,
    },
  };
}

function getErrorMessage(
  error: unknown,
): string {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação.";
}

export default function Configuracoes() {
  const {
    settings,
    isLoading,
    isSaving,
    isResetting,
    error,
    saveSettings,
    resetSettings,
    refetchSettings,
  } = useSettings();

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<SettingsSection>(
      "business",
    );

  const [
    draft,
    setDraft,
  ] =
    useState<UpdateSystemSettingsInput>(
      () =>
        createEditableSettings(
          settings,
        ),
    );

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  const savedBusinessRef =
    useRef(settings.business);

  useEffect(() => {
    savedBusinessRef.current =
      settings.business;

    setDraft(
      createEditableSettings(
        settings,
      ),
    );
  }, [settings]);

  /*
   * Atualiza imediatamente a identidade
   * enquanto o usuário edita a logo ou
   * o nome do estabelecimento.
   */
  useEffect(() => {
    applicationIdentityService.apply(
      draft.business,
    );
  }, [draft.business]);

  /*
   * Caso o usuário saia sem salvar,
   * a identidade anterior é restaurada.
   */
  useEffect(() => {
    return () => {
      applicationIdentityService.apply(
        savedBusinessRef.current,
      );
    };
  }, []);

  const changedSections =
    useMemo<SettingsSection[]>(
      () => {
        const sections:
          SettingsSection[] = [];

        const editableSections:
          Array<
            Exclude<
              SettingsSection,
              "data"
            >
          > = [
            "business",
            "general",
            "sales",
            "inventory",
            "financial",
            "reports",
            "receipt",
          ];

        editableSections.forEach(
          (section) => {
            const currentValue =
              JSON.stringify(
                draft[section],
              );

            const savedValue =
              JSON.stringify(
                settings[section],
              );

            if (
              currentValue !==
              savedValue
            ) {
              sections.push(
                section,
              );
            }
          },
        );

        return sections;
      },
      [
        draft,
        settings,
      ],
    );

  const hasChanges =
    changedSections.length > 0;

  const isWorking =
    isSaving ||
    isResetting;

  const displayedError =
    localError ||
    (
      error
        ? getErrorMessage(error)
        : ""
    );

  useEffect(() => {
    function handleBeforeUnload(
      event: BeforeUnloadEvent,
    ) {
      if (!hasChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
    };
  }, [hasChanges]);

  function validate(): string {
    if (
      !draft.business
        .legalName
        .trim()
    ) {
      return "Informe a razão social do estabelecimento.";
    }

    if (
      !draft.business
        .tradeName
        .trim()
    ) {
      return "Informe o nome fantasia do estabelecimento.";
    }

    if (
      !draft.business
        .shortName
        .trim()
    ) {
      return "Informe a sigla do estabelecimento.";
    }

    if (
      !draft.sales
        .defaultCustomerName
        .trim()
    ) {
      return "Informe o cliente padrão das vendas.";
    }

    if (
      !draft.financial
        .defaultIncomeCategory
        .trim()
    ) {
      return "Informe a categoria padrão de receita.";
    }

    if (
      !draft.financial
        .defaultExpenseCategory
        .trim()
    ) {
      return "Informe a categoria padrão de despesa.";
    }

    return "";
  }

  async function handleSave() {
    const validationError =
      validate();

    if (validationError) {
      setLocalError(
        validationError,
      );

      setSuccessMessage("");

      return;
    }

    setLocalError("");
    setSuccessMessage("");

    try {
      const savedSettings =
        await saveSettings(
          draft,
        );

      savedBusinessRef.current =
        savedSettings.business;

      setDraft(
        createEditableSettings(
          savedSettings,
        ),
      );

      setSuccessMessage(
        "Configurações salvas com sucesso.",
      );
    } catch (saveError) {
      setLocalError(
        getErrorMessage(
          saveError,
        ),
      );
    }
  }

  function handleDiscard() {
    setDraft(
      createEditableSettings(
        settings,
      ),
    );

    setLocalError("");
    setSuccessMessage("");
  }

  async function handleImport(
    input:
      UpdateSystemSettingsInput,
  ) {
    const imported =
      await saveSettings(input);

    savedBusinessRef.current =
      imported.business;

    setDraft(
      createEditableSettings(
        imported,
      ),
    );

    setLocalError("");
  }

  async function handleReset() {
    const restored =
      await resetSettings();

    savedBusinessRef.current =
      restored.business;

    setDraft(
      createEditableSettings(
        restored,
      ),
    );

    setLocalError("");
  }

  function renderSection() {
    switch (activeSection) {
      case "business":
        return (
          <BusinessSettingsForm
            value={draft.business}
            disabled={isWorking}
            onChange={(business) =>
              setDraft(
                (current) => ({
                  ...current,
                  business,
                }),
              )
            }
          />
        );

      case "general":
        return (
          <GeneralSettingsForm
            value={draft.general}
            disabled={isWorking}
            onChange={(general) =>
              setDraft(
                (current) => ({
                  ...current,
                  general,
                }),
              )
            }
          />
        );

      case "sales":
        return (
          <SalesSettingsForm
            value={draft.sales}
            disabled={isWorking}
            onChange={(sales) =>
              setDraft(
                (current) => ({
                  ...current,
                  sales,
                }),
              )
            }
          />
        );

      case "inventory":
        return (
          <InventorySettingsForm
            value={draft.inventory}
            disabled={isWorking}
            onChange={(inventory) =>
              setDraft(
                (current) => ({
                  ...current,
                  inventory,
                }),
              )
            }
          />
        );

      case "financial":
        return (
          <FinancialSettingsForm
            value={draft.financial}
            disabled={isWorking}
            onChange={(financial) =>
              setDraft(
                (current) => ({
                  ...current,
                  financial,
                }),
              )
            }
          />
        );

      case "reports":
        return (
          <ReportSettingsForm
            value={draft.reports}
            disabled={isWorking}
            onChange={(reports) =>
              setDraft(
                (current) => ({
                  ...current,
                  reports,
                }),
              )
            }
          />
        );

      case "receipt":
        return (
          <ReceiptSettingsForm
            value={draft.receipt}
            business={draft.business}
            disabled={isWorking}
            onChange={(receipt) =>
              setDraft(
                (current) => ({
                  ...current,
                  receipt,
                }),
              )
            }
          />
        );

      case "data":
        return (
          <DataMaintenancePanel
            settings={{
              ...settings,
              ...draft,
            }}
            disabled={isWorking}
            onImport={
              handleImport
            }
            onReset={
              handleReset
            }
          />
        );
    }
  }

  if (isLoading) {
    return (
      <LoadingState
        title="Carregando configurações"
        description="Consultando as preferências do sistema."
      />
    );
  }

  if (
    error &&
    !settings
  ) {
    return (
      <ErrorState
        description={
          getErrorMessage(error)
        }
        onRetry={() =>
          void refetchSettings()
        }
      />
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>
            Administração do sistema
          </span>

          <h2>
            Configurações
          </h2>

          <p>
            Personalize o estabelecimento e defina o comportamento dos módulos.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.discardButton}
            disabled={
              !hasChanges ||
              isWorking
            }
            onClick={
              handleDiscard
            }
          >
            <RotateCcw size={16} />
            Descartar
          </button>

          <button
            type="button"
            className={styles.saveButton}
            disabled={
              !hasChanges ||
              isWorking
            }
            onClick={() =>
              void handleSave()
            }
          >
            <Save size={16} />

            {isSaving
              ? "Salvando..."
              : "Salvar alterações"}
          </button>
        </div>
      </div>

      <div className={styles.statusBar}>
        <div className={styles.statusIcon}>
          <Settings2 size={18} />
        </div>

        <div>
          <strong>
            {hasChanges
              ? `${changedSections.length} seção(ões) com alterações`
              : "Configurações atualizadas"}
          </strong>

          <span>
            {hasChanges
              ? "Salve ou descarte as modificações antes de sair."
              : `Última atualização: ${new Date(
                  settings.updatedAt,
                ).toLocaleString(
                  "pt-BR",
                )}`}
          </span>
        </div>

        <span
          className={`${styles.statusBadge} ${
            hasChanges
              ? styles.pendingBadge
              : styles.savedBadge
          }`}
        >
          {hasChanges ? (
            <>
              <AlertTriangle
                size={13}
              />

              Não salvo
            </>
          ) : (
            <>
              <Check size={13} />
              Salvo
            </>
          )}
        </span>
      </div>

      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}

      {displayedError && (
        <div className={styles.errorMessage}>
          {displayedError}
        </div>
      )}

      <div className={styles.settingsLayout}>
        <SettingsNavigation
          activeSection={
            activeSection
          }
          changedSections={
            changedSections
          }
          onChange={
            setActiveSection
          }
        />

        <div className={styles.sectionContent}>
          {renderSection()}
        </div>
      </div>

      {hasChanges && (
        <div className={styles.stickySaveBar}>
          <div>
            <strong>
              Existem alterações não salvas
            </strong>

            <span>
              Salve para aplicar as novas preferências em todo o sistema.
            </span>
          </div>

          <div>
            <button
              type="button"
              disabled={isWorking}
              onClick={
                handleDiscard
              }
            >
              Descartar
            </button>

            <button
              type="button"
              className={
                styles.stickySaveButton
              }
              disabled={isWorking}
              onClick={() =>
                void handleSave()
              }
            >
              <Save size={15} />

              {isSaving
                ? "Salvando..."
                : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}