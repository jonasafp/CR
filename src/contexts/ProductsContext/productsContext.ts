import { createContext } from "react";

import type {
  Product,
  ProductFormData,
} from "../../types/Product";

export interface ProductsContextValue {
  products: Product[];

  createProduct: (
    data: ProductFormData,
  ) => Product;

  updateProduct: (
    productId: number,
    data: ProductFormData,
  ) => void;

  deleteProduct: (
    productId: number,
  ) => void;

  toggleProductStatus: (
    productId: number,
  ) => void;

  updateProductStock: (
    productId: number,
    stockQuantity: number,
  ) => void;

  findProductById: (
    productId: number,
  ) => Product | undefined;

  resetProducts: () => void;

  incrementProductSoldQuantity: (
    productId: number,
    quantity: number,
  ) => void;
}

export const ProductsContext =
  createContext<ProductsContextValue | null>(
    null,
  );