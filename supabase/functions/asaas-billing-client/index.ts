import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
  "access-control-allow-methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  });

const daysBetween = (date: string) => {
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const [year, month, day] = date.split("-").map(Number);
  return Math.round((Date.UTC(year, month - 1, day) - todayUtc) / 86_400_000);
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const asaasKey = Deno.env.get("ASAAS_API_KEY");
  const asaasUrl = Deno.env.get("ASAAS_API_URL");

  if (!supabaseUrl || !serviceKey || !asaasKey || !asaasUrl) {
    return json({ error: "server_not_configured" }, 503);
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return json({ error: "unauthorized" }, 401);
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceKey, authorization },
  });
  if (!userResponse.ok) return json({ error: "unauthorized" }, 401);
  const user = await userResponse.json();

  const dbHeaders = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    "content-type": "application/json",
  };

  const membershipResponse = await fetch(
    `${supabaseUrl}/rest/v1/company_members?user_id=eq.${encodeURIComponent(user.id)}&active=eq.true&select=company_id&limit=1`,
    { headers: dbHeaders },
  );
  if (!membershipResponse.ok) return json({ error: "membership_query_failed" }, 500);
  const membership = (await membershipResponse.json())[0];
  if (!membership) return json({ error: "company_not_found" }, 404);

  const companyId = String(membership.company_id);
  const subscriptionResponse = await fetch(
    `${supabaseUrl}/rest/v1/company_subscriptions?company_id=eq.${encodeURIComponent(companyId)}&select=id,status,next_due_date,manual_release_until,enforcement_enabled,plan_id&limit=1`,
    { headers: dbHeaders },
  );
  if (!subscriptionResponse.ok) return json({ error: "subscription_query_failed" }, 500);
  const subscription = (await subscriptionResponse.json())[0];

  if (!subscription) {
    return json({
      companyId,
      status: "active",
      accessAllowed: true,
      enforcementEnabled: false,
      warningDays: 3,
      daysUntilDue: null,
      invoice: null,
    });
  }

  const planResponse = await fetch(
    `${supabaseUrl}/rest/v1/billing_plans?id=eq.${encodeURIComponent(subscription.plan_id)}&select=warning_days,grace_days&limit=1`,
    { headers: dbHeaders },
  );
  const plan = planResponse.ok ? (await planResponse.json())[0] : null;
  const warningDays = Number(plan?.warning_days ?? 3);
  const graceDays = Number(plan?.grace_days ?? 0);

  const invoiceResponse = await fetch(
    `${supabaseUrl}/rest/v1/billing_invoices?subscription_id=eq.${encodeURIComponent(subscription.id)}&status=in.(pending,overdue)&select=id,external_payment_id,status,amount,due_date,invoice_url,pix_payload,pix_qr_expires_at&order=due_date.desc&limit=1`,
    { headers: dbHeaders },
  );
  const invoice = invoiceResponse.ok ? (await invoiceResponse.json())[0] ?? null : null;

  const daysUntilDue = subscription.next_due_date
    ? daysBetween(subscription.next_due_date)
    : null;
  const manualReleaseActive = subscription.manual_release_until
    ? new Date(subscription.manual_release_until).getTime() > Date.now()
    : false;
  const overdue = Boolean(
    subscription.status === "overdue" ||
    invoice?.status === "overdue" ||
    (daysUntilDue !== null && daysUntilDue < -graceDays),
  );
  const blockedByStatus = ["suspended", "canceled"].includes(subscription.status);
  const accessAllowed = Boolean(
    !subscription.enforcement_enabled ||
    manualReleaseActive ||
    (!overdue && !blockedByStatus),
  );

  let encodedImage: string | null = null;
  let pixPayload: string | null = invoice?.pix_payload ?? null;
  let expirationDate: string | null = invoice?.pix_qr_expires_at ?? null;

  if (invoice?.external_payment_id && ["pending", "overdue"].includes(invoice.status)) {
    const qrResponse = await fetch(
      `${asaasUrl}/payments/${encodeURIComponent(invoice.external_payment_id)}/pixQrCode`,
      {
        headers: {
          "content-type": "application/json",
          "user-agent": "GestorFacil/1.0",
          access_token: asaasKey,
        },
      },
    );

    if (qrResponse.ok) {
      const qr = await qrResponse.json();
      encodedImage = typeof qr.encodedImage === "string" ? qr.encodedImage : null;
      pixPayload = typeof qr.payload === "string" ? qr.payload : pixPayload;
      expirationDate = typeof qr.expirationDate === "string" ? qr.expirationDate : expirationDate;

      await fetch(
        `${supabaseUrl}/rest/v1/billing_invoices?id=eq.${encodeURIComponent(invoice.id)}`,
        {
          method: "PATCH",
          headers: { ...dbHeaders, prefer: "return=minimal" },
          body: JSON.stringify({
            pix_payload: pixPayload,
            pix_qr_expires_at: expirationDate,
          }),
        },
      );
    }
  }

  const derivedStatus = !subscription.enforcement_enabled
    ? "active"
    : manualReleaseActive
      ? "manual_release"
      : blockedByStatus
        ? subscription.status
        : overdue
          ? "overdue"
          : daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= warningDays
            ? "due_soon"
            : subscription.status;

  return json({
    companyId,
    status: derivedStatus,
    accessAllowed,
    enforcementEnabled: Boolean(subscription.enforcement_enabled),
    nextDueDate: subscription.next_due_date,
    daysUntilDue,
    warningDays,
    manualReleaseUntil: subscription.manual_release_until,
    invoice: invoice ? {
      id: invoice.id,
      status: invoice.status,
      amount: Number(invoice.amount),
      dueDate: invoice.due_date,
      invoiceUrl: invoice.invoice_url,
      pixPayload,
      pixQrCode: encodedImage,
      pixQrExpiresAt: expirationDate,
    } : null,
  });
});

