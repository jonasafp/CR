import {
  CalendarDays,
  Globe2,
  Palette,
  Ruler,
  Settings2,
} from "lucide-react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  GeneralSettings,
  SystemDateFormat,
  SystemTheme,
} from "../../../domain/settings/SystemSettings";

import type {
  StockUnit,
} from "../../../types/Product";

import styles from "./GeneralSettingsForm.module.css";

interface GeneralSettingsFormProps {
  value: GeneralSettings;

  disabled?: boolean;

  onChange: (
    value: GeneralSettings,
  ) => void;
}

type DecimalPlacesValue =
  | "0"
  | "1"
  | "2"
  | "3";

const stockUnitOptions:
  SelectOption<StockUnit>[] = [
    {
      value: "kg",
      label: "Quilograma (kg)",
      icon: <Ruler size={14} />,
    },
    {
      value: "g",
      label: "Grama (g)",
      icon: <Ruler size={14} />,
    },
    {
      value: "un",
      label: "Unidade (un)",
      icon: <Ruler size={14} />,
    },
    {
      value: "l",
      label: "Litro (L)",
      icon: <Ruler size={14} />,
    },
    {
      value: "ml",
      label: "Mililitro (ml)",
      icon: <Ruler size={14} />,
    },
    {
      value: "cx",
      label: "Caixa (cx)",
      icon: <Ruler size={14} />,
    },
    {
      value: "pct",
      label: "Pacote (pct)",
      icon: <Ruler size={14} />,
    },
  ];

const decimalOptions:
  SelectOption<DecimalPlacesValue>[] = [
    {
      value: "0",
      label: "Sem casas decimais",
    },
    {
      value: "1",
      label:
        "1 casa decimal — 10,5",
    },
    {
      value: "2",
      label:
        "2 casas decimais — 10,50",
    },
    {
      value: "3",
      label:
        "3 casas decimais — 10,500",
    },
  ];

const dateFormatOptions:
  SelectOption<SystemDateFormat>[] = [
    {
      value: "dd/MM/yyyy",

      label:
        "Dia/mês/ano — 31/12/2026",

      icon:
        <CalendarDays size={14} />,
    },
    {
      value: "yyyy-MM-dd",

      label:
        "Ano-mês-dia — 2026-12-31",

      icon:
        <CalendarDays size={14} />,
    },
  ];

const themeOptions:
  SelectOption<SystemTheme>[] = [
    {
      value: "light",
      label: "Tema claro",

      icon:
        <Palette size={14} />,
    },
    {
      value: "system",

      label:
        "Usar preferência do sistema",

      icon:
        <Palette size={14} />,
    },
  ];

export default function GeneralSettingsForm({
  value,
  disabled = false,
  onChange,
}: GeneralSettingsFormProps) {
  function updateField<
    Key extends keyof GeneralSettings,
  >(
    field: Key,

    fieldValue:
      GeneralSettings[Key],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  return (
    <section
      className={styles.card}
    >
      <header
        className={styles.header}
      >
        <div
          className={
            styles.headerIcon
          }
        >
          <Settings2 size={21} />
        </div>

        <div>
          <h3>
            Preferências gerais
          </h3>

          <p>
            Defina unidades, formatos regionais e aparência do sistema.
          </p>
        </div>
      </header>

      <div
        className={styles.content}
      >
        <div
          className={
            styles.sectionTitle
          }
        >
          <Ruler size={16} />

          <div>
            <strong>
              Unidades e precisão
            </strong>

            <span>
              Padrões utilizados nos cadastros e cálculos.
            </span>
          </div>
        </div>

        <div
          className={styles.grid}
        >
          <Select
            label="Unidade principal de estoque"
            value={
              value.principalStockUnit
            }
            options={
              stockUnitOptions
            }
            disabled={disabled}
            onChange={(unit) =>
              updateField(
                "principalStockUnit",
                unit,
              )
            }
          />

          <Select
            label="Casas decimais"
            value={
              String(
                value.decimalPlaces,
              ) as DecimalPlacesValue
            }
            options={
              decimalOptions
            }
            disabled={disabled}
            onChange={(places) =>
              updateField(
                "decimalPlaces",

                Number(
                  places,
                ) as
                  | 0
                  | 1
                  | 2
                  | 3,
              )
            }
          />
        </div>

        <div
          className={
            styles.sectionTitle
          }
        >
          <Globe2 size={16} />

          <div>
            <strong>
              Região e data
            </strong>

            <span>
              Configurações utilizadas na exibição das informações.
            </span>
          </div>
        </div>

        <div
          className={styles.grid}
        >
          <label
            className={
              styles.field
            }
          >
            <span>
              Moeda
            </span>

            <input
              value="Real brasileiro (BRL)"
              disabled
            />

            <small>
              A moeda será ampliada quando houver suporte multimoeda.
            </small>
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Idioma e região
            </span>

            <input
              value="Português — Brasil (pt-BR)"
              disabled
            />
          </label>

          <Select
            label="Formato de data"
            value={
              value.dateFormat
            }
            options={
              dateFormatOptions
            }
            disabled={disabled}
            onChange={(format) =>
              updateField(
                "dateFormat",
                format,
              )
            }
          />

          <label
            className={
              styles.field
            }
          >
            <span>
              Fuso horário
            </span>

            <input
              value={
                value.timezone
              }
              maxLength={80}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "timezone",
                  event.target.value,
                )
              }
            />

            <small>
              Exemplo: America/Fortaleza.
            </small>
          </label>
        </div>

        <div
          className={
            styles.sectionTitle
          }
        >
          <Palette size={16} />

          <div>
            <strong>
              Aparência
            </strong>

            <span>
              Escolha como a interface deverá ser apresentada.
            </span>
          </div>
        </div>

        <div
          className={
            styles.singleColumn
          }
        >
          <Select
            label="Tema do sistema"
            value={value.theme}
            options={
              themeOptions
            }
            disabled={disabled}
            onChange={(theme) =>
              updateField(
                "theme",
                theme,
              )
            }
          />
        </div>

        <div
          className={styles.notice}
        >
          O tema baseado no sistema operacional está preparado para a futura versão desktop. Nesta fase, a interface continuará utilizando a identidade visual clara atual.
        </div>
      </div>
    </section>
  );
}