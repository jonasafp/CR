import {
  Ban,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  Search,
  ShieldCheck,
  TriangleAlert,
  WalletCards,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FormEvent } from "react";

import type {
  ControlBillingCompany,
  ControlBillingStatus,
  SaveControlSubscriptionInput,
} from "../../../domain/control/ControlBilling";
import { billingAdminService } from "../../../services/control/billingAdminService";
import { getErrorMessage } from "../../../utils/errors";
import styles from "./BillingControlPanel.module.css";

const statusLabels: Record<ControlBillingStatus, string> = {
  trial: "Teste",
  active: "Ativa",
  due_soon: "Próxima do vencimento",
  overdue: "Vencida",
  suspended: "Suspensa",
  canceled: "Cancelada",
  manual_release: "Liberação manual",
  not_configured: "Não configurada",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  if (date.getDate() > 28) date.setDate(28);
  return date.toISOString().slice(0, 10);
}

export default function BillingControlPanel() {
  const [dashboard, setDashboard] = useState<Awaited<
    ReturnType<typeof billingAdminService.list>
  > | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ControlBillingCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);
  const [busyCompanyId, setBusyCompanyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setDashboard(await billingAdminService.list());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const companies = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return dashboard?.companies ?? [];

    return (dashboard?.companies ?? []).filter((company) =>
      [company.tradeName, company.legalName, company.document]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalized)),
    );
  }, [dashboard?.companies, search]);

  async function runCompanyAction(
    companyId: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    setBusyCompanyId(companyId);
    setMessage("");
    setError("");

    try {
      await action();
      setMessage(successMessage);
      await load();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setBusyCompanyId("");
    }
  }

  async function reconcile() {
    setIsReconciling(true);
    setMessage("");
    setError("");

    try {
      const result = await billingAdminService.reconcile();
      setMessage(`Conciliação concluída: ${result.processed} cobrança(s) revisada(s).`);
      await load();
    } catch (reconcileError) {
      setError(getErrorMessage(reconcileError));
    } finally {
      setIsReconciling(false);
    }
  }

  if (isLoading && !dashboard) {
    return <div className={styles.loading}>Carregando mensalidades...</div>;
  }

  return (
    <>
      {message && <div className={styles.successMessage}>{message}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {dashboard && (
        <>
          <div className={styles.environmentNotice}>
            <ShieldCheck size={20} />
            <div>
              <strong>
                Asaas {dashboard.environment === "sandbox" ? "Sandbox" : "Produção"}
              </strong>
              <span>
                Webhooks e conciliação separados por empresa.
              </span>
            </div>
            <button
              type="button"
              onClick={() => void reconcile()}
              disabled={isReconciling}
            >
              <RefreshCw
                size={17}
                className={isReconciling ? styles.spinning : undefined}
              />
              {isReconciling ? "Conciliando..." : "Conciliar agora"}
            </button>
          </div>

          <section className={styles.metrics}>
            <Metric
              icon={<CreditCard />}
              label="Configuradas"
              value={String(dashboard.summary.configured)}
              helper={`${dashboard.summary.companies} empresa(s)`}
              tone="blue"
            />
            <Metric
              icon={<CheckCircle2 />}
              label="Ativas"
              value={String(dashboard.summary.active)}
              helper="Acesso regular"
              tone="green"
            />
            <Metric
              icon={<Clock3 />}
              label="A vencer"
              value={String(dashboard.summary.dueSoon)}
              helper="Dentro de 3 dias"
              tone="orange"
            />
            <Metric
              icon={<TriangleAlert />}
              label="Vencidas"
              value={String(dashboard.summary.overdue)}
              helper="Acesso bloqueado"
              tone="red"
            />
            <Metric
              icon={<WalletCards />}
              label="Receita mensal"
              value={formatCurrency(dashboard.summary.monthlyRecurringRevenue)}
              helper="Recorrência configurada"
              tone="purple"
            />
          </section>

          <article className={styles.panel}>
            <div className={styles.toolbar}>
              <label>
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar empresa..."
                />
              </label>
              <span>{companies.length} empresa(s)</span>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Situação</th>
                    <th>Mensalidade</th>
                    <th>Próximo vencimento</th>
                    <th>Fiscalização</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => {
                    const isBusy = busyCompanyId === company.companyId;
                    return (
                      <tr key={company.companyId}>
                        <td>
                          <strong>{company.tradeName}</strong>
                          <small>{company.legalName}</small>
                        </td>
                        <td>
                          <span className={styles[`status_${company.status}`]}>
                            {statusLabels[company.status]}
                          </span>
                        </td>
                        <td>{formatCurrency(company.monthlyPrice)}</td>
                        <td>{formatDate(company.nextDueDate)}</td>
                        <td>
                          <span className={
                            company.enforcementEnabled
                              ? styles.enforcementOn
                              : styles.enforcementOff
                          }>
                            {company.enforcementEnabled ? "Ativa" : "Desativada"}
                          </span>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              onClick={() => setEditing(company)}
                              disabled={isBusy}
                            >
                              Configurar
                            </button>

                            {company.asaasSubscriptionId && (
                              <button
                                type="button"
                                onClick={() => void runCompanyAction(
                                  company.companyId,
                                  () => billingAdminService.setEnforcement(
                                    company.companyId,
                                    !company.enforcementEnabled,
                                  ),
                                  company.enforcementEnabled
                                    ? "Fiscalização desativada."
                                    : "Fiscalização ativada.",
                                )}
                                disabled={isBusy}
                              >
                                {company.enforcementEnabled ? "Liberar" : "Fiscalizar"}
                              </button>
                            )}

                            {["overdue", "suspended"].includes(company.status) && (
                              <button
                                type="button"
                                onClick={() => void runCompanyAction(
                                  company.companyId,
                                  () => billingAdminService.manualRelease(
                                    company.companyId,
                                    7,
                                  ),
                                  "Empresa liberada manualmente por 7 dias.",
                                )}
                                disabled={isBusy}
                              >
                                Liberar 7 dias
                              </button>
                            )}

                            {company.asaasSubscriptionId &&
                              company.status !== "suspended" && (
                              <button
                                type="button"
                                className={styles.dangerAction}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Suspender a assinatura de ${company.tradeName}?`,
                                    )
                                  ) {
                                    void runCompanyAction(
                                      company.companyId,
                                      () => billingAdminService.suspend(company.companyId),
                                      "Assinatura suspensa.",
                                    );
                                  }
                                }}
                                disabled={isBusy}
                              >
                                <Ban size={14} />
                                Suspender
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}

      {editing && (
        <SubscriptionModal
          company={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setMessage("Mensalidade configurada com sucesso.");
            await load();
          }}
        />
      )}
    </>
  );
}

function Metric({
  icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  tone: "blue" | "green" | "orange" | "red" | "purple";
}) {
  return (
    <article className={`${styles.metric} ${styles[tone]}`}>
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  );
}

function SubscriptionModal({
  company,
  onClose,
  onSaved,
}: {
  company: ControlBillingCompany;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<SaveControlSubscriptionInput>({
    companyId: company.companyId,
    monthlyValue: company.monthlyPrice || 50,
    nextDueDate: company.nextDueDate ?? defaultDueDate(),
    enforcementEnabled: company.enforcementEnabled,
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await billingAdminService.saveSubscription(form);
      await onSaved();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <form className={styles.modal} onSubmit={handleSubmit}>
        <header>
          <div>
            <span>Mensalidade</span>
            <h2>{company.tradeName}</h2>
            <p>Crie ou atualize a assinatura mensal no Asaas.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">
            <X size={19} />
          </button>
        </header>

        <label>
          <span>Valor mensal *</span>
          <input
            type="number"
            min="1"
            step="0.01"
            value={form.monthlyValue}
            onChange={(event) => setForm({
              ...form,
              monthlyValue: Number(event.target.value),
            })}
            required
          />
        </label>

        <label>
          <span>Próximo vencimento *</span>
          <input
            type="date"
            value={form.nextDueDate}
            onChange={(event) => setForm({
              ...form,
              nextDueDate: event.target.value,
            })}
            required
          />
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={form.enforcementEnabled}
            onChange={(event) => setForm({
              ...form,
              enforcementEnabled: event.target.checked,
            })}
          />
          <span>
            <strong>Ativar fiscalização automática</strong>
            <small>Bloqueia o uso após o vencimento confirmado.</small>
          </span>
        </label>

        {!company.document && (
          <div className={styles.errorMessage}>
            Cadastre um CPF ou CNPJ válido antes de criar a assinatura.
          </div>
        )}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <footer>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button
            type="submit"
            disabled={isSaving || !company.document}
          >
            {isSaving ? "Salvando..." : "Salvar mensalidade"}
          </button>
        </footer>
      </form>
    </div>
  );
}
