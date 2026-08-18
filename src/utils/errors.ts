import {
  ZodError,
} from "zod";

import {
  ApiError,
} from "../api/errors/ApiError";

export function getErrorMessage(
  error: unknown,
  fallback =
    "Não foi possível concluir a operação.",
): string {
  if (
    error instanceof ApiError
  ) {
    return error.message;
  }

  if (
    error instanceof ZodError
  ) {
    return (
      error.issues[0]
        ?.message ??
      fallback
    );
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}