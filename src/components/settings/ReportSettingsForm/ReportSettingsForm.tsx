import {
  BarChart3,
  Building2,
  CalendarDays,
  FileClock,
  ListFilter,
  Printer,
} from "lucide-react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  ReportPrintOrientation,
  ReportSettings,
} from "../../../domain/settings/SystemSettings";

import type {
  ReportGroupBy,
} from "../../../domain/reports/Report";

import type {
  ReportPeriodPreset,
} from "../../../domain/reports/ReportFilters";

import SettingsSwitch from "../SettingsSwitch/SettingsSwitch";

import styles from "./ReportSettingsForm.module.css";

interface ReportSettingsFormProps {
  value: ReportSettings;
  disabled?: boolean;

  onChange: (
    value: ReportSettings,
  ) => void;
}

type PageSizeValue =
  | "10"
  | "20"
  | "50"
  | "100";

const periodOptions:
  SelectOption<ReportPeriodPreset>[] = [
    {
      value: "today",
      label: "Hoje",
    },
    {
      value: "week",
      label: "Semana atual",
    },
    {
      value: "month",
      label: "Mês atual",
    },
    {
      value: "quarter",
      label: "Trimestre atual",
    },
    {
      value: "year",
      label: "Ano atual",
    },
    {
      value: "custom",
      label: "Período personalizado",
    },
  ];

const groupOptions:
  SelectOption<ReportGroupBy>[] = [
    {
      value: "day",
      label: "Por dia",
    },
    {
      value: "week",
      label: "Por semana",
    },
    {
      value: "month",
      label: "Por mês",
    },
    {
      value: "year",
      label: "Por ano",
    },
  ];

const pageSizeOptions:
  SelectOption<PageSizeValue>[] = [
    {
      value: "10",
      label: "10 registros por página",
    },
    {
      value: "20",
      label: "20 registros por página",
    },
    {
      value: "50",
      label: "50 registros por página",
    },
    {
      value: "100",
      label: "100 registros por página",
    },
  ];

const orientationOptions:
  SelectOption<ReportPrintOrientation>[] = [
    {
      value: "portrait",
      label: "Retrato",
    },
    {
      value: "landscape",
      label: "Paisagem",
    },
  ];

export default function ReportSettingsForm({
  value,
  disabled = false,
  onChange,
}: ReportSettingsFormProps) {
  function updateField<
    Key extends keyof ReportSettings,
  >(
    field: Key,
    fieldValue: ReportSettings[Key],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <BarChart3 size={21} />
        </div>

        <div>
          <h3>
            Configurações de relatórios
          </h3>

          <p>
            Defina filtros, agrupamentos e preferências de impressão.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.sectionTitle}>
          <ListFilter size={16} />

          <div>
            <strong>
              Padrões de consulta
            </strong>

            <span>
              Opções aplicadas automaticamente ao abrir o módulo de relatórios.
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          <Select
            label="Período padrão"
            value={value.defaultPeriod}
            options={periodOptions}
            disabled={disabled}
            onChange={(period) =>
              updateField(
                "defaultPeriod",
                period,
              )
            }
          />

          <Select
            label="Agrupamento padrão"
            value={value.defaultGroupBy}
            options={groupOptions}
            disabled={disabled}
            onChange={(groupBy) =>
              updateField(
                "defaultGroupBy",
                groupBy,
              )
            }
          />

          <Select
            label="Registros por página"
            value={
              String(
                value.defaultPageSize,
              ) as PageSizeValue
            }
            options={pageSizeOptions}
            disabled={disabled}
            onChange={(pageSize) =>
              updateField(
                "defaultPageSize",
                Number(
                  pageSize,
                ) as
                  | 10
                  | 20
                  | 50
                  | 100,
              )
            }
          />

          <Select
            label="Orientação da impressão"
            value={value.printOrientation}
            options={orientationOptions}
            disabled={disabled}
            onChange={(orientation) =>
              updateField(
                "printOrientation",
                orientation,
              )
            }
          />
        </div>

        <div className={styles.sectionTitle}>
          <Printer size={16} />

          <div>
            <strong>
              Conteúdo e impressão
            </strong>

            <span>
              Defina quais informações acompanharão os relatórios.
            </span>
          </div>
        </div>

        <div className={styles.switchGrid}>
          <SettingsSwitch
            checked={
              value.includeCancelledRecords
            }
            title="Incluir registros cancelados"
            description="Inclui vendas e lançamentos cancelados nos resultados iniciais dos relatórios."
            icon={
              <FileClock size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "includeCancelledRecords",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.showBusinessInformation
            }
            title="Exibir dados do estabelecimento"
            description="Mostra nome, documento e endereço no cabeçalho dos relatórios impressos."
            icon={
              <Building2 size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "showBusinessInformation",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.showGenerationDate
            }
            title="Exibir data de geração"
            description="Adiciona a data e o horário em que o relatório foi emitido."
            icon={
              <CalendarDays size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "showGenerationDate",
                checked,
              )
            }
          />
        </div>
      </div>
    </section>
  );
}