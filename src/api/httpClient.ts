import { apiConfig } from "./apiConfig";

import { ApiError } from "./errors/ApiError";

import type {
  ApiErrorResponse,
  ApiResponse,
} from "../types/Api";

interface RequestOptions
  extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeout?: number;
}

function createUrl(
  path: string,
): string {
  const normalizedBaseUrl =
    apiConfig.baseUrl.replace(/\/$/, "");

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

async function parseResponseBody(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get("content-type");

  if (
    contentType?.includes(
      "application/json",
    )
  ) {
    return response.json();
  }

  const text = await response.text();

  return text || null;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller =
    new AbortController();

  const timeout =
    options.timeout ??
    apiConfig.timeout;

  const timeoutId = window.setTimeout(
    () => controller.abort(),
    timeout,
  );

  try {
    const response = await fetch(
      createUrl(path),
      {
        ...options,

        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/json",

          ...options.headers,
        },

        body:
          options.body !== undefined
            ? JSON.stringify(options.body)
            : undefined,

        signal: controller.signal,
      },
    );

    const responseBody =
      await parseResponseBody(response);

    if (!response.ok) {
      const errorBody =
        responseBody as
          | ApiErrorResponse
          | null;

      throw new ApiError(
        errorBody?.message ??
          "Não foi possível concluir a requisição.",

        response.status,
        errorBody?.code,
        errorBody?.errors,
      );
    }

    const wrappedResponse =
      responseBody as ApiResponse<T>;

    if (
      wrappedResponse &&
      typeof wrappedResponse === "object" &&
      "data" in wrappedResponse
    ) {
      return wrappedResponse.data;
    }

    return responseBody as T;
  } catch (error) {
    if (
      error instanceof ApiError
    ) {
      throw error;
    }

    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new ApiError(
        "A requisição excedeu o tempo limite.",
        408,
        "REQUEST_TIMEOUT",
      );
    }

    throw new ApiError(
      "Não foi possível conectar ao servidor.",
      0,
      "NETWORK_ERROR",
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const httpClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, {
      method: "GET",
    });
  },

  post<T>(
    path: string,
    body?: unknown,
  ): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body,
    });
  },

  put<T>(
    path: string,
    body?: unknown,
  ): Promise<T> {
    return request<T>(path, {
      method: "PUT",
      body,
    });
  },

  patch<T>(
    path: string,
    body?: unknown,
  ): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body,
    });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, {
      method: "DELETE",
    });
  },
};