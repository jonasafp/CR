import type {
  UpdateSystemSettingsInput,
} from "../../domain/settings/SystemSettings";

import {
  settingsRepository,
} from "../../repositories/settings/settingsRepositoryFactory";

export const settingsService = {
  get() {
    return settingsRepository
      .get();
  },

  update(
    input:
      UpdateSystemSettingsInput,
  ) {
    return settingsRepository
      .update(
        input,
      );
  },

  reset() {
    return settingsRepository
      .reset();
  },
};