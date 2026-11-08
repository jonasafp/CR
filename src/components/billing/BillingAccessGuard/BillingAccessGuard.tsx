import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import {
  AlertTriangle,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  LogOut,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import useCompany from "../../../contexts/CompanyContext/useCompany";
import type { BillingStatus } from "../../../domain/billing/BillingStatus";
import { billingService } from "../../../services/billing/billingService";
import { signOut } from "../../../services/auth/authService";
import { supabase } from "../../../lib/supabase";
import styles from "./BillingAccessGuard.module.css";

const REFRESH_INTERVAL = 60_000;
const DISMISSED_KEY = "gestor-facil:dismissed-billing-warning";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export default function BillingAccessGuard({
  children,
}: PropsWithChildren) {
  const { companyId } = useCompany();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissedKey, setDismissedKey] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) ?? "",
  );

  const refreshBilling = useCallback(
    async (showIndicator = false) => {
      if (!companyId) {
        setBilling(null);
        setIsLoading(false);
        return;
      }

      if (showIndicator) setIsRefreshing(true);

      try {
        setBilling(await billingService.getStatus());
      } catch {
        const cached = billingService.getCachedStatus(companyId);
        if (
          cached &&
          (!cached.accessAllowed ||
            cached.status === "overdue" ||
            cached.status === "suspended")
        ) {
          setBilling(cached);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    void refreshBilling();

    const interval = window.setInterval(() => {
      void refreshBilling();
    }, REFRESH_INTERVAL);

    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshBilling();
      }
    };

    const checkWhenOnline = () => void refreshBilling();
    document.addEventListener("visibilitychange", checkWhenVisible);
    window.addEventListener("online", checkWhenOnline);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", checkWhenVisible);
      window.removeEventListener("online", checkWhenOnline);
    };
  }, [refreshBilling]);

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`billing:${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "billing_invoices",
          filter: `company_id=eq.${companyId}`,
        },
        () => void refreshBilling(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "company_subscriptions",
          filter: `company_id=eq.${companyId}`,
        },
        () => void refreshBilling(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [companyId, refreshBilling]);

  const warningKey = useMemo(
    () =>
      billing
        ? `${billing.companyId}:${billing.nextDueDate ?? "sem-vencimento"}`
        : "",
    [billing],
  );

  const isBlocked = Boolean(billing && !billing.accessAllowed);
  const shouldShow = Boolean(
    billing &&
      (isBlocked ||
        (billing.status === "due_soon" && dismissedKey !== warningKey)),
  );

  useEffect(() => {
    if (!shouldShow) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldShow]);

  async function handleCopyPix() {
    const payload = billing?.invoice?.pixPayload;
    if (!payload) return;

    await navigator.clipboard.writeText(payload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  function handleDismiss() {
    sessionStorage.setItem(DISMISSED_KEY, warningKey);
    setDismissedKey(warningKey);
  }

  async function handleSignOut() {
    await signOut();
    window.location.assign("/login");
  }

  const description = isBlocked
    ? "O acesso está temporariamente pausado. Após a confirmação do Pix, a liberação acontece automaticamente."
    : billing?.daysUntilDue === 0
      ? "O vencimento é hoje. Você pode pagar agora ou continuar usando o sistema até o fim do dia."
      : `Faltam ${billing?.daysUntilDue ?? 0} dias para o vencimento.`;

  return (
    <>
      <div
        aria-hidden={shouldShow}
        className={isBlocked ? styles.blockedContent : undefined}
      >
        {children}
      </div>

      {isLoading && (
        <div className={styles.checkingBadge}>
          <ShieldCheck size={16} />
          Verificando acesso
        </div>
      )}

      {shouldShow && billing && (
        <div className={styles.backdrop} role="presentation">
          <section
            aria-describedby="billing-description"
            aria-labelledby="billing-title"
            aria-modal="true"
            className={styles.modal}
            role="dialog"
          >
            {!isBlocked && (
              <button
                aria-label="Fechar aviso"
                className={styles.closeButton}
                onClick={handleDismiss}
                type="button"
              >
                <X size={20} />
              </button>
            )}

            <div className={isBlocked ? styles.dangerIcon : styles.warningIcon}>
              {isBlocked ? <AlertTriangle size={28} /> : <Clock3 size={28} />}
            </div>

            <div className={styles.heading}>
              <span className={styles.eyebrow}>
                {isBlocked ? "ACESSO PAUSADO" : "LEMBRETE DE MENSALIDADE"}
              </span>
              <h2 id="billing-title">
                {isBlocked
                  ? "Mensalidade vencida"
                  : "Sua mensalidade vence em breve"}
              </h2>
              <p id="billing-description">{description}</p>
            </div>

            {billing.invoice && (
              <div className={styles.paymentCard}>
                <div className={styles.paymentSummary}>
                  <span>
                    Valor
                    <strong>{formatCurrency(billing.invoice.amount)}</strong>
                  </span>
                  <span>
                    Vencimento
                    <strong>{formatDate(billing.invoice.dueDate)}</strong>
                  </span>
                </div>

                {billing.invoice.pixQrCode && (
                  <div className={styles.qrContainer}>
                    <img
                      alt="QR Code Pix da mensalidade"
                      src={`data:image/png;base64,${billing.invoice.pixQrCode}`}
                    />
                  </div>
                )}

                {billing.invoice.pixPayload && (
                  <button
                    className={styles.primaryButton}
                    onClick={() => void handleCopyPix()}
                    type="button"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? "Código Pix copiado" : "Copiar Pix copia e cola"}
                  </button>
                )}

                {billing.invoice.invoiceUrl && (
                  <a
                    className={styles.secondaryButton}
                    href={billing.invoice.invoiceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={18} />
                    Abrir cobrança
                  </a>
                )}
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={styles.refreshButton}
                disabled={isRefreshing}
                onClick={() => void refreshBilling(true)}
                type="button"
              >
                <RefreshCw
                  className={isRefreshing ? styles.spinning : undefined}
                  size={18}
                />
                Já paguei, verificar
              </button>

              {isBlocked && (
                <button
                  className={styles.logoutButton}
                  onClick={() => void handleSignOut()}
                  type="button"
                >
                  <LogOut size={18} />
                  Sair da conta
                </button>
              )}
            </div>

            <p className={styles.footer}>
              A confirmação normalmente ocorre em poucos segundos.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
