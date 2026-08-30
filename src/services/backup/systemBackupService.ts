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
  initialCustomers,
} from "../../data/customersMock";

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

import type {
  Customer,
} from "../../domain/customers/Customer";

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

function readCurrentData(): SystemBackupData {
  return {
    settings:
      settingsStorageService.read(),

    customers:
      readLocalStorage<Customer[]>(
        STORAGE_KEYS.customers,
        initialCustomers,
      ),

    products:
      readLocalStorage<Product[]>(
        STORAGE_KEYS.products,
        initialProducts,
      ),

    inventoryMovements:
      readLocalStorage<
        InventoryMovement[]
      >(
        STORAGE_KEYS.inventoryMovements,
        initialInventoryMovements,
      ),

    sales:
      readLocalStorage<Sale[]>(
        STORAGE_KEYS.sales,
        initialSales,
      ),

    financialTransactions:
      readLocalStorage<
        FinancialTransaction[]
      >(
        STORAGE_KEYS.financialTransactions,
        initialFinancialTransactions,
      ),
  };
}

function create(): SystemBackup {
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
      new Date().toISOString(),

    businessName:
      data.settings.business.tradeName ||
      data.settings.business.legalName ||
      "Estabelecimento",

    summary: {
      products:
        data.products.length,

      inventoryMovements:
        data.inventoryMovements.length,

      sales:
        data.sales.length,

      financialTransactions:
        data.financialTransactions.length,

      customers:
        data.customers.length,
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
    return systemBackupDtoSchema.parse(
      parsedContent,
    ) as SystemBackup;
  } catch (
  error
  ) {
    if (
      error instanceof ZodError
    ) {
      const issue =
        error.issues[0];

      const location =
        issue?.path.length
          ? ` Campo: ${issue.path.join(".")}.`
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
    backup.createdAt.slice(
      0,
      10,
    );

  const time =
    backup.createdAt
      .slice(
        11,
        19,
      )
      .replace(
        /:/g,
        "-",
      );

  return `${prefix}-${date}-${time}.json`;
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

  link.href =
    url;

  link.download =
    createFileName(
      backup,
      prefix,
    );

  document.body.appendChild(
    link,
  );

  link.click();
  link.remove();

  URL.revokeObjectURL(
    url,
  );
}

function restore(
  backup: SystemBackup,
): void {
  /*
   * Mesmo que o arquivo já tenha sido validado pela interface,
   * realizamos uma nova validação imediatamente antes da gravação.
   */
  const validatedBackup =
    parse(
      serialize(
        backup,
      ),
    );

  /*
   * Todos os valores são serializados antes de modificar
   * qualquer informação no localStorage.
   */
  const entries: Array<[
    string,
    unknown,
  ]> = [

      [
        STORAGE_KEYS.customers,
        validatedBackup.data.customers,
      ],
      
      [
        STORAGE_KEYS.settings,
        validatedBackup.data.settings,
      ],

      [
        STORAGE_KEYS.products,
        validatedBackup.data.products,
      ],

      [
        STORAGE_KEYS.inventoryMovements,
        validatedBackup.data.inventoryMovements,
      ],

      [
        STORAGE_KEYS.sales,
        validatedBackup.data.sales,
      ],

      [
        STORAGE_KEYS.financialTransactions,
        validatedBackup.data.financialTransactions,
      ],
    ];

  const serializedEntries =
    entries.map(
      ([
        key,
        value,
      ]) => [
        key,
        JSON.stringify(
          value,
        ),
      ] as const,
    );

  /*
   * Mantém uma fotografia dos valores atuais.
   * Ela será usada se alguma gravação falhar.
   */
  const previousValues =
    new Map(
      entries.map(
        ([key]) => [
          key,
          window.localStorage.getItem(
            key,
          ),
        ],
      ),
    );

  try {
    serializedEntries.forEach(
      ([
        key,
        value,
      ]) => {
        window.localStorage.setItem(
          key,
          value,
        );
      },
    );
  } catch (
  restoreError
  ) {
    /*
     * Rollback: devolve todas as chaves ao estado
     * em que estavam antes da tentativa.
     */
    previousValues.forEach(
      (
        previousValue,
        key,
      ) => {
        if (
          previousValue === null
        ) {
          window.localStorage.removeItem(
            key,
          );
        } else {
          window.localStorage.setItem(
            key,
            previousValue,
          );
        }
      },
    );

    throw new Error(
      restoreError instanceof Error
        ? `A restauração falhou e os dados anteriores foram recuperados. ${restoreError.message}`
        : "A restauração falhou e os dados anteriores foram recuperados.",
    );
  }
}

export const systemBackupService = {
  create,
  serialize,
  parse,
  download,
  restore,
};