import {
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Filter,
  Layers3,
  QrCode,
  RotateCcw,
  Search,
  WalletCards,
  XCircle,
} from "lucide-react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  PaymentMethod,
  SaleStatus,
} from "../../../domain/sales/Sale";

import type {
  SaleFilters as SaleFiltersState,
} from "../../../domain/sales/SaleFilters";

import styles from "./SaleFilters.module.css";

interface SaleFiltersProps {
  filters: SaleFiltersState;

  onChange: (
    filters: SaleFiltersState,
  ) => void;

  onReset: () => void;
}

const statusOptions: SelectOption<
  SaleStatus | "all"
>[] = [
  {
    value: "all",
    label: "Todas as situações",
    icon: <Layers3 size={14} />,
  },
  {
    value: "completed",
    label: "Concluídas",
    icon: <CheckCircle2 size={14} />,
  },
  {
    value: "pending",
    label: "Pendentes",
    icon: <CircleDollarSign size={14} />,
  },
  {
    value: "cancelled",
    label: "Canceladas",
    icon: <XCircle size={14} />,
  },
];

const paymentOptions: SelectOption<
  PaymentMethod | "all"
>[] = [
  {
    value: "all",
    label: "Todas as formas",
    icon: <Layers3 size={14} />,
  },
  {
    value: "cash",
    label: "Dinheiro",
    icon: <Banknote size={14} />,
  },
  {
    value: "pix",
    label: "Pix",
    icon: <QrCode size={14} />,
  },
  {
    value: "credit_card",
    label: "Cartão de crédito",
    icon: <CreditCard size={14} />,
  },
  {
    value: "debit_card",
    label: "Cartão de débito",
    icon: <WalletCards size={14} />,
  },
  {
    value: "bank_transfer",
    label: "Transferência",
  },
  {
    value: "other",
    label: "Outro",
  },
];

export default function SaleFilters({
  filters,
  onChange,
  onReset,
}: SaleFiltersProps) {
  function updateFilter<
    Key extends keyof SaleFiltersState,
  >(
    key: Key,
    value: SaleFiltersState[Key],
  ) {
    onChange({
      ...filters,
      [key]: value,
      page: 1,
    });
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.paymentMethod !== "all" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Search size={18} />

        <input
          type="search"
          value={filters.search}
          placeholder="Pesquisar por número, cliente ou produto..."
          onChange={(event) =>
            updateFilter(
              "search",
              event.target.value,
            )
          }
        />
      </div>

      <div className={styles.grid}>
        <Select
          label="Situação"
          value={filters.status}
          options={statusOptions}
          onChange={(value) =>
            updateFilter("status", value)
          }
        />

        <Select
          label="Forma de pagamento"
          value={filters.paymentMethod}
          options={paymentOptions}
          onChange={(value) =>
            updateFilter(
              "paymentMethod",
              value,
            )
          }
        />

        <label className={styles.field}>
          <span>Data inicial</span>

          <input
            type="date"
            value={
              filters.dateFrom ?? ""
            }
            onChange={(event) =>
              updateFilter(
                "dateFrom",
                event.target.value ||
                  undefined,
              )
            }
          />
        </label>

        <label className={styles.field}>
          <span>Data final</span>

          <input
            type="date"
            value={
              filters.dateTo ?? ""
            }
            onChange={(event) =>
              updateFilter(
                "dateTo",
                event.target.value ||
                  undefined,
              )
            }
          />
        </label>
      </div>

      <footer className={styles.footer}>
        <div>
          <Filter size={15} />
          Filtros da listagem
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
          >
            <RotateCcw size={15} />
            Limpar filtros
          </button>
        )}
      </footer>
    </div>
  );
}