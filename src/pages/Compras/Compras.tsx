import {
  Ban,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Edit3,
  Package,
  Plus,
  Search,
  ShoppingBasket,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

import {
  useActiveSuppliersQuery,
} from "../../application/suppliers/useSupplierQuery";

import {
  useCancelPurchaseMutation,
  useCompletePurchaseMutation,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
} from "../../application/purchases/usePurchaseMutations";

import {
  usePurchasesQuery,
  usePurchaseSummaryQuery,
} from "../../application/purchases/usePurchaseQuery";

import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import Pagination from "../../components/common/Pagination/Pagination";
import StatisticCard from "../../components/common/StatisticCard/StatisticCard";
import TableCard from "../../components/common/TableCard/TableCard";

import type {
  CreatePurchaseInput,
  Purchase,
  PurchaseCartItem,
  UpdatePurchaseInput,
} from "../../domain/purchases/Purchase";

import {
  createDefaultPurchaseFilters,
} from "../../domain/purchases/PurchaseFilters";

import {
  getSupplierDisplayName,
} from "../../domain/suppliers/Supplier";

import {
  useNotifications,
} from "../../hooks/useNotifications";

import {
  useProducts,
} from "../../hooks/useProducts";

import {
  getErrorMessage,
} from "../../utils/errors";

import {
  formatCurrency,
  formatDate,
  formatStockQuantity,
} from "../../utils/formatters";

import styles from "./Compras.module.css";

interface PurchaseFormState {
  supplierId: string;
  documentNumber: string;
  purchaseDate: string;

  discount: number;
  freight: number;
  otherExpenses: number;

  notes: string;
}

interface PurchaseConfirmation {
  type:
    | "complete"
    | "cancel";

  purchase:
    Purchase;
}

function getTodayValue():
  string {
  const now =
    new Date();

  const timezoneOffset =
    now.getTimezoneOffset() *
    60_000;

  return new Date(
    now.getTime() -
    timezoneOffset,
  )
    .toISOString()
    .slice(
      0,
      10,
    );
}

function createEmptyForm():
  PurchaseFormState {
  return {
    supplierId:
      "",

    documentNumber:
      "",

    purchaseDate:
      getTodayValue(),

    discount:
      0,

    freight:
      0,

    otherExpenses:
      0,

    notes:
      "",
  };
}

function getStatusLabel(
  purchase: Purchase,
): string {
  if (
    purchase.status ===
    "completed"
  ) {
    return "Concluída";
  }

  if (
    purchase.status ===
    "cancelled"
  ) {
    return "Cancelada";
  }

  return "Pendente";
}

export default function Compras() {
  const notifications =
    useNotifications();

  const {
    products,
  } = useProducts();

  const [
    filters,
    setFilters,
  ] = useState(
    createDefaultPurchaseFilters(),
  );

  const [
    form,
    setForm,
  ] = useState<PurchaseFormState>(
    createEmptyForm(),
  );

  const [
    cart,
    setCart,
  ] = useState<PurchaseCartItem[]>(
    [],
  );

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState("");

  const [
    editingPurchase,
    setEditingPurchase,
  ] = useState<Purchase | null>(
    null,
  );

  const [
    confirmation,
    setConfirmation,
  ] = useState<PurchaseConfirmation | null>(
    null,
  );

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const suppliersQuery =
    useActiveSuppliersQuery();

  const purchasesQuery =
    usePurchasesQuery(
      filters,
    );

  const summaryQuery =
    usePurchaseSummaryQuery();

  const createMutation =
    useCreatePurchaseMutation();

  const updateMutation =
    useUpdatePurchaseMutation();

  const completeMutation =
    useCompletePurchaseMutation();

  const cancelMutation =
    useCancelPurchaseMutation();

  const result =
    purchasesQuery.data;

  const purchases =
    result?.items ?? [];

  const suppliers =
    suppliersQuery.data ?? [];

  const activeProducts =
    useMemo(
      () =>
        products.filter(
          (product) =>
            product.status ===
            "active",
        ),
      [
        products,
      ],
    );

  const subtotal =
    useMemo(
      () =>
        cart.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.quantity *
              item.unitCost,
          0,
        ),
      [
        cart,
      ],
    );

  const total =
    Math.max(
      0,
      subtotal -
        form.discount +
        form.freight +
        form.otherExpenses,
    );

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  function updateForm(
    field: keyof PurchaseFormState,
    value: string | number,
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [field]:
          value,
      }),
    );
  }

  function resetAndCloseForm() {
    setIsFormOpen(
      false,
    );

    setEditingPurchase(
      null,
    );

    setSelectedProductId(
      "",
    );

    setCart([]);

    setForm(
      createEmptyForm(),
    );
  }

  function requestCloseForm() {
    if (!isSaving) {
      resetAndCloseForm();
    }
  }

  function openCreateForm() {
    setEditingPurchase(
      null,
    );

    setCart([]);

    setSelectedProductId(
      "",
    );

    setForm(
      createEmptyForm(),
    );

    setIsFormOpen(
      true,
    );
  }

  function openEditForm(
    purchase: Purchase,
  ) {
    if (
      purchase.status !==
      "pending"
    ) {
      return;
    }

    setEditingPurchase(
      purchase,
    );

    setForm({
      supplierId:
        String(
          purchase.supplierId,
        ),

      documentNumber:
        purchase.documentNumber,

      purchaseDate:
        purchase.purchaseDate.slice(
          0,
          10,
        ),

      discount:
        purchase.discount,

      freight:
        purchase.freight,

      otherExpenses:
        purchase.otherExpenses,

      notes:
        purchase.notes,
    });

    setCart(
      purchase.items.map(
        (item) => ({
          productId:
            item.productId,

          quantity:
            item.quantity,

          unitCost:
            item.unitCost,
        }),
      ),
    );

    setSelectedProductId(
      "",
    );

    setIsFormOpen(
      true,
    );
  }

  function addProduct() {
    const productId =
      Number(
        selectedProductId,
      );

    const product =
      activeProducts.find(
        (item) =>
          item.id ===
          productId,
      );

    if (!product) {
      notifications.error(
        "Produto não selecionado",
        "Selecione um produto válido.",
      );

      return;
    }

    const existingItem =
      cart.find(
        (item) =>
          item.productId ===
          product.id,
      );

    if (existingItem) {
      setCart(
        (
          current,
        ) =>
          current.map(
            (item) =>
              item.productId ===
              product.id
                ? {
                    ...item,

                    quantity:
                      item.quantity +
                      1,
                  }
                : item,
          ),
      );
    } else {
      setCart(
        (
          current,
        ) => [
          ...current,

          {
            productId:
              product.id,

            quantity:
              1,

            unitCost:
              product.purchasePrice,
          },
        ],
      );
    }

    setSelectedProductId(
      "",
    );
  }

  function updateCartItem(
    productId: number,
    field:
      | "quantity"
      | "unitCost",
    value: number,
  ) {
    setCart(
      (
        current,
      ) =>
        current.map(
          (item) =>
            item.productId ===
            productId
              ? {
                  ...item,

                  [field]:
                    Math.max(
                      0,
                      value,
                    ),
                }
              : item,
        ),
    );
  }

  function removeCartItem(
    productId: number,
  ) {
    setCart(
      (
        current,
      ) =>
        current.filter(
          (item) =>
            item.productId !==
            productId,
        ),
    );
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !form.supplierId
    ) {
      notifications.error(
        "Fornecedor obrigatório",
        "Selecione um fornecedor para a compra.",
      );

      return;
    }

    if (
      cart.length === 0
    ) {
      notifications.error(
        "Compra sem produtos",
        "Adicione pelo menos um produto.",
      );

      return;
    }

    const commonInput:
      CreatePurchaseInput = {
      supplierId:
        Number(
          form.supplierId,
        ),

      documentNumber:
        form.documentNumber,

      purchaseDate:
        form.purchaseDate,

      items:
        cart,

      discount:
        form.discount,

      freight:
        form.freight,

      otherExpenses:
        form.otherExpenses,

      notes:
        form.notes,
    };

    if (
      editingPurchase
    ) {
      const input:
        UpdatePurchaseInput = {
        ...commonInput,

        purchaseId:
          editingPurchase.id,
      };

      updateMutation.mutate(
        input,
        {
          onSuccess: (
            purchase,
          ) => {
            resetAndCloseForm();

            notifications.success(
              "Compra atualizada",
              `${purchase.number} foi atualizada com sucesso.`,
            );
          },

          onError: (
            error,
          ) => {
            notifications.error(
              "Não foi possível atualizar a compra",
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
          purchase,
        ) => {
          resetAndCloseForm();

          notifications.success(
            "Compra cadastrada",
            `${purchase.number} foi salva como pendente.`,
          );
        },

        onError: (
          error,
        ) => {
          notifications.error(
            "Não foi possível cadastrar a compra",
            getErrorMessage(
              error,
            ),
          );
        },
      },
    );
  }

  function confirmPurchaseAction() {
    if (
      !confirmation
    ) {
      return;
    }

    if (
      confirmation.type ===
      "complete"
    ) {
      completeMutation.mutate(
        {
          purchaseId:
            confirmation.purchase.id,
        },
        {
          onSuccess: (
            purchase,
          ) => {
            setConfirmation(
              null,
            );

            notifications.success(
              "Compra concluída",
              `${purchase.number} atualizou o estoque com sucesso.`,
            );
          },

          onError: (
            error,
          ) => {
            setConfirmation(
              null,
            );

            notifications.error(
              "Não foi possível concluir a compra",
              getErrorMessage(
                error,
              ),
            );
          },
        },
      );

      return;
    }

    const reason =
      window.prompt(
        "Informe o motivo do cancelamento:",
      )
        ?.trim() ?? "";

    if (!reason) {
      setConfirmation(
        null,
      );

      return;
    }

    cancelMutation.mutate(
      {
        purchaseId:
          confirmation.purchase.id,

        reason,
      },
      {
        onSuccess: (
          purchase,
        ) => {
          setConfirmation(
            null,
          );

          notifications.success(
            "Compra cancelada",
            `${purchase.number} foi cancelada com sucesso.`,
          );
        },

        onError: (
          error,
        ) => {
          setConfirmation(
            null,
          );

          notifications.error(
            "Não foi possível cancelar a compra",
            getErrorMessage(
              error,
            ),
          );
        },
      },
    );
  }

  const summary =
    summaryQuery.data;

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
            Compras
          </h2>

          <p>
            Registre compras e controle a entrada dos produtos no estoque.
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
          Nova compra
        </button>
      </header>

      <div
        className={
          styles.metricsGrid
        }
      >
        <StatisticCard
          title="Compras"
          value={String(
            summary?.totalPurchases ??
            0,
          )}
          description="Total de registros"
          icon={ShoppingBasket}
          color="blue"
        />

        <StatisticCard
          title="Pendentes"
          value={String(
            summary?.pendingPurchases ??
            0,
          )}
          description="Aguardando entrada"
          icon={Clock3}
          color="orange"
        />

        <StatisticCard
          title="Concluídas"
          value={String(
            summary?.completedPurchases ??
            0,
          )}
          description="Estoque atualizado"
          icon={CheckCircle2}
          color="green"
        />

        <StatisticCard
          title="Canceladas"
          value={String(
            summary?.cancelledPurchases ??
            0,
          )}
          description="Operações canceladas"
          icon={XCircle}
          color="red"
        />

        <StatisticCard
          title="Valor comprado"
          value={
            formatCurrency(
              summary?.totalCompletedValue ??
              0,
            )
          }
          description="Somente compras concluídas"
          icon={CircleDollarSign}
          color="purple"
          highlighted
        />
      </div>

      <div
        className={
          styles.tableArea
        }
      >
        <TableCard
          title="Histórico de compras"
          description="Consulte, edite, conclua ou cancele as compras."
          icon={ShoppingBasket}
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
                placeholder="Buscar compra, fornecedor ou documento"
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

              <option value="pending">
                Pendentes
              </option>

              <option value="completed">
                Concluídas
              </option>

              <option value="cancelled">
                Canceladas
              </option>
            </select>
          </div>

          {purchasesQuery.isLoading && (
            <LoadingState
              title="Carregando compras"
            />
          )}

          {purchasesQuery.isError && (
            <ErrorState
              description={
                getErrorMessage(
                  purchasesQuery.error,
                )
              }
              onRetry={() =>
                void purchasesQuery.refetch()
              }
            />
          )}

          {!purchasesQuery.isLoading &&
            !purchasesQuery.isError &&
            purchases.length ===
              0 && (
              <EmptyState
                icon={ShoppingBasket}
                title="Nenhuma compra encontrada"
                description="Cadastre uma compra ou altere os filtros."
              />
            )}

          {purchases.length >
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
                      <th>Compra</th>
                      <th>Fornecedor</th>
                      <th>Data</th>
                      <th>Itens</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th aria-label="Ações" />
                    </tr>
                  </thead>

                  <tbody>
                    {purchases.map(
                      (
                        purchase,
                      ) => (
                        <tr
                          key={
                            purchase.id
                          }
                        >
                          <td>
                            <strong>
                              {purchase.number}
                            </strong>

                            <span>
                              {purchase.documentNumber ||
                                "Sem documento"}
                            </span>
                          </td>

                          <td>
                            {purchase.supplierName}
                          </td>

                          <td>
                            {formatDate(
                              purchase.purchaseDate,
                            )}
                          </td>

                          <td>
                            {purchase.items.length}
                          </td>

                          <td>
                            <strong>
                              {formatCurrency(
                                purchase.total,
                              )}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={
                                styles[
                                  purchase.status
                                ]
                              }
                            >
                              {getStatusLabel(
                                purchase,
                              )}
                            </span>
                          </td>

                          <td>
                            <div
                              className={
                                styles.rowActions
                              }
                            >
                              {purchase.status ===
                                "pending" && (
                                <>
                                  <button
                                    type="button"
                                    title="Editar compra"
                                    onClick={() =>
                                      openEditForm(
                                        purchase,
                                      )
                                    }
                                  >
                                    <Edit3 size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Concluir compra"
                                    className={
                                      styles.completeAction
                                    }
                                    onClick={() =>
                                      setConfirmation({
                                        type:
                                          "complete",

                                        purchase,
                                      })
                                    }
                                  >
                                    <Check size={15} />
                                  </button>
                                </>
                              )}

                              {purchase.status !==
                                "cancelled" && (
                                <button
                                  type="button"
                                  title="Cancelar compra"
                                  className={
                                    styles.cancelAction
                                  }
                                  onClick={() =>
                                    setConfirmation({
                                      type:
                                        "cancel",

                                      purchase,
                                    })
                                  }
                                >
                                  <Ban size={15} />
                                </button>
                              )}
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
                  Compra interna
                </span>

                <h3>
                  {editingPurchase
                    ? `Editar ${editingPurchase.number}`
                    : "Nova compra"}
                </h3>
              </div>

              <button
                type="button"
                onClick={
                  requestCloseForm
                }
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
                <label>
                  <span>
                    Fornecedor *
                  </span>

                  <select
                    required
                    value={
                      form.supplierId
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "supplierId",
                        event.target.value,
                      )
                    }
                  >
                    <option value="">
                      Selecione
                    </option>

                    {suppliers.map(
                      (
                        supplier,
                      ) => (
                        <option
                          key={
                            supplier.id
                          }
                          value={
                            supplier.id
                          }
                        >
                          {
                            getSupplierDisplayName(
                              supplier,
                            )
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span>
                    Data *
                  </span>

                  <input
                    required
                    type="date"
                    value={
                      form.purchaseDate
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "purchaseDate",
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
                    Documento ou referência
                  </span>

                  <input
                    value={
                      form.documentNumber
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "documentNumber",
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>

              <div
                className={
                  styles.productSelector
                }
              >
                <label>
                  <span>
                    Adicionar produto
                  </span>

                  <select
                    value={
                      selectedProductId
                    }
                    onChange={(
                      event,
                    ) =>
                      setSelectedProductId(
                        event.target.value,
                      )
                    }
                  >
                    <option value="">
                      Selecione um produto
                    </option>

                    {activeProducts.map(
                      (
                        product,
                      ) => (
                        <option
                          key={
                            product.id
                          }
                          value={
                            product.id
                          }
                        >
                          {product.name} —{" "}
                          {formatStockQuantity(
                            product.stockQuantity,
                            product.stockUnit,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={
                    addProduct
                  }
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>

              <div
                className={
                  styles.items
                }
              >
                {cart.length ===
                  0 ? (
                  <div
                    className={
                      styles.emptyCart
                    }
                  >
                    <Package size={25} />
                    Nenhum produto adicionado.
                  </div>
                ) : (
                  cart.map(
                    (
                      item,
                    ) => {
                      const product =
                        products.find(
                          (
                            candidate,
                          ) =>
                            candidate.id ===
                            item.productId,
                        );

                      if (!product) {
                        return null;
                      }

                      return (
                        <article
                          key={
                            item.productId
                          }
                        >
                          <div
                            className={
                              styles.itemName
                            }
                          >
                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              {product.code} ·{" "}
                              {product.stockUnit}
                            </span>
                          </div>

                          <label>
                            <span>
                              Quantidade
                            </span>

                            <input
                              type="number"
                              min="0.001"
                              step="0.001"
                              value={
                                item.quantity
                              }
                              onChange={(
                                event,
                              ) =>
                                updateCartItem(
                                  item.productId,
                                  "quantity",
                                  Number(
                                    event.target.value,
                                  ),
                                )
                              }
                            />
                          </label>

                          <label>
                            <span>
                              Custo unitário
                            </span>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                item.unitCost
                              }
                              onChange={(
                                event,
                              ) =>
                                updateCartItem(
                                  item.productId,
                                  "unitCost",
                                  Number(
                                    event.target.value,
                                  ),
                                )
                              }
                            />
                          </label>

                          <strong>
                            {formatCurrency(
                              item.quantity *
                                item.unitCost,
                            )}
                          </strong>

                          <button
                            type="button"
                            className={
                              styles.removeItem
                            }
                            onClick={() =>
                              removeCartItem(
                                item.productId,
                              )
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </article>
                      );
                    },
                  )
                )}
              </div>

              <div
                className={
                  styles.valuesGrid
                }
              >
                <label>
                  <span>Desconto</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.discount
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "discount",
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  />
                </label>

                <label>
                  <span>Frete</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.freight
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "freight",
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Outras despesas
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.otherExpenses
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "otherExpenses",
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  />
                </label>
              </div>

              <label
                className={
                  styles.notesField
                }
              >
                <span>
                  Observações
                </span>

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

              <div
                className={
                  styles.totals
                }
              >
                <span>
                  Subtotal:{" "}
                  <strong>
                    {formatCurrency(
                      subtotal,
                    )}
                  </strong>
                </span>

                <span>
                  Total:{" "}
                  <strong>
                    {formatCurrency(
                      total,
                    )}
                  </strong>
                </span>
              </div>
            </div>

            <footer
              className={
                styles.modalFooter
              }
            >
              <button
                type="button"
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
                  : editingPurchase
                    ? "Salvar alterações"
                    : "Salvar compra pendente"}
              </button>
            </footer>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={
          confirmation !==
          null
        }
        title={
          confirmation?.type ===
            "complete"
            ? "Concluir compra"
            : "Cancelar compra"
        }
        description={
          confirmation?.type ===
            "complete"
            ? "Os produtos serão adicionados ao estoque e serão criadas movimentações de entrada."
            : "Se a compra estiver concluída, as quantidades serão retiradas do estoque."
        }
        confirmLabel={
          confirmation?.type ===
            "complete"
            ? "Concluir e atualizar estoque"
            : "Continuar cancelamento"
        }
        variant={
          confirmation?.type ===
            "complete"
            ? "warning"
            : "danger"
        }
        onConfirm={
          confirmPurchaseAction
        }
        onCancel={() =>
          setConfirmation(
            null,
          )
        }
      />
    </section>
  );
}