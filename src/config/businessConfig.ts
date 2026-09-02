import type { BusinessConfig } from "../types/Business";

export const businessConfig: BusinessConfig = {
  id: 1,

  legalName: "Casa de Rações Central LTDA",
  tradeName: "Casa de Rações",
  shortName: "CR",

  businessType: "pet_store",

  principalStockUnit: "kg",
  currency: "BRL",
  locale: "pt-BR",

  fiscalMode: false,

  allowNegativeStock: false,
  lowStockAlertsEnabled: true,

  city: "Campo Grande",
  state: "MS",

  modules: {
    dashboard: true,
    inventory: true,
    products: true,
    sales: true,
    finance: true,
    reports: true,

    customers: true,
    suppliers: true,
    purchases: false,
    cashRegister: false,
  },
};