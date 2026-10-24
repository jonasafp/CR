import {
  Activity,
  Building2,
  ChartNoAxesCombined,
  ChevronRight,
  Database,
  KeyRound,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import type {
  ControlCompany,
  ControlCompanyUser,
  ControlDashboardData,
  ControlSession,
  CreateControlCompanyInput,
  InviteControlEmployeeInput,
} from "../../domain/control/Control";
import {
  supabase,
} from "../../lib/supabase";
import {
  controlService,
} from "../../services/control/controlService";
import {
  getErrorMessage,
} from "../../utils/errors";

import styles from "./Controle.module.css";

type ControlTab = "overview" | "companies" | "database";

const emptyCompany: CreateControlCompanyInput = {
  legalName: "",
  tradeName: "",
  document: "",
  ownerName: "",
  ownerEmail: "",
};

const emptyEmployee = {
  fullName: "",
  email: "",
  role: "cashier",
} satisfies Omit<InviteControlEmployeeInput, "companyId">;

const roleLabels: Record<ControlCompanyUser["role"], string> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gerente",
  cashier: "Caixa",
  viewer: "Consulta",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function formatDocument(value: string | null) {
  if (!value) {
    return "Não informado";
  }

  if (value.length === 14) {
    return value.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5",
    );
  }

  return value;
}

