import {
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Power,
  Search,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useChangeCustomerStatusMutation,
} from "../../application/customers/useChangeCustomerStatusMutation";

import {
  useCreateCustomerMutation,
} from "../../application/customers/useCreateCustomerMutation";

import {
  useCustomersQuery,
} from "../../application/customers/useCustomerQuery";

import {
  useUpdateCustomerMutation,
} from "../../application/customers/useUpdateCustomerMutation";

import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import Pagination from "../../components/common/Pagination/Pagination";
import StatisticCard from "../../components/common/StatisticCard/StatisticCard";
import TableCard from "../../components/common/TableCard/TableCard";

import type {
  CreateCustomerInput,
  Customer,
  CustomerStatus,
  UpdateCustomerInput,
} from "../../domain/customers/Customer";

import {
  createDefaultCustomerFilters,
} from "../../domain/customers/CustomerFilters";

import {
  useNotifications,
} from "../../hooks/useNotifications";

import {
  getErrorMessage,
} from "../../utils/errors";

import styles from "./Clientes.module.css";

interface CustomerFormState {
  name: string;
  document: string;
  phone: string;
  email: string;

  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;

  notes: string;
  status: CustomerStatus;
}

const emptyForm: CustomerFormState = {
  name: "",
  document: "",
  phone: "",
  email: "",

  postalCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",

  notes: "",
  status: "active",
};

function customerToForm(
  customer: Customer,
): CustomerFormState {
  return {
    name: customer.name,
    document: customer.document,
    phone: customer.phone,
    email: customer.email,

    postalCode:
      customer.address.postalCode,

    street:
      customer.address.street,

    number:
      customer.address.number,

    complement:
      customer.address.complement,

    neighborhood:
      customer.address.neighborhood,

    city:
      customer.address.city,

    state:
      customer.address.state,

    notes:
      customer.notes,

    status:
      customer.status,
  };
}

function formatDocument(
  value: string,
): string {
  if (!value) {
    return "Não informado";
  }

  if (value.length === 11) {
    return value.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );
  }

  if (value.length === 14) {
    return value.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

  return value;
}

