import { z } from "zod";

const entityIdSchema = z.preprocess(
  (value) => typeof value === "number" ? String(value) : value,
  z.string().min(1),
);

export const saleStatusSchema =
  z.enum([
    "completed",
    "cancelled",
    "pending",
  ]);

export const paymentMethodSchema =
  z.enum([
    "cash",
    "pix",
    "credit_card",
    "debit_card",
    "bank_transfer",
    "other",
  ]);

export const saleItemDtoSchema =
  z.object({
    id: entityIdSchema,

    productId: z.string().min(1),
    productCode: z.string(),
    productName: z.string(),

    quantity: z.number(),
    unit: z.enum([
      "kg",
      "g",
      "un",
      "l",
      "ml",
      "cx",
      "pct",
    ]),

    unitCost: z.number(),
    unitPrice: z.number(),

    grossTotal: z.number(),
    discount: z.number(),
    total: z.number(),

    profit: z.number(),
  });

export const saleDtoSchema =
  z.object({
    id: entityIdSchema,
    number: z.string(),

    status: saleStatusSchema,
    paymentMethod:
      paymentMethodSchema,

    customerId:
      z.union([z.string(), z.number()]).optional(),

    customerName:
      z.string().optional(),

    items:
      z.array(saleItemDtoSchema),

    subtotal: z.number(),
    discount: z.number(),
    total: z.number(),

    cost: z.number(),
    profit: z.number(),

    notes: z.string().optional(),

    createdAt: z.string(),
    updatedAt: z.string(),

    completedAt:
      z.string().optional(),

    cancelledAt:
      z.string().optional(),

    createdBy: z.string(),
  });

export const createSaleDtoSchema =
  z.object({
    paymentMethod:
      paymentMethodSchema,

    customerId:
      z.union([z.string(), z.number()]).optional(),

    customerName:
      z.string().optional(),

    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity:
            z.number().positive(),

          unitPrice:
            z.number().positive(),

          discount:
            z.number().nonnegative(),
        }),
      )
      .min(
        1,
        "A venda deve possuir pelo menos um item.",
      )
      .superRefine(
        (items, context) => {
          const productIds =
            new Set<string>();

          items.forEach(
            (item, index) => {
              if (
                productIds.has(
                  item.productId,
                )
              ) {
                context.addIssue({
                  code: "custom",

                  path: [
                    index,
                    "productId",
                  ],

                  message:
                    "O mesmo produto não pode aparecer mais de uma vez na venda.",
                });
              }

              productIds.add(
                item.productId,
              );
            },
          );
        },
      ),

    discount:
      z.number().nonnegative(),

    notes: z.string().optional(),
  });

export type SaleDto =
  z.infer<typeof saleDtoSchema>;

export type CreateSaleDto =
  z.infer<
    typeof createSaleDtoSchema
  >;
