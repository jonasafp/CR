import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  STORAGE_KEYS,
} from "../../constants/storageKeys";

import {
  CURRENT_BACKUP_SCHEMA_VERSION,
  SYSTEM_BACKUP_IDENTIFIER,
} from "../../domain/backup/SystemBackup";

import {
  systemBackupService,
} from "./systemBackupService";

function createMemoryStorage(): Storage {
  const values =
    new Map<string, string>();

  return {
    get length() {
      return values.size;
    },

    clear() {
      values.clear();
    },

    getItem(
      key: string,
    ) {
      return values.get(
        key,
      ) ?? null;
    },

    key(
      index: number,
    ) {
      return Array.from(
        values.keys(),
      )[index] ?? null;
    },

    removeItem(
      key: string,
    ) {
      values.delete(
        key,
      );
    },

    setItem(
      key: string,
      value: string,
    ) {
      values.set(
        key,
        value,
      );
    },
  };
}

function configureBrowserEnvironment() {
  const localStorage =
    createMemoryStorage();

  Object.defineProperty(
    globalThis,
    "window",
    {
      configurable:
        true,

      writable:
        true,

      value: {
        localStorage,

        dispatchEvent() {
          return true;
        },
      },
    },
  );

  return localStorage;
}

describe(
  "systemBackupService",
  () => {
    beforeEach(
      () => {
        configureBrowserEnvironment();
      },
    );

    it(
      "cria um backup completo com identificação e versão corretas",
      () => {
        const backup =
          systemBackupService.create();

        expect(
          backup.identifier,
        ).toBe(
          SYSTEM_BACKUP_IDENTIFIER,
        );

        expect(
          backup.schemaVersion,
        ).toBe(
          CURRENT_BACKUP_SCHEMA_VERSION,
        );

        expect(
          backup.application,
        ).toBe(
          "Gestor Fácil",
        );

        expect(
          backup.data.settings,
        ).toBeDefined();

        expect(
          Array.isArray(
            backup.data.products,
          ),
        ).toBe(
          true,
        );

        expect(
          Array.isArray(
            backup.data.inventoryMovements,
          ),
        ).toBe(
          true,
        );

        expect(
          Array.isArray(
            backup.data.sales,
          ),
        ).toBe(
          true,
        );

        expect(
          Array.isArray(
            backup.data.financialTransactions,
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      "serializa e interpreta novamente um backup válido",
      () => {
        const originalBackup =
          systemBackupService.create();

        const serializedBackup =
          systemBackupService.serialize(
            originalBackup,
          );

        const parsedBackup =
          systemBackupService.parse(
            serializedBackup,
          );

        expect(
          parsedBackup,
        ).toEqual(
          originalBackup,
        );
      },
    );

    it(
      "rejeita um conteúdo que não seja JSON",
      () => {
        expect(
          () =>
            systemBackupService.parse(
              "arquivo inválido",
            ),
        ).toThrow(
          "O arquivo selecionado não contém um JSON válido.",
        );
      },
    );

    it(
      "rejeita um arquivo que não seja um backup completo",
      () => {
        const invalidContent =
          JSON.stringify(
            {
              application:
                "Outro sistema",

              products: [],
            },
          );

        expect(
          () =>
            systemBackupService.parse(
              invalidContent,
            ),
        ).toThrow(
          "O arquivo não contém um backup completo válido.",
        );
      },
    );

    it(
      "rejeita um backup com versão incompatível",
      () => {
        const backup =
          systemBackupService.create();

        const incompatibleBackup = {
          ...backup,

          schemaVersion:
            CURRENT_BACKUP_SCHEMA_VERSION +
            1,
        };

        expect(
          () =>
            systemBackupService.parse(
              JSON.stringify(
                incompatibleBackup,
              ),
            ),
        ).toThrow(
          "O arquivo não contém um backup completo válido.",
        );
      },
    );

    it(
      "rejeita um backup cujo resumo não corresponde aos dados",
      () => {
        const backup =
          systemBackupService.create();

        const invalidBackup = {
          ...backup,

          summary: {
            ...backup.summary,

            products:
              backup.summary.products +
              1,
          },
        };

        expect(
          () =>
            systemBackupService.parse(
              JSON.stringify(
                invalidBackup,
              ),
            ),
        ).toThrow(
          "O arquivo não contém um backup completo válido.",
        );
      },
    );

    it(
      "restaura todas as áreas armazenadas pelo sistema",
      () => {
        const localStorage =
          window.localStorage;

        const backup =
          systemBackupService.create();

        localStorage.setItem(
          STORAGE_KEYS.settings,
          JSON.stringify(
            {
              altered:
                true,
            },
          ),
        );

        localStorage.setItem(
          STORAGE_KEYS.products,
          JSON.stringify(
            [],
          ),
        );

        localStorage.setItem(
          STORAGE_KEYS.inventoryMovements,
          JSON.stringify(
            [],
          ),
        );

        localStorage.setItem(
          STORAGE_KEYS.sales,
          JSON.stringify(
            [],
          ),
        );

        localStorage.setItem(
          STORAGE_KEYS.financialTransactions,
          JSON.stringify(
            [],
          ),
        );

        systemBackupService.restore(
          backup,
        );

        expect(
          JSON.parse(
            localStorage.getItem(
              STORAGE_KEYS.settings,
            ) ?? "null",
          ),
        ).toEqual(
          backup.data.settings,
        );

        expect(
          JSON.parse(
            localStorage.getItem(
              STORAGE_KEYS.products,
            ) ?? "null",
          ),
        ).toEqual(
          backup.data.products,
        );

        expect(
          JSON.parse(
            localStorage.getItem(
              STORAGE_KEYS.inventoryMovements,
            ) ?? "null",
          ),
        ).toEqual(
          backup.data.inventoryMovements,
        );

        expect(
          JSON.parse(
            localStorage.getItem(
              STORAGE_KEYS.sales,
            ) ?? "null",
          ),
        ).toEqual(
          backup.data.sales,
        );

        expect(
          JSON.parse(
            localStorage.getItem(
              STORAGE_KEYS.financialTransactions,
            ) ?? "null",
          ),
        ).toEqual(
          backup.data.financialTransactions,
        );
      },
    );
  },
);