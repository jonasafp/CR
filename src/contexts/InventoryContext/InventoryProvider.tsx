import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import { STORAGE_KEYS } from "../../constants/storageKeys";

import {
  initialInventoryMovements,
} from "../../data/inventoryMock";

import { useProducts } from "../../hooks/useProducts";

import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from "../../services/storage/localStorageService";

import type {
  InventoryMovement,
  InventoryMovementFormData,
} from "../../types/Inventory";

import {
  calculateStockAfterMovement,
} from "../../utils/inventoryCalculations";

import {
  InventoryContext,
} from "./inventoryContext";

interface InventoryProviderProps {
  children: ReactNode;
}

function createMovementId(
  movements: InventoryMovement[],
): number {
  if (movements.length === 0) {
    return 1;
  }

  return (
    Math.max(
      ...movements.map(
        (movement) => movement.id,
      ),
    ) + 1
  );
}

export default function InventoryProvider({
  children,
}: InventoryProviderProps) {
  const {
    products,
    updateProductStock,
  } = useProducts();

  const [movements, setMovements] =
    useState<InventoryMovement[]>(() =>
      readLocalStorage<
        InventoryMovement[]
      >(
        STORAGE_KEYS.inventoryMovements,
        initialInventoryMovements,
      ),
    );

  useEffect(() => {
    writeLocalStorage(
      STORAGE_KEYS.inventoryMovements,
      movements,
    );
  }, [movements]);

  const createMovement = useCallback(
    (
      data: InventoryMovementFormData,
    ): InventoryMovement | null => {
      if (data.productId === null) {
        return null;
      }

      const product = products.find(
        (currentProduct) =>
          currentProduct.id ===
          data.productId,
      );

      if (!product) {
        return null;
      }

      if (data.quantity <= 0) {
        return null;
      }

      const previousStock =
        product.stockQuantity;

      const currentStock =
        calculateStockAfterMovement(
          previousStock,
          data.quantity,
          data.type,
        );

      if (currentStock < 0) {
        return null;
      }

      const newMovement: InventoryMovement = {
        id: createMovementId(movements),

        productId: product.id,
        productName: product.name,
        productCode: product.code,

        type: data.type,
        reason: data.reason,

        quantity: data.quantity,
        unit: product.stockUnit,

        previousStock,
        currentStock,

        unitCost: data.unitCost,

        totalValue:
          data.quantity * data.unitCost,

        notes: data.notes.trim(),

        createdAt:
          new Date().toISOString(),

        createdBy: "Administrador",
      };

      updateProductStock(
        product.id,
        currentStock,
      );

      setMovements(
        (currentMovements) => [
          newMovement,
          ...currentMovements,
        ],
      );

      return newMovement;
    },
    [
      movements,
      products,
      updateProductStock,
    ],
  );

  const resetMovements = useCallback(() => {
    removeLocalStorage(
      STORAGE_KEYS.inventoryMovements,
    );

    setMovements(
      initialInventoryMovements,
    );
  }, []);

  const contextValue = useMemo(
    () => ({
      movements,
      createMovement,
      resetMovements,
    }),
    [
      movements,
      createMovement,
      resetMovements,
    ],
  );

  return (
    <InventoryContext.Provider
      value={contextValue}
    >
      {children}
    </InventoryContext.Provider>
  );
}