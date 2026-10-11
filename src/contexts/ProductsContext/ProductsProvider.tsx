import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { STORAGE_KEYS } from "../../constants/storageKeys";
import useCompany from "../CompanyContext/useCompany";
import { useSettings } from "../../hooks/useSettings";
import {
  createProduct as createProductInDatabase,
  deleteProduct as deleteProductInDatabase,
  listProducts,
  updateProduct as updateProductInDatabase,
  updateProductFields,
} from "../../repositories/products/SupabaseProductsRepository";
import { writeLocalStorage } from "../../services/storage/localStorageService";
import type { Product, ProductFormData } from "../../types/Product";
import { getErrorMessage } from "../../utils/errors";
import { ProductsContext } from "./productsContext";

interface ProductsProviderProps {
  children: ReactNode;
}

export default function ProductsProvider({ children }: ProductsProviderProps) {
  const { companyId } = useCompany();
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProducts = useCallback(async () => {
    if (!companyId) {
      setProducts([]);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setProducts(await listProducts(companyId));
    } catch (loadError) {
      setProducts([]);
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  // Ponte temporária para vendas, compras e backup, que ainda usam o armazenamento local.
  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.products, products);
  }, [products]);

  useEffect(() => {
    function handleProductsUpdated(event: Event) {
      if (!companyId) return;

      const nextProducts = (event as CustomEvent<Product[]>).detail;
      if (!Array.isArray(nextProducts)) return;

      setProducts((currentProducts) => {
        const currentById = new Map(
          currentProducts.map((product) => [product.id, product]),
        );

        for (const product of nextProducts) {
          const currentProduct = currentById.get(product.id);

          if (
            currentProduct &&
            (currentProduct.stockQuantity !== product.stockQuantity ||
              currentProduct.purchasePrice !== product.purchasePrice)
          ) {
            void updateProductFields(companyId, product.id, {
              stock_quantity: product.stockQuantity,
              purchase_price: product.purchasePrice,
            }).catch(() => void refreshProducts());
          }
        }

        return nextProducts;
      });
    }

    window.addEventListener("gestor-facil:products-updated", handleProductsUpdated);
    return () =>
      window.removeEventListener(
        "gestor-facil:products-updated",
        handleProductsUpdated,
      );
  }, [companyId, refreshProducts]);

  const createProduct = useCallback(
    async (data: ProductFormData): Promise<Product> => {
      if (!companyId) throw new Error("Nenhuma empresa ativa foi encontrada.");

      const newProduct = await createProductInDatabase(
        companyId,
        data,
        settings.inventory.allowNegativeStock,
      );

      setProducts((currentProducts) =>
        [newProduct, ...currentProducts].sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR"),
        ),
      );
      return newProduct;
    },
    [companyId, settings.inventory.allowNegativeStock],
  );

  const updateProduct = useCallback(
    async (productId: string, data: ProductFormData): Promise<Product> => {
      if (!companyId) throw new Error("Nenhuma empresa ativa foi encontrada.");

      const updatedProduct = await updateProductInDatabase(
        companyId,
        productId,
        data,
        settings.inventory.allowNegativeStock,
      );

      setProducts((currentProducts) =>
        currentProducts
          .map((product) =>
            product.id === productId ? updatedProduct : product,
          )
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      );
      return updatedProduct;
    },
    [companyId, settings.inventory.allowNegativeStock],
  );

  const deleteProduct = useCallback(
    async (productId: string): Promise<void> => {
      if (!companyId) throw new Error("Nenhuma empresa ativa foi encontrada.");

      await deleteProductInDatabase(companyId, productId);
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId),
      );
    },
    [companyId],
  );

  const toggleProductStatus = useCallback(
    async (productId: string): Promise<void> => {
      if (!companyId) throw new Error("Nenhuma empresa ativa foi encontrada.");

      const product = products.find((item) => item.id === productId);
      if (!product) throw new Error("Produto não encontrado.");

      const nextStatus = product.status === "active" ? "inactive" : "active";
      await updateProductFields(companyId, productId, { status: nextStatus });

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === productId
            ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
            : item,
        ),
      );
    },
    [companyId, products],
  );

  const updateProductStock = useCallback(
    async (productId: string, stockQuantity: number): Promise<void> => {
      if (!companyId) throw new Error("Nenhuma empresa ativa foi encontrada.");

      const nextStockQuantity = settings.inventory.allowNegativeStock
        ? stockQuantity
        : Math.max(0, stockQuantity);

      await updateProductFields(companyId, productId, {
        stock_quantity: nextStockQuantity,
      });

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? {
                ...product,
                stockQuantity: nextStockQuantity,
                updatedAt: new Date().toISOString(),
              }
            : product,
        ),
      );
    },
    [companyId, settings.inventory.allowNegativeStock],
  );

  const updateProductPurchasePrice = useCallback(
    async (productId: string, purchasePrice: number): Promise<void> => {
      if (!Number.isFinite(purchasePrice) || purchasePrice < 0) return;
      if (!companyId) throw new Error("Nenhuma empresa ativa foi encontrada.");

      await updateProductFields(companyId, productId, {
        purchase_price: purchasePrice,
      });

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? { ...product, purchasePrice, updatedAt: new Date().toISOString() }
            : product,
        ),
      );
    },
    [companyId],
  );

  const incrementProductSoldQuantity = useCallback(
    (productId: string, quantity: number): void => {
      if (quantity <= 0) return;

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? { ...product, soldQuantity: product.soldQuantity + quantity }
            : product,
        ),
      );
    },
    [],
  );

  const findProductById = useCallback(
    (productId: string) => products.find((product) => product.id === productId),
    [products],
  );

  const contextValue = useMemo(
    () => ({
      products,
      isLoading,
      error,
      refreshProducts,
      createProduct,
      updateProduct,
      deleteProduct,
      toggleProductStatus,
      updateProductStock,
      updateProductPurchasePrice,
      findProductById,
      resetProducts: refreshProducts,
      incrementProductSoldQuantity,
    }),
    [
      products,
      isLoading,
      error,
      refreshProducts,
      createProduct,
      updateProduct,
      deleteProduct,
      toggleProductStatus,
      updateProductStock,
      updateProductPurchasePrice,
      findProductById,
      incrementProductSoldQuantity,
    ],
  );

  return (
    <ProductsContext.Provider value={contextValue}>
      {children}
    </ProductsContext.Provider>
  );
}
