import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { STORAGE_KEYS } from "../../constants/storageKeys";
import useCompany from "../CompanyContext/useCompany";
import { useProducts } from "../../hooks/useProducts";
import { useSettings } from "../../hooks/useSettings";
import {
  createInventoryMovement,
  listInventoryMovements,
} from "../../repositories/inventory/SupabaseInventoryRepository";
import { writeLocalStorage } from "../../services/storage/localStorageService";
import { shouldUpdatePurchasePrice, validateInventoryMovementSettings } from
  "../../services/inventory/inventorySettingsRules";
import type {
  InventoryMovement,
  InventoryMovementFormData,
} from "../../types/Inventory";
import { getErrorMessage } from "../../utils/errors";
import { InventoryContext } from "./inventoryContext";

interface InventoryProviderProps {
  children: ReactNode;
}

export default function InventoryProvider({ children }: InventoryProviderProps) {
  const { companyId } = useCompany();
  const { products, refreshProducts } = useProducts();
  const { settings } = useSettings();
  const inventorySettings = settings.inventory;

  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshMovements = useCallback(async () => {
    if (!companyId) {
      setMovements([]);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setMovements(await listInventoryMovements(companyId, products));
    } catch (loadError) {
      setMovements([]);
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [companyId, products]);

  useEffect(() => {
    void refreshMovements();
  }, [refreshMovements]);

  // Espelho temporário para relatórios, vendas, compras e backup ainda locais.
  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.inventoryMovements, movements);
  }, [movements]);

  useEffect(() => {
    function handleMovementsUpdated(event: Event) {
      const nextMovements = (event as CustomEvent<InventoryMovement[]>).detail;

      if (!Array.isArray(nextMovements)) return;

      const validProductIds = new Set(products.map((product) => product.id));
      setMovements(
        nextMovements.filter((movement) => validProductIds.has(movement.productId)),
      );
    }

    window.addEventListener(
      "gestor-facil:inventory-movements-updated",
      handleMovementsUpdated,
    );

    return () =>
      window.removeEventListener(
        "gestor-facil:inventory-movements-updated",
        handleMovementsUpdated,
      );
  }, [products]);

  const createMovement = useCallback(
    async (data: InventoryMovementFormData): Promise<InventoryMovement> => {
      if (!companyId) throw new Error("Nenhuma empresa ativa foi encontrada.");
      if (!data.productId) throw new Error("Selecione um produto.");

      const product = products.find((item) => item.id === data.productId);
      if (!product) throw new Error("Produto não encontrado.");
      if (product.status === "inactive") {
        throw new Error("Não é possível movimentar um produto inativo.");
      }
      if (data.quantity <= 0) {
        throw new Error("A quantidade deve ser maior que zero.");
      }

      const settingsError = validateInventoryMovementSettings(
        data,
        product.stockQuantity,
        inventorySettings,
      );
      if (settingsError) throw new Error(settingsError);

      const movement = await createInventoryMovement(
        companyId,
        product,
        data,
        shouldUpdatePurchasePrice(data, inventorySettings),
      );

      setMovements((currentMovements) => [movement, ...currentMovements]);
      await refreshProducts();
      return movement;
    },
    [companyId, inventorySettings, products, refreshProducts],
  );

  const contextValue = useMemo(
    () => ({
      movements,
      isLoading,
      error,
      refreshMovements,
      createMovement,
      resetMovements: refreshMovements,
    }),
    [movements, isLoading, error, refreshMovements, createMovement],
  );

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
}
