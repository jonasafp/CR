import {
  Boxes,
  ChartNoAxesCombined,
  Landmark,
  PackageSearch,
  ShoppingCart,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import type {
  ReportType,
} from "../../../domain/reports/Report";

import styles from "./ReportTypeSelector.module.css";

interface ReportTypeSelectorProps {
  value: ReportType;

  onChange: (
    value: ReportType,
  ) => void;
}

interface ReportTypeOption {
  value: ReportType;

  title: string;
  description: string;

  icon: LucideIcon;
}

const reportOptions:
  ReportTypeOption[] = [
    {
      value: "sales",
      title: "Vendas",

      description:
        "Faturamento, lucro, ticket e operações comerciais.",

      icon: ShoppingCart,
    },

    {
      value: "financial",
      title: "Financeiro",

      description:
        "Receitas, despesas, contas pendentes e saldo.",

      icon: Landmark,
    },

    {
      value: "products",
      title: "Produtos",

      description:
        "Estoque, rentabilidade e desempenho por produto.",

      icon: PackageSearch,
    },

    {
      value: "inventory",
      title: "Estoque",

      description:
        "Entradas, saídas e ajustes realizados no período.",

      icon: Boxes,
    },
  ];

export default function ReportTypeSelector({
  value,
  onChange,
}: ReportTypeSelectorProps) {
  return (
    <section
      className={styles.container}
    >
      <div className={styles.heading}>
        <div
          className={
            styles.headingIcon
          }
        >
          <ChartNoAxesCombined
            size={20}
          />
        </div>

        <div>
          <strong>
            Escolha o relatório
          </strong>

          <span>
            Selecione a área que deseja analisar.
          </span>
        </div>
      </div>

      <div className={styles.options}>
        {reportOptions.map(
          (option) => {
            const Icon =
              option.icon;

            const isSelected =
              option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.option} ${
                  isSelected
                    ? styles.selected
                    : ""
                }`}
                aria-pressed={
                  isSelected
                }
                onClick={() =>
                  onChange(
                    option.value,
                  )
                }
              >
                <div
                  className={
                    styles.optionIcon
                  }
                >
                  <Icon size={19} />
                </div>

                <div>
                  <strong>
                    {option.title}
                  </strong>

                  <span>
                    {
                      option.description
                    }
                  </span>
                </div>
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}