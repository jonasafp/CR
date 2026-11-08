import { supabase } from "../../lib/supabase";
import type {
  ControlBillingDashboard,
  SaveControlSubscriptionInput,
} from "../../domain/control/ControlBilling";

async function invoke<T>(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(
    "asaas-billing-admin",
    { body },
  );

  if (error) {
    let message = error.message;
    const context = (error as { context?: Response }).context;

    if (context) {
      try {
        const payload = await context.clone().json() as { error?: string };
        message = payload.error ?? message;
      } catch {
        // Mantém a mensagem original quando não há resposta JSON.
      }
    }

    throw new Error(message);
  }

  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String(data.error));
  }

  return data as T;
}

export const billingAdminService = {
  list() {
    return invoke<ControlBillingDashboard>({ action: "list" });
  },

  saveSubscription(input: SaveControlSubscriptionInput) {
    return invoke<{ success: true }>({
      action: "save-subscription",
      ...input,
    });
  },

  setEnforcement(companyId: string, enabled: boolean) {
    return invoke<{ success: true }>({
      action: "set-enforcement",
      companyId,
      enabled,
    });
  },

  manualRelease(companyId: string, days = 7) {
    return invoke<{ success: true; manualReleaseUntil: string }>({
      action: "manual-release",
      companyId,
      days,
    });
  },

  suspend(companyId: string) {
    return invoke<{ success: true }>({
      action: "suspend",
      companyId,
    });
  },

  reactivate(companyId: string, nextDueDate: string) {
    return invoke<{ success: true }>({
      action: "reactivate",
      companyId,
      nextDueDate,
    });
  },

  reconcile(companyId?: string) {
    return invoke<{ success: true; processed: number }>({
      action: "reconcile",
      companyId,
    });
  },
};
