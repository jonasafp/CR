import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  try {
    const authorization = request.headers.get("Authorization");
    const token = authorization?.replace(/^Bearer\s+/i, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!token || !supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Sessão ou configuração indisponível." }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: callerData, error: callerError } =
      await admin.auth.getUser(token);

    if (callerError || !callerData.user) {
      return json({ error: "Sessão inválida ou expirada." }, 401);
    }

    const body = await request.json();
    const companyId = String(body.companyId ?? "");
    const internalCode = Number(body.internalCode);
    const password = String(body.password ?? "");

    if (!companyId || !Number.isSafeInteger(internalCode) || internalCode < 1) {
      return json({ error: "Informe um código interno válido." }, 400);
    }

    if (!password) {
      return json({ error: "Informe a senha do funcionário." }, 400);
    }

    const { data: callerMembership } = await admin
      .from("company_members")
      .select("id")
      .eq("company_id", companyId)
      .eq("user_id", callerData.user.id)
      .eq("active", true)
      .maybeSingle();

    if (!callerMembership) {
      return json({ error: "Seu acesso a esta empresa não está ativo." }, 403);
    }

    const { data: target, error: targetError } = await admin
      .from("company_members")
      .select("user_id, email, full_name, active")
      .eq("company_id", companyId)
      .eq("internal_code", internalCode)
      .maybeSingle();

    if (targetError || !target?.active || !target.email) {
      return json({ error: "Código ou senha inválidos." }, 401);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: signInData, error: signInError } =
      await authClient.auth.signInWithPassword({
        email: target.email,
        password,
      });

    if (
      signInError ||
      !signInData.session ||
      signInData.user.id !== target.user_id
    ) {
      return json({ error: "Código ou senha inválidos." }, 401);
    }

    return json({
      accessToken: signInData.session.access_token,
      refreshToken: signInData.session.refresh_token,
      employeeName: target.full_name ?? target.email,
    });
  } catch {
    return json({ error: "Não foi possível trocar o usuário." }, 500);
  }
});