export default function Controle() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ControlTab>("overview");
  const [data, setData] = useState<ControlDashboardData | null>(null);
  const [controlSession, setControlSession] = useState<ControlSession | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<ControlCompany | null>(null);
  const [companyUsers, setCompanyUsers] = useState<ControlCompanyUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [employeeCompany, setEmployeeCompany] = useState<ControlCompany | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [nextData, nextSession] = await Promise.all([
        controlService.getDashboard(),
        controlService.getSession(),
      ]);

      setData(nextData);
      setControlSession(nextSession);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const filteredCompanies = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return data?.companies ?? [];
    }

    return (data?.companies ?? []).filter((company) =>
      [company.tradeName, company.legalName, company.document]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalized)),
    );
  }, [data?.companies, search]);

  async function openCompany(company: ControlCompany) {
    setSelectedCompany(company);
    setCompanyUsers([]);
    setIsLoadingUsers(true);
    setError("");

    try {
      setCompanyUsers(await controlService.getCompanyUsers(company.id));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function toggleCompanyStatus(company: ControlCompany) {
    const nextStatus = company.status === "active" ? "inactive" : "active";
    setError("");
    setMessage("");

    try {
      await controlService.setCompanyStatus(company.id, nextStatus);
      setMessage(
        nextStatus === "active"
          ? "Empresa reativada com sucesso."
          : "Empresa inativada com sucesso.",
      );
      setSelectedCompany(null);
      await loadDashboard();
    } catch (updateError) {
      setError(getErrorMessage(updateError));
    }
  }

  async function requestPasswordChange(member: ControlCompanyUser) {
    setError("");
    setMessage("");

    try {
      await controlService.requestPasswordChange(member.id);
      setMessage("Solicitação registrada e enviada ao usuário quando houver e-mail válido.");

      if (selectedCompany) {
        setCompanyUsers(await controlService.getCompanyUsers(selectedCompany.id));
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleEmployeeInvited(company: ControlCompany) {
    setEmployeeCompany(null);
    setMessage("Funcionário cadastrado. O convite para criação da senha foi enviado por e-mail.");
    setCompanyUsers(await controlService.getCompanyUsers(company.id));
    await loadDashboard();
  }

  async function handleLogout() {
    await supabase.auth.signOut({ scope: "local" });
    navigate("/controle/login", { replace: true });
  }

  if (isLoading && !data) {
    return <div className={styles.fullState}>Carregando sistema de controle...</div>;
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span>JC</span>
          <div>
            <strong>Jiah Controle</strong>
            <small>Gestor Fácil</small>
          </div>
        </div>

        <div className={styles.environment}>
          <ShieldCheck size={18} />
          <div>
            <strong>Ambiente seguro</strong>
            <small>Produção</small>
          </div>
        </div>

        <nav className={styles.navigation} aria-label="Navegação do controle">
          <button
            type="button"
            className={tab === "overview" ? styles.activeNav : ""}
            onClick={() => setTab("overview")}
          >
            <ChartNoAxesCombined size={19} />
            Visão geral
          </button>

          <button
            type="button"
            className={tab === "companies" ? styles.activeNav : ""}
            onClick={() => setTab("companies")}
          >
            <Building2 size={19} />
            Empresas
          </button>

          <button
            type="button"
            className={tab === "database" ? styles.activeNav : ""}
            onClick={() => setTab("database")}
          >
            <Database size={19} />
            Banco de dados
          </button>
        </nav>

        <div className={styles.profile}>
          <span>J</span>
          <div>
            <strong>{controlSession?.username ?? "Jiah"}</strong>
            <small>Administrador mestre</small>
          </div>
        </div>

        <button type="button" className={styles.logout} onClick={handleLogout}>
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Sistema de controle</span>
            <h1>
              {tab === "overview" && "Visão geral da plataforma"}
              {tab === "companies" && "Empresas cadastradas"}
              {tab === "database" && "Controle do banco de dados"}
            </h1>
            <p>
              {tab === "overview" && "Crescimento e desempenho do Gestor Fácil."}
              {tab === "companies" && "Cadastros, acessos e situação de cada empresa."}
              {tab === "database" && "Consultas operacionais seguras e indicadores de integridade."}
            </p>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.refreshButton} onClick={loadDashboard}>
              <RefreshCw size={18} />
              Atualizar
            </button>

            <button type="button" className={styles.primaryButton} onClick={() => setIsCreateOpen(true)}>
              <Plus size={18} />
              Nova empresa
            </button>
          </div>
        </header>

        {message && <div className={styles.successMessage}>{message}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {tab === "overview" && data && (
          <>
            <section className={styles.metrics}>
              <MetricCard
                icon={<Building2 />}
                label="Empresas"
                value={String(data.overview.companies)}
                helper={`${data.overview.activeCompanies} ativas`}
                tone="blue"
              />
              <MetricCard
                icon={<Users />}
                label="Usuários"
                value={String(data.overview.users)}
                helper="Acessos cadastrados"
                tone="purple"
              />
              <MetricCard
                icon={<ShoppingCart />}
                label="Vendas processadas"
                value={String(data.overview.sales)}
                helper={formatCurrency(data.overview.salesTotal)}
                tone="green"
              />
              <MetricCard
                icon={<Activity />}
                label="Produtos"
                value={String(data.overview.products)}
                helper="Em todas as empresas"
                tone="orange"
              />
            </section>

            <section className={styles.overviewGrid}>
              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h2>Crescimento</h2>
                    <p>Empresas acumuladas nos últimos seis meses.</p>
                  </div>
                </div>

                <div className={styles.chart}>
                  {data.growth.map((point) => {
                    const maximum = Math.max(
                      ...data.growth.map((item) => Number(item.companies)),
                      1,
                    );

                    return (
                      <div className={styles.chartColumn} key={point.month}>
                        <strong>{point.companies}</strong>
                        <div>
                          <span style={{ height: `${Math.max(12, (point.companies / maximum) * 100)}%` }} />
                        </div>
                        <small>{point.month.slice(5)}/{point.month.slice(2, 4)}</small>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h2>Empresas recentes</h2>
                    <p>Últimos cadastros da plataforma.</p>
                  </div>
                  <button type="button" onClick={() => setTab("companies")}>Ver todas</button>
                </div>

                <div className={styles.recentList}>
                  {data.companies.slice(-5).reverse().map((company) => (
                    <button type="button" key={company.id} onClick={() => void openCompany(company)}>
                      <span className={styles.companyAvatar}>{company.tradeName.slice(0, 2).toUpperCase()}</span>
                      <span>
                        <strong>{company.tradeName}</strong>
                        <small>{company.users} usuário(s) · {formatDate(company.createdAt)}</small>
                      </span>
                      <i className={company.status === "active" ? styles.statusActive : styles.statusInactive}>
                        {company.status === "active" ? "Ativa" : "Inativa"}
                      </i>
                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}

        {tab === "companies" && data && (
          <article className={styles.panel}>
            <div className={styles.companyToolbar}>
              <label>
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar por nome ou CNPJ..."
                />
              </label>
              <span>{filteredCompanies.length} empresa(s)</span>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Documento</th>
                    <th>Usuários</th>
                    <th>Vendas</th>
                    <th>Movimentado</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <strong>{company.tradeName}</strong>
                        <small>{company.legalName}</small>
                      </td>
                      <td>{formatDocument(company.document)}</td>
                      <td>{company.users}</td>
                      <td>{company.sales}</td>
                      <td>{formatCurrency(company.salesTotal)}</td>
                      <td>
                        <span className={company.status === "active" ? styles.statusActive : styles.statusInactive}>
                          {company.status === "active" ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td>
                        <button type="button" className={styles.detailButton} onClick={() => void openCompany(company)}>
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )}

        {tab === "database" && data && (
          <>
            <div className={styles.databaseNotice}>
              <ShieldCheck size={22} />
              <div>
                <strong>Operações protegidas</strong>
                <p>Esta tela usa consultas predefinidas. SQL arbitrário permanece bloqueado para proteger os dados dos clientes.</p>
              </div>
            </div>

            <section className={styles.databaseGrid}>
              {Object.entries({
                Empresas: data.database.companies,
                Usuários: data.database.members,
                Produtos: data.database.products,
                Clientes: data.database.customers,
                Vendas: data.database.sales,
                "Itens vendidos": data.database.saleItems,
                "Lançamentos financeiros": data.database.financialTransactions,
                "Movimentos de estoque": data.database.inventoryMovements,
                Compras: data.database.purchases,
                Fornecedores: data.database.suppliers,
              }).map(([label, value]) => (
                <article key={label}>
                  <Database size={18} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </section>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Atualizações permitidas</h2>
                  <p>Ações administrativas disponíveis sem acesso direto ao SQL.</p>
                </div>
              </div>
              <ul className={styles.safeActions}>
                <li><ShieldCheck size={18} /> Ativar ou inativar uma empresa.</li>
                <li><KeyRound size={18} /> Solicitar troca de senha de um usuário.</li>
                <li><Building2 size={18} /> Cadastrar empresa e proprietário com convite seguro.</li>
                <li><RefreshCw size={18} /> Consultar contagens atualizadas das principais tabelas.</li>
              </ul>
            </article>
          </>
        )}
      </section>

      {isCreateOpen && (
        <CreateCompanyModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={async () => {
            setIsCreateOpen(false);
            setMessage("Empresa cadastrada e convite enviado ao proprietário.");
            await loadDashboard();
          }}
        />
      )}

      {selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          users={companyUsers}
          isLoading={isLoadingUsers}
          onClose={() => setSelectedCompany(null)}
          onToggleStatus={() => void toggleCompanyStatus(selectedCompany)}
          onRequestPassword={(member) => void requestPasswordChange(member)}
          onAddEmployee={() => setEmployeeCompany(selectedCompany)}
        />
      )}

      {employeeCompany && (
        <InviteEmployeeModal
          company={employeeCompany}
          onClose={() => setEmployeeCompany(null)}
          onInvited={() => handleEmployeeInvited(employeeCompany)}
        />
      )}

      {controlSession?.mustChangePassword && (
        <ChangePasswordModal
          onChanged={() => {
            setControlSession({
              ...controlSession,
              mustChangePassword: false,
            });
            setMessage("Senha administrativa alterada com sucesso.");
          }}
        />
      )}
    </main>
  );
}

function MetricCard({
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
  tone: "blue" | "purple" | "green" | "orange";
}) {
  return (
    <article className={`${styles.metricCard} ${styles[tone]}`}>
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  );
}

function CreateCompanyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [form, setForm] = useState(emptyCompany);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function setField(field: keyof CreateControlCompanyInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await controlService.createCompany(form);
      await onCreated();
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
            <span>Nova empresa</span>
            <h2>Cadastrar cliente</h2>
            <p>A empresa será criada e o proprietário receberá o convite de acesso.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"><X /></button>
        </header>

        <div className={styles.formGrid}>
          <label className={styles.fullField}>
            <span>Razão social *</span>
            <input value={form.legalName} onChange={(event) => setField("legalName", event.target.value)} required />
          </label>
          <label>
            <span>Nome fantasia *</span>
            <input value={form.tradeName} onChange={(event) => setField("tradeName", event.target.value)} required />
          </label>
          <label>
            <span>CNPJ ou CPF</span>
            <input value={form.document} onChange={(event) => setField("document", event.target.value)} />
          </label>
          <label>
            <span>Responsável *</span>
            <input value={form.ownerName} onChange={(event) => setField("ownerName", event.target.value)} required />
          </label>
          <label>
            <span>E-mail do responsável *</span>
            <input type="email" value={form.ownerEmail} onChange={(event) => setField("ownerEmail", event.target.value)} required />
          </label>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <footer>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancelar</button>
          <button type="submit" className={styles.primaryButton} disabled={isSaving}>
            {isSaving ? "Cadastrando..." : "Cadastrar empresa"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function CompanyDetailsModal({
  company,
  users,
  isLoading,
  onClose,
  onToggleStatus,
  onRequestPassword,
  onAddEmployee,
}: {
  company: ControlCompany;
  users: ControlCompanyUser[];
  isLoading: boolean;
  onClose: () => void;
  onToggleStatus: () => void;
  onRequestPassword: (member: ControlCompanyUser) => void;
  onAddEmployee: () => void;
}) {
  return (
    <div className={styles.modalBackdrop} role="presentation">
      <section className={`${styles.modal} ${styles.detailModal}`}>
        <header>
          <div>
            <span>Dados da empresa</span>
            <h2>{company.tradeName}</h2>
            <p>{company.legalName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"><X /></button>
        </header>

        <div className={styles.companyFacts}>
          <div><small>Documento</small><strong>{formatDocument(company.document)}</strong></div>
          <div><small>E-mail</small><strong>{company.email ?? "Não informado"}</strong></div>
          <div><small>Localização</small><strong>{[company.city, company.state].filter(Boolean).join(" - ") || "Não informada"}</strong></div>
          <div><small>Cadastro</small><strong>{formatDate(company.createdAt)}</strong></div>
        </div>

        <div className={styles.usersHeader}>
          <div>
            <h3>Usuários cadastrados</h3>
            <p>Solicite uma nova senha sem visualizar ou definir a senha atual.</p>
          </div>
          <div className={styles.usersActions}>
            <button type="button" className={styles.primaryButton} onClick={onAddEmployee} disabled={company.status !== "active"}>
              <Plus size={16} /> Adicionar funcionário
            </button>
            <button type="button" className={company.status === "active" ? styles.dangerButton : styles.primaryButton} onClick={onToggleStatus}>
              {company.status === "active" ? "Inativar empresa" : "Reativar empresa"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.modalLoading}>Carregando usuários...</div>
        ) : (
          <div className={styles.userList}>
            {users.map((member) => (
              <article key={member.id}>
                <span>{(member.fullName ?? "U").slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{member.fullName ?? "Usuário sem nome"}</strong>
                  <small>#{member.internalCode} · {member.email ?? "Sem e-mail"} · {roleLabels[member.role]}</small>
                </div>
                {member.mustChangePassword && <i>Troca pendente</i>}
                <button type="button" onClick={() => onRequestPassword(member)}>
                  <KeyRound size={16} /> Solicitar troca
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InviteEmployeeModal({
  company,
  onClose,
  onInvited,
}: {
  company: ControlCompany;
  onClose: () => void;
  onInvited: () => Promise<void>;
}) {
  const [form, setForm] = useState(emptyEmployee);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function setField(
    field: keyof typeof emptyEmployee,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await controlService.inviteCompanyUser({
        companyId: company.id,
        ...form,
      });
      await onInvited();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={`${styles.modalBackdrop} ${styles.nestedModal}`} role="presentation">
      <form className={styles.modal} onSubmit={handleSubmit}>
        <header>
          <div>
            <span>Novo funcionário</span>
            <h2>Adicionar em {company.tradeName}</h2>
            <p>O funcionário receberá um e-mail para criar a senha de acesso.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"><X /></button>
        </header>

        <div className={styles.formGrid}>
          <label className={styles.fullField}>
            <span>Nome completo *</span>
            <input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} required minLength={3} autoFocus />
          </label>
          <label>
            <span>E-mail *</span>
            <input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} required />
          </label>
          <label>
            <span>Função *</span>
            <select value={form.role} onChange={(event) => setField("role", event.target.value)} required>
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
              <option value="cashier">Caixa</option>
              <option value="viewer">Consulta</option>
            </select>
          </label>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <footer>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancelar</button>
          <button type="submit" className={styles.primaryButton} disabled={isSaving}>
            {isSaving ? "Enviando convite..." : "Adicionar e enviar convite"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function ChangePasswordModal({
  onChanged,
}: {
  onChanged: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (password.length < 8) {
      setError("A nova senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("A confirmação não corresponde à nova senha.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await controlService.changePassword(password);
      onChanged();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={`${styles.modalBackdrop} ${styles.requiredModal}`} role="presentation">
      <form className={`${styles.modal} ${styles.passwordModal}`} onSubmit={handleSubmit}>
        <span className={styles.passwordIcon}><KeyRound /></span>
        <span className={styles.eyebrow}>Primeiro acesso</span>
        <h2>Crie sua senha definitiva</h2>
        <p>Por segurança, a senha inicial 1234 não poderá ser utilizada novamente.</p>

        <label>
          <span>Nova senha</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete="new-password" />
        </label>
        <label>
          <span>Confirmar nova senha</span>
          <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Digite novamente" autoComplete="new-password" />
        </label>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <button type="submit" className={styles.primaryButton} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
