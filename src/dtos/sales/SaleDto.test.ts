import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createSaleDtoSchema,
} from "./SaleDto";

const validSaleInput = {
  paymentMethod:
    "pix" as const,

  customerName:
    "Cliente balcão",

  items: [
    {
      productId: 1,
      quantity: 2,
      unitPrice: 15,
      discount: 0,
    },
  ],

  discount: 0,
  notes: "",
};

describe(
  "createSaleDtoSchema",
  () => {
    it(
      "aceita uma venda válida",
      () => {
        const result =
          createSaleDtoSchema
            .safeParse(
              validSaleInput,
            );

        expect(
          result.success,
        ).toBe(true);
      },
    );

    it(
      "rejeita venda sem itens",
      () => {
        const result =
          createSaleDtoSchema
            .safeParse({
              ...validSaleInput,
              items: [],
            });

        expect(
          result.success,
        ).toBe(false);
      },
    );

    it(
      "rejeita quantidade igual a zero",
      () => {
        const result =
          createSaleDtoSchema
            .safeParse({
              ...validSaleInput,

              items: [
                {
                  ...validSaleInput
                    .items[0],

                  quantity: 0,
                },
              ],
            });

        expect(
          result.success,
        ).toBe(false);
      },
    );

    it(
      "rejeita preço igual a zero",
      () => {
        const result =
          createSaleDtoSchema
            .safeParse({
              ...validSaleInput,

              items: [
                {
                  ...validSaleInput
                    .items[0],

                  unitPrice: 0,
                },
              ],
            });

        expect(
          result.success,
        ).toBe(false);
      },
    );

    it(
      "rejeita o mesmo produto duplicado",
      () => {
        const result =
          createSaleDtoSchema
            .safeParse({
              ...validSaleInput,

              items: [
                validSaleInput
                  .items[0],

                {
                  ...validSaleInput
                    .items[0],

                  quantity: 3,
                },
              ],
            });

        expect(
          result.success,
        ).toBe(false);

        if (!result.success) {
          expect(
            result.error
              .issues[0]
              ?.message,
          ).toBe(
            "O mesmo produto não pode aparecer mais de uma vez na venda.",
          );
        }
      },
    );
  },
);