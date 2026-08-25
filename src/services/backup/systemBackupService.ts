import {
  ZodError,
} from "zod";

import {
  STORAGE_KEYS,
} from "../../constants/storageKeys";

import {
  initialFinancialTransactions,
} from "../../data/financialMock";

import {
  initialInventoryMovements,
} from "../../data/inventoryMock";

import {
  products as initialProducts,
} from "../../data/mock";

import {
  initialSales,
} from "../../data/salesMock";

import {
  CURRENT_BACKUP_SCHEMA_VERSION,
  SYSTEM_BACKUP_IDENTIFIER,
} from "../../domain/backup/SystemBackup";

import type {
  SystemBackup,
  SystemBackupData,
} from "../../domain/backup/SystemBackup";

import type {
  FinancialTransaction,
} from "../../domain/financial/FinancialTransaction";

import type {
  Sale,
} from "../../domain/sales/Sale";

import {
  systemBackupDtoSchema,
} from "../../dtos/backup/SystemBackupDto";

import type {
  InventoryMovement,
} from "../../types/Inventory";

import type {
  Product,
} from "../../types/Product";

import {
  settingsStorageService,
} from "../settings/settingsStorageService";

import {
  readLocalStorage,
} from "../storage/localStorageService";

function readCurrentData():
  SystemBackupData {
  return {
    settings:
      settingsStorageService
        .read(),

    products:
      readLocalStorage<
        Product[]
      >(
        STORAGE_KEYS.products,
        initialProducts,
      ),

    inventoryMovements:
      readLocalStorage<
        InventoryMovement[]
      >(
        STORAGE_KEYS
          .inventoryMovements,

        initialInventoryMovements,
      ),

    sales:
      readLocalStorage<
        Sale[]
      >(
        STORAGE_KEYS.sales,
        initialSales,
      ),

    financialTransactions:
      readLocalStorage<
        FinancialTransaction[]
      >(
        STORAGE_KEYS
          .financialTransactions,

        initialFinancialTransactions,
      ),
  };
}

function create():
  SystemBackup {
  const data =
    readCurrentData();

  return {
    identifier:
      SYSTEM_BACKUP_IDENTIFIER,

    schemaVersion:
      CURRENT_BACKUP_SCHEMA_VERSION,

    application:
      "Gestor Fácil",

    createdAt:
      new Date()
        .toISOString(),

    businessName:
      data.settings
        .business
        .tradeName ||
      data.settings
        .business
        .legalName ||
      "Estabelecimento",

    summary: {
      products:
        data.products.length,

      inventoryMovements:
        data
          .inventoryMovements
          .length,

      sales:
        data.sales.length,

      financialTransactions:
        data
          .financialTransactions
          .length,
    },

    data,
  };
}

function serialize(
  backup: SystemBackup,
): string {
  return JSON.stringify(
    backup,
    null,
    2,
  );
}

function parse(
  content: string,
): SystemBackup {
  let parsedContent:
    unknown;

  try {
    parsedContent =
      JSON.parse(
        content,
      );
  } catch {
    throw new Error(
      "O arquivo selecionado não contém um JSON válido.",
    );
  }

  try {
    return (
      systemBackupDtoSchema
        .parse(
          parsedContent,
        ) as SystemBackup
    );
  } catch (error) {
    if (
      error instanceof
      ZodError
    ) {
      const issue =
        error.issues[0];

      const location =
        issue?.path.length
          ? ` Campo: ${issue.path.join(
              ".",
            )}.`
          : "";

      throw new Error(
        `O arquivo não contém um backup completo válido.${location}`,
      );
    }

    throw error;
  }
}

function createFileName(
  backup: SystemBackup,

  prefix =
    "gestor-facil-backup-completo",
): string {
  const date =
    backup.createdAt
      .slice(0, 10);

  const time =
    backup.createdAt
      .slice(11, 19)
      .replace(
        /:/g,
        "-",
      );

  return (
    `${prefix}-` +
    `${date}-` +
    `${time}.json`
  );
}

function download(
  backup: SystemBackup,
  prefix?: string,
): void {
  const blob =
    new Blob(
      [
        serialize(
          backup,
        ),
      ],

      {
        type:
          "application/json;charset=utf-8",
      },
    );

  const url =
    URL.createObjectURL(
      blob,
    );

  const link =
    document.createElement(
      "a",
    );

  link.href = url;

  link.download =
    createFileName(
      backup,
      prefix,
    );

  document.body
    .appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(
    url,
  );
}

export const systemBackupService = {
  create,
  serialize,
  parse,
  download,
};