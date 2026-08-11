import {
  AlertTriangle,
  BadgeMinus,
  FileText,
  PackageSearch,
  RefreshCw,
  Warehouse,
} from "lucide-react";

import type {
  InventorySettings,
} from "../../../domain/settings/SystemSettings";

import SettingsSwitch from "../SettingsSwitch/SettingsSwitch";

import styles from "./InventorySettingsForm.module.css";

interface InventorySettingsFormProps {
  value: InventorySettings;
  disabled?: boolean;

  onChange: (
    value: InventorySettings,
  ) => void;
}

export default function InventorySettingsForm({
  value,
  disabled = false,
  onChange,
}: InventorySettingsFormProps) {
  function updateField<
    Key extends keyof InventorySettings,
  >(
    field: Key,
    fieldValue: InventorySettings[Key],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function updateMinimumStock(
    rawValue: string,
  ) {
    const numericValue =
      Number(rawValue);

    updateField(
      "defaultMinimumStock",
      Number.isFinite(numericValue)
        ? Math.max(numericValue, 0)
        : 0,
    );
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <Warehouse size={21} />
        </div>

        <div>
          <h3>
            Configurações de estoque
          </h3>

          <p>
            Defina alertas, permissões e padrões utilizados nas movimentações.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.sectionTitle}>
          <PackageSearch size={16} />

          <div>
            <strong>
              Controle de quantidade
            </strong>

            <span>
              Determine como o sistema deverá controlar a disponibilidade dos produtos.
            </span>
          </div>
        </div>

        <div className={styles.fieldArea}>
          <label className={styles.field}>
            <span>
              Estoque mínimo padrão
            </span>

            <input
              type="number"
              min="0"
              step="0.001"
              value={value.defaultMinimumStock}
              disabled={disabled}
              onChange={(event) =>
                updateMinimumStock(
                  event.target.value,
                )
              }
            />

            <small>
              Valor sugerido ao cadastrar novos produtos. Cada produto poderá possuir seu próprio limite.
            </small>
          </label>
        </div>

        <div className={styles.switchGrid}>
          <SettingsSwitch
            checked={
              value.lowStockAlertsEnabled
            }
            title="Alertas de estoque baixo"
            description="Destaca produtos que alcançarem ou ficarem abaixo do estoque mínimo definido."
            icon={
              <AlertTriangle size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "lowStockAlertsEnabled",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.allowNegativeStock
            }
            title="Permitir estoque negativo"
            description="Permite concluir saídas e vendas mesmo quando não houver quantidade suficiente."
            icon={
              <BadgeMinus size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "allowNegativeStock",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.updatePurchasePriceOnEntry
            }
            title="Atualizar preço de compra na entrada"
            description="Usa automaticamente o valor informado na entrada como novo preço de compra do produto."
            icon={
              <RefreshCw size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "updatePurchasePriceOnEntry",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.requireMovementNotes
            }
            title="Exigir observação nas movimentações"
            description="Impede entradas, saídas e ajustes manuais sem uma justificativa informada."
            icon={
              <FileText size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "requireMovementNotes",
                checked,
              )
            }
          />
        </div>

        {value.allowNegativeStock && (
          <div className={styles.warning}>
            <AlertTriangle size={17} />

            <div>
              <strong>
                Atenção ao estoque negativo
              </strong>

              <span>
                Esta opção permite operações sem saldo disponível e pode gerar divergências. Utilize-a somente quando o controle físico permitir esse comportamento.
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}