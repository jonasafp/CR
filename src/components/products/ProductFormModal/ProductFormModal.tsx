import {
  BadgeDollarSign,
  Boxes,
  Calculator,
  Package,
  Save,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Product,
  ProductFormData,
  StockUnit,
} from "../../../types/Product";

import {
  formatCurrency,
  formatPercentage,
} from "../../../utils/formatters";

import styles from "./ProductFormModal.module.css";

interface ProductFormModalProps {
  isOpen: boolean;
  product: Product | null;
  categories: string[];

  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
}

interface FormErrors {
  code?: string;
  name?: string;
  category?: string;
  stockQuantity?: string;
  minimumStock?: string;
  purchasePrice?: string;
  salePrice?: string;
}

const initialFormData: ProductFormData = {
  code: "",
  barcode: "",

  name: "",
  description: "",
  category: "",

  stockUnit: "kg",
  stockQuantity: 0,
  minimumStock: 0,

  purchasePrice: 0,
  salePrice: 0,

  status: "active",
};

const stockUnits: Array<{
  value: StockUnit;
  label: string;
}> = [
  { value: "kg", label: "Quilograma (kg)" },
  { value: "g", label: "Grama (g)" },
  { value: "un", label: "Unidade (un)" },
  { value: "l", label: "Litro (l)" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "cx", label: "Caixa (cx)" },
  { value: "pct", label: "Pacote (pct)" },
];

