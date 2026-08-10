import {
  BarChart3,
  Building2,
  Database,
  Landmark,
  PackageSearch,
  ReceiptText,
  Settings2,
  ShoppingCart,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import type {
  SettingsSection,
} from "../../../domain/settings/SystemSettings";

import styles from "./SettingsNavigation.module.css";

interface SettingsNavigationProps {
  activeSection: SettingsSection;

  changedSections?: SettingsSection[];

  onChange: (
    section: SettingsSection,
  ) => void;
}

interface NavigationItem {
  section: SettingsSection;

  label: string;
  description: string;

  icon: LucideIcon;
}

const navigationItems: NavigationItem[] = [
  {
    section: "business",

    label: "Estabelecimento",

    description:
      "Identidade, contato e endereço",

    icon: Building2,
  },
  {
    section: "general",

    label: "Preferências gerais",

    description:
      "Unidades, formato e aparência",

    icon: Settings2,
  },
  {
    section: "sales",

    label: "Vendas",

    description:
      "Regras e padrões do PDV",

    icon: ShoppingCart,
  },
  {
    section: "inventory",

    label: "Estoque",

    description:
      "Alertas e movimentações",

    icon: PackageSearch,
  },
  {
    section: "financial",

    label: "Financeiro",

    description:
      "Categorias e lançamentos",

    icon: Landmark,
  },
  {
    section: "reports",

    label: "Relatórios",

    description:
      "Períodos e impressão",

    icon: BarChart3,
  },
  {
    section: "receipt",

    label: "Comprovante",

    description:
      "Conteúdo e apresentação",

    icon: ReceiptText,
  },
  {
    section: "data",

    label: "Dados e manutenção",

    description:
      "Backup, importação e limpeza",

    icon: Database,
  },
];

export default function SettingsNavigation({
  activeSection,
  changedSections = [],
  onChange,
}: SettingsNavigationProps) {
  return (
    <nav
      className={styles.navigation}
      aria-label="Seções das configurações"
    >
      <div className={styles.header}>
        <strong>
          Configurações
        </strong>

        <span>
          Selecione uma seção para editar.
        </span>
      </div>

      <div className={styles.items}>
        {navigationItems.map(
          (item) => {
            const Icon = item.icon;

            const isActive =
              activeSection ===
              item.section;

            const isChanged =
              changedSections.includes(
                item.section,
              );

            return (
              <button
                key={item.section}
                type="button"
                className={`${styles.item} ${
                  isActive
                    ? styles.active
                    : ""
                }`}
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  onChange(item.section)
                }
              >
                <div
                  className={styles.icon}
                >
                  <Icon size={18} />
                </div>

                <div
                  className={
                    styles.information
                  }
                >
                  <strong>
                    {item.label}
                  </strong>

                  <span>
                    {item.description}
                  </span>
                </div>

                {isChanged && (
                  <span
                    className={
                      styles.changed
                    }
                    title="Alterações não salvas"
                  />
                )}
              </button>
            );
          },
        )}
      </div>
    </nav>
  );
}