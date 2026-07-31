import {
  BadgeDollarSign,
  Ban,
  CircleDollarSign,
  Percent,
  Plus,
  ReceiptText,
  ShoppingCart,
  WalletCards,
} from "lucide-react";

import {
  useState,
} from "react";

import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import Pagination from "../../components/common/Pagination/Pagination";
import StatisticCard from "../../components/common/StatisticCard/StatisticCard";
import TableCard from "../../components/common/TableCard/TableCard";

import SaleFilters from "../../components/sales/SaleFilters/SaleFilters";
import SaleFormModal from "../../components/sales/SaleFormModal/SaleFormModal";
import SalesTable from "../../components/sales/SalesTable/SalesTable";

import {
  useCancelSaleMutation,
} from "../../application/sales/useCancelSaleMutation";

import {
  useCreateSaleMutation,
} from "../../application/sales/useCreateSaleMutation";

import {
  useSalesQuery,
} from "../../application/sales/useSalesQuery";

import type {
  CreateSaleInput,
  Sale,
} from "../../domain/sales/Sale";

import {
  defaultSaleFilters,
} from "../../domain/sales/SaleFilters";

import type {
  SaleFilters as SaleFiltersState,
} from "../../domain/sales/SaleFilters";

import {
  useProducts,
} from "../../hooks/useProducts";

import {
  formatCurrency,
  formatNumber,
} from "../../utils/formatters";

import styles from "./Vendas.module.css";

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "Não foi possível concluir a operação.";
}

