import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createClient,
} from "npm:@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

type JsonRecord = Record<string, unknown>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function normalizeDocument(value: unknown) {
  const document = String(value ?? "").replace(/\D/g, "");
  return document || null;
}

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Configuração segura indisponível." }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const body = await request.json() as JsonRecord;
    const action = String(body.action ?? "");

    if (action === "login") {
      const username = String(body.username ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");

      if (!username || !password) {
        return json({ error: "Informe o usuário e a senha." }, 400);
      }

      const {
        data: credential,
        error: credentialError,
      } = await admin.rpc("control_verify_credentials", {
        p_username: username,
        p_password: password,
      });

      if (credentialError) {
        throw credentialError;
      }

      if (!credential) {
        return json({ error: "Usuário ou senha inválidos." }, 401);
      }

      if (credential.locked) {
        return json({
          error: "Acesso temporariamente bloqueado. Tente novamente em 15 minutos.",
        }, 429);
      }

      let userId = credential.userId as string | null;
      const email = String(credential.email);

      if (!userId) {
        const bootstrapPassword = `${crypto.randomUUID()}Aa1!`;
        const {
          data: createData,
          error: createError,
        } = await admin.auth.admin.createUser({
          email,
          password: bootstrapPassword,
          email_confirm: true,
          app_metadata: {
            account_type: "control_admin",
          },
          user_metadata: {
            full_name: "Administrador Jiah",
          },
        });

        if (createError || !createData.user) {
          throw createError ?? new Error("Não foi possível inicializar o administrador.");
        }

        userId = createData.user.id;

        const {
          error: linkError,
        } = await admin.rpc("control_link_bootstrap_user", {
          p_control_admin_id: credential.id,
          p_user_id: userId,
        });

        if (linkError) {
          await admin.auth.admin.deleteUser(userId);
          throw linkError;
        }
      }

      const {
        data: linkData,
        error: linkError,
      } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

      if (linkError || !linkData.properties?.hashed_token) {
        throw linkError ?? new Error("Não foi possível gerar a sessão de controle.");
      }

      await admin.rpc("control_mark_login", {
        p_user_id: userId,
      });

      return json({
        email,
        tokenHash: linkData.properties.hashed_token,
        mustChangePassword: credential.mustChangePassword === true,
      });
    }

    const authorization = request.headers.get("Authorization");
    const token = authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return json({ error: "Sessão não encontrada." }, 401);
    }

    const {
      data: userData,
      error: userError,
    } = await admin.auth.getUser(token);

    if (userError || !userData.user) {
      return json({ error: "Sessão inválida ou expirada." }, 401);
    }

    const {
      data: isControlAdmin,
      error: permissionError,
    } = await admin.rpc("control_is_admin_user", {
      p_user_id: userData.user.id,
    });

    if (permissionError || !isControlAdmin) {
      return json({ error: "Acesso restrito ao sistema de controle." }, 403);
    }

    if (action === "change-password") {
      const password = String(body.password ?? "");

      if (password.length < 8) {
        return json({ error: "A nova senha deve possuir pelo menos 8 caracteres." }, 400);
      }

      const {
        error: authUpdateError,
      } = await admin.auth.admin.updateUserById(
        userData.user.id,
        { password },
      );

      if (authUpdateError) {
        throw authUpdateError;
      }

      const {
        error: passwordError,
      } = await admin.rpc("control_set_password", {
        p_user_id: userData.user.id,
        p_password: password,
      });

      if (passwordError) {
        throw passwordError;
      }

      return json({ success: true });
    }

    if (action === "create-company") {
      const legalName = String(body.legalName ?? "").trim();
      const tradeName = String(body.tradeName ?? "").trim();
      const document = normalizeDocument(body.document);
      const ownerName = String(body.ownerName ?? "").trim();
      const ownerEmail = String(body.ownerEmail ?? "").trim().toLowerCase();
      const redirectTo = String(body.redirectTo ?? "");

      if (legalName.length < 2 || tradeName.length < 2) {
        return json({ error: "Informe a razão social e o nome fantasia." }, 400);
      }

      if (ownerName.length < 3 || !isEmail(ownerEmail)) {
        return json({ error: "Informe o nome e o e-mail do responsável." }, 400);
      }

      if (document && ![11, 14].includes(document.length)) {
        return json({ error: "Informe um CPF ou CNPJ válido." }, 400);
      }

      const {
        data: existingCompany,
      } = document
        ? await admin.from("companies").select("id").eq("document", document).maybeSingle()
        : { data: null };

      if (existingCompany) {
        return json({ error: "Já existe uma empresa com este documento." }, 409);
      }

      const {
        data: usersData,
        error: usersError,
      } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

      if (usersError) {
        throw usersError;
      }

      if (usersData.users.some((user) => user.email?.toLowerCase() === ownerEmail)) {
        return json({ error: "Este e-mail já pertence a outro usuário." }, 409);
      }

      const inviteOptions: {
        data: { full_name: string };
        redirectTo?: string;
      } = {
        data: { full_name: ownerName },
      };

      if (/^https:\/\//i.test(redirectTo) || /^http:\/\/localhost(?::\d+)?/i.test(redirectTo)) {
        inviteOptions.redirectTo = redirectTo;
      }

      const {
        data: inviteData,
        error: inviteError,
      } = await admin.auth.admin.inviteUserByEmail(ownerEmail, inviteOptions);

      if (inviteError || !inviteData.user) {
        throw inviteError ?? new Error("Não foi possível convidar o responsável.");
      }

      const {
        data: company,
        error: companyError,
      } = await admin.from("companies").insert({
        legal_name: legalName,
        trade_name: tradeName,
        document,
        email: ownerEmail,
        status: "active",
      }).select("id").single();

      if (companyError || !company) {
        await admin.auth.admin.deleteUser(inviteData.user.id);
        throw companyError ?? new Error("Não foi possível cadastrar a empresa.");
      }

      const {
        error: membershipError,
      } = await admin.from("company_members").insert({
        company_id: company.id,
        user_id: inviteData.user.id,
        role: "owner",
        active: true,
        full_name: ownerName,
        email: ownerEmail,
        invited_at: new Date().toISOString(),
        invited_by: userData.user.id,
        must_change_password: true,
      });

      if (membershipError) {
        await admin.from("companies").delete().eq("id", company.id);
        await admin.auth.admin.deleteUser(inviteData.user.id);
        throw membershipError;
      }

      return json({ success: true, companyId: company.id });
    }

    if (action === "set-company-status") {
      const companyId = String(body.companyId ?? "");
      const status = String(body.status ?? "");

      if (!companyId || !["active", "inactive"].includes(status)) {
        return json({ error: "Empresa ou status inválido." }, 400);
      }

      const {
        error: updateError,
      } = await admin.from("companies")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", companyId);

      if (updateError) {
        throw updateError;
      }

      return json({ success: true });
    }

    if (action === "request-password-change") {
      const memberId = String(body.memberId ?? "");
      const redirectTo = String(body.redirectTo ?? "");

      const {
        data: member,
        error: memberError,
      } = await admin.from("company_members")
        .select("id, email")
        .eq("id", memberId)
        .maybeSingle();

      if (memberError || !member) {
        return json({ error: "Usuário não encontrado." }, 404);
      }

      const {
        error: flagError,
      } = await admin.from("company_members").update({
        must_change_password: true,
        password_change_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", memberId);

      if (flagError) {
        throw flagError;
      }

      if (member.email && !member.email.endsWith(".internal")) {
        const options = /^https?:\/\//i.test(redirectTo)
          ? { redirectTo }
          : undefined;

        const {
          error: resetError,
        } = await admin.auth.resetPasswordForEmail(member.email, options);

        if (resetError) {
          throw resetError;
        }
      }

      return json({ success: true });
    }

    return json({ error: "Ação inválida." }, 400);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Não foi possível concluir a operação.";

    return json({ error: message }, 500);
  }
});
