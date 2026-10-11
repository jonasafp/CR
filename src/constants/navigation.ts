import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  Package,
  ShoppingCart,
  Users,
  Truck,
  ShoppingBasket,
  WalletCards,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { BusinessModules } from "../types/Business";
import type { AppPermission } from "../domain/auth/permissions";

export type BusinessModuleKey = keyof BusinessModules;

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  module: BusinessModuleKey;
  permission: AppPermission;
  end?: boolean;
}

export const mainNavigationItems: NavigationItem[] = [
  {
    label: "Resumo",
    path: "/",
    icon: BarChart3,
    module: "dashboard",
    permission: "viewDashboard",
    end: true,
  },
  {
    label: "Estoque",
    path: "/estoque",
    icon: Boxes,
    module: "inventory",
    permission: "manageInventory",
  },
  {
    label: "Produtos",
    path: "/produtos",
    icon: Package,
    module: "products",
    permission: "manageProducts",
  },
  {
    label: "Vendas",
    path: "/vendas",
    icon: ShoppingCart,
    module: "sales",
    permission: "createSales",
  },
  {
    label: "Financeiro",
    path: "/financeiro",
    icon: CircleDollarSign,
    module: "finance",
    permission: "manageFinancial",
  },
  {
    label: "Relatórios",
    path: "/relatorios",
    icon: BarChart3,
    module: "reports",
    permission: "viewReports",
  },
  {
    label: "Clientes",
    path: "/clientes",
    icon: Users,
    module: "customers",
    permission: "manageCustomers",
  },
  {
    label: "Fornecedores",
    path: "/fornecedores",
    icon: Truck,
    module: "suppliers",
    permission: "manageSuppliers",
  },
  {
    label: "Compras",
    path: "/compras",
    icon: ShoppingBasket,
    module: "purchases",
    permission: "managePurchases",
  },
  {
    label: "Caixa",
    path: "/caixa",
    icon: WalletCards,
    module: "cashRegister",
    permission: "manageFinancial",
  },
];
