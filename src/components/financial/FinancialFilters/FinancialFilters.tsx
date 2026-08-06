import {
  ArrowDownAZ,
  ArrowDownUp,
  ArrowUp,
  CalendarDays,
  CircleDollarSign,
  Filter,
  Layers3,
  Receipt,
  RotateCcw,
  Search,
  ShoppingCart,
  WalletCards,
} from "lucide-react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  FinancialFilters as FinancialFiltersState,
  FinancialSortDirection,
  FinancialSortField,
  FinancialTransactionSourceFilter,
  FinancialTransactionStatusFilter,
  FinancialTransactionTypeFilter,
} from "../../../domain/financial/FinancialFilters";

import styles from "./FinancialFilters.module.css";

interface FinancialFiltersProps {
  filters:
    FinancialFiltersState;

  categories: string[];

  onChange: (
    filters:
      FinancialFiltersState,
  ) => void;

  onReset: () => void;
}

const typeOptions: SelectOption<
  FinancialTransactionTypeFilter
>[] = [
  {
    value: "all",
    label:
      "Receitas e despesas",
    icon: <Layers3 size={14} />,
  },
  {
    value: "income",
    label:
      "Somente receitas",
    icon: (
      <CircleDollarSign
        size={14}
      />
    ),
  },
  {
    value: "expense",
    label:
      "Somente despesas",
    icon: (
      <WalletCards size={14} />
    ),
  },
];

const statusOptions: SelectOption<
  FinancialTransactionStatusFilter
>[] = [
  {
    value: "all",
    label:
      "Todas as situações",
    icon: <Layers3 size={14} />,
  },
  {
    value: "pending",
    label: "Pendentes",
    icon: (
      <CalendarDays size={14} />
    ),
  },
  {
    value: "overdue",
    label: "Vencidos",
    icon: (
      <CalendarDays size={14} />
    ),
  },
  {
    value: "received",
    label: "Recebidos",
    icon: (
      <CircleDollarSign
        size={14}
      />
    ),
  },
  {
    value: "paid",
    label: "Pagos",
    icon: (
      <WalletCards size={14} />
    ),
  },
  {
    value: "cancelled",
    label: "Cancelados",
    icon: <Receipt size={14} />,
  },
];

const sourceOptions: SelectOption<
  FinancialTransactionSourceFilter
>[] = [
  {
    value: "all",
    label:
      "Todas as origens",
    icon: <Layers3 size={14} />,
  },
  {
    value: "manual",
    label:
      "Lançamento manual",
    icon: <Receipt size={14} />,
  },
  {
    value: "sale",
    label: "Venda",
    icon: (
      <ShoppingCart size={14} />
    ),
  },
  {
    value: "inventory",
    label: "Estoque",
    icon: <Layers3 size={14} />,
  },
  {
    value: "other",
    label: "Outra origem",
    icon: <Layers3 size={14} />,
  },
];

const sortOptions: SelectOption<
  FinancialSortField
>[] = [
  {
    value: "dueDate",
    label:
      "Data de vencimento",
    icon: (
      <CalendarDays size={14} />
    ),
  },
  {
    value: "createdAt",
    label:
      "Data de cadastro",
    icon: (
      <CalendarDays size={14} />
    ),
  },
  {
    value: "amount",
    label: "Valor",
    icon: (
      <ArrowDownUp size={14} />
    ),
  },
  {
    value: "description",
    label: "Descrição",
    icon: (
      <ArrowDownAZ size={14} />
    ),
  },
];

const directionOptions:
  SelectOption<
    FinancialSortDirection
  >[] = [
    {
      value: "desc",
      label: "Decrescente",
      description:
        "Exibe os maiores ou mais recentes primeiro",
      icon: (
        <ArrowDownUp size={14} />
      ),
    },
    {
      value: "asc",
      label: "Crescente",
      description:
        "Exibe os menores ou mais antigos primeiro",
      icon: <ArrowUp size={14} />,
    },
  ];

export default function FinancialFilters({
  filters,
  categories,
  onChange,
  onReset,
}: FinancialFiltersProps) {
  function updateFilter<
    Key extends keyof FinancialFiltersState,
  >(
    key: Key,

    value:
      FinancialFiltersState[Key],
  ) {
    onChange({
      ...filters,

      [key]:
        value,

      page:
        1,
    });
  }

  const categoryOptions:
    SelectOption<string>[] = [
      {
        value: "all",
        label:
          "Todas as categorias",
        icon: (
          <Layers3 size={14} />
        ),
      },

      ...categories.map(
        (category) => ({
          value:
            category,

          label:
            category,
        }),
      ),
    ];

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.source !== "all" ||
    filters.category !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.sortBy !==
      "dueDate" ||
    filters.sortDirection !==
      "desc";

  return (
    <div
      className={
        styles.container
      }
    >
      <div
        className={
          styles.search
        }
      >
        <Search size={18} />

        <input
          type="search"
          value={filters.search}
          placeholder="Pesquisar por número, descrição, categoria, cliente ou fornecedor..."
          onChange={(event) =>
            updateFilter(
              "search",
              event.target.value,
            )
          }
        />
      </div>

      <div
        className={
          styles.primaryGrid
        }
      >
        <Select
          label="Tipo"
          value={filters.type}
          options={typeOptions}
          onChange={(value) =>
            updateFilter(
              "type",
              value,
            )
          }
        />

        <Select
          label="Situação"
          value={filters.status}
          options={statusOptions}
          onChange={(value) =>
            updateFilter(
              "status",
              value,
            )
          }
        />

        <Select
          label="Origem"
          value={filters.source}
          options={sourceOptions}
          onChange={(value) =>
            updateFilter(
              "source",
              value,
            )
          }
        />

        <Select
          label="Categoria"
          value={filters.category}
          options={
            categoryOptions
          }
          onChange={(value) =>
            updateFilter(
              "category",
              value,
            )
          }
        />
      </div>

      <div
        className={
          styles.secondaryGrid
        }
      >
        <label
          className={styles.field}
        >
          <span>
            Vencimento inicial
          </span>

          <input
            type="date"
            value={
              filters.dateFrom
            }
            onChange={(event) =>
              updateFilter(
                "dateFrom",
                event.target.value,
              )
            }
          />
        </label>

        <label
          className={styles.field}
        >
          <span>
            Vencimento final
          </span>

          <input
            type="date"
            value={
              filters.dateTo
            }
            onChange={(event) =>
              updateFilter(
                "dateTo",
                event.target.value,
              )
            }
          />
        </label>

        <Select
          label="Ordenar por"
          value={filters.sortBy}
          options={sortOptions}
          onChange={(value) =>
            updateFilter(
              "sortBy",
              value,
            )
          }
        />

        <Select
          label="Direção"
          value={
            filters.sortDirection
          }
          options={
            directionOptions
          }
          onChange={(value) =>
            updateFilter(
              "sortDirection",
              value,
            )
          }
        />
      </div>

      <footer
        className={styles.footer}
      >
        <div>
          <Filter size={15} />

          Filtros da listagem
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
          >
            <RotateCcw
              size={15}
            />

            Limpar filtros
          </button>
        )}
      </footer>
    </div>
  );
}