import {
  apiConfig,
} from "../../api/apiConfig";

import {
  ApiSettingsRepository,
} from "./api/ApiSettingsRepository";

import {
  MockSettingsRepository,
} from "./mock/MockSettingsRepository";

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

  return new MockSettingsRepository();
}

export const settingsRepository =
  createSettingsRepository();