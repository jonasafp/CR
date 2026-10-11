import { createContext } from "react";

import type {
  Product,
  ProductFormData,
} from "../../types/Product";

export interface ProductsContextValue {
  products: Product[];
  isLoading: boolean;
  error: string;

  refreshProducts: () => Promise<void>;

  createProduct: (
    data: ProductFormData,
  ) => Promise<Product>;

  updateProduct: (
    productId: string,
    data: ProductFormData,
  ) => Promise<Product>;

  deleteProduct: (
    productId: string,
  ) => Promise<void>;

  toggleProductStatus: (
    productId: string,
  ) => Promise<void>;

  updateProductStock: (
    productId: string,
    stockQuantity: number,
  ) => Promise<void>;

  updateProductPurchasePrice: (
    productId: string,
    purchasePrice: number,
  ) => Promise<void>;

  findProductById: (
    productId: string,
  ) => Product | undefined;

  resetProducts: () => Promise<void>;

  incrementProductSoldQuantity: (
    productId: string,
    quantity: number,
  ) => void;
}

export const ProductsContext =
  createContext<ProductsContextValue | null>(
    null,
  );
