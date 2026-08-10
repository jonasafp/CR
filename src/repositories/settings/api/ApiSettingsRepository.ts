import {
  httpClient,
} from "../../../api/httpClient";

import type {
  SystemSettings,
  UpdateSystemSettingsInput,
} from "../../../domain/settings/SystemSettings";

import {
  mapSystemSettingsDtoToDomain,
  mapUpdateSystemSettingsInput,
} from "../../../mappers/settings/systemSettingsMapper";

import type {
  SettingsRepository,
} from "../SettingsRepository";

export class ApiSettingsRepository
  implements SettingsRepository
{
  async get():
    Promise<SystemSettings> {
    const response =
      await httpClient
        .get<unknown>(
          "/settings",
        );

    return mapSystemSettingsDtoToDomain(
      response,
    );
  }

  async update(
    input:
      UpdateSystemSettingsInput,
  ): Promise<SystemSettings> {
    const validInput =
      mapUpdateSystemSettingsInput(
        input,
      );

    const response =
      await httpClient
        .put<unknown>(
          "/settings",
          validInput,
        );

    return mapSystemSettingsDtoToDomain(
      response,
    );
  }

  async reset():
    Promise<SystemSettings> {
    const response =
      await httpClient
        .post<unknown>(
          "/settings/reset",
        );

    return mapSystemSettingsDtoToDomain(
      response,
    );
  }
}