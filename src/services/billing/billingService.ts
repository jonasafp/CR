import { supabase } from "../../lib/supabase";
import type { BillingStatus } from "../../domain/billing/BillingStatus";

const CACHE_KEY = "gestor-facil:last-billing-status";

function isBillingStatus(value: unknown): value is BillingStatus {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<BillingStatus>;
  return (
    typeof candidate.companyId === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.accessAllowed === "boolean" &&
    typeof candidate.enforcementEnabled === "boolean"
  );
}

async function getStatus(): Promise<BillingStatus> {
  const { data, error } = await supabase.functions.invoke(
    "asaas-billing-client",
    { body: { action: "get_status" } },
  );

  if (error) {
    throw new Error(error.message || "Não foi possível consultar a mensalidade.");
  }

  if (!isBillingStatus(data)) {
    throw new Error("O servidor retornou uma situação de cobrança inválida.");
  }

  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  return data;
}

function getCachedStatus(companyId: string) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const value = JSON.parse(raw) as unknown;
    if (!isBillingStatus(value) || value.companyId !== companyId) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

export const billingService = {
  getStatus,
  getCachedStatus,
};
