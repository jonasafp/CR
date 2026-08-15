import type {
  InventorySettings,
} from "../../domain/settings/SystemSettings";

import type {
  InventoryMovementFormData,
} from "../../types/Inventory";

export function validateInventoryMovementSettings(
  data: InventoryMovementFormData,
  currentStock: number,
  settings: InventorySettings,
): string {
  if (
    settings.requireMovementNotes &&
    !data.notes.trim()
  ) {
    return "Informe uma observação para registrar a movimentação.";
  }

  const isOutgoing =
    data.type === "exit" ||
    data.type ===
      "adjustment_negative";

  if (
    isOutgoing &&
    !settings.allowNegativeStock &&
    data.quantity > currentStock
  ) {
    return "A quantidade informada é maior que o estoque disponível.";
  }

  return "";
}

export function shouldUpdatePurchasePrice(
  data: InventoryMovementFormData,
  settings: InventorySettings,
): boolean {
  return (
    settings
      .updatePurchasePriceOnEntry &&
    data.type === "entry" &&
    data.unitCost >= 0
  );
}