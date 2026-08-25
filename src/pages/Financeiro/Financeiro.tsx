import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  HandCoins,
  Landmark,
  Plus,
  ReceiptText,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import Pagination from "../../components/common/Pagination/Pagination";
import StatisticCard from "../../components/common/StatisticCard/StatisticCard";
import TableCard from "../../components/common/TableCard/TableCard";

import FinancialDetailsModal from "../../components/financial/FinancialDetailsModal/FinancialDetailsModal";
import FinancialFilters from "../../components/financial/FinancialFilters/FinancialFilters";
import FinancialSettleModal from "../../components/financial/FinancialSettleModal/FinancialSettleModal";
import FinancialTable from "../../components/financial/FinancialTable/FinancialTable";
import FinancialTransactionModal from "../../components/financial/FinancialTransactionModal/FinancialTransactionModal";

import {
  useCancelFinancialTransactionMutation,
} from "../../application/financial/useCancelFinancialTransactionMutation";

import {
  useCreateFinancialTransactionMutation,
} from "../../application/financial/useCreateFinancialTransactionMutation";

import {
  useFinancialCategoriesQuery,
} from "../../application/financial/useFinancialCategoriesQuery";

import {
  useFinancialQuery,
} from "../../application/financial/useFinancialQuery";

import {
  useSettleFinancialTransactionMutation,
} from "../../application/financial/useSettleFinancialTransactionMutation";

import {
  useUpdateFinancialTransactionMutation,
} from "../../application/financial/useUpdateFinancialTransactionMutation";

import {
  defaultFinancialFilters,
} from "../../domain/financial/FinancialFilters";

import type {
  FinancialFilters as FinancialFiltersState,
} from "../../domain/financial/FinancialFilters";

import type {
  CancelFinancialTransactionInput,
  CreateFinancialTransactionInput,
  FinancialTransaction,
  SettleFinancialTransactionInput,
  UpdateFinancialTransactionInput,
} from "../../domain/financial/FinancialTransaction";

import {
  formatCurrency,
} from "../../utils/formatters";

import {
  getErrorMessage,
} from "../../utils/errors";

import {
  useSettings,
} from "../../hooks/useSettings";

import styles from "./Financeiro.module.css";

