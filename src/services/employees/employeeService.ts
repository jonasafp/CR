import {
  supabase,
} from "../../lib/supabase";
import type {
  Employee,
  InviteEmployeeInput,
  UpdateEmployeeInput,
} from "../../domain/employees/Employee";
import type {
  CompanyMemberRole,
} from "../auth/authService";

type EmployeeRow = {
  id: string;
  user_id: string;
  internal_code: number;
  full_name: string | null;
  email: string | null;
  role: CompanyMemberRole;
  active: boolean;
  invited_at: string | null;
  created_at: string;
};

function mapEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    userId: row.user_id,
    internalCode: row.internal_code,
    fullName: row.full_name ?? "Usuário sem nome",
    email: row.email ?? "E-mail não disponível",
    role: row.role,
    active: row.active,
    invitedAt: row.invited_at,
    createdAt: row.created_at,
  };
}

async function invokeMemberManagement(
  body: Record<string, unknown>,
) {
  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "manage-company-members",
    { body },
  );

  if (error) {
    let message = error.message;
    const context = (
      error as { context?: Response }
    ).context;

    if (context) {
      try {
        const payload = await context.clone().json() as {
          error?: string;
        };

        message = payload.error ?? message;
      } catch {
        // Mantém a mensagem original quando a resposta não contém JSON.
      }
    }

    throw new Error(message);
  }

  if (
    data &&
    typeof data === "object" &&
    "error" in data
  ) {
    throw new Error(String(data.error));
  }

  return data;
}

export const employeeService = {
  async list(companyId: string): Promise<Employee[]> {
    const {
      data,
      error,
    } = await supabase
      .from("company_members")
      .select(
        "id, user_id, internal_code, full_name, email, role, active, invited_at, created_at",
      )
      .eq("company_id", companyId)
      .order("full_name");

    if (error) {
      throw error;
    }

    return (data as EmployeeRow[]).map(mapEmployee);
  },

  async invite(input: InviteEmployeeInput) {
    return invokeMemberManagement({
      action: "invite",
      ...input,
      redirectTo: `${window.location.origin}/definir-senha`,
    });
  },

  async update(input: UpdateEmployeeInput) {
    return invokeMemberManagement({
      action: "update",
      ...input,
    });
  },
};
