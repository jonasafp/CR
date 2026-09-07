import {
  Edit3,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Power,
  Search,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import {
  type FormEvent,
  useState,
} from "react";

import {
  useChangeSupplierStatusMutation,
} from "../../application/suppliers/useChangeSupplierStatusMutation";

import {
  useCreateSupplierMutation,
} from "../../application/suppliers/useCreateSupplierMutation";

import {
  useSuppliersQuery,
} from "../../application/suppliers/useSupplierQuery";

import {
  useUpdateSupplierMutation,
} from "../../application/suppliers/useUpdateSupplierMutation";

import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import Pagination from "../../components/common/Pagination/Pagination";
import StatisticCard from "../../components/common/StatisticCard/StatisticCard";
import TableCard from "../../components/common/TableCard/TableCard";
import SupplierPurchaseHistoryModal from "../../components/suppliers/SupplierPurchaseHistoryModal/SupplierPurchaseHistoryModal";

import {
  getSupplierDisplayName,
} from "../../domain/suppliers/Supplier";

import type {
  CreateSupplierInput,
  Supplier,
  SupplierStatus,
  UpdateSupplierInput,
} from "../../domain/suppliers/Supplier";

import {
  createDefaultSupplierFilters,
} from "../../domain/suppliers/SupplierFilters";

import {
  useNotifications,
} from "../../hooks/useNotifications";

import {
  getErrorMessage,
} from "../../utils/errors";

import styles from "./Fornecedores.module.css";

interface SupplierFormState {
  legalName: string;
  tradeName: string;

  document: string;
  stateRegistration: string;

  contactName: string;
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
  status: SupplierStatus;
}

const emptyForm:
  SupplierFormState = {
  legalName: "",
  tradeName: "",

  document: "",
  stateRegistration: "",

  contactName: "",
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

function supplierToForm(
  supplier: Supplier,
): SupplierFormState {
  return {
    legalName:
      supplier.legalName,

    tradeName:
      supplier.tradeName,

    document:
      supplier.document,

    stateRegistration:
      supplier.stateRegistration,

    contactName:
      supplier.contactName,

    phone:
      supplier.phone,

    email:
      supplier.email,

    postalCode:
      supplier.address.postalCode,

    street:
      supplier.address.street,

    number:
      supplier.address.number,

    complement:
      supplier.address.complement,

    neighborhood:
      supplier.address.neighborhood,

    city:
      supplier.address.city,

    state:
      supplier.address.state,

    notes:
      supplier.notes,

    status:
      supplier.status,
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

export default function Fornecedores() {
  const notifications =
    useNotifications();

  const [
    filters,
    setFilters,
  ] = useState(
    createDefaultSupplierFilters(),
  );

  const [
    form,
    setForm,
  ] = useState<SupplierFormState>(
    emptyForm,
  );

  const [
    editingSupplier,
    setEditingSupplier,
  ] = useState<Supplier | null>(
    null,
  );

  const [
    statusSupplier,
    setStatusSupplier,
  ] = useState<Supplier | null>(
    null,
  );

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const suppliersQuery =
    useSuppliersQuery(
      filters,
    );

  const createMutation =
    useCreateSupplierMutation();

  const updateMutation =
    useUpdateSupplierMutation();

  const statusMutation =
    useChangeSupplierStatusMutation();

  const result =
    suppliersQuery.data;

  const suppliers =
    result?.items ?? [];

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  const [
    historySupplier,
    setHistorySupplier,
  ] = useState<Supplier | null>(
    null,
  );

  function openCreateForm() {
    setEditingSupplier(
      null,
    );

    setForm({
      ...emptyForm,
    });

    setIsFormOpen(
      true,
    );
  }

  function openEditForm(
    supplier: Supplier,
  ) {
    setEditingSupplier(
      supplier,
    );

    setForm(
      supplierToForm(
        supplier,
      ),
    );

    setIsFormOpen(
      true,
    );
  }

  function resetAndCloseForm() {
    setIsFormOpen(
      false,
    );

    setEditingSupplier(
      null,
    );

    setForm({
      ...emptyForm,
    });
  }

  function requestCloseForm() {
    if (isSaving) {
      return;
    }

    resetAndCloseForm();
  }

  function updateForm(
    field: keyof SupplierFormState,
    value: string,
  ) {
    setForm(
      (
        currentForm,
      ) => ({
        ...currentForm,
        [field]:
          value,
      }),
    );
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const commonInput:
      CreateSupplierInput = {
      legalName:
        form.legalName,

      tradeName:
        form.tradeName,

      document:
        form.document,

      stateRegistration:
        form.stateRegistration,

      contactName:
        form.contactName,

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

    if (
      editingSupplier
    ) {
      const input:
        UpdateSupplierInput = {
        ...commonInput,

        id:
          editingSupplier.id,

        status:
          form.status,
      };

      updateMutation.mutate(
        input,
        {
          onSuccess: (
            supplier,
          ) => {
            resetAndCloseForm();

            notifications.success(
              "Fornecedor atualizado",
              `${getSupplierDisplayName(supplier)} foi atualizado com sucesso.`,
            );
          },

          onError: (
            error,
          ) => {
            notifications.error(
              "Não foi possível atualizar o fornecedor",
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
          supplier,
        ) => {
          resetAndCloseForm();

          notifications.success(
            "Fornecedor cadastrado",
            `${getSupplierDisplayName(supplier)} foi cadastrado com sucesso.`,
          );
        },

        onError: (
          error,
        ) => {
          notifications.error(
            "Não foi possível cadastrar o fornecedor",
            getErrorMessage(
              error,
            ),
          );
        },
      },
    );
  }

  function confirmStatusChange() {
    if (
      !statusSupplier
    ) {
      return;
    }

    const nextStatus:
      SupplierStatus =
      statusSupplier.status ===
        "active"
        ? "inactive"
        : "active";

    statusMutation.mutate(
      {
        supplierId:
          statusSupplier.id,

        status:
          nextStatus,
      },
      {
        onSuccess: (
          supplier,
        ) => {
          setStatusSupplier(
            null,
          );

          notifications.success(
            supplier.status ===
              "active"
              ? "Fornecedor ativado"
              : "Fornecedor inativado",

            `${getSupplierDisplayName(supplier)} foi atualizado com sucesso.`,
          );
        },

        onError: (
          error,
        ) => {
          setStatusSupplier(
            null,
          );

          notifications.error(
            "Não foi possível alterar o fornecedor",
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
            Abastecimento
          </span>

          <h2>
            Fornecedores
          </h2>

          <p>
            Organize fornecedores, contatos e informações comerciais.
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
          Novo fornecedor
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
            result?.totalItems ??
            0,
          )}
          description="Conforme os filtros aplicados"
          icon={Truck}
          color="blue"
        />

        <StatisticCard
          title="Página atual"
          value={String(
            result?.page ??
            1,
          )}
          description={`De ${result?.totalPages ?? 1} páginas`}
          icon={UserRound}
          color="purple"
        />

        <StatisticCard
          title="Ativos nesta página"
          value={String(
            suppliers.filter(
              (supplier) =>
                supplier.status ===
                "active",
            ).length,
          )}
          description="Disponíveis para novas compras"
          icon={Power}
          color="green"
        />
      </div>

      <div
        className={
          styles.tableArea
        }
      >
        <TableCard
          title="Cadastro de fornecedores"
          description="Consulte e gerencie os fornecedores da empresa."
          icon={Truck}
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
                placeholder="Buscar nome, documento, contato, telefone ou e-mail"
                value={
                  filters.search
                }
                onChange={(
                  event,
                ) =>
                  setFilters(
                    (
                      current,
                    ) => ({
                      ...current,

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
                    current,
                  ) => ({
                    ...current,

                    status:
                      event.target.value as
                      typeof current.status,

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
                    current,
                  ) => ({
                    ...current,

                    sortBy:
                      event.target.value as
                      typeof current.sortBy,

                    page:
                      1,
                  }),
                )
              }
            >
              <option value="tradeName">
                Nome de exibição
              </option>

              <option value="legalName">
                Razão social
              </option>

              <option value="createdAt">
                Data de cadastro
              </option>

              <option value="updatedAt">
                Última atualização
              </option>
            </select>
          </div>

          {suppliersQuery.isLoading && (
            <LoadingState
              title="Carregando fornecedores"
              description="Aguarde enquanto os cadastros são preparados."
            />
          )}

          {suppliersQuery.isError && (
            <ErrorState
              title="Não foi possível carregar os fornecedores"
              description={
                getErrorMessage(
                  suppliersQuery.error,
                )
              }
              onRetry={() =>
                void suppliersQuery.refetch()
              }
            />
          )}

          {!suppliersQuery.isLoading &&
            !suppliersQuery.isError &&
            suppliers.length ===
            0 && (
              <EmptyState
                icon={Truck}
                title="Nenhum fornecedor encontrado"
                description="Altere os filtros ou cadastre um novo fornecedor."
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
                    Cadastrar fornecedor
                  </button>
                }
              />
            )}

          {!suppliersQuery.isLoading &&
            !suppliersQuery.isError &&
            suppliers.length >
            0 && (
              <>
                <div
                  className={
                    styles.tableWrapper
                  }
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Fornecedor</th>
                        <th>Contato</th>
                        <th>Documento</th>
                        <th>Localização</th>
                        <th>Status</th>
                        <th aria-label="Ações" />
                      </tr>
                    </thead>

                    <tbody>
                      {suppliers.map(
                        (
                          supplier,
                        ) => (
                          <tr
                            key={
                              supplier.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  getSupplierDisplayName(
                                    supplier,
                                  )
                                }
                              </strong>

                              <span>
                                {
                                  supplier.tradeName
                                    ? supplier.legalName
                                    : `Código #${supplier.id}`
                                }
                              </span>
                            </td>

                            <td>
                              <span
                                className={
                                  styles.contact
                                }
                              >
                                <Phone size={13} />

                                {supplier.phone ||
                                  "Sem telefone"}
                              </span>

                              <span
                                className={
                                  styles.contact
                                }
                              >
                                <Mail size={13} />

                                {supplier.email ||
                                  "Sem e-mail"}
                              </span>
                            </td>

                            <td>
                              {
                                formatDocument(
                                  supplier.document,
                                )
                              }
                            </td>

                            <td>
                              <span
                                className={
                                  styles.contact
                                }
                              >
                                <MapPin size={13} />

                                {supplier.address.city
                                  ? `${supplier.address.city}/${supplier.address.state}`
                                  : "Não informada"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={
                                  supplier.status ===
                                    "active"
                                    ? styles.activeBadge
                                    : styles.inactiveBadge
                                }
                              >
                                {supplier.status ===
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
                                  title="Ver histórico de compras"
                                  onClick={() =>
                                    setHistorySupplier(
                                      supplier,
                                    )
                                  }
                                >
                                  <Eye size={15} />
                                </button>

                                <button
                                  type="button"
                                  title="Editar fornecedor"
                                  onClick={() =>
                                    openEditForm(
                                      supplier,
                                    )
                                  }
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  type="button"
                                  title={
                                    supplier.status ===
                                      "active"
                                      ? "Inativar fornecedor"
                                      : "Ativar fornecedor"
                                  }
                                  className={
                                    supplier.status ===
                                      "active"
                                      ? styles.disableAction
                                      : styles.enableAction
                                  }
                                  onClick={() =>
                                    setStatusSupplier(
                                      supplier,
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
                    result?.page ??
                    1
                  }
                  pageSize={
                    result?.pageSize ??
                    filters.pageSize
                  }
                  totalItems={
                    result?.totalItems ??
                    0
                  }
                  totalPages={
                    result?.totalPages ??
                    1
                  }
                  onPageChange={(
                    page,
                  ) =>
                    setFilters(
                      (
                        current,
                      ) => ({
                        ...current,
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
            requestCloseForm
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
                  {editingSupplier
                    ? "Editar fornecedor"
                    : "Novo fornecedor"}
                </h3>
              </div>

              <button
                type="button"
                disabled={
                  isSaving
                }
                onClick={
                  requestCloseForm
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
                    Razão social ou nome *
                  </span>

                  <input
                    required
                    minLength={2}
                    value={
                      form.legalName
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "legalName",
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
                    Nome fantasia
                  </span>

                  <input
                    value={
                      form.tradeName
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "tradeName",
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
                    Inscrição estadual
                  </span>

                  <input
                    value={
                      form.stateRegistration
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "stateRegistration",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Pessoa de contato
                  </span>

                  <input
                    value={
                      form.contactName
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "contactName",
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
                  <span>E-mail</span>

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
                  requestCloseForm
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
                  : editingSupplier
                    ? "Salvar alterações"
                    : "Cadastrar fornecedor"}
              </button>
            </footer>
          </form>
        </div>
      )}

      <SupplierPurchaseHistoryModal
        supplier={
          historySupplier
        }
        onClose={() =>
          setHistorySupplier(
            null,
          )
        }
      />

      <ConfirmDialog
        isOpen={
          statusSupplier !==
          null
        }
        title={
          statusSupplier?.status ===
            "active"
            ? "Inativar fornecedor"
            : "Ativar fornecedor"
        }
        description={
          statusSupplier
            ? `O fornecedor “${getSupplierDisplayName(statusSupplier)}” será ${statusSupplier.status ===
              "active"
              ? "inativado e deixará de estar disponível para novas compras"
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
          setStatusSupplier(
            null,
          )
        }
      />
    </section>
  );
}