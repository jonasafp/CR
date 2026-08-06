import {
  httpClient,
} from "../../../api/httpClient";

import type {
  FinancialFilters,
} from "../../../domain/financial/FinancialFilters";

import type {
  CancelFinancialTransactionInput,
  CreateFinancialTransactionInput,
  FinancialCategorySummary,
  FinancialSummary,
  FinancialTransaction,
  FinancialTransactionType,
  SettleFinancialTransactionInput,
  UpdateFinancialTransactionInput,
} from "../../../domain/financial/FinancialTransaction";

import {
  mapFinancialTransactionDtoToDomain,
} from "../../../mappers/financial/financialTransactionMapper";

import type {
  PaginatedResult,
} from "../../../types/Pagination";

import type {
  FinancialRepository,
} from "../FinancialRepository";

interface ApiPaginatedFinancialTransactions {
  items: unknown[];

  page: number;
  pageSize: number;

  totalItems: number;
  totalPages: number;

  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

function createQueryString(
  filters:
    FinancialFilters,
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

  if (
    filters.search.trim()
  ) {
    params.set(
      "search",
      filters.search.trim(),
    );
  }

  if (
    filters.type !==
    "all"
  ) {
    params.set(
      "type",
      filters.type,
    );
  }

  if (
    filters.status !==
    "all"
  ) {
    params.set(
      "status",
      filters.status,
    );
  }

  if (
    filters.source !==
    "all"
  ) {
    params.set(
      "source",
      filters.source,
    );
  }

  if (
    filters.category !==
    "all"
  ) {
    params.set(
      "category",
      filters.category,
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

function createSummaryQueryString(
  filters?:
    Partial<FinancialFilters>,
): string {
  const params =
    new URLSearchParams();

  if (
    filters?.type &&
    filters.type !== "all"
  ) {
    params.set(
      "type",
      filters.type,
    );
  }

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
    filters?.source &&
    filters.source !== "all"
  ) {
    params.set(
      "source",
      filters.source,
    );
  }

  if (
    filters?.category &&
    filters.category !== "all"
  ) {
    params.set(
      "category",
      filters.category,
    );
  }

  if (
    filters?.dateFrom
  ) {
    params.set(
      "dateFrom",
      filters.dateFrom,
    );
  }

  if (
    filters?.dateTo
  ) {
    params.set(
      "dateTo",
      filters.dateTo,
    );
  }

  return params.toString();
}

export class ApiFinancialRepository
  implements FinancialRepository
{
  async list(
    filters:
      FinancialFilters,
  ): Promise<
    PaginatedResult<
      FinancialTransaction
    >
  > {
    const response =
      await httpClient.get<
        ApiPaginatedFinancialTransactions
      >(
        `/financial-transactions?${createQueryString(
          filters,
        )}`,
      );

    return {
      ...response,

      items:
        response.items.map(
          mapFinancialTransactionDtoToDomain,
        ),
    };
  }

  async getById(
    transactionId: number,
  ): Promise<FinancialTransaction> {
    const response =
      await httpClient.get<unknown>(
        `/financial-transactions/${transactionId}`,
      );

    return mapFinancialTransactionDtoToDomain(
      response,
    );
  }

  async create(
    input:
      CreateFinancialTransactionInput,
  ): Promise<FinancialTransaction> {
    const response =
      await httpClient.post<unknown>(
        "/financial-transactions",
        input,
      );

    return mapFinancialTransactionDtoToDomain(
      response,
    );
  }

  async update(
    input:
      UpdateFinancialTransactionInput,
  ): Promise<FinancialTransaction> {
    const response =
      await httpClient.put<unknown>(
        `/financial-transactions/${input.transactionId}`,
        {
          type:
            input.type,

          description:
            input.description,

          category:
            input.category,

          amount:
            input.amount,

          dueDate:
            input.dueDate,

          status:
            input.status,

          paymentDate:
            input.paymentDate,

          paymentMethod:
            input.paymentMethod,

          customerOrSupplier:
            input.customerOrSupplier,

          notes:
            input.notes,
        },
      );

    return mapFinancialTransactionDtoToDomain(
      response,
    );
  }

  async settle(
    input:
      SettleFinancialTransactionInput,
  ): Promise<FinancialTransaction> {
    const response =
      await httpClient.post<unknown>(
        `/financial-transactions/${input.transactionId}/settle`,
        {
          paymentDate:
            input.paymentDate,

          paymentMethod:
            input.paymentMethod,
        },
      );

    return mapFinancialTransactionDtoToDomain(
      response,
    );
  }

  async cancel(
    input:
      CancelFinancialTransactionInput,
  ): Promise<FinancialTransaction> {
    const response =
      await httpClient.post<unknown>(
        `/financial-transactions/${input.transactionId}/cancel`,
        {
          reason:
            input.reason,
        },
      );

    return mapFinancialTransactionDtoToDomain(
      response,
    );
  }

  async getSummary(
    filters?:
      Partial<FinancialFilters>,
  ): Promise<FinancialSummary> {
    const query =
      createSummaryQueryString(
        filters,
      );

    return httpClient.get<
      FinancialSummary
    >(
      `/financial-transactions/summary${
        query
          ? `?${query}`
          : ""
      }`,
    );
  }

  async getCategorySummary(
    filters?:
      Partial<FinancialFilters>,
  ): Promise<
    FinancialCategorySummary[]
  > {
    const query =
      createSummaryQueryString(
        filters,
      );

    return httpClient.get<
      FinancialCategorySummary[]
    >(
      `/financial-transactions/category-summary${
        query
          ? `?${query}`
          : ""
      }`,
    );
  }

  async listCategories(
    type?:
      FinancialTransactionType,
  ): Promise<string[]> {
    const params =
      new URLSearchParams();

    if (type) {
      params.set(
        "type",
        type,
      );
    }

    const query =
      params.toString();

    return httpClient.get<
      string[]
    >(
      `/financial-transactions/categories${
        query
          ? `?${query}`
          : ""
      }`,
    );
  }
}