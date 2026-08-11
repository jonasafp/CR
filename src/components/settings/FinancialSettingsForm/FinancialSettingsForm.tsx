import {
  BellRing,
  CalendarClock,
  Landmark,
  Link2,
  RotateCcw,
  Tags,
} from "lucide-react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  FinancialPaymentMethod,
} from "../../../domain/financial/FinancialTransaction";

import type {
  FinancialSettings,
} from "../../../domain/settings/SystemSettings";

import SettingsSwitch from "../SettingsSwitch/SettingsSwitch";

import styles from "./FinancialSettingsForm.module.css";

interface FinancialSettingsFormProps {
  value: FinancialSettings;
  disabled?: boolean;

  onChange: (
    value: FinancialSettings,
  ) => void;
}

const paymentOptions:
  SelectOption<FinancialPaymentMethod>[] = [
    {
      value: "cash",
      label: "Dinheiro",
    },
    {
      value: "pix",
      label: "Pix",
    },
    {
      value: "credit_card",
      label: "Cartão de crédito",
    },
    {
      value: "debit_card",
      label: "Cartão de débito",
    },
    {
      value: "bank_transfer",
      label: "Transferência bancária",
    },
    {
      value: "bank_slip",
      label: "Boleto bancário",
    },
    {
      value: "other",
      label: "Outro",
    },
  ];

export default function FinancialSettingsForm({
  value,
  disabled = false,
  onChange,
}: FinancialSettingsFormProps) {
  function updateField<
    Key extends keyof FinancialSettings,
  >(
    field: Key,
    fieldValue: FinancialSettings[Key],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function handleGenerateIncomeChange(
    checked: boolean,
  ) {
    onChange({
      ...value,

      generateIncomeFromSale:
        checked,

      cancelIncomeWithSale:
        checked
          ? value.cancelIncomeWithSale
          : false,
    });
  }

  function updateDueDays(
    rawValue: string,
  ) {
    const numericValue =
      Number(rawValue);

    updateField(
      "defaultDueDays",

      Number.isFinite(numericValue)
        ? Math.min(
            Math.max(
              Math.trunc(numericValue),
              0,
            ),
            3650,
          )
        : 0,
    );
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <Landmark size={21} />
        </div>

        <div>
          <h3>
            Configurações financeiras
          </h3>

          <p>
            Defina padrões dos lançamentos e a integração automática com as vendas.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.sectionTitle}>
          <Tags size={16} />

          <div>
            <strong>
              Padrões dos lançamentos
            </strong>

            <span>
              Informações sugeridas ao registrar novas receitas e despesas.
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          <Select
            label="Forma de pagamento padrão"
            value={
              value.defaultPaymentMethod
            }
            options={paymentOptions}
            disabled={disabled}
            onChange={(method) =>
              updateField(
                "defaultPaymentMethod",
                method,
              )
            }
          />

          <label className={styles.field}>
            <span>
              Prazo padrão de vencimento
            </span>

            <div className={styles.daysInput}>
              <input
                type="number"
                min="0"
                max="3650"
                step="1"
                value={
                  value.defaultDueDays
                }
                disabled={disabled}
                onChange={(event) =>
                  updateDueDays(
                    event.target.value,
                  )
                }
              />

              <span>
                dias
              </span>
            </div>

            <small>
              Use zero para considerar o lançamento com vencimento no mesmo dia.
            </small>
          </label>

          <label className={styles.field}>
            <span>
              Categoria padrão de receita
            </span>

            <input
              value={
                value.defaultIncomeCategory
              }
              maxLength={80}
              disabled={disabled}
              placeholder="Vendas"
              onChange={(event) =>
                updateField(
                  "defaultIncomeCategory",
                  event.target.value,
                )
              }
            />
          </label>

          <label className={styles.field}>
            <span>
              Categoria padrão de despesa
            </span>

            <input
              value={
                value.defaultExpenseCategory
              }
              maxLength={80}
              disabled={disabled}
              placeholder="Despesas gerais"
              onChange={(event) =>
                updateField(
                  "defaultExpenseCategory",
                  event.target.value,
                )
              }
            />
          </label>
        </div>

        <div className={styles.sectionTitle}>
          <Link2 size={16} />

          <div>
            <strong>
              Automação financeira
            </strong>

            <span>
              Controle a comunicação entre vendas e movimentações financeiras.
            </span>
          </div>
        </div>

        <div className={styles.switchGrid}>
          <SettingsSwitch
            checked={
              value.generateIncomeFromSale
            }
            title="Gerar receita ao concluir uma venda"
            description="Cria automaticamente um lançamento de receita com o valor total da venda concluída."
            icon={
              <Link2 size={17} />
            }
            disabled={disabled}
            onChange={
              handleGenerateIncomeChange
            }
          />

          <SettingsSwitch
            checked={
              value.cancelIncomeWithSale
            }
            title="Cancelar receita junto com a venda"
            description="Cancela o lançamento financeiro vinculado quando a respectiva venda for cancelada."
            icon={
              <RotateCcw size={17} />
            }
            disabled={
              disabled ||
              !value.generateIncomeFromSale
            }
            onChange={(checked) =>
              updateField(
                "cancelIncomeWithSale",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.showOverdueAlerts
            }
            title="Exibir alertas de vencimento"
            description="Destaca contas a receber e a pagar que estiverem vencidas."
            icon={
              <BellRing size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "showOverdueAlerts",
                checked,
              )
            }
          />
        </div>

        <div className={styles.integrationNote}>
          <CalendarClock size={18} />

          <div>
            <strong>
              Integração com as vendas
            </strong>

            <span>
              Os lançamentos automáticos utilizarão o total, a forma de pagamento e a data da venda. A receita será vinculada ao número da operação para preservar a rastreabilidade.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}