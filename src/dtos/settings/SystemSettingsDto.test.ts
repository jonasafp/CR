import {
  describe,
  expect,
  it,
} from "vitest";

import {
  defaultSystemSettings,
} from "../../config/defaultSystemSettings";

import {
  systemSettingsDtoSchema,
} from "./SystemSettingsDto";

describe(
  "systemSettingsDtoSchema",
  () => {
    it(
      "aceita as configurações padrão",
      () => {
        const result =
          systemSettingsDtoSchema
            .safeParse(
              defaultSystemSettings,
            );

        expect(
          result.success,
        ).toBe(true);
      },
    );

    it(
      "rejeita prazo financeiro acima do limite",
      () => {
        const result =
          systemSettingsDtoSchema
            .safeParse({
              ...defaultSystemSettings,

              financial: {
                ...defaultSystemSettings
                  .financial,

                defaultDueDays:
                  3651,
              },
            });

        expect(
          result.success,
        ).toBe(false);
      },
    );

    it(
      "aceita mensagem de rodapé com 240 caracteres",
      () => {
        const result =
          systemSettingsDtoSchema
            .safeParse({
              ...defaultSystemSettings,

              receipt: {
                ...defaultSystemSettings
                  .receipt,

                footerMessage:
                  "A".repeat(
                    240,
                  ),
              },
            });

        expect(
          result.success,
        ).toBe(true);
      },
    );

    it(
      "rejeita mensagem de rodapé com 241 caracteres",
      () => {
        const result =
          systemSettingsDtoSchema
            .safeParse({
              ...defaultSystemSettings,

              receipt: {
                ...defaultSystemSettings
                  .receipt,

                footerMessage:
                  "A".repeat(
                    241,
                  ),
              },
            });

        expect(
          result.success,
        ).toBe(false);
      },
    );
  },
);