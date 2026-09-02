import type {
  FinancialTransaction,
} from "../financial/FinancialTransaction";

import type {
  Sale,
} from "../sales/Sale";

import type {
  SystemSettings,
} from "../settings/SystemSettings";

import type {
  InventoryMovement,
} from "../../types/Inventory";

import type {
  Product,
} from "../../types/Product";

import type {
  Customer,
} from "../customers/Customer";

import type {
  Supplier,
} from "../suppliers/Supplier";

import type {
  Purchase,
} from "../purchases/Purchase";

export const SYSTEM_BACKUP_IDENTIFIER =
  "gestor-facil-full-backup" as const;

export const CURRENT_BACKUP_SCHEMA_VERSION =
  1;

export interface SystemBackupData {
  settings:
  SystemSettings;

  products:
  Product[];

  inventoryMovements:
  InventoryMovement[];

  sales:
  Sale[];

  financialTransactions:
  FinancialTransaction[];

  customers:
  Customer[];

  suppliers:
  Supplier[];

  purchases:
  Purchase[];
}

export interface SystemBackupSummary {
  products: number;

  inventoryMovements:
  number;

  sales:
  number;

  financialTransactions:
  number;

  customers:
  number;

  suppliers:
  number;

  purchases:
  number;
}

export interface SystemBackup {
  identifier:
  typeof SYSTEM_BACKUP_IDENTIFIER;

  schemaVersion: number;

  application:
  "Gestor Fácil";

  createdAt: string;
  businessName: string;

  summary:
  SystemBackupSummary;

  data:
  SystemBackupData;
}