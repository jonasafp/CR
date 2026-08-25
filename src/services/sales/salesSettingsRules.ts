import type {
  SalesSettings,
} from "../../domain/settings/SystemSettings";

export function roundSaleValue(
  value: number,
): number {
  return (
    Math.round(
      (value + Number.EPSILON) *
        100,
    ) / 100
  );
}

export function getMaximumDiscount(
  baseValue: number,
  settings: SalesSettings,
): number {
  const percentage =
    Math.min(
      Math.max(
        settings
          .maximumDiscountPercentage,
        0,
      ),
      100,
    );

  return roundSaleValue(
    Math.max(baseValue, 0) *
      (
        percentage /
        100
      ),
  );
}

export function limitDiscount(
  discount: number,
  baseValue: number,
  settings: SalesSettings,
): number {
  const safeDiscount =
    Number.isFinite(discount)
      ? Math.max(
          discount,
          0,
        )
      : 0;

  return Math.min(
    safeDiscount,

    getMaximumDiscount(
      baseValue,
      settings,
    ),
  );
}