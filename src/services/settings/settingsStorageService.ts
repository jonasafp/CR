import {
  CURRENT_SETTINGS_SCHEMA_VERSION,
  defaultSystemSettings,
} from "../../config/defaultSystemSettings";

import {
  STORAGE_KEYS,
} from "../../constants/storageKeys";

import type {
  SystemSettings,
} from "../../domain/settings/SystemSettings";

import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from "../storage/localStorageService";

export const SETTINGS_UPDATED_EVENT =
  "gestor-facil:settings-updated";

function cloneDefaultSettings():
  SystemSettings {
  return JSON.parse(
    JSON.stringify(
      defaultSystemSettings,
    ),
  ) as SystemSettings;
}

function mergeWithDefaults(
  storedSettings:
    Partial<SystemSettings>,
): SystemSettings {
  const defaults =
    cloneDefaultSettings();

  return {
    ...defaults,
    ...storedSettings,

    schemaVersion:
      CURRENT_SETTINGS_SCHEMA_VERSION,

    business: {
      ...defaults.business,
      ...storedSettings.business,
    },

    general: {
      ...defaults.general,
      ...storedSettings.general,
    },

    sales: {
      ...defaults.sales,
      ...storedSettings.sales,
    },

    inventory: {
      ...defaults.inventory,
      ...storedSettings.inventory,
    },

    financial: {
      ...defaults.financial,
      ...storedSettings.financial,
    },

    reports: {
      ...defaults.reports,
      ...storedSettings.reports,
    },

    receipt: {
      ...defaults.receipt,
      ...storedSettings.receipt,
    },
  };
}

function notifySettingsUpdated(
  settings:
    SystemSettings,
) {
  window.dispatchEvent(
    new CustomEvent<
      SystemSettings
    >(
      SETTINGS_UPDATED_EVENT,
      {
        detail: settings,
      },
    ),
  );
}

export const settingsStorageService = {
  read(): SystemSettings {
    const storedSettings =
      readLocalStorage<
        Partial<SystemSettings>
      >(
        STORAGE_KEYS.settings,
        {},
      );

    return mergeWithDefaults(
      storedSettings,
    );
  },

  save(
    settings:
      SystemSettings,
  ): SystemSettings {
    const normalizedSettings =
      mergeWithDefaults(
        settings,
      );

    writeLocalStorage(
      STORAGE_KEYS.settings,
      normalizedSettings,
    );

    notifySettingsUpdated(
      normalizedSettings,
    );

    return normalizedSettings;
  },

  reset(): SystemSettings {
    removeLocalStorage(
      STORAGE_KEYS.settings,
    );

    const defaultSettings =
      cloneDefaultSettings();

    notifySettingsUpdated(
      defaultSettings,
    );

    return defaultSettings;
  },
};