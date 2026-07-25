import type {
  ProductStatus,
  StockUnit,
} from "./Product";

export type ProductStockFilter =
  | "all"
  | "available"
  | "low"
  | "out";

export interface ProductFiltersState {
  search: string;
  category: string;
  status: ProductStatus | "all";
  stock: ProductStockFilter;
  unit: StockUnit | "all";
}

export const defaultProductFilters: ProductFiltersState = {
  search: "",
  category: "all",
  status: "all",
  stock: "all",
  unit: "all",
};