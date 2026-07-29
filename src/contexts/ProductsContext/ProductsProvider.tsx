import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import { STORAGE_KEYS } from "../../constants/storageKeys";

import {
  products as initialProducts,
} from "../../data/mock";

import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from "../../services/storage/localStorageService";

import type {
  Product,
  ProductFormData,
} from "../../types/Product";

import {
  ProductsContext,
} from "./productsContext";

interface ProductsProviderProps {
  children: ReactNode;
}

function createProductId(
  products: Product[],
): number {
  if (products.length === 0) {
    return 1;
  }

  return (
    Math.max(
      ...products.map(
        (product) => product.id,
      ),
    ) + 1
  );
}

export default function ProductsProvider({
  children,
}: ProductsProviderProps) {
  const [products, setProducts] =
    useState<Product[]>(() =>
      readLocalStorage<Product[]>(
        STORAGE_KEYS.products,
        initialProducts,
      ),
    );

  useEffect(() => {
    writeLocalStorage(
      STORAGE_KEYS.products,
      products,
    );
  }, [products]);

  const createProduct = useCallback(
    (data: ProductFormData): Product => {
      const now = new Date().toISOString();

      const newProduct: Product = {
        id: createProductId(products),

        ...data,

        soldQuantity: 0,

        createdAt: now,
        updatedAt: now,
      };

      setProducts((currentProducts) => [
        newProduct,
        ...currentProducts,
      ]);

      return newProduct;
    },
    [products],
  );

  const updateProduct = useCallback(
    (
      productId: number,
      data: ProductFormData,
    ) => {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? {
                ...product,
                ...data,
                updatedAt:
                  new Date().toISOString(),
              }
            : product,
        ),
      );
    },
    [],
  );

  const deleteProduct = useCallback(
    (productId: number) => {
      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) =>
            product.id !== productId,
        ),
      );
    },
    [],
  );

  const toggleProductStatus = useCallback(
    (productId: number) => {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? {
                ...product,

                status:
                  product.status === "active"
                    ? "inactive"
                    : "active",

                updatedAt:
                  new Date().toISOString(),
              }
            : product,
        ),
      );
    },
    [],
  );

  const updateProductStock = useCallback(
    (
      productId: number,
      stockQuantity: number,
    ) => {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? {
                ...product,

                stockQuantity:
                  Math.max(0, stockQuantity),

                updatedAt:
                  new Date().toISOString(),
              }
            : product,
        ),
      );
    },
    [],
  );

  const findProductById = useCallback(
    (productId: number) =>
      products.find(
        (product) =>
          product.id === productId,
      ),
    [products],
  );

  const resetProducts = useCallback(() => {
    removeLocalStorage(
      STORAGE_KEYS.products,
    );

    setProducts(initialProducts);
  }, []);

  const contextValue = useMemo(
    () => ({
      products,

      createProduct,
      updateProduct,
      deleteProduct,
      toggleProductStatus,
      updateProductStock,
      findProductById,
      resetProducts,
    }),
    [
      products,
      createProduct,
      updateProduct,
      deleteProduct,
      toggleProductStatus,
      updateProductStock,
      findProductById,
      resetProducts,
    ],
  );

  return (
    <ProductsContext.Provider
      value={contextValue}
    >
      {children}
    </ProductsContext.Provider>
  );
}