import type {
  ReportPeriod,
} from "./Report";

import type {
  ReportPeriodPreset,
} from "./ReportFilters";

export function formatReportDate(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getReportPresetPeriod(
  preset: Exclude<
    ReportPeriodPreset,
    "custom"
  >,
  referenceDate = new Date(),
): ReportPeriod {
  const endDate =
    new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate(),
    );

  const startDate =
    new Date(endDate);

  if (preset === "week") {
    const currentDay =
      startDate.getDay();

    const daysSinceMonday =
      currentDay === 0
        ? 6
        : currentDay - 1;

    startDate.setDate(
      startDate.getDate() -
        daysSinceMonday,
    );
  } else if (
    preset === "month"
  ) {
    startDate.setDate(1);
  } else if (
    preset === "quarter"
  ) {
    const quarterStartMonth =
      Math.floor(
        startDate.getMonth() / 3,
      ) * 3;

    startDate.setMonth(
      quarterStartMonth,
      1,
    );
  } else if (
    preset === "year"
  ) {
    startDate.setMonth(0, 1);
  }

  return {
    dateFrom:
      formatReportDate(
        startDate,
      ),

    dateTo:
      formatReportDate(
        endDate,
      ),
  };
}

export function isValidReportPeriod(
  period: ReportPeriod,
): boolean {
  if (
    !period.dateFrom ||
    !period.dateTo
  ) {
    return false;
  }

  return (
    period.dateFrom <=
    period.dateTo
  );
}

export function getReportPeriodLabel(
  period: ReportPeriod,
): string {
  const dateFormatter =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        timeZone: "UTC",
      },
    );

  const startDate =
    new Date(
      `${period.dateFrom}T00:00:00Z`,
    );

  const endDate =
    new Date(
      `${period.dateTo}T00:00:00Z`,
    );

  if (
    period.dateFrom ===
    period.dateTo
  ) {
    return dateFormatter.format(
      startDate,
    );
  }

  return `${dateFormatter.format(
    startDate,
  )} a ${dateFormatter.format(
    endDate,
  )}`;
}