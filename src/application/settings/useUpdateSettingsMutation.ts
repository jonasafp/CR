import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  UpdateSystemSettingsInput,
} from "../../domain/settings/SystemSettings";

import {
  settingsService,
} from "../../services/settings/settingsService";

import {
  settingsQueryKeys,
} from "./useSettingsQuery";

export function useUpdateSettingsMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        UpdateSystemSettingsInput,
    ) =>
      settingsService.update(
        input,
      ),

    onSuccess: async (
      settings,
    ) => {
      queryClient.setQueryData(
        settingsQueryKeys.detail(),
        settings,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "sales",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "financial",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "reports",
          ],
        }),
      ]);
    },
  });
}