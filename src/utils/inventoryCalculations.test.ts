import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateStockAfterMovement,
  isIncomingMovement,
  isOutgoingMovement,
} from "./inventoryCalculations";

describe(
  "inventoryCalculations",
  () => {
    it(
      "soma entradas e ajustes positivos",
      () => {
        expect(
          calculateStockAfterMovement(
            10,
            5,
            "entry",
          ),
        ).toBe(15);

        expect(
          calculateStockAfterMovement(
            10,
            5,
            "adjustment_positive",
          ),
        ).toBe(15);
      },
    );

    it(
      "subtrai saídas e ajustes negativos",
      () => {
        expect(
          calculateStockAfterMovement(
            10,
            4,
            "exit",
          ),
        ).toBe(6);

        expect(
          calculateStockAfterMovement(
            10,
            4,
            "adjustment_negative",
          ),
        ).toBe(6);
      },
    );

    it(
      "identifica corretamente a direção da movimentação",
      () => {
        expect(
          isIncomingMovement(
            "entry",
          ),
        ).toBe(true);

        expect(
          isIncomingMovement(
            "exit",
          ),
        ).toBe(false);

        expect(
          isOutgoingMovement(
            "exit",
          ),
        ).toBe(true);

        expect(
          isOutgoingMovement(
            "adjustment_negative",
          ),
        ).toBe(true);
      },
    );
  },
);