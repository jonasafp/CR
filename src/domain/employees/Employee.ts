import type {
  CompanyMemberRole,
} from "../../services/auth/authService";

export type EmployeeRole = Exclude<
  CompanyMemberRole,
  "owner"
>;

export interface Employee {
  id: string;
  userId: string;
  internalCode: number;
  fullName: string;
  email: string;
  role: CompanyMemberRole;
  active: boolean;
  invitedAt: string | null;
  createdAt: string;
}

export interface InviteEmployeeInput {
  companyId: string;
  fullName: string;
  email: string;
  role: EmployeeRole;
}

export interface UpdateEmployeeInput {
  companyId: string;
  memberId: string;
  role: EmployeeRole;
  active: boolean;
}
