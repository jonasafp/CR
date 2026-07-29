import { useContext } from "react";

import {
  ProductsContext,
} from "../contexts/ProductsContext/productsContext";

export function useProducts() {
  const context = useContext(
    ProductsContext,
  );

  if (!context) {
    throw new Error(
      "useProducts deve ser usado dentro de ProductsProvider.",
    );
  }

  return context;
}