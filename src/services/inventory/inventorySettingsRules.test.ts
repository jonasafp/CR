import {
  describe,
  expect,
  it,
} from "vitest";

import {
  defaultSystemSettings,
} from "../../config/defaultSystemSettings";

import type {
  InventoryMovementFormData,
} from "../../types/Inventory";

import {
  shouldUpdatePurchasePrice,
  validateInventoryMovementSettings,
} from "./inventorySettingsRules";

const baseMovement:
  InventoryMovementFormData = {
  productId: 1,

  type: "entry",
  reason: "purchase",

  quantity: 10,
  unitCost: 5,

  notes:
    "Compra para reposição.",
};

describe(
  "inventorySettingsRules",
  () => {
    it(
      "exige observação quando configurado",
      () => {
        const error =
          validateInventoryMovementSettings(
            {
              ...baseMovement,
              notes: "",
            },

            20,

            {
              ...defaultSystemSettings
                .inventory,

              requireMovementNotes:
                true,
            },
          );

        expect(error).toBe(
          "Informe uma observação para registrar a movimentação.",
        );
      },
    );

    it(
      "bloqueia saída maior que o estoque",
      () => {
        const error =
          validateInventoryMovementSettings(
            {
              ...baseMovement,

              type: "exit",
              reason: "sale",
              quantity: 25,
            },

            20,

            {
              ...defaultSystemSettings
                .inventory,

              allowNegativeStock:
                false,
            },
          );

        expect(error).toBe(
          "A quantidade informada é maior que o estoque disponível.",
        );
      },
    );

    it(
      "permite saída maior quando estoque negativo está ativo",
      () => {
        const error =
          validateInventoryMovementSettings(
            {
              ...baseMovement,

              type: "exit",
              reason: "sale",
              quantity: 25,
            },

            20,

            {
              ...defaultSystemSettings
                .inventory,

              allowNegativeStock:
                true,
            },
          );

        expect(error).toBe(
          "",
        );
      },
    );

    it(
      "atualiza o custo somente em entradas autorizadas",
      () => {
        const settings = {
          ...defaultSystemSettings
            .inventory,

          updatePurchasePriceOnEntry:
            true,
        };

        expect(
          shouldUpdatePurchasePrice(
            baseMovement,
            settings,
          ),
        ).toBe(true);

        expect(
          shouldUpdatePurchasePrice(
            {
              ...baseMovement,

              type:
                "adjustment_positive",
            },

            settings,
          ),
        ).toBe(false);
      },
    );
  },
);