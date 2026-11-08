import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

function equal(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const expectedSecret = Deno.env.get("BILLING_CRON_SECRET");
  const suppliedSecret = request.headers.get("x-cron-secret") ?? "";
  if (
    !expectedSecret ||
    !equal(await digest(expectedSecret), await digest(suppliedSecret))
  ) {
    return json({ error: "unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const asaasUrl = Deno.env.get("ASAAS_API_URL");
  const asaasKey = Deno.env.get("ASAAS_API_KEY");
  if (!supabaseUrl || !serviceKey || !asaasUrl || !asaasKey) {
    return json({ error: "server_not_configured" }, 503);
  }

  const dbHeaders = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    "content-type": "application/json",
  };

  const subscriptionsResponse = await fetch(
    `${supabaseUrl}/rest/v1/company_subscriptions?asaas_subscription_id=not.is.null&select=id,company_id,asaas_subscription_id`,
    { headers: dbHeaders },
  );
  if (!subscriptionsResponse.ok) {
    return json({ error: "subscription_query_failed" }, 500);
  }

  const subscriptions = await subscriptionsResponse.json();
  let processed = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    try {
      const paymentsResponse = await fetch(
        `${asaasUrl}/subscriptions/${encodeURIComponent(subscription.asaas_subscription_id)}/payments?limit=100`,
        {
          headers: {
            "content-type": "application/json",
            "user-agent": "GestorFacil/1.0",
            access_token: asaasKey,
          },
        },
      );
      if (!paymentsResponse.ok) {
        failed += 1;
        continue;
      }

      const payments = await paymentsResponse.json();
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
          "cron",
          payment.id,
          status,
          payment.dateUpdated ?? payment.dueDate ?? "unknown",
        ].join(":");

        const rpcResponse = await fetch(
          `${supabaseUrl}/rest/v1/rpc/process_asaas_webhook`,
          {
            method: "POST",
            headers: dbHeaders,
            body: JSON.stringify({
              p_event_id: eventId,
              p_event_type: event,
              p_payload: { id: eventId, event, payment },
            }),
          },
        );
        if (rpcResponse.ok) processed += 1;
        else failed += 1;
      }
    } catch {
      failed += 1;
    }
  }

  return json({
    success: failed === 0,
    subscriptions: subscriptions.length,
    processed,
    failed,
    reconciledAt: new Date().toISOString(),
  });
});
