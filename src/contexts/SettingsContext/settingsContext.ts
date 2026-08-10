import {
  createContext,
} from "react";

import type {
  SystemSettings,
  UpdateSystemSettingsInput,
} from "../../domain/settings/SystemSettings";

export interface SettingsContextValue {
  settings:
    SystemSettings;

  isLoading: boolean;
  isSaving: boolean;
  isResetting: boolean;

  error: unknown;

  saveSettings: (
    input:
      UpdateSystemSettingsInput,
  ) => Promise<SystemSettings>;

  resetSettings: () =>
    Promise<SystemSettings>;

  refetchSettings: () =>
    Promise<void>;
}

export const SettingsContext =
  createContext<
    SettingsContextValue | null
  >(null);