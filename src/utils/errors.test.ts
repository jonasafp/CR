import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getErrorMessage,
} from "./errors";

describe("getErrorMessage", () => {
  it("traduz falta de permissão do banco", () => {
    expect(getErrorMessage({ code: "42501" })).toBe(
      "Você não possui permissão para concluir esta operação.",
    );
  });

  it("traduz falha de conexão", () => {
    expect(getErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
    );
  });

  it("preserva mensagens de domínio", () => {
    expect(getErrorMessage(new Error("Estoque insuficiente."))).toBe(
      "Estoque insuficiente.",
    );
  });
});
