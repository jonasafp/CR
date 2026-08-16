import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  Link2,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import FinancialSourceBadge from "../FinancialSourceBadge/FinancialSourceBadge";
import FinancialStatusBadge from "../FinancialStatusBadge/FinancialStatusBadge";
import FinancialTypeBadge from "../FinancialTypeBadge/FinancialTypeBadge";

import type {
  FinancialPaymentMethod,
  FinancialTransaction,
} from "../../../domain/financial/FinancialTransaction";

import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../../../utils/formatters";

import styles from "./FinancialDetailsModal.module.css";

interface FinancialDetailsModalProps {
  isOpen: boolean;

  transaction:
  FinancialTransaction | null;

  onClose: () => void;
}

const paymentLabels: Record<
  FinancialPaymentMethod,
  string
> = {
  cash:
    "Dinheiro",

  pix:
    "Pix",

  credit_card:
    "Cartão de crédito",

  debit_card:
    "Cartão de débito",

  bank_transfer:
    "Transferência bancária",

  bank_slip:
    "Boleto bancário",

  other:
    "Outro",
};

export default function FinancialDetailsModal({
  isOpen,
  transaction,
  onClose,
}: FinancialDetailsModalProps) {
  if (
    !isOpen ||
    !transaction
  ) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header
          className={styles.header}
        >
          <div>
            <div
              className={
                styles.headerIcon
              }
            >
              <FileText size={22} />
            </div>

            <div>
              <span>
                Detalhes do lançamento
              </span>

              <h2>
                {transaction.number}
              </h2>

              <p>
                {
                  transaction.description
                }
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </header>

        <div
          className={styles.content}
        >
          <section
            className={
              styles.highlight
            }
          >
            <div>
              <span>
                Valor do lançamento
              </span>

              <strong
                className={
                  transaction.type ===
                    "income"
                    ? styles.incomeValue
                    : styles.expenseValue
                }
              >
                {formatCurrency(
                  transaction.amount,
                )}
              </strong>
            </div>

            <div
              className={
                styles.badges
              }
            >
              <FinancialTypeBadge
                type={
                  transaction.type
                }
              />

              <FinancialStatusBadge
                transaction={
                  transaction
                }
              />

              <FinancialSourceBadge
                source={
                  transaction.source
                }
              />
            </div>
          </section>

          <section
            className={
              styles.informationGrid
            }
          >
            <article>
              <div>
                <CircleDollarSign
                  size={17}
                />
              </div>

              <span>Categoria</span>

              <strong>
                {
                  transaction.category
                }
              </strong>
            </article>

            <article>
              <div>
                <CalendarDays
                  size={17}
                />
              </div>

              <span>Vencimento</span>

              <strong>
                {formatDate(
                  transaction.dueDate,
                )}
              </strong>
            </article>

            <article>
              <div>
                <CalendarDays
                  size={17}
                />
              </div>

              <span>
                {transaction.type ===
                  "income"
                  ? "Recebimento"
                  : "Pagamento"}
              </span>

              <strong>
                {formatDate(
                  transaction.paymentDate,
                  "Não informado",
                )}
              </strong>
            </article>

            <article>
              <div>
                <WalletCards
                  size={17}
                />
              </div>

              <span>
                Forma de pagamento
              </span>

              <strong>
                {transaction.paymentMethod
                  ? paymentLabels[
                  transaction
                    .paymentMethod
                  ]
                  : "Não informada"}
              </strong>
            </article>

            <article>
              <div>
                <UserRound
                  size={17}
                />
              </div>

              <span>
                {transaction.type ===
                  "income"
                  ? "Cliente"
                  : "Fornecedor"}
              </span>

              <strong>
                {transaction
                  .customerOrSupplier ??
                  "Não informado"}
              </strong>
            </article>

            <article>
              <div>
                <Link2 size={17} />
              </div>

              <span>
                Referência de origem
              </span>

              <strong>
                {transaction.saleNumber
                  ? `Venda ${transaction.saleNumber}`
                  : transaction
                    .inventoryMovementId
                    ? `Movimentação ${transaction.inventoryMovementId}`
                    : "Sem referência"}
              </strong>
            </article>
          </section>

          {transaction.notes && (
            <section
              className={
                styles.notes
              }
            >
              <div>
                <FileText
                  size={17}
                />

                <strong>
                  Observações
                </strong>
              </div>

              <p>
                {transaction.notes}
              </p>
            </section>
          )}

          <section
            className={
              styles.audit
            }
          >
            <div>
              <span>
                Cadastrado em
              </span>

              <strong>
                {formatDateTime(
                  transaction.createdAt,
                )}
              </strong>
            </div>

            <div>
              <span>
                Última atualização
              </span>

              <strong>
                {formatDateTime(
                  transaction.updatedAt,
                )}
              </strong>
            </div>

            <div>
              <span>
                Responsável
              </span>

              <strong>
                {
                  transaction.createdBy
                }
              </strong>
            </div>
          </section>
        </div>

        <footer
          className={styles.footer}
        >
          <button
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}