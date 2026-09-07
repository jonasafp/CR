import {
  z,
} from "zod";

export const financialTransactionTypeSchema =
  z.enum([
    "income",
    "expense",
  ]);

export const financialTransactionStatusSchema =
  z.enum([
    "pending",
    "received",
    "paid",
    "cancelled",
  ]);

export const financialTransactionSourceSchema =
  z.enum([
    "manual",
    "sale",
    "purchase",
    "inventory",
    "other",
  ]);

export const financialPaymentMethodSchema =
  z.enum([
    "cash",
    "pix",
    "credit_card",
    "debit_card",
    "bank_transfer",
    "bank_slip",
    "other",
  ]);

const optionalTextSchema =
  z
    .string()
    .trim()
    .optional();

const optionalDateSchema =
  z
    .string()
    .trim()
    .optional();

export const financialTransactionDtoSchema =
  z.object({
    id:
      z
        .number()
        .int()
        .positive(),

    number:
      z
        .string()
        .trim()
        .min(
          1,
          "O número do lançamento é obrigatório.",
        ),

    type:
      financialTransactionTypeSchema,

    status:
      financialTransactionStatusSchema,

    source:
      financialTransactionSourceSchema,

    description:
      z
        .string()
        .trim()
        .min(
          2,
          "A descrição deve possuir pelo menos 2 caracteres.",
        ),

    category:
      z
        .string()
        .trim()
        .min(
          1,
          "A categoria é obrigatória.",
        ),

    amount:
      z
        .number()
        .positive(
          "O valor deve ser maior que zero.",
        ),

    dueDate:
      z
        .string()
        .trim()
        .min(
          1,
          "A data de vencimento é obrigatória.",
        ),

    paymentDate:
      optionalDateSchema,

    paymentMethod:
      financialPaymentMethodSchema
        .optional(),

    customerOrSupplier:
      optionalTextSchema,

    notes:
      optionalTextSchema,

    saleId:
      z
        .number()
        .int()
        .positive()
        .optional(),

    saleNumber:
      optionalTextSchema,

    purchaseId:
      z
        .number()
        .int()
        .positive()
        .optional(),

    purchaseNumber:
      optionalTextSchema,

    inventoryMovementId:
      z
        .number()
        .int()
        .positive()
        .optional(),

    createdAt:
      z.string(),

    updatedAt:
      z.string(),

    createdBy:
      z
        .string()
        .trim()
        .min(1),
  });

export const createFinancialTransactionDtoSchema =
  z
    .object({
      type:
        financialTransactionTypeSchema,

      description:
        z
          .string()
          .trim()
          .min(
            2,
            "Informe uma descrição válida.",
          ),

      category:
        z
          .string()
          .trim()
          .min(
            1,
            "Selecione uma categoria.",
          ),

      amount:
        z
          .number()
          .positive(
            "O valor deve ser maior que zero.",
          ),

      dueDate:
        z
          .string()
          .trim()
          .min(
            1,
            "Informe a data de vencimento.",
          ),

      status:
        financialTransactionStatusSchema
          .optional(),

      paymentDate:
        optionalDateSchema,

      paymentMethod:
        financialPaymentMethodSchema
          .optional(),

      customerOrSupplier:
        optionalTextSchema,

      notes:
        optionalTextSchema,

      source:
        financialTransactionSourceSchema
          .optional(),

      saleId:
        z
          .number()
          .int()
          .positive()
          .optional(),

      saleNumber:
        optionalTextSchema,

      purchaseId:
        z
          .number()
          .int()
          .positive()
          .optional(),

      purchaseNumber:
        optionalTextSchema,

      inventoryMovementId:
        z
          .number()
          .int()
          .positive()
          .optional(),
    })
    .superRefine(
      (
        transaction,
        context,
      ) => {
        const isSettled =
          transaction.status ===
          "received" ||
          transaction.status ===
          "paid";

        if (
          transaction.type ===
          "income" &&
          transaction.status ===
          "paid"
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "status",
            ],

            message:
              "Receitas concluídas devem possuir a situação Recebida.",
          });
        }

        if (
          transaction.type ===
          "expense" &&
          transaction.status ===
          "received"
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "status",
            ],

            message:
              "Despesas concluídas devem possuir a situação Paga.",
          });
        }

        if (
          isSettled &&
          !transaction.paymentDate
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "paymentDate",
            ],

            message:
              "Informe a data de pagamento ou recebimento.",
          });
        }

        if (
          isSettled &&
          !transaction.paymentMethod
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "paymentMethod",
            ],

            message:
              "Informe a forma de pagamento.",
          });
        }
      },
    );

export const updateFinancialTransactionDtoSchema =
  z
    .object({
      transactionId:
        z
          .number()
          .int()
          .positive(),

      type:
        financialTransactionTypeSchema,

      description:
        z
          .string()
          .trim()
          .min(
            2,
            "Informe uma descrição válida.",
          ),

      category:
        z
          .string()
          .trim()
          .min(
            1,
            "Selecione uma categoria.",
          ),

      amount:
        z
          .number()
          .positive(
            "O valor deve ser maior que zero.",
          ),

      dueDate:
        z
          .string()
          .trim()
          .min(
            1,
            "Informe a data de vencimento.",
          ),

      status:
        financialTransactionStatusSchema,

      paymentDate:
        optionalDateSchema,

      paymentMethod:
        financialPaymentMethodSchema
          .optional(),

      customerOrSupplier:
        optionalTextSchema,

      notes:
        optionalTextSchema,
    })
    .superRefine(
      (
        transaction,
        context,
      ) => {
        if (
          transaction.type ===
          "income" &&
          transaction.status ===
          "paid"
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "status",
            ],

            message:
              "Receitas concluídas devem possuir a situação Recebida.",
          });
        }

        if (
          transaction.type ===
          "expense" &&
          transaction.status ===
          "received"
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "status",
            ],

            message:
              "Despesas concluídas devem possuir a situação Paga.",
          });
        }
      },
    );

export const settleFinancialTransactionDtoSchema =
  z.object({
    transactionId:
      z
        .number()
        .int()
        .positive(),

    paymentDate:
      z
        .string()
        .trim()
        .min(
          1,
          "Informe a data de pagamento ou recebimento.",
        ),

    paymentMethod:
      financialPaymentMethodSchema,
  });

export const cancelFinancialTransactionDtoSchema =
  z.object({
    transactionId:
      z
        .number()
        .int()
        .positive(),

    reason:
      z
        .string()
        .trim()
        .min(
          3,
          "Informe o motivo do cancelamento.",
        ),
  });

export type FinancialTransactionDto =
  z.infer<
    typeof financialTransactionDtoSchema
  >;

export type CreateFinancialTransactionDto =
  z.infer<
    typeof createFinancialTransactionDtoSchema
  >;

export type UpdateFinancialTransactionDto =
  z.infer<
    typeof updateFinancialTransactionDtoSchema
  >;

export type SettleFinancialTransactionDto =
  z.infer<
    typeof settleFinancialTransactionDtoSchema
  >;

export type CancelFinancialTransactionDto =
  z.infer<
    typeof cancelFinancialTransactionDtoSchema
  >;