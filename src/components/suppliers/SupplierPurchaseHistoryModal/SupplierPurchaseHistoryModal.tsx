import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ShoppingBasket,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";

import {
  useSupplierPurchaseHistoryQuery,
} from "../../../application/suppliers/useSupplierPurchaseHistoryQuery";

import {
  getSupplierDisplayName,
} from "../../../domain/suppliers/Supplier";

import type {
  Supplier,
} from "../../../domain/suppliers/Supplier";

import {
  getErrorMessage,
} from "../../../utils/errors";

import {
  formatCurrency,
  formatDate,
} from "../../../utils/formatters";

import ErrorState from "../../common/ErrorState/ErrorState";
import LoadingState from "../../common/LoadingState/LoadingState";

import styles from "./SupplierPurchaseHistoryModal.module.css";

interface SupplierPurchaseHistoryModalProps {
  supplier:
    Supplier | null;

  onClose:
    () => void;
}

function getStatusLabel(
  status:
    "pending" |
    "completed" |
    "cancelled",
): string {
  if (
    status ===
    "completed"
  ) {
    return "Concluída";
  }

  if (
    status ===
    "cancelled"
  ) {
    return "Cancelada";
  }

  return "Pendente";
}

export default function SupplierPurchaseHistoryModal({
  supplier,
  onClose,
}: SupplierPurchaseHistoryModalProps) {
  const historyQuery =
    useSupplierPurchaseHistoryQuery(
      supplier?.id ??
      null,
    );

  if (!supplier) {
    return null;
  }

  const history =
    historyQuery.data;

  return (
    <div
      className={
        styles.overlay
      }
      role="presentation"
      onMouseDown={
        onClose
      }
    >
      <section
        className={
          styles.modal
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="supplier-history-title"
        onMouseDown={(
          event,
        ) =>
          event.stopPropagation()
        }
      >
        <header
          className={
            styles.header
          }
        >
          <div>
            <span>
              Histórico de fornecimento
            </span>

            <h3
              id="supplier-history-title"
            >
              {
                getSupplierDisplayName(
                  supplier,
                )
              }
            </h3>

            <p>
              Compras internas vinculadas a este fornecedor.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Fechar histórico"
          >
            <X size={20} />
          </button>
        </header>

        <div
          className={
            styles.content
          }
        >
          {historyQuery.isLoading && (
            <LoadingState
              title="Carregando histórico"
              description="Aguarde enquanto as compras são consultadas."
            />
          )}

          {historyQuery.isError && (
            <ErrorState
              title="Não foi possível carregar o histórico"
              description={
                getErrorMessage(
                  historyQuery.error,
                )
              }
              onRetry={() =>
                void historyQuery.refetch()
              }
            />
          )}

          {history && (
            <>
              <div
                className={
                  styles.summaryGrid
                }
              >
                <article>
                  <ShoppingBasket
                    size={18}
                  />

                  <span>
                    Total de compras
                  </span>

                  <strong>
                    {
                      history.totalPurchases
                    }
                  </strong>
                </article>

                <article>
                  <Clock3
                    size={18}
                  />

                  <span>
                    Pendentes
                  </span>

                  <strong>
                    {
                      history.pendingPurchases
                    }
                  </strong>
                </article>

                <article>
                  <CheckCircle2
                    size={18}
                  />

                  <span>
                    Concluídas
                  </span>

                  <strong>
                    {
                      history.completedPurchases
                    }
                  </strong>
                </article>

                <article>
                  <XCircle
                    size={18}
                  />

                  <span>
                    Canceladas
                  </span>

                  <strong>
                    {
                      history.cancelledPurchases
                    }
                  </strong>
                </article>

                <article>
                  <CircleDollarSign
                    size={18}
                  />

                  <span>
                    Valor concluído
                  </span>

                  <strong>
                    {
                      formatCurrency(
                        history.totalCompletedValue,
                      )
                    }
                  </strong>
                </article>

                <article>
                  <TrendingUp
                    size={18}
                  />

                  <span>
                    Compra média
                  </span>

                  <strong>
                    {
                      formatCurrency(
                        history.averagePurchaseValue,
                      )
                    }
                  </strong>
                </article>

                <article>
                  <CalendarDays
                    size={18}
                  />

                  <span>
                    Última compra
                  </span>

                  <strong>
                    {
                      formatDate(
                        history.lastPurchaseAt,
                      )
                    }
                  </strong>
                </article>
              </div>

              <div
                className={
                  styles.historySection
                }
              >
                <header>
                  <div>
                    <ShoppingBasket
                      size={18}
                    />

                    <div>
                      <strong>
                        Compras vinculadas
                      </strong>

                      <span>
                        Operações registradas para este fornecedor.
                      </span>
                    </div>
                  </div>
                </header>

                {history.purchases.length ===
                  0 ? (
                  <div
                    className={
                      styles.emptyHistory
                    }
                  >
                    <ShoppingBasket
                      size={29}
                    />

                    <strong>
                      Nenhuma compra vinculada
                    </strong>

                    <span>
                      As compras criadas selecionando este fornecedor aparecerão aqui.
                    </span>
                  </div>
                ) : (
                  <div
                    className={
                      styles.tableWrapper
                    }
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>Compra</th>
                          <th>Data</th>
                          <th>Documento</th>
                          <th>Itens</th>
                          <th>Situação</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {history.purchases.map(
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
                              </td>

                              <td>
                                {
                                  formatDate(
                                    purchase.purchaseDate,
                                  )
                                }
                              </td>

                              <td>
                                {
                                  purchase.documentNumber ||
                                  "—"
                                }
                              </td>

                              <td>
                                {
                                  purchase.items.length
                                }
                              </td>

                              <td>
                                <span
                                  className={
                                    styles[
                                      purchase.status
                                    ]
                                  }
                                >
                                  {
                                    getStatusLabel(
                                      purchase.status,
                                    )
                                  }
                                </span>
                              </td>

                              <td>
                                <strong>
                                  {
                                    formatCurrency(
                                      purchase.total,
                                    )
                                  }
                                </strong>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}