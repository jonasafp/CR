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
        "company_id, role",
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
  };
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