export default function ProductFormModal({
  isOpen,
  product,
  categories,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [formData, setFormData] =
    useState<ProductFormData>(initialFormData);

  const [errors, setErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (product) {
      setFormData({
        code: product.code,
        barcode: product.barcode ?? "",

        name: product.name,
        description: product.description ?? "",
        category: product.category,

        stockUnit: product.stockUnit,
        stockQuantity: product.stockQuantity,
        minimumStock: product.minimumStock,

        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,

        status: product.status,
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  }, [isOpen, product]);

  const profitPerUnit = useMemo(
    () =>
      formData.salePrice - formData.purchasePrice,
    [
      formData.purchasePrice,
      formData.salePrice,
    ],
  );

  const profitMargin = useMemo(() => {
    if (formData.salePrice <= 0) {
      return 0;
    }

    return (
      (profitPerUnit / formData.salePrice) *
      100
    );
  }, [formData.salePrice, profitPerUnit]);

  function updateField<
    Key extends keyof ProductFormData,
  >(
    key: Key,
    value: ProductFormData[Key],
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

  function validateForm(): boolean {
    const nextErrors: FormErrors = {};

    if (!formData.code.trim()) {
      nextErrors.code =
        "Informe o código do produto.";
    }

    if (!formData.name.trim()) {
      nextErrors.name =
        "Informe o nome do produto.";
    }

    if (!formData.category.trim()) {
      nextErrors.category =
        "Informe a categoria.";
    }

    if (formData.stockQuantity < 0) {
      nextErrors.stockQuantity =
        "O estoque não pode ser negativo.";
    }

    if (formData.minimumStock < 0) {
      nextErrors.minimumStock =
        "O estoque mínimo não pode ser negativo.";
    }

    if (formData.purchasePrice < 0) {
      nextErrors.purchasePrice =
        "O preço de compra não pode ser negativo.";
    }

    if (formData.salePrice <= 0) {
      nextErrors.salePrice =
        "O preço de venda deve ser maior que zero.";
    }

    if (
      formData.purchasePrice > 0 &&
      formData.salePrice < formData.purchasePrice
    ) {
      nextErrors.salePrice =
        "O preço de venda está abaixo do custo.";
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

      code: formData.code.trim(),
      barcode: formData.barcode.trim(),

      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
    });
  }

  if (!isOpen) {
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
        aria-labelledby="product-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className={styles.header}>
          <div className={styles.headerInformation}>
            <div className={styles.headerIcon}>
              <Package size={23} />
            </div>

            <div>
              <h2 id="product-modal-title">
                {product
                  ? "Editar produto"
                  : "Cadastrar produto"}
              </h2>

              <p>
                Preencha os dados comerciais e de
                estoque.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar formulário"
          >
            <X size={21} />
          </button>
        </header>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.formContent}>
            <section className={styles.formSection}>
              <div className={styles.sectionTitle}>
                <Package size={18} />

                <div>
                  <strong>Identificação</strong>
                  <span>
                    Informações principais do produto
                  </span>
                </div>
              </div>

              <div className={styles.grid}>
                <label className={styles.field}>
                  <span>Código *</span>

                  <input
                    value={formData.code}
                    placeholder="Ex.: RAC-001"
                    onChange={(event) =>
                      updateField(
                        "code",
                        event.target.value,
                      )
                    }
                  />

                  {errors.code && (
                    <small className={styles.error}>
                      {errors.code}
                    </small>
                  )}
                </label>

                <label className={styles.field}>
                  <span>Código de barras</span>

                  <input
                    value={formData.barcode}
                    placeholder="Opcional"
                    onChange={(event) =>
                      updateField(
                        "barcode",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label
                  className={`${styles.field} ${styles.fullWidth}`}
                >
                  <span>Nome do produto *</span>

                  <input
                    value={formData.name}
                    placeholder="Nome comercial do produto"
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value,
                      )
                    }
                  />

                  {errors.name && (
                    <small className={styles.error}>
                      {errors.name}
                    </small>
                  )}
                </label>

                <label className={styles.field}>
                  <span>Categoria *</span>

                  <input
                    value={formData.category}
                    list="product-categories"
                    placeholder="Ex.: Rações para cães"
                    onChange={(event) =>
                      updateField(
                        "category",
                        event.target.value,
                      )
                    }
                  />

                  <datalist id="product-categories">
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      />
                    ))}
                  </datalist>

                  {errors.category && (
                    <small className={styles.error}>
                      {errors.category}
                    </small>
                  )}
                </label>

                <label className={styles.field}>
                  <span>Situação</span>

                  <select
                    value={formData.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value as
                          ProductFormData["status"],
                      )
                    }
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">
                      Inativo
                    </option>
                  </select>
                </label>

                <label
                  className={`${styles.field} ${styles.fullWidth}`}
                >
                  <span>Descrição</span>

                  <textarea
                    value={formData.description}
                    rows={3}
                    placeholder="Informações adicionais sobre o produto..."
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>
            </section>

            <section className={styles.formSection}>
              <div className={styles.sectionTitle}>
                <Boxes size={18} />

                <div>
                  <strong>Controle de estoque</strong>
                  <span>
                    Quantidade e unidade de medida
                  </span>
                </div>
              </div>

              <div
                className={`${styles.grid} ${styles.threeColumns}`}
              >
                <label className={styles.field}>
                  <span>Unidade *</span>

                  <select
                    value={formData.stockUnit}
                    onChange={(event) =>
                      updateField(
                        "stockUnit",
                        event.target.value as StockUnit,
                      )
                    }
                  >
                    {stockUnits.map((unit) => (
                      <option
                        key={unit.value}
                        value={unit.value}
                      >
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Estoque atual *</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.stockQuantity}
                    onChange={(event) =>
                      updateField(
                        "stockQuantity",
                        Number(event.target.value),
                      )
                    }
                  />

                  {errors.stockQuantity && (
                    <small className={styles.error}>
                      {errors.stockQuantity}
                    </small>
                  )}
                </label>

                <label className={styles.field}>
                  <span>Estoque mínimo *</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimumStock}
                    onChange={(event) =>
                      updateField(
                        "minimumStock",
                        Number(event.target.value),
                      )
                    }
                  />

                  {errors.minimumStock && (
                    <small className={styles.error}>
                      {errors.minimumStock}
                    </small>
                  )}
                </label>
              </div>
            </section>

            <section className={styles.formSection}>
              <div className={styles.sectionTitle}>
                <BadgeDollarSign size={18} />

                <div>
                  <strong>Valores comerciais</strong>
                  <span>
                    Custos, venda e rentabilidade
                  </span>
                </div>
              </div>

              <div className={styles.grid}>
                <label className={styles.field}>
                  <span>Preço de compra *</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(event) =>
                      updateField(
                        "purchasePrice",
                        Number(event.target.value),
                      )
                    }
                  />

                  {errors.purchasePrice && (
                    <small className={styles.error}>
                      {errors.purchasePrice}
                    </small>
                  )}
                </label>

                <label className={styles.field}>
                  <span>Preço de venda *</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(event) =>
                      updateField(
                        "salePrice",
                        Number(event.target.value),
                      )
                    }
                  />

                  {errors.salePrice && (
                    <small className={styles.error}>
                      {errors.salePrice}
                    </small>
                  )}
                </label>
              </div>

              <div className={styles.financialPreview}>
                <div className={styles.previewIcon}>
                  <Calculator size={20} />
                </div>

                <div>
                  <span>Lucro por unidade</span>

                  <strong>
                    {formatCurrency(profitPerUnit)}
                  </strong>
                </div>

                <div>
                  <span>Margem estimada</span>

                  <strong>
                    {formatPercentage(profitMargin)}
                  </strong>
                </div>
              </div>
            </section>
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

              {product
                ? "Salvar alterações"
                : "Cadastrar produto"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}