export default function Clientes() {
  const notifications =
    useNotifications();

  const [
    filters,
    setFilters,
  ] = useState(
    createDefaultCustomerFilters(),
  );

  const [
    form,
    setForm,
  ] = useState<CustomerFormState>(
    emptyForm,
  );

  const [
    editingCustomer,
    setEditingCustomer,
  ] = useState<Customer | null>(
    null,
  );

  const [
    statusCustomer,
    setStatusCustomer,
  ] = useState<Customer | null>(
    null,
  );

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const customersQuery =
    useCustomersQuery(
      filters,
    );

  const createMutation =
    useCreateCustomerMutation();

  const updateMutation =
    useUpdateCustomerMutation();

  const statusMutation =
    useChangeCustomerStatusMutation();

  const result =
    customersQuery.data;

  const customers =
    result?.items ?? [];

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  useEffect(
    () => {
      if (!isFormOpen) {
        return;
      }

      setForm(
        editingCustomer
          ? customerToForm(
              editingCustomer,
            )
          : emptyForm,
      );
    },
    [
      editingCustomer,
      isFormOpen,
    ],
  );

  function openCreateForm() {
    setEditingCustomer(
      null,
    );

    setForm(
      emptyForm,
    );

    setIsFormOpen(
      true,
    );
  }

  function openEditForm(
    customer: Customer,
  ) {
    setEditingCustomer(
      customer,
    );

    setForm(
      customerToForm(
        customer,
      ),
    );

    setIsFormOpen(
      true,
    );
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setIsFormOpen(
      false,
    );

    setEditingCustomer(
      null,
    );

    setForm(
      emptyForm,
    );
  }

  function updateForm(
    field: keyof CustomerFormState,
    value: string,
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        [field]:
          value,
      }),
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const commonInput:
      CreateCustomerInput = {
      name:
        form.name,

      document:
        form.document,

      phone:
        form.phone,

      email:
        form.email,

      address: {
        postalCode:
          form.postalCode,

        street:
          form.street,

        number:
          form.number,

        complement:
          form.complement,

        neighborhood:
          form.neighborhood,

        city:
          form.city,

        state:
          form.state,
      },

      notes:
        form.notes,
    };

    if (editingCustomer) {
      const updateInput:
        UpdateCustomerInput = {
        ...commonInput,

        id:
          editingCustomer.id,

        status:
          form.status,
      };

      updateMutation.mutate(
        updateInput,
        {
          onSuccess: (
            customer,
          ) => {
            closeForm();

            notifications.success(
              "Cliente atualizado",
              `${customer.name} foi atualizado com sucesso.`,
            );
          },

          onError: (
            error,
          ) => {
            notifications.error(
              "Não foi possível atualizar o cliente",
              getErrorMessage(
                error,
              ),
            );
          },
        },
      );

      return;
    }

    createMutation.mutate(
      commonInput,
      {
        onSuccess: (
          customer,
        ) => {
          closeForm();

          notifications.success(
            "Cliente cadastrado",
            `${customer.name} foi cadastrado com sucesso.`,
          );
        },

        onError: (
          error,
        ) => {
          notifications.error(
            "Não foi possível cadastrar o cliente",
            getErrorMessage(
              error,
            ),
          );
        },
      },
    );
  }

  function confirmStatusChange() {
    if (!statusCustomer) {
      return;
    }

    const nextStatus:
      CustomerStatus =
      statusCustomer.status ===
        "active"
        ? "inactive"
        : "active";

    statusMutation.mutate(
      {
        customerId:
          statusCustomer.id,

        status:
          nextStatus,
      },
      {
        onSuccess: (
          customer,
        ) => {
          setStatusCustomer(
            null,
          );

          notifications.success(
            customer.status ===
              "active"
              ? "Cliente ativado"
              : "Cliente inativado",

            `${customer.name} foi atualizado com sucesso.`,
          );
        },

        onError: (
          error,
        ) => {
          setStatusCustomer(
            null,
          );

          notifications.error(
            "Não foi possível alterar o cliente",
            getErrorMessage(
              error,
            ),
          );
        },
      },
    );
  }

  return (
    <section
      className={
        styles.page
      }
    >
      <header
        className={
          styles.pageHeader
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Relacionamento
          </span>

          <h2>
            Clientes
          </h2>

          <p>
            Cadastre clientes e mantenha seus dados de contato organizados.
          </p>
        </div>

        <button
          type="button"
          className={
            styles.createButton
          }
          onClick={
            openCreateForm
          }
        >
          <Plus size={18} />
          Novo cliente
        </button>
      </header>

      <div
        className={
          styles.metricsGrid
        }
      >
        <StatisticCard
          title="Resultados encontrados"
          value={String(
            result?.totalItems ?? 0,
          )}
          description="Conforme os filtros aplicados"
          icon={Users}
          color="blue"
        />

        <StatisticCard
          title="Página atual"
          value={String(
            result?.page ?? 1,
          )}
          description={`De ${result?.totalPages ?? 1} páginas`}
          icon={UserRound}
          color="purple"
        />

        <StatisticCard
          title="Disponíveis na página"
          value={String(
            customers.filter(
              (customer) =>
                customer.status ===
                "active",
            ).length,
          )}
          description="Clientes ativos nesta página"
          icon={UserCheck}
          color="green"
        />
      </div>

      <div
        className={
          styles.tableArea
        }
      >
        <TableCard
          title="Cadastro de clientes"
          description="Consulte, edite, ative ou inative os clientes cadastrados."
          icon={Users}
          badge={`${result?.totalItems ?? 0} resultados`}
          noPadding
        >
          <div
            className={
              styles.filters
            }
          >
            <label
              className={
                styles.searchField
              }
            >
              <Search size={17} />

              <input
                type="search"
                placeholder="Buscar por nome, documento, telefone ou e-mail"
                value={
                  filters.search
                }
                onChange={(
                  event,
                ) =>
                  setFilters(
                    (
                      currentFilters,
                    ) => ({
                      ...currentFilters,

                      search:
                        event.target.value,

                      page:
                        1,
                    }),
                  )
                }
              />
            </label>

            <select
              value={
                filters.status
              }
              onChange={(
                event,
              ) =>
                setFilters(
                  (
                    currentFilters,
                  ) => ({
                    ...currentFilters,

                    status:
                      event.target.value as
                        typeof currentFilters.status,

                    page:
                      1,
                  }),
                )
              }
            >
              <option value="all">
                Todos os status
              </option>

              <option value="active">
                Ativos
              </option>

              <option value="inactive">
                Inativos
              </option>
            </select>

            <select
              value={
                filters.sortBy
              }
              onChange={(
                event,
              ) =>
                setFilters(
                  (
                    currentFilters,
                  ) => ({
                    ...currentFilters,

                    sortBy:
                      event.target.value as
                        typeof currentFilters.sortBy,

                    page:
                      1,
                  }),
                )
              }
            >
              <option value="name">
                Ordenar por nome
              </option>

              <option value="createdAt">
                Data de cadastro
              </option>

              <option value="updatedAt">
                Última atualização
              </option>
            </select>
          </div>

          {customersQuery.isLoading && (
            <LoadingState
              title="Carregando clientes"
              description="Aguarde enquanto os cadastros são preparados."
            />
          )}

          {customersQuery.isError && (
            <ErrorState
              title="Não foi possível carregar os clientes"
              description={getErrorMessage(
                customersQuery.error,
              )}
              onRetry={() =>
                void customersQuery.refetch()
              }
            />
          )}

          {!customersQuery.isLoading &&
            !customersQuery.isError &&
            customers.length === 0 && (
              <EmptyState
                icon={Users}
                title="Nenhum cliente encontrado"
                description="Altere os filtros ou cadastre um novo cliente."
                action={
                  <button
                    type="button"
                    className={
                      styles.emptyButton
                    }
                    onClick={
                      openCreateForm
                    }
                  >
                    <Plus size={16} />
                    Cadastrar cliente
                  </button>
                }
              />
            )}

          {!customersQuery.isLoading &&
            !customersQuery.isError &&
            customers.length > 0 && (
              <>
                <div
                  className={
                    styles.tableWrapper
                  }
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Contato</th>
                        <th>Documento</th>
                        <th>Cidade</th>
                        <th>Status</th>
                        <th aria-label="Ações" />
                      </tr>
                    </thead>

                    <tbody>
                      {customers.map(
                        (
                          customer,
                        ) => (
                          <tr
                            key={
                              customer.id
                            }
                          >
                            <td>
                              <strong>
                                {customer.name}
                              </strong>

                              <span>
                                Código #{customer.id}
                              </span>
                            </td>

                            <td>
                              <span
                                className={
                                  styles.contact
                                }
                              >
                                <Phone size={13} />

                                {customer.phone ||
                                  "Sem telefone"}
                              </span>

                              <span
                                className={
                                  styles.contact
                                }
                              >
                                <Mail size={13} />

                                {customer.email ||
                                  "Sem e-mail"}
                              </span>
                            </td>

                            <td>
                              {formatDocument(
                                customer.document,
                              )}
                            </td>

                            <td>
                              <span
                                className={
                                  styles.contact
                                }
                              >
                                <MapPin size={13} />

                                {customer.address.city
                                  ? `${customer.address.city}/${customer.address.state}`
                                  : "Não informada"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={
                                  customer.status ===
                                    "active"
                                    ? styles.activeBadge
                                    : styles.inactiveBadge
                                }
                              >
                                {customer.status ===
                                  "active"
                                  ? "Ativo"
                                  : "Inativo"}
                              </span>
                            </td>

                            <td>
                              <div
                                className={
                                  styles.rowActions
                                }
                              >
                                <button
                                  type="button"
                                  title="Editar cliente"
                                  onClick={() =>
                                    openEditForm(
                                      customer,
                                    )
                                  }
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  type="button"
                                  title={
                                    customer.status ===
                                      "active"
                                      ? "Inativar cliente"
                                      : "Ativar cliente"
                                  }
                                  className={
                                    customer.status ===
                                      "active"
                                      ? styles.disableAction
                                      : styles.enableAction
                                  }
                                  onClick={() =>
                                    setStatusCustomer(
                                      customer,
                                    )
                                  }
                                >
                                  <Power size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={
                    result?.page ?? 1
                  }
                  pageSize={
                    result?.pageSize ??
                    filters.pageSize
                  }
                  totalItems={
                    result?.totalItems ?? 0
                  }
                  totalPages={
                    result?.totalPages ?? 1
                  }
                  onPageChange={(
                    page,
                  ) =>
                    setFilters(
                      (
                        currentFilters,
                      ) => ({
                        ...currentFilters,
                        page,
                      }),
                    )
                  }
                />
              </>
            )}
        </TableCard>
      </div>

      {isFormOpen && (
        <div
          className={
            styles.modalOverlay
          }
          role="presentation"
          onMouseDown={
            closeForm
          }
        >
          <form
            className={
              styles.modal
            }
            onSubmit={
              handleSubmit
            }
            onMouseDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <header
              className={
                styles.modalHeader
              }
            >
              <div>
                <span>
                  Cadastro interno
                </span>

                <h3>
                  {editingCustomer
                    ? "Editar cliente"
                    : "Novo cliente"}
                </h3>
              </div>

              <button
                type="button"
                disabled={
                  isSaving
                }
                onClick={
                  closeForm
                }
                aria-label="Fechar formulário"
              >
                <X size={20} />
              </button>
            </header>

            <div
              className={
                styles.formContent
              }
            >
              <div
                className={
                  styles.formGrid
                }
              >
                <label
                  className={
                    styles.fullField
                  }
                >
                  <span>
                    Nome *
                  </span>

                  <input
                    required
                    minLength={2}
                    value={
                      form.name
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "name",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    CPF ou CNPJ
                  </span>

                  <input
                    inputMode="numeric"
                    value={
                      form.document
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "document",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Telefone
                  </span>

                  <input
                    inputMode="tel"
                    value={
                      form.phone
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "phone",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label
                  className={
                    styles.fullField
                  }
                >
                  <span>
                    E-mail
                  </span>

                  <input
                    type="email"
                    value={
                      form.email
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "email",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>CEP</span>

                  <input
                    value={
                      form.postalCode
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "postalCode",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Número</span>

                  <input
                    value={
                      form.number
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "number",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label
                  className={
                    styles.fullField
                  }
                >
                  <span>Rua</span>

                  <input
                    value={
                      form.street
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "street",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Bairro</span>

                  <input
                    value={
                      form.neighborhood
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "neighborhood",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Complemento</span>

                  <input
                    value={
                      form.complement
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "complement",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Cidade</span>

                  <input
                    value={
                      form.city
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "city",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>Estado</span>

                  <input
                    maxLength={2}
                    value={
                      form.state
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "state",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label
                  className={
                    styles.fullField
                  }
                >
                  <span>Observações</span>

                  <textarea
                    rows={3}
                    value={
                      form.notes
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "notes",
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>
            </div>

            <footer
              className={
                styles.modalFooter
              }
            >
              <button
                type="button"
                disabled={
                  isSaving
                }
                onClick={
                  closeForm
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={
                  styles.saveButton
                }
                disabled={
                  isSaving
                }
              >
                {isSaving
                  ? "Salvando..."
                  : editingCustomer
                    ? "Salvar alterações"
                    : "Cadastrar cliente"}
              </button>
            </footer>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={
          statusCustomer !== null
        }
        title={
          statusCustomer?.status ===
            "active"
            ? "Inativar cliente"
            : "Ativar cliente"
        }
        description={
          statusCustomer
            ? `O cliente “${statusCustomer.name}” será ${
                statusCustomer.status ===
                  "active"
                  ? "inativado e deixará de aparecer nas novas vendas"
                  : "ativado novamente para uso no sistema"
              }.`
            : ""
        }
        confirmLabel="Confirmar alteração"
        variant="warning"
        onConfirm={
          confirmStatusChange
        }
        onCancel={() =>
          setStatusCustomer(
            null,
          )
        }
      />
    </section>
  );
}