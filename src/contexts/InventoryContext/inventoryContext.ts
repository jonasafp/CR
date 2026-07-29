import { createContext } from "react";

import type {
  InventoryMovement,
  InventoryMovementFormData,
} from "../../types/Inventory";

export interface InventoryContextValue {
  movements: InventoryMovement[];

  createMovement: (
    data: InventoryMovementFormData,
  ) => InventoryMovement | null;

  resetMovements: () => void;
}

export const InventoryContext =
  createContext<InventoryContextValue | null>(
    null,
  );