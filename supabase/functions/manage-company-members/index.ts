import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createClient,
} from "npm:@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

const allowedRoles = new Set([
  "admin",
  "manager",
  "cashier",
  "viewer",
]);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return response({ error: "Método não permitido." }, 405);
  }

  try {
    const authorization = request.headers.get("Authorization");
    const token = authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return response({ error: "Sessão não encontrada." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Configuração segura do servidor indisponível.");
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: userData,
      error: userError,
    } = await admin.auth.getUser(token);

    if (userError || !userData.user) {
      return response({ error: "Sessão inválida ou expirada." }, 401);
    }

    const body = await request.json();
    const companyId = String(body.companyId ?? "");

    const {
      data: callerMembership,
      error: callerError,
    } = await admin
      .from("company_members")
      .select("id, role, active")
      .eq("company_id", companyId)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (
      callerError ||
      !callerMembership?.active ||
      !["owner", "admin"].includes(callerMembership.role)
    ) {
      return response(
        { error: "Você não possui permissão para gerenciar funcionários." },
        403,
      );
    }

    if (body.action === "invite") {
      const fullName = String(body.fullName ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const role = String(body.role ?? "");
      const redirectTo = String(body.redirectTo ?? "");

      if (fullName.length < 3) {
        return response({ error: "Informe o nome completo do funcionário." }, 400);
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return response({ error: "Informe um e-mail válido." }, 400);
      }

      if (!allowedRoles.has(role)) {
        return response({ error: "A função selecionada é inválida." }, 400);
      }

      const {
        data: existingMembership,
      } = await admin
        .from("company_members")
        .select("id")
        .eq("company_id", companyId)
        .ilike("email", email)
        .maybeSingle();

      if (existingMembership) {
        return response({ error: "Este e-mail já pertence à empresa." }, 409);
      }

      const {
        data: usersData,
        error: usersError,
      } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

      if (usersError) {
        throw usersError;
      }

      let invitedUser = usersData.users.find(
        (user) => user.email?.toLowerCase() === email,
      );
      let createdByInvite = false;

      if (!invitedUser) {
        const inviteOptions: {
          data: { full_name: string };
          redirectTo?: string;
        } = {
          data: { full_name: fullName },
        };

        if (/^https?:\/\//i.test(redirectTo)) {
          inviteOptions.redirectTo = redirectTo;
        }

        const {
          data: inviteData,
          error: inviteError,
        } = await admin.auth.admin.inviteUserByEmail(email, inviteOptions);

        if (inviteError) {
          throw inviteError;
        }

        invitedUser = inviteData.user;
        createdByInvite = true;
      }

      const {
        data: anotherMembership,
      } = await admin
        .from("company_members")
        .select("id")
        .eq("user_id", invitedUser.id)
        .maybeSingle();

      if (anotherMembership) {
        return response(
          { error: "Este usuário já está vinculado a uma empresa." },
          409,
        );
      }

      const {
        error: insertError,
      } = await admin.from("company_members").insert({
        company_id: companyId,
        user_id: invitedUser.id,
        full_name: fullName,
        email,
        role,
        active: true,
        invited_at: new Date().toISOString(),
        invited_by: userData.user.id,
      });

      if (insertError) {
        if (createdByInvite) {
          await admin.auth.admin.deleteUser(invitedUser.id);
        }

        throw insertError;
      }

      return response({ success: true });
    }

    if (body.action === "update") {
      const memberId = String(body.memberId ?? "");
      const role = String(body.role ?? "");
      const active = body.active === true;

      if (!allowedRoles.has(role)) {
        return response({ error: "A função selecionada é inválida." }, 400);
      }

      const {
        data: target,
        error: targetError,
      } = await admin
        .from("company_members")
        .select("id, user_id, role")
        .eq("id", memberId)
        .eq("company_id", companyId)
        .maybeSingle();

      if (targetError || !target) {
        return response({ error: "Funcionário não encontrado." }, 404);
      }

      if (target.role === "owner") {
        return response({ error: "O proprietário não pode ser alterado." }, 403);
      }

      if (target.user_id === userData.user.id && !active) {
        return response({ error: "Você não pode desativar seu próprio acesso." }, 400);
      }

      const {
        error: updateError,
      } = await admin
        .from("company_members")
        .update({ role, active })
        .eq("id", memberId)
        .eq("company_id", companyId);

      if (updateError) {
        throw updateError;
      }

      return response({ success: true });
    }

    return response({ error: "Ação inválida." }, 400);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Não foi possível concluir a operação.";

    return response({ error: message }, 500);
  }
});
