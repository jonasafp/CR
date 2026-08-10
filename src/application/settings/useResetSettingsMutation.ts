import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  settingsService,
} from "../../services/settings/settingsService";

import {
  settingsQueryKeys,
} from "./useSettingsQuery";

export function useResetSettingsMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: () =>
      settingsService.reset(),

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