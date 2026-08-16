import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileText,
  QrCode,
  Save,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  CreateFinancialTransactionInput,
  FinancialPaymentMethod,
  FinancialTransaction,
  FinancialTransactionStatus,
  FinancialTransactionType,
  UpdateFinancialTransactionInput,
} from "../../../domain/financial/FinancialTransaction";

import styles from "./FinancialTransactionModal.module.css";

interface FinancialTransactionModalProps {
  isOpen: boolean;

  transaction?:
  FinancialTransaction | null;

  categoriesByType: {
    income: string[];
    expense: string[];
  };

  defaultPaymentMethod:
  FinancialPaymentMethod;

  defaultIncomeCategory: string;

  defaultExpenseCategory: string;

  defaultDueDays: number;

  isSubmitting: boolean;

  submitError?: string;

  onClose: () => void;

  onSubmit: (
    input:
      | CreateFinancialTransactionInput
      | UpdateFinancialTransactionInput,
  ) => void;
}

const typeOptions:
  SelectOption<
    FinancialTransactionType
  >[] = [
    {
      value: "income",
      label: "Receita",
      description:
        "Valor recebido ou a receber",
      icon: (
        <ArrowDownLeft
          size={14}
        />
      ),
    },
    {
      value: "expense",
      label: "Despesa",
      description:
        "Valor pago ou a pagar",
      icon: (
        <ArrowUpRight
          size={14}
        />
      ),
    },
  ];

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

function addDaysToDate(
  date: string,
  days: number,
): string {
  const [year, month, day] =
    date.split("-").map(Number);

  const result = new Date(
    year,
    month - 1,
    day,
  );

  result.setDate(
    result.getDate() +
    Math.max(0, days),
  );

  return `${result.getFullYear()}-${String(
    result.getMonth() + 1,
  ).padStart(2, "0")}-${String(
    result.getDate(),
  ).padStart(2, "0")}`;
}

function getInitialStatus(
  transaction:
    FinancialTransaction | null,
): FinancialTransactionStatus {
  return (
    transaction?.status ??
    "pending"
  );
}

