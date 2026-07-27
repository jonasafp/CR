import {
  Boxes,
  CheckCircle2,
  CircleOff,
  Filter,
  Layers3,
  PackageCheck,
  PackageX,
  RotateCcw,
  Search,
  TriangleAlert,
} from "lucide-react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  ProductStatus,
  StockUnit,
} from "../../../types/Product";

import type {
  ProductFiltersState,
  ProductStockFilter,
} from "../../../types/ProductFilters";

import styles from "./ProductFilters.module.css";

interface ProductFiltersProps {
  filters: ProductFiltersState;
  categories: string[];
  resultCount: number;

  onChange: (
    nextFilters: ProductFiltersState,
  ) => void;

  onReset: () => void;
}

const stockUnitOptions: SelectOption<
  StockUnit | "all"
>[] = [
  {
    value: "all",
    label: "Todas as unidades",
    icon: <Layers3 size={14} />,
  },
  {
    value: "kg",
    label: "Quilograma",
  },
  {
    value: "g",
    label: "Grama",
  },
  {
    value: "un",
    label: "Unidade",
  },
  {
    value: "l",
    label: "Litro",
  },
  {
    value: "ml",
    label: "Mililitro",
  },
  {
    value: "cx",
    label: "Caixa",
  },
  {
    value: "pct",
    label: "Pacote",
  },
];

const statusOptions: SelectOption<
  ProductStatus | "all"
>[] = [
  {
    value: "all",
    label: "Todas as situações",
    icon: <Layers3 size={14} />,
  },
  {
    value: "active",
    label: "Ativos",
    icon: <CheckCircle2 size={14} />,
  },
  {
    value: "inactive",
    label: "Inativos",
    icon: <CircleOff size={14} />,
  },
];

const stockConditionOptions: SelectOption<
  ProductStockFilter
>[] = [
  {
    value: "all",
    label: "Todos os estoques",
    icon: <Boxes size={14} />,
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

export default function ProductFilters({
  filters,
  categories,
  resultCount,
  onChange,
  onReset,
}: ProductFiltersProps) {
  function updateFilter<
    Key extends keyof ProductFiltersState,
  >(
    key: Key,
    value: ProductFiltersState[Key],
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  const categoryOptions: SelectOption<string>[] =
    [
      {
        value: "all",
        label: "Todas as categorias",
        icon: <Layers3 size={14} />,
      },

      ...categories.map((category) => ({
        value: category,
        label: category,
      })),
    ];

  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.stock !== "all" ||
    filters.unit !== "all";

  return (
    <div className={styles.container}>
      <div className={styles.searchArea}>
        <Search size={18} />

        <input
          type="search"
          value={filters.search}
          placeholder="Pesquisar por nome, código ou categoria..."
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
          label="Categoria"
          value={filters.category}
          options={categoryOptions}
          onChange={(value) =>
            updateFilter("category", value)
          }
        />

        <Select
          label="Situação"
          value={filters.status}
          options={statusOptions}
          onChange={(value) =>
            updateFilter("status", value)
          }
        />

        <Select
          label="Condição do estoque"
          value={filters.stock}
          options={stockConditionOptions}
          onChange={(value) =>
            updateFilter("stock", value)
          }
        />

        <Select
          label="Unidade"
          value={filters.unit}
          options={stockUnitOptions}
          onChange={(value) =>
            updateFilter("unit", value)
          }
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.result}>
          <Filter size={15} />

          <span>
            {resultCount}{" "}
            {resultCount === 1
              ? "produto encontrado"
              : "produtos encontrados"}
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