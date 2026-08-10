import {
  z,
} from "zod";

const businessTypeSchema =
  z.enum([
    "pet_store",
    "convenience_store",
    "small_market",
    "general_store",
    "bakery",
    "clothing_store",
    "other",
  ]);

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

const paymentMethodSchema =
  z.enum([
    "cash",
    "pix",
    "credit_card",
    "debit_card",
    "bank_transfer",
    "other",
  ]);

const financialPaymentMethodSchema =
  z.enum([
    "cash",
    "pix",
    "credit_card",
    "debit_card",
    "bank_transfer",
    "bank_slip",
    "other",
  ]);

const reportPeriodSchema =
  z.enum([
    "today",
    "week",
    "month",
    "quarter",
    "year",
    "custom",
  ]);

const reportGroupSchema =
  z.enum([
    "day",
    "week",
    "month",
    "year",
  ]);

export const businessSettingsSchema =
  z.object({
    legalName:
      z
        .string()
        .trim()
        .min(
          2,
          "Informe a razão social.",
        )
        .max(150),

    tradeName:
      z
        .string()
        .trim()
        .min(
          2,
          "Informe o nome fantasia.",
        )
        .max(100),

    shortName:
      z
        .string()
        .trim()
        .min(
          2,
          "A sigla deve possuir pelo menos 2 caracteres.",
        )
        .max(
          5,
          "A sigla deve possuir no máximo 5 caracteres.",
        ),

    businessType:
      businessTypeSchema,

    document:
      z
        .string()
        .trim()
        .max(20),

    stateRegistration:
      z
        .string()
        .trim()
        .max(30),

    phone:
      z
        .string()
        .trim()
        .max(20),

    email:
      z.union([
        z.literal(""),

        z.email(
          "Informe um e-mail válido.",
        ),
      ]),

    postalCode:
      z
        .string()
        .trim()
        .max(10),

    street:
      z
        .string()
        .trim()
        .max(120),

    number:
      z
        .string()
        .trim()
        .max(15),

    complement:
      z
        .string()
        .trim()
        .max(80),

    neighborhood:
      z
        .string()
        .trim()
        .max(80),

    city:
      z
        .string()
        .trim()
        .max(80),

    state:
      z
        .string()
        .trim()
        .max(
          2,
          "Utilize a sigla do estado.",
        ),

    logo:
      z.string(),
  });

export const generalSettingsSchema =
  z.object({
    principalStockUnit:
      stockUnitSchema,

    currency:
      z.literal("BRL"),

    locale:
      z.literal("pt-BR"),

    timezone:
      z
        .string()
        .trim()
        .min(
          1,
          "Informe o fuso horário.",
        ),

    decimalPlaces:
      z.union([
        z.literal(0),
        z.literal(1),
        z.literal(2),
        z.literal(3),
      ]),

    dateFormat:
      z.enum([
        "dd/MM/yyyy",
        "yyyy-MM-dd",
      ]),

    theme:
      z.enum([
        "light",
        "system",
      ]),
  });

export const salesSettingsSchema =
  z.object({
    defaultPaymentMethod:
      paymentMethodSchema,

    defaultCustomerName:
      z
        .string()
        .trim()
        .min(
          2,
          "Informe o cliente padrão.",
        )
        .max(100),

    allowFractionalKgSales:
      z.boolean(),

    allowPriceChange:
      z.boolean(),

    allowItemDiscount:
      z.boolean(),

    allowGeneralDiscount:
      z.boolean(),

    maximumDiscountPercentage:
      z
        .number()
        .min(
          0,
          "O desconto não pode ser negativo.",
        )
        .max(
          100,
          "O desconto máximo não pode ultrapassar 100%.",
        ),

    requireCustomerIdentification:
      z.boolean(),

    clearCartAfterSale:
      z.boolean(),

    autoPrintReceipt:
      z.boolean(),
  });

export const inventorySettingsSchema =
  z.object({
    allowNegativeStock:
      z.boolean(),

    lowStockAlertsEnabled:
      z.boolean(),

    defaultMinimumStock:
      z
        .number()
        .min(
          0,
          "O estoque mínimo não pode ser negativo.",
        ),

    updatePurchasePriceOnEntry:
      z.boolean(),

    requireMovementNotes:
      z.boolean(),
  });

export const financialSettingsSchema =
  z.object({
    generateIncomeFromSale:
      z.boolean(),

    cancelIncomeWithSale:
      z.boolean(),

    defaultPaymentMethod:
      financialPaymentMethodSchema,

    defaultIncomeCategory:
      z
        .string()
        .trim()
        .min(
          1,
          "Informe a categoria padrão de receita.",
        )
        .max(80),

    defaultExpenseCategory:
      z
        .string()
        .trim()
        .min(
          1,
          "Informe a categoria padrão de despesa.",
        )
        .max(80),

    defaultDueDays:
      z
        .number()
        .int()
        .min(
          0,
          "O prazo não pode ser negativo.",
        )
        .max(
          365,
          "O prazo máximo permitido é de 365 dias.",
        ),

    showOverdueAlerts:
      z.boolean(),
  });

export const reportSettingsSchema =
  z.object({
    defaultPeriod:
      reportPeriodSchema,

    defaultGroupBy:
      reportGroupSchema,

    defaultPageSize:
      z.union([
        z.literal(10),
        z.literal(20),
        z.literal(50),
        z.literal(100),
      ]),

    includeCancelledRecords:
      z.boolean(),

    printOrientation:
      z.enum([
        "portrait",
        "landscape",
      ]),

    showBusinessInformation:
      z.boolean(),

    showGenerationDate:
      z.boolean(),
  });

export const receiptSettingsSchema =
  z.object({
    paperSize:
      z.enum([
        "58mm",
        "80mm",
        "a4",
      ]),

    showLogo:
      z.boolean(),

    showLegalName:
      z.boolean(),

    showDocument:
      z.boolean(),

    showAddress:
      z.boolean(),

    showPhone:
      z.boolean(),

    showSeller:
      z.boolean(),

    showCustomer:
      z.boolean(),

    footerMessage:
      z
        .string()
        .trim()
        .max(
          200,
          "A mensagem deve possuir no máximo 200 caracteres.",
        ),
  });

export const updateSystemSettingsDtoSchema =
  z.object({
    business:
      businessSettingsSchema,

    general:
      generalSettingsSchema,

    sales:
      salesSettingsSchema,

    inventory:
      inventorySettingsSchema,

    financial:
      financialSettingsSchema,

    reports:
      reportSettingsSchema,

    receipt:
      receiptSettingsSchema,
  });

export const systemSettingsDtoSchema =
  updateSystemSettingsDtoSchema
    .extend({
      schemaVersion:
        z
          .number()
          .int()
          .positive(),

      updatedAt:
        z
          .string()
          .min(1),

      updatedBy:
        z
          .string()
          .trim()
          .min(1),
    });