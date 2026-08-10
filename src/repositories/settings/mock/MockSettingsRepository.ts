import {
  CURRENT_SETTINGS_SCHEMA_VERSION,
} from "../../../config/defaultSystemSettings";

import {
  systemSettingsDtoSchema,
} from "../../../dtos/settings/SystemSettingsDto";

import type {
  SystemSettings,
  UpdateSystemSettingsInput,
} from "../../../domain/settings/SystemSettings";

import {
  mapSystemSettingsDtoToDomain,
  mapUpdateSystemSettingsInput,
} from "../../../mappers/settings/systemSettingsMapper";

import {
  settingsStorageService,
} from "../../../services/settings/settingsStorageService";

import type {
  SettingsRepository,
} from "../SettingsRepository";

const MOCK_DELAY = 320;

function wait(
  milliseconds = MOCK_DELAY,
): Promise<void> {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

export class MockSettingsRepository
  implements SettingsRepository
{
  async get():
    Promise<SystemSettings> {
    await wait(180);

    const storedSettings =
      settingsStorageService.read();

    const result =
      systemSettingsDtoSchema
        .safeParse(
          storedSettings,
        );

    if (result.success) {
      return result.data;
    }

    return mapSystemSettingsDtoToDomain(
      settingsStorageService
        .reset(),
    );
  }

  async update(
    input:
      UpdateSystemSettingsInput,
  ): Promise<SystemSettings> {
    await wait();

    const validInput =
      mapUpdateSystemSettingsInput(
        input,
      );

    const updatedSettings =
      mapSystemSettingsDtoToDomain({
        ...validInput,

        schemaVersion:
          CURRENT_SETTINGS_SCHEMA_VERSION,

        updatedAt:
          new Date()
            .toISOString(),

        updatedBy:
          "Administrador",
      });

    return settingsStorageService
      .save(
        updatedSettings,
      );
  }

  async reset():
    Promise<SystemSettings> {
    await wait();

    return mapSystemSettingsDtoToDomain(
      settingsStorageService
        .reset(),
    );
  }
}