import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  QrCode,
  Save,
  WalletCards,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  FinancialPaymentMethod,
  FinancialTransaction,
  SettleFinancialTransactionInput,
} from "../../../domain/financial/FinancialTransaction";

import {
  formatCurrency,
} from "../../../utils/formatters";

import styles from "./FinancialSettleModal.module.css";

interface FinancialSettleModalProps {
  isOpen: boolean;

  transaction:
    FinancialTransaction | null;

  isSubmitting: boolean;

  submitError?: string;

  onClose: () => void;

  onSubmit: (
    input:
      SettleFinancialTransactionInput,
  ) => void;
}

const paymentOptions:
  SelectOption<
    FinancialPaymentMethod | ""
  >[] = [
    {
      value: "",
      label:
        "Selecione uma forma",
    },
    {
      value: "cash",
      label: "Dinheiro",
      icon: <Banknote size={14} />,
    },
    {
      value: "pix",
      label: "Pix",
      icon: <QrCode size={14} />,
    },
    {
      value: "credit_card",
      label:
        "Cartão de crédito",
      icon: (
        <CreditCard size={14} />
      ),
    },
    {
      value: "debit_card",
      label:
        "Cartão de débito",
      icon: (
        <WalletCards size={14} />
      ),
    },
    {
      value: "bank_transfer",
      label:
        "Transferência bancária",
    },
    {
      value: "bank_slip",
      label: "Boleto bancário",
    },
    {
      value: "other",
      label: "Outro",
    },
  ];

function getToday(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export default function FinancialSettleModal({
  isOpen,
  transaction,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: FinancialSettleModalProps) {
  const [
    paymentDate,
    setPaymentDate,
  ] = useState(getToday());

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<
    FinancialPaymentMethod | ""
  >("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPaymentDate(
      getToday(),
    );

    setPaymentMethod("");

    setLocalError("");
  }, [
    isOpen,
    transaction,
  ]);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setLocalError("");

    onClose();
  }

  function handleSubmit() {
    if (!transaction) {
      return;
    }

    if (!paymentDate) {
      setLocalError(
        transaction.type ===
          "income"
          ? "Informe a data do recebimento."
          : "Informe a data do pagamento.",
      );

      return;
    }

    if (!paymentMethod) {
      setLocalError(
        "Selecione a forma de pagamento.",
      );

      return;
    }

    onSubmit({
      transactionId:
        transaction.id,

      paymentDate,

      paymentMethod,
    });
  }

  if (
    !isOpen ||
    !transaction
  ) {
    return null;
  }

  const isIncome =
    transaction.type ===
    "income";

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={handleClose}
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
              className={`${styles.headerIcon} ${
                isIncome
                  ? styles.incomeIcon
                  : styles.expenseIcon
              }`}
            >
              <CheckCircle2
                size={22}
              />
            </div>

            <div>
              <span>
                Concluir lançamento
              </span>

              <h2>
                {isIncome
                  ? "Receber receita"
                  : "Pagar despesa"}
              </h2>

              <p>
                Confirme os dados da
                movimentação financeira.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={
              styles.closeButton
            }
            disabled={isSubmitting}
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </header>

        <div
          className={styles.content}
        >
          <section
            className={
              styles.transactionSummary
            }
          >
            <div>
              <span>
                Lançamento
              </span>

              <strong>
                {transaction.number}
              </strong>
            </div>

            <div>
              <span>
                Descrição
              </span>

              <strong>
                {
                  transaction.description
                }
              </strong>
            </div>

            <div
              className={
                styles.amount
              }
            >
              <span>
                Valor
              </span>

              <strong>
                {formatCurrency(
                  transaction.amount,
                )}
              </strong>
            </div>
          </section>

          <div
            className={
              styles.formGrid
            }
          >
            <label
              className={
                styles.field
              }
            >
              <span>
                {isIncome
                  ? "Data do recebimento"
                  : "Data do pagamento"}
                <b>*</b>
              </span>

              <div
                className={
                  styles.inputWithIcon
                }
              >
                <CalendarDays
                  size={16}
                />

                <input
                  type="date"
                  value={paymentDate}
                  onChange={(event) =>
                    setPaymentDate(
                      event.target
                        .value,
                    )
                  }
                />
              </div>
            </label>

            <div>
              <Select
                label="Forma de pagamento"
                required
                value={paymentMethod}
                options={
                  paymentOptions
                }
                onChange={
                  setPaymentMethod
                }
              />
            </div>
          </div>

          {(localError ||
            submitError) && (
            <div
              className={
                styles.error
              }
            >
              {localError ||
                submitError}
            </div>
          )}
        </div>

        <footer
          className={styles.footer}
        >
          <button
            type="button"
            className={
              styles.cancelButton
            }
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Voltar
          </button>

          <button
            type="button"
            className={
              styles.submitButton
            }
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            <Save size={17} />

            {isSubmitting
              ? "Concluindo..."
              : isIncome
                ? "Confirmar recebimento"
                : "Confirmar pagamento"}
          </button>
        </footer>
      </div>
    </div>
  );
}