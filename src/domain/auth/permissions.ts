import type {
  CompanyMemberRole,
} from "../../services/auth/authService";

export type AppPermission =
  | "viewDashboard"
  | "manageInventory"
  | "manageProducts"
  | "createSales"
  | "manageFinancial"
  | "viewReports"
  | "manageCustomers"
  | "manageSuppliers"
  | "managePurchases"
  | "manageSettings";

const allPermissions: AppPermission[] = [
  "viewDashboard",
  "manageInventory",
  "manageProducts",
  "createSales",
  "manageFinancial",
  "viewReports",
  "manageCustomers",
  "manageSuppliers",
  "managePurchases",
  "manageSettings",
];

const permissionsByRole: Record<
  CompanyMemberRole,
  readonly AppPermission[]
> = {
  owner: allPermissions,
  admin: allPermissions,
  manager: allPermissions,
  cashier: [
    "viewDashboard",
    "createSales",
  ],
  viewer: [
    "viewDashboard",
    "viewReports",
  ],
};

export function hasPermission(
  role: CompanyMemberRole | null | undefined,
  permission: AppPermission,
) {
  return role
    ? permissionsByRole[role].includes(permission)
    : false;
}

export function getRoleLabel(
  role: CompanyMemberRole | null | undefined,
) {
  const labels: Record<CompanyMemberRole, string> = {
    owner: "Proprietário",
    admin: "Administrador",
    manager: "Gerente",
    cashier: "Operador de caixa",
    viewer: "Consulta",
  };

  return role
    ? labels[role]
    : "Usuário";
}
