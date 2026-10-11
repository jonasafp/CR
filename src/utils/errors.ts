import {
  ZodError,
} from "zod";

import {
  ApiError,
} from "../api/errors/ApiError";

type ErrorWithCode = {
  code?: unknown;
  message?: unknown;
};

const databaseErrorMessages: Record<string, string> = {
  "23505": "Já existe um cadastro com essas informações.",
  "23503": "Este registro está sendo utilizado e não pode ser removido.",
  "23514": "Os dados informados não atendem às regras do sistema.",
  "42501": "Você não possui permissão para concluir esta operação.",
  PGRST116: "O registro solicitado não foi encontrado.",
};

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
    typeof error === "object" &&
    error !== null
  ) {
    const databaseError = error as ErrorWithCode;
    const code = typeof databaseError.code === "string"
      ? databaseError.code
      : "";

    if (databaseErrorMessages[code]) {
      return databaseErrorMessages[code];
    }

    if (
      typeof databaseError.message === "string" &&
      databaseError.message.toLowerCase().includes("failed to fetch")
    ) {
      return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
    }
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}
