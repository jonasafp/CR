import {
  useQuery,
} from "@tanstack/react-query";

import {
  settingsService,
} from "../../services/settings/settingsService";

export const settingsQueryKeys = {
  all:
    [
      "settings",
    ] as const,

  detail: () =>
    [
      ...settingsQueryKeys.all,
      "detail",
    ] as const,
};

export function useSettingsQuery() {
  return useQuery({
    queryKey:
      settingsQueryKeys.detail(),

    queryFn: () =>
      settingsService.get(),

    staleTime:
      5 * 60_000,
  });
}