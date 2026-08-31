import {
  CalendarDays,
  CircleDollarSign,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  X,
} from "lucide-react";

import {
  useCustomerHistoryQuery,
} from "../../../application/customers/useCustomerHistoryQuery";

import type {
  Customer,
} from "../../../domain/customers/Customer";

import {
  formatCurrency,
  formatDateTime,
} from "../../../utils/formatters";

import {
  getErrorMessage,
} from "../../../utils/errors";

import ErrorState from "../../common/ErrorState/ErrorState";
import LoadingState from "../../common/LoadingState/LoadingState";
import PaymentMethodBadge from "../../sales/PaymentMethodBadge/PaymentMethodBadge";
import SaleStatusBadge from "../../sales/SaleStatusBadge/SaleStatusBadge";

import styles from "./CustomerHistoryModal.module.css";

interface CustomerHistoryModalProps {
  customer:
    Customer | null;

  onClose:
    () => void;
}

export default function CustomerHistoryModal({
  customer,
  onClose,
}: CustomerHistoryModalProps) {
  const historyQuery =
    useCustomerHistoryQuery(
      customer?.id ??
      null,
    );

  if (!customer) {
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
        aria-labelledby="customer-history-title"
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
              Histórico comercial
            </span>

            <h3
              id="customer-history-title"
            >
              {customer.name}
            </h3>

            <p>
              Compras vinculadas ao cadastro deste cliente.
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
                  <div>
                    <ShoppingBag
                      size={18}
                    />
                  </div>

                  <span>
                    Compras
                  </span>

                  <strong>
                    {
                      history.totalPurchases
                    }
                  </strong>
                </article>

                <article>
                  <div>
                    <CircleDollarSign
                      size={18}
                    />
                  </div>

                  <span>
                    Total gasto
                  </span>

                  <strong>
                    {
                      formatCurrency(
                        history.totalSpent,
                      )
                    }
                  </strong>
                </article>

                <article>
                  <div>
                    <TrendingUp
                      size={18}
                    />
                  </div>

                  <span>
                    Ticket médio
                  </span>

                  <strong>
                    {
                      formatCurrency(
                        history.averageTicket,
                      )
                    }
                  </strong>
                </article>

                <article>
                  <div>
                    <CalendarDays
                      size={18}
                    />
                  </div>

                  <span>
                    Última compra
                  </span>

                  <strong>
                    {
                      formatDateTime(
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
                    <ReceiptText
                      size={18}
                    />

                    <div>
                      <strong>
                        Vendas vinculadas
                      </strong>

                      <span>
                        Apenas vendas concluídas são consideradas nos totais.
                      </span>
                    </div>
                  </div>
                </header>

                {history.completedSales.length ===
                  0 ? (
                  <div
                    className={
                      styles.emptyHistory
                    }
                  >
                    <ShoppingBag
                      size={28}
                    />

                    <strong>
                      Nenhuma compra vinculada
                    </strong>

                    <span>
                      As próximas vendas selecionando este cliente aparecerão aqui.
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
                          <th>Venda</th>
                          <th>Data</th>
                          <th>Pagamento</th>
                          <th>Itens</th>
                          <th>Status</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {history.completedSales.map(
                          (
                            sale,
                          ) => (
                            <tr
                              key={
                                sale.id
                              }
                            >
                              <td>
                                <strong>
                                  {sale.number}
                                </strong>
                              </td>

                              <td>
                                {
                                  formatDateTime(
                                    sale.createdAt,
                                  )
                                }
                              </td>

                              <td>
                                <PaymentMethodBadge
                                  method={
                                    sale.paymentMethod
                                  }
                                />
                              </td>

                              <td>
                                {
                                  sale.items.length
                                }
                              </td>

                              <td>
                                <SaleStatusBadge
                                  status={
                                    sale.status
                                  }
                                />
                              </td>

                              <td>
                                <strong>
                                  {
                                    formatCurrency(
                                      sale.total,
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