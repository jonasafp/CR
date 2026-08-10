import type {
  SystemSettings,
  UpdateSystemSettingsInput,
} from "../../domain/settings/SystemSettings";

export interface SettingsRepository {
  get():
    Promise<SystemSettings>;

  update(
    input:
      UpdateSystemSettingsInput,
  ): Promise<SystemSettings>;

  reset():
    Promise<SystemSettings>;
}