export default function FinancialTransactionModal({
  isOpen,
  transaction = null,
  categoriesByType,
  defaultPaymentMethod,
  defaultIncomeCategory,
  defaultExpenseCategory,
  defaultDueDays,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: FinancialTransactionModalProps) {
  const [type, setType] =
    useState<
      FinancialTransactionType
    >("income");

  const [
    description,
    setDescription,
  ] = useState("");

  const [category, setCategory] =
    useState("");

  const [amount, setAmount] =
    useState(0);

  const [dueDate, setDueDate] =
    useState(getToday());

  const [status, setStatus] =
    useState<
      FinancialTransactionStatus
    >("pending");

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
    customerOrSupplier,
    setCustomerOrSupplier,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  const isEditing =
    transaction !== null;

  const isSettled =
    status === "received" ||
    status === "paid";

  const currentCategories =
    categoriesByType[type];

  const categoryOptions:
    SelectOption<string>[] =
    useMemo(
      () => [
        {
          value: "",
          label:
            "Selecione uma categoria",
        },

        ...currentCategories.map(
          (item) => ({
            value: item,
            label: item,
          }),
        ),
      ],
      [currentCategories],
    );

  const statusOptions:
    SelectOption<
      FinancialTransactionStatus
    >[] =
    type === "income"
      ? [
        {
          value: "pending",
          label: "Pendente",
          description:
            "Receita ainda não recebida",
          icon: (
            <CalendarDays
              size={14}
            />
          ),
        },
        {
          value: "received",
          label: "Recebida",
          description:
            "Receita já recebida",
          icon: (
            <CheckCircle2
              size={14}
            />
          ),
        },
      ]
      : [
        {
          value: "pending",
          label: "Pendente",
          description:
            "Despesa ainda não paga",
          icon: (
            <CalendarDays
              size={14}
            />
          ),
        },
        {
          value: "paid",
          label: "Paga",
          description:
            "Despesa já paga",
          icon: (
            <CheckCircle2
              size={14}
            />
          ),
        },
      ];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const initialType =
      transaction?.type ??
      "income";

    setType(initialType);

    setDescription(
      transaction?.description ??
      "",
    );

    setCategory(
      transaction?.category ??
      (initialType === "income"
        ? defaultIncomeCategory
        : defaultExpenseCategory),
    );

    setAmount(
      transaction?.amount ?? 0,
    );

    setDueDate(
      transaction?.dueDate ??
      addDaysToDate(
        getToday(),
        defaultDueDays,
      ),
    );

    setStatus(
      getInitialStatus(
        transaction,
      ),
    );

    setPaymentDate(
      transaction?.paymentDate ??
      getToday(),
    );

    setPaymentMethod(
      transaction?.paymentMethod ??
      defaultPaymentMethod,
    );

    setCustomerOrSupplier(
      transaction
        ?.customerOrSupplier ??
      "",
    );

    setNotes(
      transaction?.notes ?? "",
    );

    setLocalError("");
  }, [
    isOpen,
    transaction,
    defaultPaymentMethod,
    defaultIncomeCategory,
    defaultExpenseCategory,
    defaultDueDays,
  ]);

  function handleTypeChange(
    nextType:
      FinancialTransactionType,
  ) {
    setType(nextType);

    setCategory(
      nextType === "income"
        ? defaultIncomeCategory
        : defaultExpenseCategory,
    );

    setStatus("pending");

    setPaymentMethod(
      defaultPaymentMethod,
    );

    setPaymentDate(
      getToday(),
    );

    setLocalError("");
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setLocalError("");

    onClose();
  }

  function handleSubmit() {
    const safeDescription =
      description.trim();

    const safeCategory =
      category.trim();

    if (
      safeDescription.length < 2
    ) {
      setLocalError(
        "Informe uma descrição válida.",
      );

      return;
    }

    if (!safeCategory) {
      setLocalError(
        "Selecione uma categoria.",
      );

      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setLocalError(
        "O valor deve ser maior que zero.",
      );

      return;
    }

    if (!dueDate) {
      setLocalError(
        "Informe a data de vencimento.",
      );

      return;
    }

    if (
      isSettled &&
      !paymentDate
    ) {
      setLocalError(
        type === "income"
          ? "Informe a data de recebimento."
          : "Informe a data de pagamento.",
      );

      return;
    }

    if (
      isSettled &&
      !paymentMethod
    ) {
      setLocalError(
        "Selecione a forma de pagamento.",
      );

      return;
    }

    if (
      isEditing &&
      transaction
    ) {
      const updateInput:
        UpdateFinancialTransactionInput =
      {
        transactionId:
          transaction.id,

        type,

        description:
          safeDescription,

        category:
          safeCategory,

        amount,

        dueDate,

        status,

        paymentDate:
          isSettled
            ? paymentDate
            : undefined,

        paymentMethod:
          isSettled &&
            paymentMethod
            ? paymentMethod
            : undefined,

        customerOrSupplier:
          customerOrSupplier
            .trim() ||
          undefined,

        notes:
          notes.trim() ||
          undefined,
      };

      onSubmit(updateInput);

      return;
    }

    const createInput:
      CreateFinancialTransactionInput =
    {
      type,

      description:
        safeDescription,

      category:
        safeCategory,

      amount,

      dueDate,

      status,

      paymentDate:
        isSettled
          ? paymentDate
          : undefined,

      paymentMethod:
        isSettled &&
          paymentMethod
          ? paymentMethod
          : undefined,

      customerOrSupplier:
        customerOrSupplier
          .trim() ||
        undefined,

      notes:
        notes.trim() ||
        undefined,

      source:
        "manual",
    };

    onSubmit(createInput);
  }

  if (!isOpen) {
    return null;
  }

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
        aria-labelledby="financial-transaction-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header
          className={styles.header}
        >
          <div
            className={
              styles.headerInformation
            }
          >
            <div
              className={`${styles.headerIcon} ${type === "income"
                ? styles.incomeIcon
                : styles.expenseIcon
                }`}
            >
              {type === "income" ? (
                <ArrowDownLeft
                  size={22}
                />
              ) : (
                <ArrowUpRight
                  size={22}
                />
              )}
            </div>

            <div>
              <span>
                {isEditing
                  ? "Editar registro"
                  : "Novo registro"}
              </span>

              <h2
                id="financial-transaction-title"
              >
                {isEditing
                  ? "Editar lançamento"
                  : "Novo lançamento financeiro"}
              </h2>

              <p>
                Registre uma receita
                ou despesa do negócio.
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
              styles.formSection
            }
          >
            <div
              className={
                styles.sectionTitle
              }
            >
              <CircleDollarSign
                size={17}
              />

              <div>
                <strong>
                  Informações do
                  lançamento
                </strong>

                <span>
                  Dados principais da
                  receita ou despesa.
                </span>
              </div>
            </div>

            <div
              className={
                styles.formGrid
              }
            >
              <div>
                <Select
                  label="Tipo"
                  required
                  value={type}
                  options={typeOptions}
                  onChange={
                    handleTypeChange
                  }
                />
              </div>

              <div>
                <Select
                  label="Situação"
                  required
                  value={status}
                  options={
                    statusOptions
                  }
                  onChange={
                    setStatus
                  }
                />
              </div>

              <label
                className={`${styles.field} ${styles.fullWidth}`}
              >
                <span>
                  Descrição
                  <b>*</b>
                </span>

                <div
                  className={
                    styles.inputWithIcon
                  }
                >
                  <FileText
                    size={16}
                  />

                  <input
                    value={description}
                    placeholder="Ex.: Conta de energia elétrica"
                    onChange={(event) =>
                      setDescription(
                        event.target
                          .value,
                      )
                    }
                  />
                </div>
              </label>

              <div>
                <Select
                  label="Categoria"
                  required
                  value={category}
                  options={
                    categoryOptions
                  }
                  onChange={
                    setCategory
                  }
                />
              </div>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  Valor
                  <b>*</b>
                </span>

                <div
                  className={
                    styles.moneyInput
                  }
                >
                  <span>R$</span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        Number(
                          event.target
                            .value,
                        ),
                      )
                    }
                  />
                </div>
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  Data de vencimento
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
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(
                        event.target
                          .value,
                      )
                    }
                  />
                </div>
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  {type === "income"
                    ? "Cliente"
                    : "Fornecedor"}
                </span>

                <div
                  className={
                    styles.inputWithIcon
                  }
                >
                  <UserRound
                    size={16}
                  />

                  <input
                    value={
                      customerOrSupplier
                    }
                    placeholder={
                      type === "income"
                        ? "Nome do cliente"
                        : "Nome do fornecedor"
                    }
                    onChange={(event) =>
                      setCustomerOrSupplier(
                        event.target
                          .value,
                      )
                    }
                  />
                </div>
              </label>
            </div>
          </section>

          {isSettled && (
            <section
              className={
                styles.paymentSection
              }
            >
              <div
                className={
                  styles.sectionTitle
                }
              >
                <CheckCircle2
                  size={17}
                />

                <div>
                  <strong>
                    {type === "income"
                      ? "Dados do recebimento"
                      : "Dados do pagamento"}
                  </strong>

                  <span>
                    Informe como o valor
                    foi movimentado.
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.paymentGrid
                }
              >
                <label
                  className={
                    styles.field
                  }
                >
                  <span>
                    {type === "income"
                      ? "Data de recebimento"
                      : "Data de pagamento"}
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
                      value={
                        paymentDate
                      }
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
                    value={
                      paymentMethod
                    }
                    options={
                      paymentOptions
                    }
                    onChange={
                      setPaymentMethod
                    }
                  />
                </div>
              </div>
            </section>
          )}

          <section
            className={
              styles.notesSection
            }
          >
            <label
              className={
                styles.field
              }
            >
              <span>
                Observações
              </span>

              <textarea
                rows={4}
                value={notes}
                placeholder="Informações adicionais sobre o lançamento..."
                onChange={(event) =>
                  setNotes(
                    event.target.value,
                  )
                }
              />
            </label>
          </section>

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
            Cancelar
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
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Cadastrar lançamento"}
          </button>
        </footer>
      </div>
    </div>
  );
}