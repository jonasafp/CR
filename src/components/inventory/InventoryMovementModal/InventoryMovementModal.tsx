import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Boxes,
  CircleDollarSign,
  Minus,
  Package,
  Plus,
  Save,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Select from "../../common/Select/Select";

import type { SelectOption } from "../../common/Select/Select";

import type {
  InventoryMovementFormData,
  InventoryMovementReason,
  InventoryMovementType,
} from "../../../types/Inventory";

import type { Product } from "../../../types/Product";

import {
  calculateStockAfterMovement,
  isOutgoingMovement,
} from "../../../utils/inventoryCalculations";

import {
  formatCurrency,
  formatStockQuantity,
} from "../../../utils/formatters";

import styles from "./InventoryMovementModal.module.css";

interface InventoryMovementModalProps {
  isOpen: boolean;
  products: Product[];
  initialProduct: Product | null;

  onClose: () => void;

  onSubmit: (
    data: InventoryMovementFormData,
  ) => void;
}

interface FormErrors {
  productId?: string;
  quantity?: string;
  unitCost?: string;
}

const initialFormData: InventoryMovementFormData =
{
  productId: null,

  type: "entry",
  reason: "purchase",

  quantity: 0,
  unitCost: 0,

  notes: "",
};

const movementTypeOptions: SelectOption<InventoryMovementType>[] =
  [
    {
      value: "entry",
      label: "Entrada",
      description:
        "Adiciona quantidade ao estoque",
      icon: <ArrowDownToLine size={14} />,
    },
    {
      value: "exit",
      label: "Saída",
      description:
        "Remove quantidade do estoque",
      icon: <ArrowUpFromLine size={14} />,
    },
    {
      value: "adjustment_positive",
      label: "Ajuste positivo",
      description:
        "Corrige o estoque adicionando quantidade",
      icon: <Plus size={14} />,
    },
    {
      value: "adjustment_negative",
      label: "Ajuste negativo",
      description:
        "Corrige o estoque removendo quantidade",
      icon: <Minus size={14} />,
    },
  ];

