import { createContext } from "react";

import type {
  InventoryMovement,
  InventoryMovementFormData,
} from "../../types/Inventory";

export interface InventoryContextValue {
  movements: InventoryMovement[];
  isLoading: boolean;
  error: string;

  refreshMovements: () => Promise<void>;

  createMovement: (
    data: InventoryMovementFormData,
  ) => Promise<InventoryMovement>;

  resetMovements: () => Promise<void>;
}

export const InventoryContext =
  createContext<InventoryContextValue | null>(
    null,
  );
