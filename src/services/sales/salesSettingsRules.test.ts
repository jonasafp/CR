import {
  describe,
  expect,
  it,
} from "vitest";

import {
  defaultSystemSettings,
} from "../../config/defaultSystemSettings";

import {
  getMaximumDiscount,
  limitDiscount,
  roundSaleValue,
} from "./salesSettingsRules";

describe(
  "salesSettingsRules",
  () => {
    it(
      "arredonda valores monetários para duas casas",
      () => {
        expect(
          roundSaleValue(
            10.125,
          ),
        ).toBe(10.13);
      },
    );

    it(
      "calcula o desconto máximo configurado",
      () => {
        const settings = {
          ...defaultSystemSettings
            .sales,

          maximumDiscountPercentage:
            10,
        };

        expect(
          getMaximumDiscount(
            200,
            settings,
          ),
        ).toBe(20);
      },
    );

    it(
      "limita percentuais inválidos entre zero e cem",
      () => {
        expect(
          getMaximumDiscount(
            100,
            {
              ...defaultSystemSettings
                .sales,

              maximumDiscountPercentage:
                150,
            },
          ),
        ).toBe(100);

        expect(
          getMaximumDiscount(
            100,
            {
              ...defaultSystemSettings
                .sales,

              maximumDiscountPercentage:
                -10,
            },
          ),
        ).toBe(0);
      },
    );

    it(
      "não permite desconto acima do limite",
      () => {
        const settings = {
          ...defaultSystemSettings
            .sales,

          maximumDiscountPercentage:
            15,
        };

        expect(
          limitDiscount(
            50,
            200,
            settings,
          ),
        ).toBe(30);
      },
    );

    it(
      "transforma descontos negativos ou inválidos em zero",
      () => {
        const settings =
          defaultSystemSettings
            .sales;

        expect(
          limitDiscount(
            -5,
            100,
            settings,
          ),
        ).toBe(0);

        expect(
          limitDiscount(
            Number.NaN,
            100,
            settings,
          ),
        ).toBe(0);
      },
    );
  },
);