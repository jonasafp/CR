import {
  systemSettingsDtoSchema,
  updateSystemSettingsDtoSchema,
} from "../../dtos/settings/SystemSettingsDto";

import type {
  SystemSettings,
  UpdateSystemSettingsInput,
} from "../../domain/settings/SystemSettings";

export function mapSystemSettingsDtoToDomain(
  input: unknown,
): SystemSettings {
  return systemSettingsDtoSchema.parse(
    input,
  );
}

export function mapUpdateSystemSettingsInput(
  input:
    UpdateSystemSettingsInput,
): UpdateSystemSettingsInput {
  return updateSystemSettingsDtoSchema.parse(
    input,
  );
}