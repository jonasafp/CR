import type {
  FinancialPaymentMethod,
} from "../financial/FinancialTransaction";

import type {
  PaymentMethod,
} from "../sales/Sale";

import type {
  ReportGroupBy,
} from "../reports/Report";

import type {
  ReportPeriodPreset,
} from "../reports/ReportFilters";

import type {
  BusinessType,
} from "../../types/Business";

import type {
  StockUnit,
} from "../../types/Product";

export type SystemTheme =
  | "light"
  | "system";

export type SystemDateFormat =
  | "dd/MM/yyyy"
  | "yyyy-MM-dd";

export type ReportPrintOrientation =
  | "portrait"
  | "landscape";

export type ReceiptPaperSize =
  | "58mm"
  | "80mm"
  | "a4";

export interface BusinessSettings {
  legalName: string;
  tradeName: string;
  shortName: string;

  businessType:
    BusinessType;

  document: string;
  stateRegistration: string;

  phone: string;
  email: string;

  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;

  logo: string;
}

export interface GeneralSettings {
  principalStockUnit:
    StockUnit;

  currency: "BRL";
  locale: "pt-BR";
  timezone: string;

  decimalPlaces:
    | 0
    | 1
    | 2
    | 3;

  dateFormat:
    SystemDateFormat;

  theme: SystemTheme;
}

export interface SalesSettings {
  defaultPaymentMethod:
    PaymentMethod;

  defaultCustomerName: string;

  allowFractionalKgSales:
    boolean;

  allowPriceChange: boolean;

  allowItemDiscount:
    boolean;

  allowGeneralDiscount:
    boolean;

  maximumDiscountPercentage:
    number;

  requireCustomerIdentification:
    boolean;

  clearCartAfterSale:
    boolean;

  autoPrintReceipt:
    boolean;
}

export interface InventorySettings {
  allowNegativeStock:
    boolean;

  lowStockAlertsEnabled:
    boolean;

  defaultMinimumStock:
    number;

  updatePurchasePriceOnEntry:
    boolean;

  requireMovementNotes:
    boolean;
}

export interface FinancialSettings {
  generateIncomeFromSale:
    boolean;

  cancelIncomeWithSale:
    boolean;

  defaultPaymentMethod:
    FinancialPaymentMethod;

  defaultIncomeCategory:
    string;

  defaultExpenseCategory:
    string;

  defaultDueDays: number;

  showOverdueAlerts:
    boolean;
}

export interface ReportSettings {
  defaultPeriod:
    ReportPeriodPreset;

  defaultGroupBy:
    ReportGroupBy;

  defaultPageSize:
    | 10
    | 20
    | 50
    | 100;

  includeCancelledRecords:
    boolean;

  printOrientation:
    ReportPrintOrientation;

  showBusinessInformation:
    boolean;

  showGenerationDate:
    boolean;
}

export interface ReceiptSettings {
  paperSize:
    ReceiptPaperSize;

  showLogo: boolean;
  showLegalName: boolean;
  showDocument: boolean;
  showAddress: boolean;
  showPhone: boolean;

  showSeller: boolean;
  showCustomer: boolean;

  footerMessage: string;
}

export interface SystemSettings {
  schemaVersion: number;

  business:
    BusinessSettings;

  general:
    GeneralSettings;

  sales:
    SalesSettings;

  inventory:
    InventorySettings;

  financial:
    FinancialSettings;

  reports:
    ReportSettings;

  receipt:
    ReceiptSettings;

  updatedAt: string;
  updatedBy: string;
}

export type UpdateSystemSettingsInput =
  Omit<
    SystemSettings,
    | "schemaVersion"
    | "updatedAt"
    | "updatedBy"
  >;

export type SettingsSection =
  | "business"
  | "general"
  | "sales"
  | "inventory"
  | "financial"
  | "reports"
  | "receipt"
  | "data";