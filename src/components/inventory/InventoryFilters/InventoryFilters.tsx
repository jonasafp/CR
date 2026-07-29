import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Filter,
  Layers3,
  Minus,
  PackageCheck,
  PackageX,
  Plus,
  RotateCcw,
  Search,
  TriangleAlert,
} from "lucide-react";

import Select from "../../common/Select/Select";

import type { SelectOption } from "../../common/Select/Select";

import type {
  InventoryFiltersState,
  InventoryMovementFilter,
  InventoryStockFilter,
} from "../../../types/Inventory";

import styles from "./InventoryFilters.module.css";

interface InventoryFiltersProps {
  filters: InventoryFiltersState;
  resultCount: number;

  onChange: (
    filters: InventoryFiltersState,
  ) => void;

  onReset: () => void;
}

const stockOptions: SelectOption<InventoryStockFilter>[] =
  [
    {
      value: "all",
      label: "Todos os estoques",
      icon: <Layers3 size={14} />,
    },
    {
      value: "available",
      label: "Estoque disponível",
      icon: <PackageCheck size={14} />,
    },
    {
      value: "low",
      label: "Estoque baixo",
      icon: <TriangleAlert size={14} />,
    },
    {
      value: "out",
      label: "Sem estoque",
      icon: <PackageX size={14} />,
    },
  ];

const movementOptions: SelectOption<InventoryMovementFilter>[] =
  [
    {
      value: "all",
      label: "Todas as movimentações",
      icon: <Boxes size={14} />,
    },
    {
      value: "entry",
      label: "Entradas",
      icon: <ArrowDownToLine size={14} />,
    },
    {
      value: "exit",
      label: "Saídas",
      icon: <ArrowUpFromLine size={14} />,
    },
    {
      value: "adjustment_positive",
      label: "Ajustes positivos",
      icon: <Plus size={14} />,
    },
    {
      value: "adjustment_negative",
      label: "Ajustes negativos",
      icon: <Minus size={14} />,
    },
  ];

export default function InventoryFilters({
  filters,
  resultCount,
  onChange,
  onReset,
}: InventoryFiltersProps) {
  function updateFilter<
    Key extends keyof InventoryFiltersState,
  >(
    key: Key,
    value: InventoryFiltersState[Key],
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.stock !== "all" ||
    filters.movementType !== "all";

  return (
    <div className={styles.container}>
      <div className={styles.searchArea}>
        <Search size={18} />

        <input
          type="search"
          value={filters.search}
          placeholder="Pesquisar por produto, código ou categoria..."
          onChange={(event) =>
            updateFilter(
              "search",
              event.target.value,
            )
          }
        />
      </div>

      <div className={styles.filtersGrid}>
        <Select
          label="Condição do estoque"
          value={filters.stock}
          options={stockOptions}
          onChange={(value) =>
            updateFilter("stock", value)
          }
        />

        <Select
          label="Tipo de movimentação"
          value={filters.movementType}
          options={movementOptions}
          onChange={(value) =>
            updateFilter(
              "movementType",
              value,
            )
          }
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.result}>
          <Filter size={15} />

          <span>
            {resultCount}{" "}
            {resultCount === 1
              ? "registro encontrado"
              : "registros encontrados"}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={onReset}
          >
            <RotateCcw size={15} />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}