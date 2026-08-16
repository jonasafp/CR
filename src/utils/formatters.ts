import type {
  GeneralSettings,
} from "../domain/settings/SystemSettings";

import type {
  StockUnit,
} from "../types/Product";

import {
  settingsStorageService,
} from "../services/settings/settingsStorageService";

let activeGeneralSettings =
  settingsStorageService
    .read()
    .general;

export function applyFormattingSettings(
  settings: GeneralSettings,
): void {
  activeGeneralSettings =
    settings;
}

const unitLabels:
  Record<StockUnit, string> = {
    kg: "kg",
    g: "g",
    un: "un.",
    l: "L",
    ml: "ml",
    cx: "cx.",
    pct: "pct.",
  };

export function formatCurrency(
  value: number,
): string {
  const general =
    activeGeneralSettings;

  return new Intl.NumberFormat(
    general.locale,
    {
      style: "currency",
      currency:
        general.currency,
    },
  ).format(value);
}

export function formatNumber(
  value: number,
  maximumFractionDigits?:
    number,
): string {
  const general =
    activeGeneralSettings;

  const fractionDigits =
    maximumFractionDigits ??
    general.decimalPlaces;

  return new Intl.NumberFormat(
    general.locale,
    {
      minimumFractionDigits: 0,

      maximumFractionDigits:
        fractionDigits,
    },
  ).format(value);
}

export function formatPercentage(
  value: number,
): string {
  return `${formatNumber(
    value,
    1,
  )}%`;
}

export function formatStockQuantity(
  quantity: number,
  unit: StockUnit,
): string {
  return `${formatNumber(
    quantity,
  )} ${unitLabels[unit]}`;
}

export function getStockUnitLabel(
  unit: StockUnit,
): string {
  return unitLabels[unit];
}

function createDateFormatter(
  includeTime: boolean,
  longDate = false,
): Intl.DateTimeFormat {
  const general =
    activeGeneralSettings;

  const dateOptions:
    Intl.DateTimeFormatOptions =
    longDate
      ? {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      : general.dateFormat ===
          "yyyy-MM-dd"
        ? {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }
        : {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          };

  return new Intl.DateTimeFormat(
    general.dateFormat ===
      "yyyy-MM-dd"
      ? "sv-SE"
      : general.locale,
    {
      ...dateOptions,

      ...(includeTime
        ? {
            hour: "2-digit",
            minute: "2-digit",
          }
        : {}),

      timeZone:
        general.timezone,
    },
  );
}

function parseDateValue(
  value: string,
): Date {
  return new Date(
    value.includes("T")
      ? value
      : `${value}T12:00:00`,
  );
}

export function formatDate(
  value: string | undefined,
  emptyValue = "—",
): string {
  if (!value) {
    return emptyValue;
  }

  const date =
    parseDateValue(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  try {
    return createDateFormatter(
      false,
    ).format(date);
  } catch {
    return new Intl.DateTimeFormat(
      "pt-BR",
    ).format(date);
  }
}

export function formatDateTime(
  value: string | undefined,
  emptyValue = "—",
): string {
  if (!value) {
    return emptyValue;
  }

  const date =
    parseDateValue(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  try {
    return createDateFormatter(
      true,
    ).format(date);
  } catch {
    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short",
      },
    ).format(date);
  }
}

export function formatLongDate(
  value =
    new Date().toISOString(),
): string {
  const date =
    parseDateValue(value);

  try {
    return createDateFormatter(
      false,
      true,
    ).format(date);
  } catch {
    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    ).format(date);
  }
}