export default function Financeiro() {
  const { settings } =
    useSettings();

  const financialSettings =
    settings.financial;

  const [
    filters,
    setFilters,
  ] = useState<FinancialFiltersState>({
    ...defaultFinancialFilters,
  });

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const [
    editingTransaction,
    setEditingTransaction,
  ] = useState<
    FinancialTransaction | null
  >(null);

  const [
    selectedTransaction,
    setSelectedTransaction,
  ] = useState<
    FinancialTransaction | null
  >(null);

  const [
    settlementTransaction,
    setSettlementTransaction,
  ] = useState<
    FinancialTransaction | null
  >(null);

  const [
    transactionToCancel,
    setTransactionToCancel,
  ] = useState<
    FinancialTransaction | null
  >(null);

  const {
    transactionsQuery,
    summaryQuery,
    categorySummaryQuery,
  } = useFinancialQuery(
    filters,
  );

  const incomeCategoriesQuery =
    useFinancialCategoriesQuery(
      "income",
    );

  const expenseCategoriesQuery =
    useFinancialCategoriesQuery(
      "expense",
    );

  const createMutation =
    useCreateFinancialTransactionMutation();

  const updateMutation =
    useUpdateFinancialTransactionMutation();

  const settleMutation =
    useSettleFinancialTransactionMutation();

  const cancelMutation =
    useCancelFinancialTransactionMutation();

  const summary =
    summaryQuery.data;

  const categoriesByType =
    useMemo(
      () => ({
        income: Array.from(
          new Set([
            financialSettings.defaultIncomeCategory,
            ...(incomeCategoriesQuery.data ?? []),
          ]),
        ).filter(Boolean),

        expense: Array.from(
          new Set([
            financialSettings.defaultExpenseCategory,
            ...(expenseCategoriesQuery.data ?? []),
          ]),
        ).filter(Boolean),
      }),
      [
        incomeCategoriesQuery.data,
        expenseCategoriesQuery.data,
        financialSettings.defaultIncomeCategory,
        financialSettings.defaultExpenseCategory,
      ],
    );

  const filterCategories =
    useMemo(
      () =>
        Array.from(
          new Set([
            ...categoriesByType.income,
            ...categoriesByType.expense,
          ]),
        ).sort(
          (
            firstCategory,
            secondCategory,
          ) =>
            firstCategory.localeCompare(
              secondCategory,
              "pt-BR",
            ),
        ),
      [categoriesByType],
    );

  const topCategories =
    useMemo(
      () =>
        (
          categorySummaryQuery.data ??
          []
        ).slice(0, 5),
      [
        categorySummaryQuery.data,
      ],
    );

  const largestCategoryValue =
    useMemo(
      () =>
        Math.max(
          1,

          ...topCategories.map(
            (category) =>
              category.income +
              category.expense,
          ),
        ),
      [topCategories],
    );

  const overdueTotal =
    (
      summary?.overdueReceivable ??
      0
    ) +
    (
      summary?.overduePayable ??
      0
    );

  const formMutation =
    editingTransaction
      ? updateMutation
      : createMutation;

  function resetFormMutations() {
    createMutation.reset();
    updateMutation.reset();
  }

  function handleOpenCreate() {
    resetFormMutations();

    setEditingTransaction(
      null,
    );

    setIsFormOpen(true);
  }

  function handleOpenEdit(
    transaction:
      FinancialTransaction,
  ) {
    resetFormMutations();

    setEditingTransaction(
      transaction,
    );

    setIsFormOpen(true);
  }

  function handleCloseForm() {
    if (
      createMutation.isPending ||
      updateMutation.isPending
    ) {
      return;
    }

    resetFormMutations();

    setIsFormOpen(false);

    setEditingTransaction(
      null,
    );
  }

  function handleFormSubmit(
    input:
      | CreateFinancialTransactionInput
      | UpdateFinancialTransactionInput,
  ) {
    if (
      "transactionId" in
      input
    ) {
      updateMutation.mutate(
        input,
        {
          onSuccess: () => {
            setIsFormOpen(
              false,
            );

            setEditingTransaction(
              null,
            );
          },
        },
      );

      return;
    }

    createMutation.mutate(
      input,
      {
        onSuccess: () => {
          setIsFormOpen(
            false,
          );
        },
      },
    );
  }

  function handleOpenSettle(
    transaction:
      FinancialTransaction,
  ) {
    settleMutation.reset();

    setSettlementTransaction(
      transaction,
    );
  }

  function handleCloseSettle() {
    if (
      settleMutation.isPending
    ) {
      return;
    }

    settleMutation.reset();

    setSettlementTransaction(
      null,
    );
  }

  function handleSettle(
    input:
      SettleFinancialTransactionInput,
  ) {
    settleMutation.mutate(
      input,
      {
        onSuccess: () => {
          setSettlementTransaction(
            null,
          );
        },
      },
    );
  }

  function handleOpenCancel(
    transaction:
      FinancialTransaction,
  ) {
    cancelMutation.reset();

    setTransactionToCancel(
      transaction,
    );
  }

  function handleCloseCancel() {
    if (
      cancelMutation.isPending
    ) {
      return;
    }

    cancelMutation.reset();

    setTransactionToCancel(
      null,
    );
  }

  function handleConfirmCancel() {
    if (
      !transactionToCancel
    ) {
      return;
    }

    const input:
      CancelFinancialTransactionInput =
    {
      transactionId:
        transactionToCancel.id,

      reason:
        "Cancelamento manual realizado pelo administrador.",
    };

    cancelMutation.mutate(
      input,
      {
        onSuccess: () => {
          setTransactionToCancel(
            null,
          );
        },
      },
    );
  }

  return (
    <section
      className={styles.page}
    >
      <div
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
            Gestão financeira
          </span>

          <h2>Financeiro</h2>

          <p>
            Controle receitas,
            despesas, vencimentos e
            o resultado financeiro
            do negócio.
          </p>
        </div>

        <button
          type="button"
          className={
            styles.createButton
          }
          onClick={
            handleOpenCreate
          }
        >
          <Plus size={18} />

          Novo lançamento
        </button>
      </div>

      <div
        className={
          styles.metricsGrid
        }
      >
        <StatisticCard
          title="Saldo realizado"
          value={formatCurrency(
            summary?.balance ?? 0,
          )}
          description="Receitas recebidas menos despesas pagas"
          icon={Landmark}
          color={
            (
              summary?.balance ??
              0
            ) >= 0
              ? "blue"
              : "red"
          }
          highlighted
        />

        <StatisticCard
          title="Receitas recebidas"
          value={formatCurrency(
            summary?.totalIncome ??
            0,
          )}
          description="Entradas financeiras realizadas"
          icon={ArrowDownLeft}
          color="green"
        />

        <StatisticCard
          title="Despesas pagas"
          value={formatCurrency(
            summary?.totalExpense ??
            0,
          )}
          description="Saídas financeiras realizadas"
          icon={ArrowUpRight}
          color="red"
        />

        <StatisticCard
          title="Contas a receber"
          value={formatCurrency(
            summary
              ?.accountsReceivable ??
            0,
          )}
          description="Receitas ainda pendentes"
          icon={HandCoins}
          color="purple"
        />

        <StatisticCard
          title="Contas a pagar"
          value={formatCurrency(
            summary
              ?.accountsPayable ??
            0,
          )}
          description="Despesas ainda pendentes"
          icon={ReceiptText}
          color="orange"
        />

        {financialSettings.showOverdueAlerts && (
          <StatisticCard
            title="Valores vencidos"
            value={formatCurrency(
              overdueTotal,
            )}
            description={`${summary
              ?.overdueTransactions ??
              0
              } lançamentos vencidos`}
            icon={TriangleAlert}
            color="red"
          />
        )}
      </div>

      <div
        className={
          styles.overviewGrid
        }
      >
        <article
          className={
            styles.cashPosition
          }
        >
          <header>
            <div
              className={
                styles.overviewIcon
              }
            >
              <CircleDollarSign
                size={19}
              />
            </div>

            <div>
              <strong>
                Posição financeira
              </strong>

              <span>
                Valores realizados e
                pendentes
              </span>
            </div>
          </header>

          <div
            className={
              styles.positionGrid
            }
          >
            <div>
              <span>
                Disponível
              </span>

              <strong
                className={
                  (
                    summary?.balance ??
                    0
                  ) >= 0
                    ? styles.positive
                    : styles.negative
                }
              >
                {formatCurrency(
                  summary?.balance ??
                  0,
                )}
              </strong>
            </div>

            <div>
              <span>
                Previsão de entrada
              </span>

              <strong
                className={
                  styles.positive
                }
              >
                {formatCurrency(
                  summary
                    ?.accountsReceivable ??
                  0,
                )}
              </strong>
            </div>

            <div>
              <span>
                Previsão de saída
              </span>

              <strong
                className={
                  styles.negative
                }
              >
                {formatCurrency(
                  summary
                    ?.accountsPayable ??
                  0,
                )}
              </strong>
            </div>

            <div>
              <span>
                Saldo projetado
              </span>

              <strong
                className={
                  (
                    (
                      summary?.balance ??
                      0
                    ) +
                    (
                      summary
                        ?.accountsReceivable ??
                      0
                    ) -
                    (
                      summary
                        ?.accountsPayable ??
                      0
                    )
                  ) >= 0
                    ? styles.positive
                    : styles.negative
                }
              >
                {formatCurrency(
                  (
                    summary?.balance ??
                    0
                  ) +
                  (
                    summary
                      ?.accountsReceivable ??
                    0
                  ) -
                  (
                    summary
                      ?.accountsPayable ??
                    0
                  ),
                )}
              </strong>
            </div>
          </div>
        </article>

        <article
          className={
            styles.categoriesCard
          }
        >
          <header>
            <div
              className={
                styles.overviewIcon
              }
            >
              <WalletCards
                size={19}
              />
            </div>

            <div>
              <strong>
                Principais categorias
              </strong>

              <span>
                Movimentações por
                categoria
              </span>
            </div>
          </header>

          {categorySummaryQuery
            .isLoading ? (
            <div
              className={
                styles.categoriesLoading
              }
            >
              Carregando categorias...
            </div>
          ) : topCategories.length ===
            0 ? (
            <div
              className={
                styles.categoriesEmpty
              }
            >
              Nenhuma movimentação
              realizada no período.
            </div>
          ) : (
            <div
              className={
                styles.categoryList
              }
            >
              {topCategories.map(
                (category) => {
                  const movement =
                    category.income +
                    category.expense;

                  const percentage =
                    Math.max(
                      4,

                      (
                        movement /
                        largestCategoryValue
                      ) * 100,
                    );

                  return (
                    <div
                      key={
                        category.category
                      }
                      className={
                        styles.categoryItem
                      }
                    >
                      <div>
                        <strong>
                          {
                            category.category
                          }
                        </strong>

                        <span>
                          {
                            category.transactionCount
                          }{" "}
                          {category.transactionCount ===
                            1
                            ? "lançamento"
                            : "lançamentos"}
                        </span>

                        <b>
                          {formatCurrency(
                            movement,
                          )}
                        </b>
                      </div>

                      <div
                        className={
                          styles.categoryBar
                        }
                      >
                        <span
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </article>
      </div>

      <div
        className={
          styles.tableArea
        }
      >
        <TableCard
          title="Lançamentos financeiros"
          description="Consulte e gerencie receitas, despesas, pagamentos e recebimentos."
          icon={WalletCards}
          badge={`${transactionsQuery.data
            ?.totalItems ?? 0
            } registros`}
          noPadding
        >
          <FinancialFilters
            filters={filters}
            categories={
              filterCategories
            }
            onChange={
              setFilters
            }
            onReset={() =>
              setFilters({
                ...defaultFinancialFilters,
              })
            }
          />

          {transactionsQuery
            .isLoading ? (
            <LoadingState
              title="Carregando lançamentos"
              description="Consultando as movimentações financeiras."
            />
          ) : transactionsQuery
            .isError ? (
            <ErrorState
              description={getErrorMessage(
                transactionsQuery.error,
              )}
              onRetry={() =>
                void transactionsQuery.refetch()
              }
            />
          ) : (
            <>
              <FinancialTable
                transactions={
                  transactionsQuery.data
                    ?.items ?? []
                }
                onCreate={
                  handleOpenCreate
                }
                onView={
                  setSelectedTransaction
                }
                onEdit={
                  handleOpenEdit
                }
                onSettle={
                  handleOpenSettle
                }
                onCancel={
                  handleOpenCancel
                }
              />

              <Pagination
                page={
                  transactionsQuery.data
                    ?.page ??
                  filters.page
                }
                totalPages={
                  transactionsQuery.data
                    ?.totalPages ??
                  1
                }
                totalItems={
                  transactionsQuery.data
                    ?.totalItems ??
                  0
                }
                pageSize={
                  transactionsQuery.data
                    ?.pageSize ??
                  filters.pageSize
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

      <FinancialTransactionModal
        isOpen={isFormOpen}
        transaction={
          editingTransaction
        }
        categoriesByType={
          categoriesByType
        }
        defaultPaymentMethod={
          financialSettings.defaultPaymentMethod
        }
        defaultIncomeCategory={
          financialSettings.defaultIncomeCategory
        }
        defaultExpenseCategory={
          financialSettings.defaultExpenseCategory
        }
        defaultDueDays={
          financialSettings.defaultDueDays
        }
        isSubmitting={
          formMutation.isPending
        }
        submitError={
          formMutation.isError
            ? getErrorMessage(
              formMutation.error,
            )
            : undefined
        }
        onClose={
          handleCloseForm
        }
        onSubmit={
          handleFormSubmit
        }
      />

      <FinancialSettleModal
        isOpen={
          settlementTransaction !==
          null
        }
        transaction={
          settlementTransaction
        }
        defaultPaymentMethod={
          financialSettings.defaultPaymentMethod
        }
        isSubmitting={
          settleMutation.isPending
        }
        submitError={
          settleMutation.isError
            ? getErrorMessage(
              settleMutation.error,
            )
            : undefined
        }
        onClose={
          handleCloseSettle
        }
        onSubmit={
          handleSettle
        }
      />

      <FinancialDetailsModal
        isOpen={
          selectedTransaction !==
          null
        }
        transaction={
          selectedTransaction
        }
        onClose={() =>
          setSelectedTransaction(
            null,
          )
        }
      />

      <ConfirmDialog
        isOpen={
          transactionToCancel !==
          null
        }
        title="Cancelar lançamento"
        description={
          transactionToCancel
            ? `O lançamento “${transactionToCancel.number} — ${transactionToCancel.description}” será cancelado e deixará de compor os resultados financeiros.`
            : ""
        }
        confirmLabel={
          cancelMutation.isPending
            ? "Cancelando..."
            : "Cancelar lançamento"
        }
        variant="danger"
        onCancel={
          handleCloseCancel
        }
        onConfirm={
          handleConfirmCancel
        }
      />

      {cancelMutation.isError && (
        <div
          className={
            styles.floatingError
          }
        >
          <TriangleAlert
            size={17}
          />

          {getErrorMessage(
            cancelMutation.error,
          )}

          <button
            type="button"
            onClick={() =>
              cancelMutation.reset()
            }
          >
            Fechar
          </button>
        </div>
      )}
    </section>
  );
}