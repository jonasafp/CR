import {
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

import type { StockUnit } from "../../../types/Product";
import type { ProductFiltersState } from "../../../types/ProductFilters";

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

const stockUnits: Array<{
  value: StockUnit;
  label: string;
}> = [
  { value: "kg", label: "Quilograma" },
  { value: "g", label: "Grama" },
  { value: "un", label: "Unidade" },
  { value: "l", label: "Litro" },
  { value: "ml", label: "Mililitro" },
  { value: "cx", label: "Caixa" },
  { value: "pct", label: "Pacote" },
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
            updateFilter("search", event.target.value)
          }
        />
      </div>

      <div className={styles.filtersGrid}>
        <label className={styles.selectField}>
          <span>Categoria</span>

          <select
            value={filters.category}
            onChange={(event) =>
              updateFilter(
                "category",
                event.target.value,
              )
            }
          >
            <option value="all">
              Todas as categorias
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.selectField}>
          <span>Situação</span>

          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter(
                "status",
                event.target.value as
                  | "all"
                  | "active"
                  | "inactive",
              )
            }
          >
            <option value="all">
              Todas as situações
            </option>

            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </label>

        <label className={styles.selectField}>
          <span>Condição do estoque</span>

          <select
            value={filters.stock}
            onChange={(event) =>
              updateFilter(
                "stock",
                event.target.value as
                  ProductFiltersState["stock"],
              )
            }
          >
            <option value="all">
              Todos os estoques
            </option>

            <option value="available">
              Estoque disponível
            </option>

            <option value="low">
              Estoque baixo
            </option>

            <option value="out">
              Sem estoque
            </option>
          </select>
        </label>

        <label className={styles.selectField}>
          <span>Unidade</span>

          <select
            value={filters.unit}
            onChange={(event) =>
              updateFilter(
                "unit",
                event.target.value as
                  ProductFiltersState["unit"],
              )
            }
          >
            <option value="all">
              Todas as unidades
            </option>

            {stockUnits.map((unit) => (
              <option
                key={unit.value}
                value={unit.value}
              >
                {unit.label}
              </option>
            ))}
          </select>
        </label>
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