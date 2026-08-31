import {
  z,
} from "zod";

import {
  financialTransactionDtoSchema,
} from "../financial/FinancialTransactionDto";

import {
  saleDtoSchema,
} from "../sales/SaleDto";

import {
  systemSettingsDtoSchema,
} from "../settings/SystemSettingsDto";

import {
  CURRENT_BACKUP_SCHEMA_VERSION,
  SYSTEM_BACKUP_IDENTIFIER,
} from "../../domain/backup/SystemBackup";

const stockUnitSchema =
  z.enum([
    "kg",
    "g",
    "un",
    "l",
    "ml",
    "cx",
    "pct",
  ]);

const productSchema =
  z.object({
    id:
      z
        .number()
        .int()
        .positive(),

    code:
      z
        .string()
        .trim()
        .min(1),

    barcode:
      z
        .string()
        .optional(),

    name:
      z
        .string()
        .trim()
        .min(1),

    description:
      z
        .string()
        .optional(),

    category:
      z
        .string()
        .trim()
        .min(1),

    stockUnit:
      stockUnitSchema,

    stockQuantity:
      z
        .number()
        .finite(),

    minimumStock:
      z
        .number()
        .finite()
        .nonnegative(),

    soldQuantity:
      z
        .number()
        .finite()
        .nonnegative(),

    purchasePrice:
      z
        .number()
        .finite()
        .nonnegative(),

    salePrice:
      z
        .number()
        .finite()
        .nonnegative(),

    status:
      z.enum([
        "active",
        "inactive",
      ]),

    image:
      z
        .string()
        .optional(),

    createdAt:
      z
        .string()
        .optional(),

    updatedAt:
      z
        .string()
        .optional(),
  });

const inventoryMovementSchema =
  z.object({
    id:
      z
        .number()
        .int()
        .positive(),

    productId:
      z
        .number()
        .int()
        .positive(),

    productName:
      z
        .string()
        .trim()
        .min(1),

    productCode:
      z
        .string()
        .trim()
        .min(1),

    type:
      z.enum([
        "entry",
        "exit",
        "adjustment_positive",
        "adjustment_negative",
      ]),

    reason:
      z.enum([
        "purchase",
        "sale",
        "manual_adjustment",
        "loss",
        "damage",
        "expiration",
        "return",
        "initial_balance",
        "other",
      ]),

    quantity:
      z
        .number()
        .finite()
        .positive(),

    unit:
      stockUnitSchema,

    previousStock:
      z
        .number()
        .finite(),

    currentStock:
      z
        .number()
        .finite(),

    unitCost:
      z
        .number()
        .finite()
        .nonnegative(),

    totalValue:
      z
        .number()
        .finite()
        .nonnegative(),

    notes:
      z
        .string()
        .optional(),

    saleId:
      z
        .number()
        .int()
        .positive()
        .optional(),

    saleNumber:
      z
        .string()
        .optional(),

    createdAt:
      z
        .string()
        .min(1),

    createdBy:
      z
        .string()
        .trim()
        .min(1),
  });

const customerAddressSchema =
  z.object({
    postalCode:
      z.string(),

    street:
      z.string(),

    number:
      z.string(),

    complement:
      z.string(),

    neighborhood:
      z.string(),

    city:
      z.string(),

    state:
      z.string(),
  });

const customerSchema =
  z.object({
    id:
      z.number()
        .int()
        .positive(),

    name:
      z.string()
        .trim()
        .min(1),

    document:
      z.string(),

    phone:
      z.string(),

    email:
      z.string(),

    address:
      customerAddressSchema,

    notes:
      z.string(),

    status:
      z.enum([
        "active",
        "inactive",
      ]),

    createdAt:
      z.string()
        .min(1),

    updatedAt:
      z.string()
        .min(1),
  });

const supplierAddressSchema =
  z.object({
    postalCode:
      z.string(),

    street:
      z.string(),

    number:
      z.string(),

    complement:
      z.string(),

    neighborhood:
      z.string(),

    city:
      z.string(),

    state:
      z.string(),
  });

const supplierSchema =
  z.object({
    id:
      z.number()
        .int()
        .positive(),

    legalName:
      z.string()
        .trim()
        .min(2),

    tradeName:
      z.string(),

    document:
      z.string(),

    stateRegistration:
      z.string(),

    contactName:
      z.string(),

    phone:
      z.string(),

    email:
      z.string(),

    address:
      supplierAddressSchema,

    notes:
      z.string(),

    status:
      z.enum([
        "active",
        "inactive",
      ]),

    createdAt:
      z.string()
        .min(1),

    updatedAt:
      z.string()
        .min(1),
  });

export const systemBackupDtoSchema =
  z
    .object({
      identifier:
        z.literal(
          SYSTEM_BACKUP_IDENTIFIER,
        ),

      schemaVersion:
        z.literal(
          CURRENT_BACKUP_SCHEMA_VERSION,
        ),

      application:
        z.literal(
          "Gestor Fácil",
        ),

      createdAt:
        z
          .string()
          .min(1),

      businessName:
        z.string(),

      summary:
        z.object({
          products:
            z
              .number()
              .int()
              .nonnegative(),

          inventoryMovements:
            z
              .number()
              .int()
              .nonnegative(),

          sales:
            z
              .number()
              .int()
              .nonnegative(),

          financialTransactions:
            z
              .number()
              .int()
              .nonnegative(),

          customers:
            z.number()
              .int()
              .nonnegative(),

          suppliers:
            z.number()
              .int()
              .nonnegative(),
        }),

      data:
        z.object({
          settings:
            systemSettingsDtoSchema,

          products:
            z.array(
              productSchema,
            ),

          inventoryMovements:
            z.array(
              inventoryMovementSchema,
            ),

          sales:
            z.array(
              saleDtoSchema,
            ),

          financialTransactions:
            z.array(
              financialTransactionDtoSchema,
            ),

          customers:
            z.array(
              customerSchema,
            ),

          suppliers:
            z.array(
              supplierSchema,
            ),
        }),
    })
    .superRefine(
      (
        backup,
        context,
      ) => {
        const counts = {
          products:
            backup.data
              .products
              .length,

          inventoryMovements:
            backup.data
              .inventoryMovements
              .length,

          sales:
            backup.data
              .sales
              .length,

          financialTransactions:
            backup.data
              .financialTransactions
              .length,

          customers:
            backup.data.customers.length,

          suppliers:
            backup.data.suppliers.length,
        };

        Object.entries(
          counts,
        ).forEach(
          ([
            key,
            count,
          ]) => {
            const summaryKey =
              key as keyof
              typeof counts;

            if (
              backup.summary[
              summaryKey
              ] !== count
            ) {
              context.addIssue({
                code: "custom",

                path: [
                  "summary",
                  summaryKey,
                ],

                message:
                  "O resumo do backup não corresponde aos dados armazenados.",
              });
            }
          },
        );
      },
    );