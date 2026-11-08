import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const expectedToken = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
  const suppliedToken = request.headers.get("asaas-access-token") ?? "";

  if (!expectedToken) {
    console.error("ASAAS_WEBHOOK_TOKEN não configurado");
    return json({ error: "webhook_not_configured" }, 503);
  }

  const tokenIsValid = equalBytes(
    await sha256(suppliedToken),
    await sha256(expectedToken),
  );

  if (!tokenIsValid) {
    return json({ error: "unauthorized" }, 401);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 1_000_000) {
    return json({ error: "payload_too_large" }, 413);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const eventId = typeof payload.id === "string" ? payload.id : "";
  const eventType = typeof payload.event === "string" ? payload.event : "";

  if (!eventId || !eventType) {
    return json({ error: "invalid_event" }, 400);
  }

  const forcedStatusByEvent: Record<string, string> = {
    PAYMENT_CONFIRMED: "CONFIRMED",
    PAYMENT_RECEIVED: "RECEIVED",
    PAYMENT_OVERDUE: "OVERDUE",
    PAYMENT_DELETED: "DELETED",
    PAYMENT_RESTORED: "PENDING",
    PAYMENT_REFUNDED: "REFUNDED",
    PAYMENT_PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
    PAYMENT_CHARGEBACK_REQUESTED: "CHARGEBACK_REQUESTED",
    PAYMENT_CHARGEBACK_DISPUTE: "CHARGEBACK_DISPUTE",
    PAYMENT_AWAITING_CHARGEBACK_REVERSAL: "AWAITING_CHARGEBACK_REVERSAL",
  };

  const payment =
    payload.payment &&
    typeof payload.payment === "object"
      ? payload.payment as Record<string, unknown>
      : null;

  if (payment && forcedStatusByEvent[eventType]) {
    payload = {
      ...payload,
      payment: {
        ...payment,
        status: forcedStatusByEvent[eventType],
      },
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Credenciais internas do Supabase ausentes");
    return json({ error: "server_not_configured" }, 503);
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/rpc/process_asaas_webhook`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        p_event_id: eventId,
        p_event_type: eventType,
        p_payload: payload,
      }),
    },
  );

  const resultText = await response.text();
  if (!response.ok) {
    console.error("Falha ao processar webhook", response.status, resultText);
    return json({ error: "processing_failed" }, 500);
  }

  try {
    return json(JSON.parse(resultText));
  } catch {
    return json({ accepted: true });
  }
});
