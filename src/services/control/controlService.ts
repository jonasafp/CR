import {
  supabase,
} from "../../lib/supabase";

import type {
  ControlCompanyStatus,
  ControlCompanyUser,
  ControlDashboardData,
  ControlSession,
  CreateControlCompanyInput,
} from "../../domain/control/Control";

type RpcResult<T> = Promise<{
  data: T | null;
  error: { message: string } | null;
}>;

type ControlRpc = (
  name:
    | "get_control_session"
    | "control_get_dashboard"
    | "control_get_company_users",
  parameters?: Record<string, unknown>,
) => RpcResult<unknown>;

async function invokeControl(
  body: Record<string, unknown>,
) {
  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "control-admin",
    { body },
  );

  if (error) {
    let message = error.message;
    const context = (error as { context?: Response }).context;

    if (context) {
      try {
        const payload = await context.clone().json() as { error?: string };
        message = payload.error ?? message;
      } catch {
        // Mantém a mensagem original quando não existe JSON na resposta.
      }
    }

    throw new Error(message);
  }

  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String(data.error));
  }

  return data as Record<string, unknown>;
}

async function rpc<T>(
  name: Parameters<ControlRpc>[0],
  parameters?: Record<string, unknown>,
) {
  const execute = supabase.rpc.bind(supabase) as unknown as ControlRpc;
  const { data, error } = await execute(name, parameters);

  if (error) {
    throw new Error(error.message);
  }

  return data as T | null;
}

export const controlService = {
  async signIn(username: string, password: string) {
    const result = await invokeControl({
      action: "login",
      username: username.trim().toLowerCase(),
      password,
    });

    const tokenHash = String(result.tokenHash ?? "");

    if (!tokenHash) {
      throw new Error("Não foi possível iniciar a sessão de controle.");
    }

    const {
      data,
      error,
    } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    if (error || !data.session) {
      throw error ?? new Error("Sessão de controle não criada.");
    }

    return data.session;
  },

  async getSession() {
    return rpc<ControlSession>("get_control_session");
  },

  async getDashboard() {
    const data = await rpc<ControlDashboardData>("control_get_dashboard");

    if (!data) {
      throw new Error("Não foi possível carregar o sistema de controle.");
    }

    return data;
  },

  async getCompanyUsers(companyId: string) {
    return (
      await rpc<ControlCompanyUser[]>(
        "control_get_company_users",
        { p_company_id: companyId },
      )
    ) ?? [];
  },

  async createCompany(input: CreateControlCompanyInput) {
    return invokeControl({
      action: "create-company",
      ...input,
      redirectTo: `${window.location.origin}/definir-senha`,
    });
  },

  async setCompanyStatus(
    companyId: string,
    status: ControlCompanyStatus,
  ) {
    return invokeControl({
      action: "set-company-status",
      companyId,
      status,
    });
  },

  async requestPasswordChange(memberId: string) {
    return invokeControl({
      action: "request-password-change",
      memberId,
      redirectTo: `${window.location.origin}/definir-senha`,
    });
  },

  async changePassword(password: string) {
    return invokeControl({
      action: "change-password",
      password,
    });
  },
};
