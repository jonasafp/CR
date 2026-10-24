import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolvePublicAppUrl,
} from "./publicAppUrl";

describe("resolvePublicAppUrl", () => {
  it("prioriza a URL pública configurada", () => {
    expect(
      resolvePublicAppUrl(
        "https://gestor.exemplo.com/",
        "http://localhost:5173",
      ),
    ).toBe("https://gestor.exemplo.com");
  });

  it("não envia convites para o ambiente local", () => {
    expect(
      resolvePublicAppUrl(undefined, "http://localhost:5173"),
    ).toBe("https://cr-three-ashy.vercel.app");
  });

  it("mantém a origem pública atual quando não existe configuração", () => {
    expect(
      resolvePublicAppUrl(undefined, "https://app.exemplo.com"),
    ).toBe("https://app.exemplo.com");
  });
});
