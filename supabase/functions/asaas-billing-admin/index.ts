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

const digits = (value: unknown) =>
  typeof value === "string" ? value.replace(/\D/g, "") : "";

const validUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const validDate = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const daysUntil = (value: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((Date.UTC(year, month - 1, day) - today) / 86_400_000);
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const asaasKey = Deno.env.get("ASAAS_API_KEY");
  const asaasUrl = Deno.env.get("ASAAS_API_URL");

  if (!supabaseUrl || !serviceKey || !asaasKey || !asaasUrl) {
    return json({ error: "Integração financeira não configurada." }, 503);
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return json({ error: "Sessão administrativa necessária." }, 401);
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceKey, authorization },
  });
  if (!userResponse.ok) return json({ error: "Sessão inválida." }, 401);
  const user = await userResponse.json();

  const serviceHeaders = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    "content-type": "application/json",
  };

  const adminResponse = await fetch(
    `${supabaseUrl}/rest/v1/rpc/control_is_admin_user`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ p_user_id: user.id }),
    },
  );
  if (!adminResponse.ok || (await adminResponse.json()) !== true) {
    return json({ error: "Acesso restrito ao administrador Jiah." }, 403);
  }

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return json({ error: "Conteúdo inválido." }, 400);
  }

  const db = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: { ...serviceHeaders, ...(init.headers ?? {}) },
    });
    const text = await response.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = null; }
    if (!response.ok) {
      console.error("Database request failed", path, response.status);
      throw new Error("Falha ao acessar os dados de mensalidade.");
    }
    return body;
  };

  const asaas = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${asaasUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        "user-agent": "GestorFacil/1.0",
        access_token: asaasKey,
        ...(init.headers ?? {}),
      },
    });
    const text = await response.text();
    let body: any = {};
    try { body = text ? JSON.parse(text) : {}; } catch { body = {}; }
    if (!response.ok) {
      console.error("Asaas request failed", path, response.status);
      const detail = body?.errors?.[0]?.description;
      throw new Error(detail || "O Asaas recusou a operação.");
    }
    return body;
  };

  const getLocalSubscription = async (companyId: string) => {
    const rows = await db(
      `company_subscriptions?company_id=eq.${encodeURIComponent(companyId)}&select=*&limit=1`,
    );
    return rows?.[0] ?? null;
  };

  const writeAudit = async (
    companyId: string,
    action: string,
    details: Record<string, unknown> = {},
  ) => {
    await db("rpc/control_write_billing_audit", {
      method: "POST",
      body: JSON.stringify({
        p_company_id: companyId,
        p_actor_user_id: user.id,
        p_action: action,
        p_details: details,
      }),
    });
  };

  try {
    if (input.action === "list") {
      const [companies, subscriptions, plans, invoices] = await Promise.all([
        db("companies?select=id,legal_name,trade_name,document,status&order=trade_name"),
        db("company_subscriptions?select=*"),
        db("billing_plans?select=id,monthly_price,warning_days,grace_days"),
        db("billing_invoices?select=id,company_id,external_payment_id,status,amount,due_date,paid_at,invoice_url,created_at&order=due_date.desc"),
      ]);

      const planMap = new Map(plans.map((plan: any) => [plan.id, plan]));
      const subscriptionMap = new Map(
        subscriptions.map((subscription: any) => [subscription.company_id, subscription]),
      );
      const invoiceMap = new Map<string, any>();
      for (const invoice of invoices) {
        if (!invoiceMap.has(invoice.company_id)) {
          invoiceMap.set(invoice.company_id, invoice);
        }
      }

      const rows = companies.map((company: any) => {
        const subscription = subscriptionMap.get(company.id);
        const plan = subscription ? planMap.get(subscription.plan_id) : null;
        const invoice = invoiceMap.get(company.id) ?? null;
        const remaining = daysUntil(subscription?.next_due_date ?? null);
        const manualRelease = subscription?.manual_release_until &&
          new Date(subscription.manual_release_until).getTime() > Date.now();
        const overdue = Boolean(
          subscription &&
          (
            subscription.status === "overdue" ||
            invoice?.status === "overdue" ||
            (
              remaining !== null &&
              remaining < -Number(plan?.grace_days ?? 0)
            )
          )
        );
        const dueSoon = Boolean(
          subscription &&
          remaining !== null &&
          remaining >= 0 &&
          remaining <= Number(plan?.warning_days ?? 3)
        );

        let status = subscription?.status ?? "not_configured";
        if (manualRelease) status = "manual_release";
        else if (["suspended", "canceled"].includes(subscription?.status)) {
          status = subscription.status;
        } else if (overdue) status = "overdue";
        else if (dueSoon) status = "due_soon";
        else if (subscription) status = "active";

        return {
          companyId: company.id,
          tradeName: company.trade_name,
          legalName: company.legal_name,
          document: company.document,
          companyStatus: company.status,
          subscriptionId: subscription?.id ?? null,
          status,
          enforcementEnabled: Boolean(subscription?.enforcement_enabled),
          monthlyPrice: Number(
            subscription?.monthly_price_override ?? plan?.monthly_price ?? 50,
          ),
          nextDueDate: subscription?.next_due_date ?? null,
          manualReleaseUntil: subscription?.manual_release_until ?? null,
          asaasCustomerId: subscription?.asaas_customer_id ?? null,
          asaasSubscriptionId: subscription?.asaas_subscription_id ?? null,
          lastPaymentAt: subscription?.last_payment_at ?? null,
          latestInvoice: invoice ? {
            id: invoice.id,
            externalPaymentId: invoice.external_payment_id,
            status: invoice.status,
            amount: Number(invoice.amount),
            dueDate: invoice.due_date,
            paidAt: invoice.paid_at,
            invoiceUrl: invoice.invoice_url,
          } : null,
        };
      });

      const configured = rows.filter((row: any) => row.asaasSubscriptionId);
      return json({
        environment: asaasUrl.includes("sandbox") ? "sandbox" : "production",
        summary: {
          companies: rows.length,
          configured: configured.length,
          active: rows.filter((row: any) => row.status === "active").length,
          dueSoon: rows.filter((row: any) => row.status === "due_soon").length,
          overdue: rows.filter((row: any) => row.status === "overdue").length,
          suspended: rows.filter((row: any) => row.status === "suspended").length,
          manualRelease: rows.filter((row: any) => row.status === "manual_release").length,
          monthlyRecurringRevenue: configured.reduce(
            (total: number, row: any) => total + row.monthlyPrice,
            0,
          ),
        },
        companies: rows,
      });
    }

    const companyId = input.companyId;
    if (input.action !== "reconcile" && !validUuid(companyId)) {
      return json({ error: "Empresa inválida." }, 400);
    }

    if (input.action === "save-subscription") {
      const monthlyValue = Number(input.monthlyValue);
      const nextDueDate = input.nextDueDate;
      if (!Number.isFinite(monthlyValue) || monthlyValue <= 0 || !validDate(nextDueDate)) {
        return json({ error: "Valor ou vencimento inválido." }, 400);
      }

      const companies = await db(
        `companies?id=eq.${companyId}&select=id,legal_name,trade_name,document,email,phone&limit=1`,
      );
      const company = companies?.[0];
      if (!company) return json({ error: "Empresa não encontrada." }, 404);

      const document = digits(company.document);
      if (![11, 14].includes(document.length)) {
        return json({ error: "Cadastre um CPF ou CNPJ válido na empresa." }, 422);
      }

      const subscription = await getLocalSubscription(companyId);
      if (!subscription) {
        return json({ error: "Assinatura local não encontrada." }, 404);
      }

      let customerId = subscription.asaas_customer_id;
      if (!customerId) {
        const customer = await asaas("/customers", {
          method: "POST",
          body: JSON.stringify({
            name: company.legal_name || company.trade_name,
            cpfCnpj: document,
            email: company.email || undefined,
            mobilePhone: digits(company.phone) || undefined,
            externalReference: companyId,
            notificationDisabled: false,
          }),
        });
        customerId = customer.id;
        await db(
          `company_subscriptions?id=eq.${subscription.id}`,
          {
            method: "PATCH",
            headers: { prefer: "return=minimal" },
            body: JSON.stringify({ asaas_customer_id: customerId }),
          },
        );
      }

      let remoteSubscriptionId = subscription.asaas_subscription_id;
      if (remoteSubscriptionId) {
        await asaas(`/subscriptions/${encodeURIComponent(remoteSubscriptionId)}`, {
          method: "PUT",
          body: JSON.stringify({
            billingType: "PIX",
            status: "ACTIVE",
            value: monthlyValue,
            nextDueDate,
            cycle: "MONTHLY",
            description: "Mensalidade Gestor Fácil",
            externalReference: companyId,
            updatePendingPayments: true,
          }),
        });
      } else {
        const remote = await asaas("/subscriptions", {
          method: "POST",
          body: JSON.stringify({
            customer: customerId,
            billingType: "PIX",
            value: monthlyValue,
            nextDueDate,
            cycle: "MONTHLY",
            description: "Mensalidade Gestor Fácil",
            externalReference: companyId,
          }),
        });
        remoteSubscriptionId = remote.id;
      }

      await db(
        `company_subscriptions?id=eq.${subscription.id}`,
        {
          method: "PATCH",
          headers: { prefer: "return=minimal" },
          body: JSON.stringify({
            asaas_customer_id: customerId,
            asaas_subscription_id: remoteSubscriptionId,
            monthly_price_override: monthlyValue,
            billing_day: Math.min(Number(nextDueDate.slice(8, 10)), 28),
            next_due_date: nextDueDate,
            status: "active",
            enforcement_enabled: Boolean(input.enforcementEnabled),
            manual_release_until: null,
            last_reconciled_at: new Date().toISOString(),
          }),
        },
      );
      await writeAudit(companyId, "subscription_saved", {
        monthlyValue,
        nextDueDate,
        enforcementEnabled: Boolean(input.enforcementEnabled),
      });
      return json({ success: true });
    }

    const subscription = validUuid(companyId)
      ? await getLocalSubscription(companyId)
      : null;
    if (input.action !== "reconcile" && !subscription) {
      return json({ error: "Assinatura não encontrada." }, 404);
    }

    if (input.action === "set-enforcement") {
      await db(`company_subscriptions?id=eq.${subscription.id}`, {
        method: "PATCH",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({
          enforcement_enabled: Boolean(input.enabled),
          updated_at: new Date().toISOString(),
        }),
      });
      await writeAudit(companyId, "enforcement_changed", {
        enabled: Boolean(input.enabled),
      });
      return json({ success: true });
    }

    if (input.action === "manual-release") {
      const days = Math.min(Math.max(Number(input.days) || 7, 1), 30);
      const until = new Date(Date.now() + days * 86_400_000).toISOString();
      await db(`company_subscriptions?id=eq.${subscription.id}`, {
        method: "PATCH",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({
          status: "manual_release",
          manual_release_until: until,
          enforcement_enabled: true,
        }),
      });
      await writeAudit(companyId, "manual_release", { days, until });
      return json({ success: true, manualReleaseUntil: until });
    }

    if (input.action === "suspend") {
      if (subscription.asaas_subscription_id) {
        await asaas(
          `/subscriptions/${encodeURIComponent(subscription.asaas_subscription_id)}`,
          { method: "PUT", body: JSON.stringify({ status: "INACTIVE" }) },
        );
      }
      await db(`company_subscriptions?id=eq.${subscription.id}`, {
        method: "PATCH",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({
          status: "suspended",
          enforcement_enabled: true,
          manual_release_until: null,
        }),
      });
      await writeAudit(companyId, "subscription_suspended");
      return json({ success: true });
    }

    if (input.action === "reactivate") {
      const nextDueDate = input.nextDueDate;
      if (!validDate(nextDueDate)) {
        return json({ error: "Informe o próximo vencimento." }, 400);
      }
      if (subscription.asaas_subscription_id) {
        await asaas(
          `/subscriptions/${encodeURIComponent(subscription.asaas_subscription_id)}`,
          {
            method: "PUT",
            body: JSON.stringify({ status: "ACTIVE", nextDueDate }),
          },
        );
      }
      await db(`company_subscriptions?id=eq.${subscription.id}`, {
        method: "PATCH",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({
          status: "active",
          next_due_date: nextDueDate,
          manual_release_until: null,
        }),
      });
      await writeAudit(companyId, "subscription_reactivated", { nextDueDate });
      return json({ success: true });
    }

    if (input.action === "reconcile") {
      const targetSubscriptions = validUuid(input.companyId)
        ? [subscription]
        : await db(
            "company_subscriptions?asaas_subscription_id=not.is.null&select=*",
          );
      let processed = 0;

      for (const target of targetSubscriptions) {
        if (!target.asaas_subscription_id) continue;
        const payments = await asaas(
          `/subscriptions/${encodeURIComponent(target.asaas_subscription_id)}/payments?limit=100`,
        );
        for (const payment of payments.data ?? []) {
          const status = String(payment.status ?? "PENDING");
          const event = status === "RECEIVED" || status === "RECEIVED_IN_CASH"
            ? "PAYMENT_RECEIVED"
            : status === "CONFIRMED"
              ? "PAYMENT_CONFIRMED"
              : status === "OVERDUE"
                ? "PAYMENT_OVERDUE"
                : status === "REFUNDED" || status === "PARTIALLY_REFUNDED"
                  ? "PAYMENT_REFUNDED"
                  : status === "DELETED"
                    ? "PAYMENT_DELETED"
                    : "PAYMENT_UPDATED";
          const eventId = [
            "reconcile",
            payment.id,
            status,
            payment.dateUpdated ?? payment.dueDate ?? "unknown",
          ].join(":");
          await db("rpc/process_asaas_webhook", {
            method: "POST",
            body: JSON.stringify({
              p_event_id: eventId,
              p_event_type: event,
              p_payload: { id: eventId, event, payment },
            }),
          });
          processed += 1;
        }
      }
      if (validUuid(companyId)) {
        await writeAudit(companyId, "billing_reconciled", { processed });
      }
      return json({ success: true, processed });
    }

    return json({ error: "Ação não reconhecida." }, 400);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Não foi possível concluir a operação.";
    console.error("Billing admin failed", message);
    return json({ error: message }, 502);
  }
});
