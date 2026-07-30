import { httpClient } from "../../../api/httpClient";

import type {
  CancelSaleInput,
  CreateSaleInput,
  Sale,
  SalesSummary,
} from "../../../domain/sales/Sale";

import type {
  SaleFilters,
} from "../../../domain/sales/SaleFilters";

import {
  mapSaleDtoToDomain,
} from "../../../mappers/sales/saleMapper";

import type {
  PaginatedResult,
} from "../../../types/Pagination";

import type {
  SalesRepository,
} from "../SalesRepository";

interface ApiPaginatedSales {
  items: unknown[];

  page: number;
  pageSize: number;

  totalItems: number;
  totalPages: number;

  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

function createQueryString(
  filters: SaleFilters,
): string {
  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(filters.page),
  );

  params.set(
    "pageSize",
    String(filters.pageSize),
  );

  params.set(
    "sortBy",
    filters.sortBy,
  );

  params.set(
    "sortDirection",
    filters.sortDirection,
  );

  if (filters.search.trim()) {
    params.set(
      "search",
      filters.search.trim(),
    );
  }

  if (filters.status !== "all") {
    params.set(
      "status",
      filters.status,
    );
  }

  if (
    filters.paymentMethod !== "all"
  ) {
    params.set(
      "paymentMethod",
      filters.paymentMethod,
    );
  }

  if (filters.dateFrom) {
    params.set(
      "dateFrom",
      filters.dateFrom,
    );
  }

  if (filters.dateTo) {
    params.set(
      "dateTo",
      filters.dateTo,
    );
  }

  return params.toString();
}

export class ApiSalesRepository
  implements SalesRepository
{
  async list(
    filters: SaleFilters,
  ): Promise<
    PaginatedResult<Sale>
  > {
    const response =
      await httpClient.get<ApiPaginatedSales>(
        `/sales?${createQueryString(
          filters,
        )}`,
      );

    return {
      ...response,

      items:
        response.items.map(
          mapSaleDtoToDomain,
        ),
    };
  }

  async getById(
    saleId: number,
  ): Promise<Sale> {
    const response =
      await httpClient.get<unknown>(
        `/sales/${saleId}`,
      );

    return mapSaleDtoToDomain(
      response,
    );
  }

  async create(
    input: CreateSaleInput,
  ): Promise<Sale> {
    const response =
      await httpClient.post<unknown>(
        "/sales",
        input,
      );

    return mapSaleDtoToDomain(
      response,
    );
  }

  async cancel(
    input: CancelSaleInput,
  ): Promise<Sale> {
    const response =
      await httpClient.post<unknown>(
        `/sales/${input.saleId}/cancel`,
        {
          reason: input.reason,
        },
      );

    return mapSaleDtoToDomain(
      response,
    );
  }

  async getSummary(
    filters?: Partial<SaleFilters>,
  ): Promise<SalesSummary> {
    const params =
      new URLSearchParams();

    if (
      filters?.status &&
      filters.status !== "all"
    ) {
      params.set(
        "status",
        filters.status,
      );
    }

    if (
      filters?.paymentMethod &&
      filters.paymentMethod !== "all"
    ) {
      params.set(
        "paymentMethod",
        filters.paymentMethod,
      );
    }

    const query =
      params.toString();

    return httpClient.get<SalesSummary>(
      `/sales/summary${
        query ? `?${query}` : ""
      }`,
    );
  }
}