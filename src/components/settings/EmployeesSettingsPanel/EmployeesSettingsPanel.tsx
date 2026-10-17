import {
  CheckCircle2,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import useCompany from "../../../contexts/CompanyContext/useCompany";
import type {
  Employee,
  EmployeeRole,
} from "../../../domain/employees/Employee";
import {
  employeeService,
} from "../../../services/employees/employeeService";
import {
  getErrorMessage,
} from "../../../utils/errors";
import {
  useNotifications,
} from "../../../hooks/useNotifications";
import Select from "../../common/Select/Select";
import ErrorState from "../../common/ErrorState/ErrorState";
import LoadingState from "../../common/LoadingState/LoadingState";

import styles from "./EmployeesSettingsPanel.module.css";

const roleOptions = [
  {
    value: "admin",
    label: "Administrador",
    description: "Acesso completo, inclusive às configurações.",
  },
  {
    value: "manager",
    label: "Gerente",
    description: "Gerencia os módulos operacionais e configurações.",
  },
  {
    value: "cashier",
    label: "Operador de caixa",
    description: "Acesso ao resumo e às vendas.",
  },
  {
    value: "viewer",
    label: "Consulta",
    description: "Acesso somente ao resumo e aos relatórios.",
  },
] satisfies Array<{
  value: EmployeeRole;
  label: string;
  description: string;
}>;

export default function EmployeesSettingsPanel() {
  const {
    companyId,
    membership,
  } = useCompany();
  const notifications = useNotifications();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EmployeeRole>("cashier");

  const canManage =
    membership?.role === "owner" ||
    membership?.role === "admin";

  const loadEmployees = useCallback(async () => {
    if (!companyId || !canManage) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setEmployees(await employeeService.list(companyId));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [canManage, companyId]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const activeCount = useMemo(
    () => employees.filter((employee) => employee.active).length,
    [employees],
  );

  async function handleInvite() {
    if (!companyId || isSubmitting) {
      return;
    }

    if (fullName.trim().length < 3) {
      setError("Informe o nome completo do funcionário.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Informe um e-mail válido.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await employeeService.invite({
        companyId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
      });

      setFullName("");
      setEmail("");
      setRole("cashier");
      await loadEmployees();

      notifications.success(
        "Convite enviado",
        "O funcionário receberá um e-mail para definir a senha.",
      );
    } catch (inviteError) {
      const message = getErrorMessage(inviteError);
      setError(message);
      notifications.error("Não foi possível convidar", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChange(
    employee: Employee,
    nextRole: EmployeeRole,
    active: boolean,
  ) {
    if (!companyId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await employeeService.update({
        companyId,
        memberId: employee.id,
        role: nextRole,
        active,
      });
      await loadEmployees();
      notifications.success(
        "Funcionário atualizado",
        "As permissões foram atualizadas com sucesso.",
      );
    } catch (updateError) {
      const message = getErrorMessage(updateError);
      setError(message);
      notifications.error("Não foi possível atualizar", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!canManage) {
    return (
      <ErrorState
        title="Acesso restrito"
        description="Somente proprietários e administradores podem gerenciar funcionários."
      />
    );
  }

  if (isLoading && employees.length === 0) {
    return (
      <LoadingState
        title="Carregando funcionários"
        description="Consultando os acessos desta empresa."
      />
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.card}>
        <div className={styles.heading}>
          <div className={styles.headingIcon}><UserPlus size={21} /></div>
          <div>
            <h3>Novo funcionário</h3>
            <p>O funcionário receberá um convite para criar a própria senha.</p>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Nome completo</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nome do funcionário"
              disabled={isSubmitting}
            />
          </label>

          <label className={styles.field}>
            <span>E-mail de acesso</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="funcionario@empresa.com"
              disabled={isSubmitting}
            />
          </label>

          <Select
            label="Função"
            value={role}
            options={roleOptions}
            onChange={setRole}
            disabled={isSubmitting}
          />
        </div>

        <button
          type="button"
          className={styles.inviteButton}
          onClick={() => void handleInvite()}
          disabled={isSubmitting}
        >
          <UserPlus size={17} />
          {isSubmitting ? "Enviando..." : "Enviar convite"}
        </button>
      </section>

      <section className={styles.card}>
        <div className={styles.listHeader}>
          <div className={styles.heading}>
            <div className={styles.headingIcon}><Users size={21} /></div>
            <div>
              <h3>Funcionários</h3>
              <p>{activeCount} acesso(s) ativo(s) nesta empresa.</p>
            </div>
          </div>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => void loadEmployees()}
            disabled={isLoading || isSubmitting}
          >
            <RefreshCw size={15} /> Atualizar
          </button>
        </div>

        <div className={styles.employeeList}>
          {employees.map((employee) => (
            <article className={styles.employee} key={employee.id}>
              <div className={styles.avatar}>
                {employee.fullName.slice(0, 2).toUpperCase()}
              </div>

              <div className={styles.employeeInfo}>
                <strong>{employee.fullName}</strong>
                <span>{employee.email}</span>
                <small>
                  {employee.active ? "Acesso ativo" : "Acesso desativado"}
                </small>
              </div>

              {employee.role === "owner" ? (
                <div className={styles.ownerBadge}>
                  <CheckCircle2 size={14} /> Proprietário
                </div>
              ) : (
                <>
                  <div className={styles.roleSelect}>
                    <Select
                      ariaLabel={`Função de ${employee.fullName}`}
                      value={employee.role as EmployeeRole}
                      options={roleOptions}
                      onChange={(nextRole) =>
                        void handleChange(employee, nextRole, employee.active)
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="button"
                    className={employee.active ? styles.deactivateButton : styles.activateButton}
                    onClick={() =>
                      void handleChange(
                        employee,
                        employee.role as EmployeeRole,
                        !employee.active,
                      )
                    }
                    disabled={isSubmitting}
                  >
                    {employee.active ? "Desativar" : "Ativar"}
                  </button>
                </>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