export default function InventoryMovementModal({
  isOpen,
  products,
  initialProduct,
  onClose,
  onSubmit,
}: InventoryMovementModalProps) {
  const [formData, setFormData] =
    useState<InventoryMovementFormData>(
      initialFormData,
    );

  const availableReasonOptions =
    getReasonOptionsByType(
      formData.type,
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData({
      ...initialFormData,

      productId:
        initialProduct?.id ?? null,

      unitCost:
        initialProduct?.purchasePrice ?? 0,
    });

    setErrors({});
  }, [initialProduct, isOpen]);

  const productOptions: SelectOption<string>[] =
    products.map((product) => ({
      value: String(product.id),
      label: product.name,

      description:
        product.status === "inactive"
          ? `${product.code} · Produto inativo`
          : `${product.code} · ${formatStockQuantity(
            product.stockQuantity,
            product.stockUnit,
          )}`,

      icon: <Package size={14} />,

      disabled:
        product.status === "inactive",
    }));

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) =>
          product.id === formData.productId,
      ) ?? null,
    [formData.productId, products],
  );

  const nextStock = useMemo(() => {
    if (!selectedProduct) {
      return 0;
    }

    return calculateStockAfterMovement(
      selectedProduct.stockQuantity,
      formData.quantity,
      formData.type,
    );
  }, [
    formData.quantity,
    formData.type,
    selectedProduct,
  ]);

  const movementValue =
    formData.quantity * formData.unitCost;

  function updateField<
    Key extends keyof InventoryMovementFormData,
  >(
    key: Key,
    value: InventoryMovementFormData[Key],
  ) {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));

    if (key in errors) {
      setErrors((current) => ({
        ...current,
        [key]: undefined,
      }));
    }
  }

  function handleProductChange(value: string) {
    const productId = Number(value);

    const product = products.find(
      (item) => item.id === productId,
    );

    setFormData((current) => ({
      ...current,
      productId,
      unitCost:
        product?.purchasePrice ??
        current.unitCost,
    }));

    setErrors((current) => ({
      ...current,
      productId: undefined,
    }));
  }

  function validateForm(): boolean {
    const nextErrors: FormErrors = {};

    if (!selectedProduct) {
      nextErrors.productId =
        "Selecione um produto.";
    }

    if (formData.quantity <= 0) {
      nextErrors.quantity =
        "Informe uma quantidade maior que zero.";
    }

    if (formData.unitCost < 0) {
      nextErrors.unitCost =
        "O custo unitário não pode ser negativo.";
    }

    if (
      selectedProduct &&
      isOutgoingMovement(formData.type) &&
      formData.quantity >
      selectedProduct.stockQuantity
    ) {
      nextErrors.quantity =
        "A quantidade informada é maior que o estoque disponível.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      notes: formData.notes.trim(),
    });
  }

  if (!isOpen) {
    return null;
  }

  function getReasonOptionsByType(
    type: InventoryMovementType,
  ): SelectOption<InventoryMovementReason>[] {
    if (type === "entry") {
      return [
        {
          value: "purchase",
          label: "Compra",
        },
        {
          value: "return",
          label: "Devolução",
        },
        {
          value: "initial_balance",
          label: "Saldo inicial",
        },
        {
          value: "other",
          label: "Outro",
        },
      ];
    }

    if (type === "exit") {
      return [
        {
          value: "sale",
          label: "Venda",
        },
        {
          value: "loss",
          label: "Perda",
        },
        {
          value: "damage",
          label: "Avaria",
        },
        {
          value: "expiration",
          label: "Vencimento",
        },
        {
          value: "other",
          label: "Outro",
        },
      ];
    }

    return [
      {
        value: "manual_adjustment",
        label: "Ajuste manual",
      },
      {
        value: "other",
        label: "Outro",
      },
    ];
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
        aria-labelledby="inventory-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <Boxes size={23} />
            </div>

            <div>
              <h2 id="inventory-modal-title">
                Nova movimentação
              </h2>

              <p>
                Registre entradas, saídas ou ajustes de
                estoque.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.content}>
            <div className={styles.grid}>
              <div
                className={`${styles.field} ${styles.fullWidth}`}
              >
                <Select
                  label="Produto"
                  required
                  value={
                    formData.productId
                      ? String(formData.productId)
                      : ""
                  }
                  placeholder="Selecione um produto"
                  options={productOptions}
                  error={errors.productId}
                  onChange={handleProductChange}
                />
              </div>

              <div className={styles.field}>
                <Select
                  label="Tipo de movimentação"
                  required
                  value={formData.type}
                  options={movementTypeOptions}
                  onChange={(value) => {
                    const nextReasons =
                      getReasonOptionsByType(value);

                    setFormData((current) => ({
                      ...current,
                      type: value,
                      reason:
                        nextReasons[0]?.value ??
                        "other",
                    }));
                  }}
                />
              </div>

              <div className={styles.field}>
                <Select
                  label="Motivo"
                  required
                  value={formData.reason}
                  options={availableReasonOptions}
                  onChange={(value) =>
                    updateField("reason", value)
                  }
                />
              </div>

              <label className={styles.field}>
                <span>Quantidade *</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(event) =>
                    updateField(
                      "quantity",
                      Number(event.target.value),
                    )
                  }
                />

                {errors.quantity && (
                  <small className={styles.error}>
                    {errors.quantity}
                  </small>
                )}
              </label>

              <label className={styles.field}>
                <span>Custo unitário</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(event) =>
                    updateField(
                      "unitCost",
                      Number(event.target.value),
                    )
                  }
                />

                {errors.unitCost && (
                  <small className={styles.error}>
                    {errors.unitCost}
                  </small>
                )}
              </label>

              <label
                className={`${styles.field} ${styles.fullWidth}`}
              >
                <span>Observações</span>

                <textarea
                  rows={3}
                  value={formData.notes}
                  placeholder="Informações adicionais sobre a movimentação..."
                  onChange={(event) =>
                    updateField(
                      "notes",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            {selectedProduct && (
              <div className={styles.preview}>
                <div className={styles.previewItem}>
                  <span>Estoque atual</span>

                  <strong>
                    {formatStockQuantity(
                      selectedProduct.stockQuantity,
                      selectedProduct.stockUnit,
                    )}
                  </strong>
                </div>

                <ArrowRight
                  size={20}
                  className={styles.arrow}
                />

                <div className={styles.previewItem}>
                  <span>Saldo posterior</span>

                  <strong
                    className={
                      nextStock < 0
                        ? styles.negative
                        : ""
                    }
                  >
                    {formatStockQuantity(
                      nextStock,
                      selectedProduct.stockUnit,
                    )}
                  </strong>
                </div>

                <div className={styles.valuePreview}>
                  <CircleDollarSign size={19} />

                  <div>
                    <span>
                      Valor da movimentação
                    </span>

                    <strong>
                      {formatCurrency(
                        movementValue,
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.saveButton}
            >
              <Save size={17} />
              Registrar movimentação
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}