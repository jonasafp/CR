import {
  Ban,
  CheckCircle2,
  Eye,
  Pencil,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import EmptyState from "../../common/EmptyState/EmptyState";

import FinancialSourceBadge from "../FinancialSourceBadge/FinancialSourceBadge";
import FinancialStatusBadge from "../FinancialStatusBadge/FinancialStatusBadge";
import FinancialTypeBadge from "../FinancialTypeBadge/FinancialTypeBadge";

import type {
  FinancialTransaction,
} from "../../../domain/financial/FinancialTransaction";

import {
  formatCurrency,
  formatDate,
} from "../../../utils/formatters";

import styles from "./FinancialTable.module.css";

interface FinancialTableProps {
  transactions:
    FinancialTransaction[];

  onCreate: () => void;

  onView: (
    transaction:
      FinancialTransaction,
  ) => void;

  onEdit: (
    transaction:
      FinancialTransaction,
  ) => void;

  onSettle: (
    transaction:
      FinancialTransaction,
  ) => void;

  onCancel: (
    transaction:
      FinancialTransaction,
  ) => void;
}

export default function FinancialTable({
  transactions,
  onCreate,
  onView,
  onEdit,
  onSettle,
  onCancel,
}: FinancialTableProps) {
  if (
    transactions.length === 0
  ) {
    return (
      <EmptyState
        icon={WalletCards}
        title="Nenhum lançamento encontrado"
        description="Altere os filtros utilizados ou registre um novo lançamento financeiro."
        action={
          <button
            type="button"
            className={
              styles.emptyAction
            }
            onClick={onCreate}
          >
            Novo lançamento
          </button>
        }
      />
    );
  }

  return (
    <div
      className={styles.wrapper}
    >
      <table
        className={styles.table}
      >
        <thead>
          <tr>
            <th>Lançamento</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Cliente/Fornecedor</th>
            <th>Vencimento</th>
            <th>Origem</th>
            <th>Valor</th>
            <th>Situação</th>

            <th
              aria-label="Ações"
            />
          </tr>
        </thead>

        <tbody>
          {transactions.map(
            (transaction) => {
              const canEdit =
                transaction.source ===
                  "manual" &&
                transaction.status !==
                  "cancelled";

              const canSettle =
                transaction.status ===
                "pending";

              const canCancel =
                transaction.source ===
                  "manual" &&
                transaction.status !==
                  "cancelled";

              return (
                <tr
                  key={
                    transaction.id
                  }
                >
                  <td>
                    <div
                      className={
                        styles.number
                      }
                    >
                      <div>
                        <ReceiptText
                          size={18}
                        />
                      </div>

                      <strong>
                        {
                          transaction.number
                        }
                      </strong>
                    </div>
                  </td>

                  <td>
                    <FinancialTypeBadge
                      type={
                        transaction.type
                      }
                    />
                  </td>

                  <td>
                    <div
                      className={
                        styles.description
                      }
                    >
                      <strong>
                        {
                          transaction.description
                        }
                      </strong>

                      {transaction.saleNumber && (
                        <span>
                          Venda{" "}
                          {
                            transaction.saleNumber
                          }
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    {
                      transaction.category
                    }
                  </td>

                  <td>
                    {
                      transaction
                        .customerOrSupplier ??
                      "Não informado"
                    }
                  </td>

                  <td>
                    {formatDate(
                      transaction.dueDate,
                    )}
                  </td>

                  <td>
                    <FinancialSourceBadge
                      source={
                        transaction.source
                      }
                    />
                  </td>

                  <td>
                    <strong
                      className={
                        transaction.type ===
                        "income"
                          ? styles.incomeAmount
                          : styles.expenseAmount
                      }
                    >
                      {transaction.type ===
                      "expense"
                        ? "- "
                        : "+ "}

                      {formatCurrency(
                        transaction.amount,
                      )}
                    </strong>
                  </td>

                  <td>
                    <FinancialStatusBadge
                      transaction={
                        transaction
                      }
                    />
                  </td>

                  <td>
                    <div
                      className={
                        styles.actions
                      }
                    >
                      <button
                        type="button"
                        title="Visualizar lançamento"
                        onClick={() =>
                          onView(
                            transaction,
                          )
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        title={
                          canEdit
                            ? "Editar lançamento"
                            : "Lançamentos automáticos ou cancelados não podem ser editados"
                        }
                        disabled={
                          !canEdit
                        }
                        onClick={() =>
                          onEdit(
                            transaction,
                          )
                        }
                      >
                        <Pencil
                          size={16}
                        />
                      </button>

                      <button
                        type="button"
                        title={
                          canSettle
                            ? transaction.type ===
                              "income"
                              ? "Marcar como recebido"
                              : "Marcar como pago"
                            : "Este lançamento não está pendente"
                        }
                        disabled={
                          !canSettle
                        }
                        className={
                          styles.settleButton
                        }
                        onClick={() =>
                          onSettle(
                            transaction,
                          )
                        }
                      >
                        <CheckCircle2
                          size={16}
                        />
                      </button>

                      <button
                        type="button"
                        title={
                          canCancel
                            ? "Cancelar lançamento"
                            : "Este lançamento não pode ser cancelado manualmente"
                        }
                        disabled={
                          !canCancel
                        }
                        className={
                          styles.cancelButton
                        }
                        onClick={() =>
                          onCancel(
                            transaction,
                          )
                        }
                      >
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}