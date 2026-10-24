export type ControlCompanyStatus = "active" | "inactive";

export interface ControlSession {
  username: string;
  companyId: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
}

export interface ControlOverview {
  companies: number;
  activeCompanies: number;
  users: number;
  sales: number;
  salesTotal: number;
  products: number;
}

export interface ControlCompany {
  id: string;
  legalName: string;
  tradeName: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  status: ControlCompanyStatus;
  createdAt: string;
  users: number;
  products: number;
  sales: number;
  salesTotal: number;
}

export interface ControlGrowthPoint {
  month: string;
  companies: number;
  sales: number;
}

export interface ControlDatabaseSummary {
  companies: number;
  members: number;
  products: number;
  customers: number;
  sales: number;
  saleItems: number;
  financialTransactions: number;
  inventoryMovements: number;
  purchases: number;
  suppliers: number;
}

export interface ControlDashboardData {
  overview: ControlOverview;
  companies: ControlCompany[];
  growth: ControlGrowthPoint[];
  database: ControlDatabaseSummary;
}

export interface ControlCompanyUser {
  id: string;
  userId: string;
  internalCode: number;
  fullName: string | null;
  email: string | null;
  role: "owner" | "admin" | "manager" | "cashier" | "viewer";
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface CreateControlCompanyInput {
  legalName: string;
  tradeName: string;
  document: string;
  ownerName: string;
  ownerEmail: string;
}
