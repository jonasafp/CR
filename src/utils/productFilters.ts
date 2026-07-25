import type { Product } from "../types/Product";
import type { ProductFiltersState } from "../types/ProductFilters";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function isProductOutOfStock(
  product: Product,
): boolean {
  return product.stockQuantity <= 0;
}

export function isProductLowStock(
  product: Product,
): boolean {
  return (
    product.stockQuantity > 0 &&
    product.stockQuantity <= product.minimumStock
  );
}

export function isProductAvailable(
  product: Product,
): boolean {
  return product.stockQuantity > product.minimumStock;
}

export function filterProducts(
  products: Product[],
  filters: ProductFiltersState,
): Product[] {
  const normalizedSearch = normalizeText(filters.search);

  return products.filter((product) => {
    const searchableContent = normalizeText(
      [
        product.name,
        product.code,
        product.barcode ?? "",
        product.category,
        product.description ?? "",
      ].join(" "),
    );

    const matchesSearch =
      !normalizedSearch ||
      searchableContent.includes(normalizedSearch);

    const matchesCategory =
      filters.category === "all" ||
      product.category === filters.category;

    const matchesStatus =
      filters.status === "all" ||
      product.status === filters.status;

    const matchesUnit =
      filters.unit === "all" ||
      product.stockUnit === filters.unit;

    let matchesStock = true;

    if (filters.stock === "available") {
      matchesStock = isProductAvailable(product);
    }

    if (filters.stock === "low") {
      matchesStock = isProductLowStock(product);
    }

    if (filters.stock === "out") {
      matchesStock = isProductOutOfStock(product);
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesUnit &&
      matchesStock
    );
  });
}

export function getProductCategories(
  products: Product[],
): string[] {
  return Array.from(
    new Set(
      products
        .map((product) => product.category.trim())
        .filter(Boolean),
    ),
  ).sort((categoryA, categoryB) =>
    categoryA.localeCompare(categoryB, "pt-BR"),
  );
}