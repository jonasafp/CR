import type {
  SalesSettings,
} from "../../domain/settings/SystemSettings";

export const SALE_COMPLETED_EVENT =
  "gestor-facil:sale-completed";

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

export function notifySaleCompleted(
  saleId: number,
  shouldPrint: boolean,
): void {
  window.dispatchEvent(
    new CustomEvent(
      SALE_COMPLETED_EVENT,
      {
        detail: {
          saleId,
          shouldPrint,
        },
      },
    ),
  );
}