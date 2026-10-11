import {
  apiConfig,
} from "../../api/apiConfig";

import {
  ApiSettingsRepository,
} from "./api/ApiSettingsRepository";

import { SupabaseSettingsRepository } from "./supabase/SupabaseSettingsRepository";

import type {
  SettingsRepository,
} from "./SettingsRepository";

function createSettingsRepository():
  SettingsRepository {
  if (
    apiConfig.dataSource ===
    "api"
  ) {
    return new ApiSettingsRepository();
  }

  return new SupabaseSettingsRepository();
}

export const settingsRepository =
  createSettingsRepository();
