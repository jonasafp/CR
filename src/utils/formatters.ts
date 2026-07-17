import type { StockUnit } from "../types/Product";

const unitLabels: Record<StockUnit, string> = {
  kg: "kg",
  g: "g",
  un: "un.",
  l: "L",
  ml: "ml",
  cx: "cx.",
  pct: "pct.",
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(
  value: number,
  maximumFractionDigits = 2,
): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

export function formatStockQuantity(
  quantity: number,
  unit: StockUnit,
): string {
  return `${formatNumber(quantity)} ${unitLabels[unit]}`;
}

export function getStockUnitLabel(
  unit: StockUnit,
): string {
  return unitLabels[unit];
}