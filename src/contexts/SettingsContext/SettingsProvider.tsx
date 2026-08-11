import {
  useCallback,
  useEffect,
  useMemo,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  useResetSettingsMutation,
} from "../../application/settings/useResetSettingsMutation";

import {
  settingsQueryKeys,
  useSettingsQuery,
} from "../../application/settings/useSettingsQuery";

import {
  useUpdateSettingsMutation,
} from "../../application/settings/useUpdateSettingsMutation";

import {
  defaultSystemSettings,
} from "../../config/defaultSystemSettings";

import type {
  SystemSettings,
  UpdateSystemSettingsInput,
} from "../../domain/settings/SystemSettings";

import {
  applicationIdentityService,
} from "../../services/desktop/applicationIdentityService";

import {
  SETTINGS_UPDATED_EVENT,
} from "../../services/settings/settingsStorageService";

import {
  SettingsContext,
} from "./settingsContext";

interface SettingsProviderProps {
  children: ReactNode;
}

export default function SettingsProvider({
  children,
}: SettingsProviderProps) {
  const queryClient =
    useQueryClient();

  const settingsQuery =
    useSettingsQuery();

  const updateMutation =
    useUpdateSettingsMutation();

  const resetMutation =
    useResetSettingsMutation();

  const currentSettings =
    settingsQuery.data ??
    defaultSystemSettings;

  useEffect(() => {
    applicationIdentityService.apply(
      currentSettings.business,
    );
  }, [currentSettings.business]);

  useEffect(() => {
    function handleSettingsUpdated(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<SystemSettings>;

      if (!customEvent.detail) {
        return;
      }

      queryClient.setQueryData(
        settingsQueryKeys.detail(),
        customEvent.detail,
      );
    }

    window.addEventListener(
      SETTINGS_UPDATED_EVENT,
      handleSettingsUpdated,
    );

    return () => {
      window.removeEventListener(
        SETTINGS_UPDATED_EVENT,
        handleSettingsUpdated,
      );
    };
  }, [queryClient]);

  const saveSettings =
    useCallback(
      (
        input:
          UpdateSystemSettingsInput,
      ) =>
        updateMutation.mutateAsync(
          input,
        ),
      [updateMutation],
    );

  const resetSettings =
    useCallback(
      () =>
        resetMutation.mutateAsync(),
      [resetMutation],
    );

  const refetchSettings =
    useCallback(
      async () => {
        await settingsQuery.refetch();
      },
      [settingsQuery],
    );

  const value = useMemo(
    () => ({
      settings:
        currentSettings,

      isLoading:
        settingsQuery.isLoading,

      isSaving:
        updateMutation.isPending,

      isResetting:
        resetMutation.isPending,

      error:
        settingsQuery.error ??
        updateMutation.error ??
        resetMutation.error,

      saveSettings,
      resetSettings,
      refetchSettings,
    }),
    [
      settingsQuery.data,
      settingsQuery.isLoading,
      settingsQuery.error,
      updateMutation.isPending,
      updateMutation.error,
      resetMutation.isPending,
      resetMutation.error,
      saveSettings,
      resetSettings,
      refetchSettings,
    ],
  );

  return (
    <SettingsContext.Provider
      value={value}
    >
      {children}
    </SettingsContext.Provider>
  );
}