export default function Vendas() {
  const { products } =
    useProducts();

  const [filters, setFilters] =
    useState<SaleFiltersState>({
      ...defaultSaleFilters,
    });

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [selectedSale, setSelectedSale] =
    useState<Sale | null>(null);

  const [saleToCancel, setSaleToCancel] =
    useState<Sale | null>(null);

  const {
    salesQuery,
    summaryQuery,
  } = useSalesQuery(filters);

  const createSaleMutation =
    useCreateSaleMutation();

  const cancelSaleMutation =
    useCancelSaleMutation();

  const summary =
    summaryQuery.data;

  function handleCreateSale(
    input: CreateSaleInput,
  ) {
    createSaleMutation.mutate(
      input,
      {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      },
    );
  }

  function handleConfirmCancel() {
    if (!saleToCancel) {
      return;
    }

    cancelSaleMutation.mutate(
      {
        saleId:
          saleToCancel.id,

        reason:
          "Cancelamento manual realizado pelo administrador.",
      },
      {
        onSuccess: () => {
          setSaleToCancel(null);
        },
      },
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>
            Operação comercial
          </span>

          <h2>Vendas</h2>

          <p>
            Registre vendas, acompanhe recebimentos e
            controle o resultado das operações.
          </p>
        </div>

        <button
          type="button"
          className={styles.createButton}
          onClick={() =>
            setIsFormOpen(true)
          }
        >
          <Plus size={18} />
          Nova venda
        </button>
      </div>

      <div className={styles.metricsGrid}>
        <StatisticCard
          title="Vendas concluídas"
          value={formatNumber(
            summary?.completedSales ?? 0,
            0,
          )}
          description="Operações concluídas no período"
          icon={ReceiptText}
          color="blue"
        />

        <StatisticCard
          title="Faturamento líquido"
          value={formatCurrency(
            summary?.netRevenue ?? 0,
          )}
          description="Receita após descontos"
          icon={CircleDollarSign}
          color="green"
          highlighted
        />

        <StatisticCard
          title="Lucro realizado"
          value={formatCurrency(
            summary?.totalProfit ?? 0,
          )}
          description="Resultado estimado das vendas"
          icon={BadgeDollarSign}
          color="green"
          highlighted
        />

        <StatisticCard
          title="Ticket médio"
          value={formatCurrency(
            summary?.averageTicket ?? 0,
          )}
          description="Valor médio por venda concluída"
          icon={WalletCards}
          color="purple"
        />

        <StatisticCard
          title="Descontos"
          value={formatCurrency(
            summary?.discounts ?? 0,
          )}
          description="Descontos concedidos nas vendas"
          icon={Percent}
          color="orange"
        />

        <StatisticCard
          title="Cancelamentos"
          value={formatNumber(
            summary?.cancelledSales ?? 0,
            0,
          )}
          description="Vendas canceladas"
          icon={Ban}
          color="red"
        />
      </div>

      <div className={styles.tableArea}>
        <TableCard
          title="Histórico de vendas"
          description="Consulte as operações comerciais registradas."
          icon={ShoppingCart}
          badge={`${salesQuery.data?.totalItems ?? 0} registros`}
          noPadding
        >
          <SaleFilters
            filters={filters}
            onChange={setFilters}
            onReset={() =>
              setFilters({
                ...defaultSaleFilters,
              })
            }
          />

          {salesQuery.isLoading ? (
            <LoadingState
              title="Carregando vendas"
              description="Consultando as operações registradas."
            />
          ) : salesQuery.isError ? (
            <ErrorState
              description={getErrorMessage(
                salesQuery.error,
              )}
              onRetry={() =>
                void salesQuery.refetch()
              }
            />
          ) : (
            <>
              <SalesTable
                sales={
                  salesQuery.data?.items ??
                  []
                }
                onCreate={() =>
                  setIsFormOpen(true)
                }
                onView={
                  setSelectedSale
                }
                onCancel={
                  setSaleToCancel
                }
              />

              <Pagination
                page={
                  salesQuery.data?.page ??
                  filters.page
                }
                totalPages={
                  salesQuery.data
                    ?.totalPages ?? 1
                }
                totalItems={
                  salesQuery.data
                    ?.totalItems ?? 0
                }
                pageSize={
                  salesQuery.data
                    ?.pageSize ??
                  filters.pageSize
                }
                onPageChange={(page) =>
                  setFilters(
                    (current) => ({
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

      <SaleFormModal
        isOpen={isFormOpen}
        products={products}
        isSubmitting={
          createSaleMutation.isPending
        }
        submitError={
          createSaleMutation.isError
            ? getErrorMessage(
                createSaleMutation.error,
              )
            : undefined
        }
        onClose={() => {
          if (
            !createSaleMutation.isPending
          ) {
            createSaleMutation.reset();
            setIsFormOpen(false);
          }
        }}
        onSubmit={handleCreateSale}
      />

      <ConfirmDialog
        isOpen={saleToCancel !== null}
        title="Cancelar venda"
        description={
          saleToCancel
            ? `A venda “${saleToCancel.number}” será cancelada e os produtos retornarão ao estoque.`
            : ""
        }
        confirmLabel={
          cancelSaleMutation.isPending
            ? "Cancelando..."
            : "Cancelar venda"
        }
        variant="danger"
        onCancel={() => {
          if (
            !cancelSaleMutation.isPending
          ) {
            setSaleToCancel(null);
          }
        }}
        onConfirm={
          handleConfirmCancel
        }
      />

      {selectedSale && (
        <div
          className={styles.detailsOverlay}
          onMouseDown={() =>
            setSelectedSale(null)
          }
        >
          <div
            className={styles.detailsModal}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <div>
                <span>
                  Detalhes da venda
                </span>

                <h3>
                  {selectedSale.number}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSale(null)
                }
              >
                Fechar
              </button>
            </header>

            <div className={styles.detailsContent}>
              {selectedSale.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className={
                      styles.detailItem
                    }
                  >
                    <div>
                      <strong>
                        {item.productName}
                      </strong>

                      <span>
                        {item.quantity}{" "}
                        {item.unit} ×{" "}
                        {formatCurrency(
                          item.unitPrice,
                        )}
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(
                        item.total,
                      )}
                    </strong>
                  </div>
                ),
              )}

              <div className={styles.detailTotals}>
                <span>
                  Subtotal
                  <strong>
                    {formatCurrency(
                      selectedSale.subtotal,
                    )}
                  </strong>
                </span>

                <span>
                  Desconto
                  <strong>
                    {formatCurrency(
                      selectedSale.discount,
                    )}
                  </strong>
                </span>

                <span>
                  Total
                  <strong>
                    {formatCurrency(
                      selectedSale.total,
                    )}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}