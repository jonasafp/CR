import {
  businessConfig,
} from "./businessConfig";

import type {
  SystemSettings,
} from "../domain/settings/SystemSettings";

export const CURRENT_SETTINGS_SCHEMA_VERSION =
  1;

export const defaultSystemSettings:
  SystemSettings = {
    schemaVersion:
      CURRENT_SETTINGS_SCHEMA_VERSION,

    business: {
      legalName:
        businessConfig.legalName,

      tradeName:
        businessConfig.tradeName,

      shortName:
        businessConfig.shortName,

      businessType:
        businessConfig.businessType,

      document: "",
      stateRegistration: "",

      phone: "",
      email: "",

      postalCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",

      city:
        businessConfig.city ?? "",

      state:
        businessConfig.state ?? "",

      logo: "",
    },

    general: {
      principalStockUnit:
        businessConfig
          .principalStockUnit,

      currency: "BRL",
      locale: "pt-BR",

      timezone:
        "America/Fortaleza",

      decimalPlaces: 2,

      dateFormat:
        "dd/MM/yyyy",

      theme: "light",
    },

    sales: {
      defaultPaymentMethod:
        "pix",

      defaultCustomerName:
        "Cliente balcão",

      allowFractionalKgSales:
        true,

      allowPriceChange:
        true,

      allowItemDiscount:
        true,

      allowGeneralDiscount:
        true,

      maximumDiscountPercentage:
        100,

      requireCustomerIdentification:
        false,

      clearCartAfterSale:
        true,

      autoPrintReceipt:
        false,
    },

    inventory: {
      allowNegativeStock:
        businessConfig
          .allowNegativeStock,

      lowStockAlertsEnabled:
        businessConfig
          .lowStockAlertsEnabled,

      defaultMinimumStock: 5,

      updatePurchasePriceOnEntry:
        false,

      requireMovementNotes:
        false,
    },

    financial: {
      generateIncomeFromSale:
        true,

      cancelIncomeWithSale:
        true,

      defaultPaymentMethod:
        "pix",

      defaultIncomeCategory:
        "Vendas",

      defaultExpenseCategory:
        "Despesas gerais",

      defaultDueDays: 0,

      showOverdueAlerts:
        true,
    },

    reports: {
      defaultPeriod: "month",
      defaultGroupBy: "day",
      defaultPageSize: 10,

      includeCancelledRecords:
        false,

      printOrientation:
        "landscape",

      showBusinessInformation:
        true,

      showGenerationDate:
        true,
    },

    receipt: {
      paperSize: "80mm",

      showLogo: true,
      showLegalName: true,
      showDocument: true,
      showAddress: true,
      showPhone: true,

      showSeller: true,
      showCustomer: true,

      footerMessage:
        "Obrigado pela preferência!",
    },

    updatedAt:
      "2026-08-10T00:00:00.000Z",

    updatedBy: "Sistema",
  };