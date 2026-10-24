import {
  supabase,
} from "../../lib/supabase";

export type CompanyMemberRole =
  | "owner"
  | "admin"
  | "manager"
  | "cashier"
  | "viewer";

export type CurrentCompanyMembership = {
  company_id:
  string;

  role:
  CompanyMemberRole;

  full_name: string;
  internal_code: number;
  must_change_password: boolean;
};

type BootstrapCompanyInput = {
  legalName:
  string;

  tradeName:
  string;

  document?:
  string;
};

export async function signIn(
  email:
    string,

  password:
    string,
) {
  const {
    data,
    error,
  } =
    await supabase.auth
      .signInWithPassword({
        email:
          email.trim(),

        password,
      });

  if (
    error
  ) {
    throw error;
  }

  return data;
}

export async function signUp(
  email:
    string,

  password:
    string,
) {
  const {
    data,
    error,
  } =
    await supabase.auth
      .signUp({
        email:
          email.trim(),

        password,

        options: {
          emailRedirectTo:
            `${window.location.origin}/login`,
        },
      });

  if (
    error
  ) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const {
    error,
  } =
    await supabase.auth
      .signOut({
        scope:
          "local",
      });

  if (
    error
  ) {
    throw error;
  }
}

export async function getCurrentCompanyMembership():
  Promise<
    CurrentCompanyMembership
    | null
  > {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "company_members",
      )
      .select(
        "company_id, role, full_name, internal_code, must_change_password",
      )
      .eq(
        "active",
        true,
      )
      .maybeSingle();

  if (
    error
  ) {
    throw error;
  }

  if (
    !data
  ) {
    return null;
  }

  return {
    company_id:
      data.company_id,

    role:
      data.role,

    full_name:
      data.full_name ?? "Usuário do sistema",

    internal_code:
      data.internal_code,

    must_change_password:
      data.must_change_password,
  };
}

export async function quickSwitchUser(
  companyId: string,
  internalCode: number,
  password: string,
) {
  const { data, error } = await supabase.functions.invoke(
    "quick-switch-user",
    {
      body: { companyId, internalCode, password },
    },
  );

  if (error) {
    let message = error.message;
    const context = (error as { context?: Response }).context;

    if (context) {
      try {
        const payload = await context.clone().json() as { error?: string };
        message = payload.error ?? message;
      } catch {
        // Mantém a mensagem original quando a resposta não contém JSON.
      }
    }

    throw new Error(message);
  }

  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error(data?.error ?? "Não foi possível trocar o usuário.");
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.accessToken,
    refresh_token: data.refreshToken,
  });

  if (sessionError) {
    throw sessionError;
  }

  return String(data.employeeName ?? "Usuário");
}

type BootstrapCompanyRpc =
  (
    functionName:
      "bootstrap_company",

    parameters: {
      p_legal_name:
      string;

      p_trade_name:
      string;

      p_document?:
      string;
    },
  ) =>
    Promise<{
      data:
      string
      | null;

      error:
      {
        message:
        string;
      }
      | null;
    }>;

export async function bootstrapCompany({
  legalName,
  tradeName,
  document,
}: BootstrapCompanyInput) {
  const executeRpc =
    supabase.rpc.bind(
      supabase,
    ) as unknown as
    BootstrapCompanyRpc;

  const {
    data,
    error,
  } =
    await executeRpc(
      "bootstrap_company",
      {
        p_legal_name:
          legalName.trim(),

        p_trade_name:
          tradeName.trim(),

        p_document:
          document
            ?.trim() ||
          undefined,
      },
    );

  if (
    error
  ) {
    throw new Error(
      error.message,
    );
  }

  return data;
}

export function getAuthErrorMessage(
  error:
    unknown,
) {
  if (
    !(error instanceof Error)
  ) {
    return "Ocorreu um erro inesperado.";
  }

  const message =
    error.message
      .toLowerCase();

  if (
    message.includes(
      "invalid login credentials",
    )
  ) {
    return "E-mail ou senha inválidos.";
  }

  if (
    message.includes(
      "email not confirmed",
    )
  ) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (
    message.includes(
      "user already registered",
    )
  ) {
    return "Este e-mail já está cadastrado.";
  }

  if (
    message.includes(
      "password",
    )
  ) {
    return "A senha informada não atende aos requisitos de segurança.";
  }

  if (
    message.includes(
      "user_already_has_company",
    )
  ) {
    return "Este usuário já possui uma empresa cadastrada.";
  }

  if (
    message.includes(
      "duplicate key",
    )
  ) {
    return "Já existe um cadastro com essas informações.";
  }

  return error.message;
}
