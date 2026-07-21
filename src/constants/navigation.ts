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

export type BusinessModuleKey = keyof BusinessModules;

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  module: BusinessModuleKey;
  end?: boolean;
}

export const mainNavigationItems: NavigationItem[] = [
  {
    label: "Resumo",
    path: "/",
    icon: BarChart3,
    module: "dashboard",
    end: true,
  },
  {
    label: "Estoque",
    path: "/estoque",
    icon: Boxes,
    module: "inventory",
  },
  {
    label: "Produtos",
    path: "/produtos",
    icon: Package,
    module: "products",
  },
  {
    label: "Vendas",
    path: "/vendas",
    icon: ShoppingCart,
    module: "sales",
  },
  {
    label: "Financeiro",
    path: "/financeiro",
    icon: CircleDollarSign,
    module: "finance",
  },
  {
    label: "Relatórios",
    path: "/relatorios",
    icon: BarChart3,
    module: "reports",
  },
  {
    label: "Clientes",
    path: "/clientes",
    icon: Users,
    module: "customers",
  },
  {
    label: "Fornecedores",
    path: "/fornecedores",
    icon: Truck,
    module: "suppliers",
  },
  {
    label: "Compras",
    path: "/compras",
    icon: ShoppingBasket,
    module: "purchases",
  },
  {
    label: "Caixa",
    path: "/caixa",
    icon: WalletCards,
    module: "cashRegister",
  },
];