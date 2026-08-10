import {
  ArrowDownAZ,
  ArrowDownUp,
  ArrowUp,
  Boxes,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Layers3,
  Package,
  Receipt,
  RotateCcw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  FinancialTransactionSource,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from "../../../domain/financial/FinancialTransaction";

import type {
  PaymentMethod,
  SaleStatus,
} from "../../../domain/sales/Sale";

import type {
  ReportGroupBy,
} from "../../../domain/reports/Report";

import type {
  ReportFilters as ReportFiltersState,
  ReportPeriodPreset,
  ReportSortDirection,
  ReportSortField,
  ReportStockCondition,
} from "../../../domain/reports/ReportFilters";

import {
  getReportPresetPeriod,
} from "../../../domain/reports/ReportPeriod";

import type {
  InventoryMovementType,
} from "../../../types/Inventory";

import type {
  ProductStatus,
} from "../../../types/Product";

import type {
  ReportFilterOptions,
} from "../../../repositories/reports/ReportRepository";

import styles from "./ReportFilters.module.css";

interface ReportFiltersProps {
  filters: ReportFiltersState;

  options?:
    ReportFilterOptions;

  isLoadingOptions?: boolean;

  onChange: (
    filters:
      ReportFiltersState,
  ) => void;

  onReset: () => void;
}

type SaleStatusFilter =
  | SaleStatus
  | "all";

type PaymentMethodFilter =
  | PaymentMethod
  | "all";

type FinancialTypeFilter =
  | FinancialTransactionType
  | "all";

type FinancialStatusFilter =
  | FinancialTransactionStatus
  | "overdue"
  | "all";

type FinancialSourceFilter =
  | FinancialTransactionSource
  | "all";

type ProductStatusFilter =
  | ProductStatus
  | "all";

type InventoryMovementTypeFilter =
  | InventoryMovementType
  | "all";

const periodOptions:
  SelectOption<
    ReportPeriodPreset
  >[] = [
    {
      value: "today",
      label: "Hoje",
      icon: (
        <CalendarDays size={14} />
      ),
    },

    {
      value: "week",
      label: "Semana atual",
      icon: (
        <CalendarDays size={14} />
      ),
    },

    {
      value: "month",
      label: "Mês atual",
      icon: (
        <CalendarDays size={14} />
      ),
    },

    {
      value: "quarter",
      label: "Trimestre atual",
      icon: (
        <CalendarDays size={14} />
      ),
    },

    {
      value: "year",
      label: "Ano atual",
      icon: (
        <CalendarDays size={14} />
      ),
    },

    {
      value: "custom",
      label:
        "Período personalizado",
      icon: (
        <SlidersHorizontal
          size={14}
        />
      ),
    },
  ];

const groupOptions:
  SelectOption<
    ReportGroupBy
  >[] = [
    {
      value: "day",
      label: "Agrupar por dia",
      icon: (
        <CalendarDays size={14} />
      ),
    },

    {
      value: "week",
      label: "Agrupar por semana",
      icon: (
        <CalendarDays size={14} />
      ),
    },

    {
      value: "month",
      label: "Agrupar por mês",
      icon: (
        <CalendarDays size={14} />
      ),
    },

    {
      value: "year",
      label: "Agrupar por ano",
      icon: (
        <CalendarDays size={14} />
      ),
    },
  ];

const saleStatusOptions:
  SelectOption<
    SaleStatusFilter
  >[] = [
    {
      value: "all",
      label:
        "Todas as situações",
      icon: (
        <Layers3 size={14} />
      ),
    },

    {
      value: "completed",
      label: "Concluídas",
      icon: (
        <CheckCircle2 size={14} />
      ),
    },

    {
      value: "pending",
      label: "Pendentes",
      icon: <Clock3 size={14} />,
    },

    {
      value: "cancelled",
      label: "Canceladas",
      icon: <Receipt size={14} />,
    },
  ];

const paymentOptions:
  SelectOption<
    PaymentMethodFilter
  >[] = [
    {
      value: "all",
      label:
        "Todas as formas",
      icon: (
        <WalletCards size={14} />
      ),
    },

    {
      value: "cash",
      label: "Dinheiro",
      icon: (
        <CircleDollarSign
          size={14}
        />
      ),
    },

    {
      value: "pix",
      label: "Pix",
      icon: (
        <CircleDollarSign
          size={14}
        />
      ),
    },

    {
      value: "credit_card",
      label:
        "Cartão de crédito",
      icon: (
        <WalletCards size={14} />
      ),
    },

    {
      value: "debit_card",
      label:
        "Cartão de débito",
      icon: (
        <WalletCards size={14} />
      ),
    },

    {
      value: "bank_transfer",
      label:
        "Transferência bancária",
      icon: (
        <WalletCards size={14} />
      ),
    },

    {
      value: "other",
      label: "Outro",
      icon: (
        <Layers3 size={14} />
      ),
    },
  ];

const financialTypeOptions:
  SelectOption<
    FinancialTypeFilter
  >[] = [
    {
      value: "all",
      label:
        "Receitas e despesas",
      icon: (
        <Layers3 size={14} />
      ),
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

const financialStatusOptions:
  SelectOption<
    FinancialStatusFilter
  >[] = [
    {
      value: "all",
      label:
        "Todas as situações",
      icon: (
        <Layers3 size={14} />
      ),
    },

    {
      value: "pending",
      label: "Pendentes",
      icon: <Clock3 size={14} />,
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

const financialSourceOptions:
  SelectOption<
    FinancialSourceFilter
  >[] = [
    {
      value: "all",
      label:
        "Todas as origens",
      icon: (
        <Layers3 size={14} />
      ),
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
      icon: <Boxes size={14} />,
    },

    {
      value: "other",
      label: "Outra origem",
      icon: (
        <Layers3 size={14} />
      ),
    },
  ];

const productStatusOptions:
  SelectOption<
    ProductStatusFilter
  >[] = [
    {
      value: "all",
      label:
        "Ativos e inativos",
      icon: (
        <Layers3 size={14} />
      ),
    },

    {
      value: "active",
      label:
        "Somente ativos",
      icon: (
        <CheckCircle2 size={14} />
      ),
    },

    {
      value: "inactive",
      label:
        "Somente inativos",
      icon: <Clock3 size={14} />,
    },
  ];

const stockOptions:
  SelectOption<
    ReportStockCondition
  >[] = [
    {
      value: "all",
      label:
        "Todas as condições",
      icon: (
        <Layers3 size={14} />
      ),
    },

    {
      value: "available",
      label:
        "Estoque disponível",
      icon: <Package size={14} />,
    },

    {
      value: "low",
      label: "Estoque baixo",
      icon: <Clock3 size={14} />,
    },

    {
      value: "out",
      label: "Sem estoque",
      icon: <Boxes size={14} />,
    },
  ];

const movementOptions:
  SelectOption<
    InventoryMovementTypeFilter
  >[] = [
    {
      value: "all",
      label:
        "Todas as movimentações",
      icon: (
        <Layers3 size={14} />
      ),
    },

    {
      value: "entry",
      label: "Entradas",
      icon: <Boxes size={14} />,
    },

    {
      value: "exit",
      label: "Saídas",
      icon: <Boxes size={14} />,
    },

    {
      value:
        "adjustment_positive",

      label:
        "Ajustes positivos",

      icon: <ArrowUp size={14} />,
    },

    {
      value:
        "adjustment_negative",

      label:
        "Ajustes negativos",

      icon: (
        <ArrowDownUp size={14} />
      ),
    },
  ];

const sortOptions:
  SelectOption<
    ReportSortField
  >[] = [
    {
      value: "date",
      label: "Data",
      icon: (
        <CalendarDays size={14} />
      ),
    },

    {
      value: "description",
      label: "Descrição",
      icon: (
        <ArrowDownAZ size={14} />
      ),
    },

    {
      value: "amount",
      label: "Valor",
      icon: (
        <CircleDollarSign
          size={14}
        />
      ),
    },

    {
      value: "quantity",
      label: "Quantidade",
      icon: <Boxes size={14} />,
    },

    {
      value: "profit",
      label: "Lucro",
      icon: (
        <CircleDollarSign
          size={14}
        />
      ),
    },
  ];

const directionOptions:
  SelectOption<
    ReportSortDirection
  >[] = [
    {
      value: "desc",
      label: "Decrescente",

      description:
        "Maiores ou mais recentes primeiro",

      icon: (
        <ArrowDownUp size={14} />
      ),
    },

    {
      value: "asc",
      label: "Crescente",

      description:
        "Menores ou mais antigos primeiro",

      icon: <ArrowUp size={14} />,
    },
  ];

export default function ReportFilters({
  filters,
  options,
  isLoadingOptions = false,
  onChange,
  onReset,
}: ReportFiltersProps) {
  function updateFilter<
    Key extends keyof
      ReportFiltersState,
  >(
    key: Key,
    value:
      ReportFiltersState[Key],
  ) {
    onChange({
      ...filters,
      [key]: value,
      page: 1,
    });
  }

  function handlePeriodChange(
    periodPreset:
      ReportPeriodPreset,
  ) {
    if (
      periodPreset === "custom"
    ) {
      onChange({
        ...filters,
        periodPreset,
        page: 1,
      });

      return;
    }

    const period =
      getReportPresetPeriod(
        periodPreset,
      );

    onChange({
      ...filters,

      periodPreset,

      dateFrom:
        period.dateFrom,

      dateTo:
        period.dateTo,

      page: 1,
    });
  }

  function handleDateChange(
    field:
      | "dateFrom"
      | "dateTo",

    value: string,
  ) {
    onChange({
      ...filters,

      periodPreset: "custom",

      [field]: value,

      page: 1,
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

      ...(
        options?.categories ??
        []
      ).map((category) => ({
        value: category,
        label: category,
      })),
    ];

  const productOptions:
    SelectOption<string>[] = [
      {
        value: "all",

        label:
          "Todos os produtos",

        icon: (
          <Package size={14} />
        ),
      },

      ...(
        options?.products ??
        []
      ).map((product) => ({
        value:
          String(product.id),

        label:
          product.name,

        description:
          product.code,

        icon: (
          <Package size={14} />
        ),
      })),
    ];

  const productValue =
    filters.productId === null
      ? "all"
      : String(
          filters.productId,
        );

  return (
    <section
      className={
        styles.container
      }
    >
      <div className={styles.search}>
        <Search size={18} />

        <input
          type="search"
          value={filters.search}
          placeholder="Pesquisar no relatório..."
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
          styles.commonGrid
        }
      >
        <Select
          label="Período"
          value={
            filters.periodPreset
          }
          options={periodOptions}
          onChange={
            handlePeriodChange
          }
        />

        <label
          className={styles.field}
        >
          <span>Data inicial</span>

          <input
            type="date"
            value={filters.dateFrom}
            max={
              filters.dateTo ||
              undefined
            }
            onChange={(event) =>
              handleDateChange(
                "dateFrom",
                event.target.value,
              )
            }
          />
        </label>

        <label
          className={styles.field}
        >
          <span>Data final</span>

          <input
            type="date"
            value={filters.dateTo}
            min={
              filters.dateFrom ||
              undefined
            }
            onChange={(event) =>
              handleDateChange(
                "dateTo",
                event.target.value,
              )
            }
          />
        </label>

        <Select
          label="Agrupamento"
          value={filters.groupBy}
          options={groupOptions}
          onChange={(value) =>
            updateFilter(
              "groupBy",
              value,
            )
          }
        />
      </div>

      <div
        className={
          styles.filterGrid
        }
      >
        <Select
          label="Categoria"
          value={filters.category}
          options={
            categoryOptions
          }
          disabled={
            isLoadingOptions
          }
          onChange={(value) =>
            updateFilter(
              "category",
              value,
            )
          }
        />

        <Select
          label="Produto"
          value={productValue}
          options={productOptions}
          disabled={
            isLoadingOptions
          }
          onChange={(value) =>
            updateFilter(
              "productId",

              value === "all"
                ? null
                : Number(value),
            )
          }
        />

        {filters.reportType ===
          "sales" && (
          <>
            <Select
              label="Situação da venda"
              value={
                filters.saleStatus
              }
              options={
                saleStatusOptions
              }
              onChange={(value) =>
                updateFilter(
                  "saleStatus",
                  value,
                )
              }
            />

            <Select
              label="Forma de pagamento"
              value={
                filters.paymentMethod
              }
              options={
                paymentOptions
              }
              onChange={(value) =>
                updateFilter(
                  "paymentMethod",
                  value,
                )
              }
            />
          </>
        )}

        {filters.reportType ===
          "financial" && (
          <>
            <Select
              label="Tipo financeiro"
              value={
                filters.financialType
              }
              options={
                financialTypeOptions
              }
              onChange={(value) =>
                updateFilter(
                  "financialType",
                  value,
                )
              }
            />

            <Select
              label="Situação financeira"
              value={
                filters.financialStatus
              }
              options={
                financialStatusOptions
              }
              onChange={(value) =>
                updateFilter(
                  "financialStatus",
                  value,
                )
              }
            />

            <Select
              label="Origem"
              value={
                filters.financialSource
              }
              options={
                financialSourceOptions
              }
              onChange={(value) =>
                updateFilter(
                  "financialSource",
                  value,
                )
              }
            />
          </>
        )}

        {filters.reportType ===
          "products" && (
          <>
            <Select
              label="Situação do produto"
              value={
                filters.productStatus
              }
              options={
                productStatusOptions
              }
              onChange={(value) =>
                updateFilter(
                  "productStatus",
                  value,
                )
              }
            />

            <Select
              label="Condição do estoque"
              value={
                filters.stockCondition
              }
              options={
                stockOptions
              }
              onChange={(value) =>
                updateFilter(
                  "stockCondition",
                  value,
                )
              }
            />
          </>
        )}

        {filters.reportType ===
          "inventory" && (
          <Select
            label="Tipo de movimentação"
            value={
              filters
                .inventoryMovementType
            }
            options={
              movementOptions
            }
            onChange={(value) =>
              updateFilter(
                "inventoryMovementType",
                value,
              )
            }
          />
        )}
      </div>

      <div
        className={
          styles.orderGrid
        }
      >
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

      <footer className={styles.footer}>
        <div>
          <SlidersHorizontal
            size={15}
          />

          Os filtros são aplicados automaticamente.
        </div>

        <button
          type="button"
          onClick={onReset}
        >
          <RotateCcw size={14} />
          Limpar filtros
        </button>
      </footer>
    </section>
  );
}