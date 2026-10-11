import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getRoleLabel,
  hasPermission,
} from "./permissions";

describe("permissions", () => {
  it("permite que o proprietário acesse todos os módulos", () => {
    expect(hasPermission("owner", "manageSettings")).toBe(true);
    expect(hasPermission("owner", "manageFinancial")).toBe(true);
  });

  it("limita o operador de caixa ao painel e às vendas", () => {
    expect(hasPermission("cashier", "createSales")).toBe(true);
    expect(hasPermission("cashier", "manageProducts")).toBe(false);
    expect(hasPermission("cashier", "manageSettings")).toBe(false);
  });

  it("mantém o usuário de consulta sem acesso de gestão", () => {
    expect(hasPermission("viewer", "viewReports")).toBe(true);
    expect(hasPermission("viewer", "manageInventory")).toBe(false);
  });

  it("fornece nomes amigáveis para os papéis", () => {
    expect(getRoleLabel("manager")).toBe("Gerente");
    expect(getRoleLabel(null)).toBe("Usuário");
  });
});
